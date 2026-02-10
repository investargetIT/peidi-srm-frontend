<script setup lang="ts">
import { onMounted } from "vue";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRoute, useRouter } from "vue-router";
import { message } from "@/utils/message";
import { useUserStoreHook } from "../../store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { decryptMessage, encryptMessage } from "./utils/cryptojs";
import {
  getUserInfo,
  register,
  getUserDataSourceApi,
  getAllCate,
  registerMobile,
  getUserSite
} from "../../api/user";

const route = useRoute();
const router = useRouter();

const getKeyFromUrl = () => {
  const url = window.location.href;
  const key1Match = url.match(/key1=([^&]+)/);
  const key2Match = url.match(/key2=([^&]+)/);
  const key3Match = url.match(/key3=([^&]+)/);
  const key1 = key1Match ? key1Match[1] : null;
  const key2 = key2Match ? key2Match[1] : null;
  const key3 = key3Match ? key3Match[1] : null;
  console.log("key1", key1);
  console.log("key2", key2);
  console.log("key3", key3);
  return { key1, key2, key3 };
};
const queryKey = getKeyFromUrl();

onMounted(() => {
  // const userInfo = storageLocal().getItem("peidi-userInfo");
  let userInfo: { username: string; password: string; site?: string } | null =
    storageLocal().getItem("peidi-userInfo") || null;

  console.log("queryKey", queryKey);

  // 如果有记住密码的参数，就按照参数来处理
  if (queryKey.key3) {
    const isRemember = decryptMessage(queryKey.key3);
    console.log("isRemember", isRemember);
    if (isRemember === "true") {
      storageLocal().setItem("peidi-userInfo", {
        username: decryptMessage(queryKey.key1 || ""),
        password: decryptMessage(queryKey.key2 || ""),
        site: null
      });
    } else {
      storageLocal().removeItem("peidi-userInfo");
    }
  }

  // username and password
  if (queryKey.key1 && queryKey.key2) {
    const username = decryptMessage(queryKey.key1);
    const password = decryptMessage(queryKey.key2);
    userInfo = { username, password };
  }
  console.log("userInfo", userInfo);

  if (userInfo) {
    useUserStoreHook()
      .loginByUsername({
        username: userInfo?.username,
        password: userInfo?.password,
        site: userInfo?.site || null
      })
      .then((res: any) => {
        if (res.success) {
          localStorage.setItem("token", res.data);
          getUserDataSourceApi({
            token: res.data
          }).then((res: any) => {
            if (res.success) {
              // 如果dataSource不存在则刷新一次页面，因为有些权限在login组件加载前就已经判定
              if (!localStorage.getItem("dataSource")) {
                window.location.reload();
              }
              localStorage.setItem("dataSource", JSON.stringify(res.data));
              // message("登录成功" + res.data.dataSource, { type: "success" });
            }
            // 获取后端路由
            return initRouter().then(() => {
              // 获取一级分类数据
              // getAllCate({}).then(res => {
              //   if (res.success) {
              //     const level1Categories = res.data
              //       .filter(item => item.level === 1)
              //       .sort((a, b) => a.id - b.id);
              //     localStorage.setItem(
              //       "level1Categories",
              //       JSON.stringify(level1Categories)
              //     );
              //   }
              //   router.push(getTopMenu(true).path).then(() => {
              //     message("登录成功", { type: "success" });
              //   });
              // });
              router.push(getTopMenu(true).path).then(() => {
                message("登录成功", { type: "success" });
              });
            });
          });
        } else {
          message("登录失败", { type: "error" });
          window.location.href = `https://login.peidigroup.cn/#/login?source=${encryptMessage(window.location.href)}`;
        }
      });
  } else {
    if (process.env.NODE_ENV === "development") {
      // window.location.href = `http://localhost:8848/#/login?source=${encryptMessage(window.location.href)}`;
      window.location.href = `https://login.peidigroup.cn/#/login?source=${encryptMessage(window.location.href)}`;
    } else {
      window.location.href = `https://login.peidigroup.cn/#/login?source=${encryptMessage(window.location.href)}`;
    }
  }
});
</script>

<template>
  <div></div>
</template>
