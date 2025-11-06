<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNotice from "../lay-notice/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";

import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import Setting from "@iconify-icons/ri/settings-3-line";
import RiEditBoxLine from "@iconify-icons/ri/edit-box-line";
import { emitter } from "@/utils/mitt.ts";
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { updateUserPassword } from "../../../api/user";

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar
} = useNav();
emitter.on("logout", () => {
  logout();
});

const showPasswordDialog = ref(false);
const changePassword = () => {
  showPasswordDialog.value = true;
};
const passwordFormRef = ref();
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};
const passwordRules = reactive({
  oldPassword: [
    {
      required: true,
      message: "请输入旧密码",
      trigger: "blur"
    }
  ],
  // 新密码还需要和确认密码一致
  newPassword: [
    {
      required: true,
      message: "请输入新密码",
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    { required: true, validator: validateConfirmPassword, trigger: "blur" }
  ]
});
const handlePasswordUpdate = () => {
  passwordFormRef.value.validate((valid: any) => {
    if (valid) {
      console.log("passwordForm表单数据==", passwordForm);
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error(t("navbar.passwordNotMatch"));
        return;
      }
      updateUserPassword({
        identifier: (storageLocal().getItem("dataSource") as any)?.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }).then((res: any) => {
        if (res?.code === 200) {
          ElMessage.success("修改密码成功");
          passwordFormRef.value.resetFields();
          showPasswordDialog.value = false;
        } else {
          ElMessage.error("修改密码失败" + res?.msg);
        }
      });
    }
  });
};

const isDingUser = computed(() => {
  if (navigator.userAgent.includes("DingTalk")) return true;
  const dataSource = JSON.parse(localStorage.getItem("dataSource") || "{}");
  console.log("dataSource==", dataSource);
  if (!!dataSource?.dingId) return true;
  return false;
});
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <!-- <LaySearch id="header-search" /> -->
      <!-- 全屏 -->
      <!-- <LaySidebarFullScreen id="full-screen" /> -->
      <!-- 消息通知 -->
      <!-- <LayNotice id="header-notice" /> -->
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item v-if="!isDingUser" @click="changePassword">
              <IconifyIconOffline :icon="RiEditBoxLine" style="margin: 5px" />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                :icon="LogoutCircleRLine"
                style="margin: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- <span
        class="set-icon navbar-bg-hover"
        title="打开系统配置"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="Setting" />
      </span> -->

      <el-dialog
        v-model="showPasswordDialog"
        :title="'修改密码'"
        width="500"
        @closed="passwordFormRef?.resetFields()"
        :close-on-click-modal="false"
      >
        <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          :label-width="'100px'"
        >
          <el-form-item :label="'旧密码'" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item :label="'新密码'" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item :label="'确认密码'" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="handlePasswordUpdate">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
