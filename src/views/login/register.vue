<template>
  <el-dialog v-model="showRegisterDialog" width="40%" title="注册账号">
    <el-form
      :model="form"
      :rules="rules"
      ref="registerForm"
      label-width="100px"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号">
          <template #append>
            <el-button
              @click="sendCode"
              :disabled="sendingCode || !isPhoneValid"
              >{{ sendingCode ? `${countdown}s` : "发送验证码" }}</el-button
            >
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="form.code" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="register">注册</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { sendCodeApi, registerApi } from "@/api/user.ts";
import { useRouter } from "vue-router";

const router = useRouter();

const showRegisterDialog = defineModel("showRegisterDialog");

const form = ref({
  phone: "",
  code: "",
  password: ""
});

const rules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" }
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const registerForm = ref(null);
const sendingCode = ref(false);
const countdown = ref(60);

const isPhoneValid = computed(() => {
  const phonePattern = /^1[3-9]\d{9}$/;
  return phonePattern.test(form.value.phone);
});

function sendCode() {
  if (!isPhoneValid.value) {
    ElMessage.error("手机号格式不正确");
    return;
  }

  sendingCode.value = true;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      sendingCode.value = false;
      countdown.value = 60;
    }
  }, 1000);
  sendCodeApi({
    destination: form.value.phone,
    codeType: "sms_register"
  }).then(res => {
    if (res.code !== 200) {
      ElMessage.error(res.msg);
      clearInterval(timer);
      sendingCode.value = false;
      countdown.value = 60;
    } else {
      ElMessage.success("验证码已发送");
    }
  });
}

const codeMap = [
  {
    code: 100100003,
    msg: "手机号已注册"
  }
];

function register() {
  registerForm.value.validate(valid => {
    if (valid) {
      // 模拟注册请求
      registerApi({
        mobile: form.value.phone,
        mobileCode: form.value.code,
        password: form.value.password,
        username: form.value.phone
      }).then(res => {
        if (res.code !== 200) {
          if (codeMap.find(item => item.code === res.code)) {
            ElMessage.error(codeMap.find(item => item.code === res.code).msg);
            return;
          } else {
            ElMessage.error(res.msg);
            return;
          }
        } else {
          ElMessage.success("注册成功");
          showRegisterDialog.value = false;
        }
      });
    } else {
      ElMessage.error("请填写完整信息");
    }
  });
}
</script>
