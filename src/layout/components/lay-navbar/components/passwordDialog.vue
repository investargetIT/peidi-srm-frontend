<script setup lang="ts">
import { updateUserPassword } from "@/api/user";
import { storageLocal } from "@/store/utils";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";

const visible = ref(false);

const formRef = ref();
const formData = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== formData.newPassword) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};
const rules: any = reactive({
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
  formRef.value.validate((valid: any) => {
    if (valid) {
      // console.log("formData表单数据:", formData);
      if (formData.newPassword !== formData.confirmPassword) {
        ElMessage.error("两次输入密码不一致");
        return;
      }
      updateUserPassword({
        identifier: (storageLocal().getItem("dataSource") as any)?.id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }).then((res: any) => {
        if (res?.code === 200) {
          ElMessage.success("修改密码成功");
          visible.value = false;
        } else {
          ElMessage.error("修改密码失败:" + res?.msg);
        }
      });
    }
  });
};

defineExpose({ show: () => (visible.value = true) });
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="'修改密码'"
      width="500"
      @closed="formRef?.resetFields()"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        :label-width="'100px'"
      >
        <el-form-item :label="'旧密码'" prop="oldPassword">
          <el-input
            v-model="formData.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item :label="'新密码'" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item :label="'确认密码'" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
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
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: #0a0a0a;
}
</style>
