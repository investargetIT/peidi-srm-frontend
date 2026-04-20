<script setup lang="ts">
// 尝试把钉钉和网页登录逻辑合并在一个组件
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { message } from "@/utils/message";
import { decryptMessage, encryptMessage } from "./utils/cryptojs";
import { storageLocal } from "@pureadmin/utils";
import * as dd from "dingtalk-jsapi";
import { SYSTEM_CONFIG } from "@/constants";
import {
  getUserDataSourceApi,
  getUserInfo,
  register,
  registerMobile
} from "@/api/user";

const router = useRouter();

// 账号密码登录，所有登录方式都调用这个函数
const fetchLogin = (username: string, password: string) => {
  useUserStoreHook()
    .loginByUsername({
      username: username,
      password: password
    })
    .then((res: any) => {
      if (res.success) {
        console.log(res?.data);
        localStorage.setItem("token", res?.data);

        getUserDataSourceApi({
          token: res?.data
        })
          .then((res: any) => {
            if (res.success) {
              localStorage.setItem("dataSource", JSON.stringify(res.data));
            }
          })
          .finally(() => {
            // 获取后端路由
            return initRouter().then(() => {
              router.push(getTopMenu(true).path).then(() => {
                message("登录成功", { type: "success" });
              });
            });
          });
      } else {
        message("登录失败", { type: "error" });
        // 不是钉钉环境，退回登录页
        if (!navigator.userAgent.includes("DingTalk"))
          window.location.href = `https://login.peidigroup.cn/#/login?source=${encryptMessage(window.location.href)}`;
      }
    });
};

//#region 网页登录逻辑
// 网页环境下的登录参数获取
const getLoginInfoInWeb = () => {
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

// 网页登录逻辑总函数
const loginInWeb = () => {
  // 先判断是否有记住密码功能存下的账号密码，有的话就先取出来
  const userInfo: { username: string; password: string } | null =
    storageLocal().getItem("peidi-userInfo") || { username: "", password: "" };

  // 获取参数
  const queryKey = getLoginInfoInWeb();
  // 判断是否需要记住密码
  if (queryKey.key3) {
    const isRemember = decryptMessage(queryKey.key3);
    console.log("isRemember", isRemember);
    if (isRemember === "true") {
      storageLocal().setItem("peidi-userInfo", {
        username: decryptMessage(queryKey.key1 || ""),
        password: decryptMessage(queryKey.key2 || "")
      });
    } else {
      storageLocal().removeItem("peidi-userInfo");
    }
  }
  // 是否存在账号密码
  if (queryKey.key1 && queryKey.key2) {
    const username = decryptMessage(queryKey.key1);
    const password = decryptMessage(queryKey.key2);
    // 如果存在则覆盖保存的账号密码
    userInfo.username = username;
    userInfo.password = password;
  }
  if (userInfo.username && userInfo.password) {
    // 调用账号密码登录函数
    fetchLogin(userInfo.username, userInfo.password);
  } else {
    // 没有账号密码 提示用户输入
    window.location.href = `https://login.peidigroup.cn/#/login?source=${encryptMessage(window.location.href)}`;
  }
};
//#endregion

//#region 钉钉登录逻辑
// 钉钉登录总函数
const ddLogin = () => {
  let ddUserEmail = "";
  let userInfoInDingTalk = {
    username: "",
    password: SYSTEM_CONFIG.DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD_ENCRYPTED
  };
  dd.runtime.permission.requestAuthCode({
    corpId: SYSTEM_CONFIG.DINGTALK_CORP_ID, // 企业id
    //@ts-ignore
    onSuccess: function (info) {
      console.log("钉钉免登授权码", info);
      const { code } = info;

      // 通过该免登授权码可以获取用户身份
      getUserInfo(code)
        .then((res: any) => {
          console.log("获取钉钉用户信息", res);
          if (res.success) {
            const { data: ddUserInfo } = res;
            console.log("ddUserInfo", ddUserInfo);
            localStorage.setItem("ddUserInfo", JSON.stringify(ddUserInfo));
            const { org_email, name, userid, mobile } = ddUserInfo;
            if (org_email) {
              console.log("ddEmail", org_email);
              ddUserEmail = org_email;

              // 优先邮箱注册，账号为邮箱
              userInfoInDingTalk.username = ddUserEmail;
              return register({
                email: org_email,
                emailCode: "",
                password: SYSTEM_CONFIG.DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD,
                username: name,
                dataSource: 1,
                dingId: userid,
                mobile: mobile
              });
            } else if (mobile) {
              console.log("使用手机号注册mobile:", mobile);

              // 手机号注册时，账号为手机号
              userInfoInDingTalk.username = mobile;
              // 使用手机号注册，添加标识
              return registerMobile({
                mobile,
                mobileCode: "",
                password: SYSTEM_CONFIG.DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD,
                username: name,
                dingId: userid
              });
            } else {
              message(
                "获取钉钉用户邮箱和手机号都失败：" + JSON.stringify(res),
                {
                  type: "error"
                }
              );
            }
          } else {
            message("用户注册失败：" + JSON.stringify(res), { type: "error" });
          }
        })
        .then((res: any) => {
          if (res) {
            // 获取当前用户信息来判断注册类型
            const ddUserInfo = JSON.parse(
              localStorage.getItem("ddUserInfo") || "{}"
            );
            const isEmailRegistration = !!ddUserInfo.org_email;

            let registrationSuccess = false;

            if (isEmailRegistration) {
              // 邮箱注册的判断条件
              registrationSuccess =
                res.success ||
                (res.code === 100100002 &&
                  res.msg === "EMAIL_ACCOUNT_ALREADY_EXIST");
              console.log("邮箱注册结果:", res);
            } else {
              // 手机号注册的判断条件
              registrationSuccess =
                res.success ||
                (res.code === 100100003 &&
                  res.msg === "PHONE_ACCOUNT_ALREADY_EXIST");
              console.log("手机号注册结果:", res);
            }

            if (registrationSuccess) {
              // 注册成功，调用登录接口
              console.log("注册成功，开始登录");
              // 调用登录函数
              fetchLogin(
                userInfoInDingTalk.username,
                userInfoInDingTalk.password
              );
            } else {
              const registrationType = isEmailRegistration ? "邮箱" : "手机号";
              message(`${registrationType}注册失败：` + JSON.stringify(res), {
                type: "error"
              });
            }
          }
        });
    },
    onFail: function (err) {
      // setErrMsg('获取钉钉免登授权码失败：' + JSON.stringify(err))
      message(JSON.stringify(err), { type: "error" });
    }
  });
};
//#endregion

onMounted(() => {
  // 首先判断环境
  if (navigator.userAgent.includes("DingTalk")) {
    // 钉钉环境下 调用钉钉登录逻辑
    ddLogin();
  } else {
    // 在网页环境下 调用网页登录逻辑
    loginInWeb();
  }
});
</script>

<template>
  <div class="peidi-login-container">
    <div class="pridi-loader" />
  </div>
</template>

<style lang="scss" scoped>
.peidi-login-container {
  @keyframes loading-shake {
    0% {
      transform: rotate(-5deg);
    }

    15% {
      transform: rotate(8deg);
    }

    30% {
      transform: rotate(-7deg);
    }

    45% {
      transform: rotate(6deg);
    }

    60% {
      transform: rotate(-4deg);
    }

    75% {
      transform: rotate(3deg);
    }

    90% {
      transform: rotate(-2deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }

  & {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .pridi-loader {
    width: 200px;
    height: 200px;
    background-image: url("@/assets/login/loading.svg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    transform-origin: center center;
    // animation: loading-shake 1.5s ease-in-out infinite;
  }
}
</style>
