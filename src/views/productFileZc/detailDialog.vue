<script setup lang="ts">
import { reactive, ref } from "vue";
import { FormInstance } from "element-plus";
import { nextTick } from "process";
import { message } from "@/utils/message";
import { id } from "element-plus/es/locale/index.mjs";

const props = defineProps({
  addCateData: {
    type: Function,
    required: true
  },
  updateCateData: {
    type: Function,
    required: true
  }
});

const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  id: "",
  lastQuoteDate: "", // 业务日期
  supplierName: "", // 供应商
  materialCode: "", // 料号
  productName: "", // 品名
  specification: "", // 规格
  barcode: "", // 条码
  unit: "", // 单位
  referenceCost: "" // 价格
});

const beforeClose = (done: () => void) => {
  ruleFormRef.value?.resetFields();
  done();
};
const initDialog = (type: "add" | "edit", row?: any) => {
  dialogType.value = type;
  if (type === "edit") {
    nextTick(() => {
      Object.keys(ruleForm).forEach(key => {
        ruleForm[key] = row[key];
      });
    });
  }
  dialogVisible.value = true;
};

const submitForm = () => {
  ruleFormRef.value?.validate(valid => {
    if (valid) {
      if (dialogType.value === "add") {
        props.addCateData(ruleForm);
      } else {
        props.updateCateData(ruleForm);
      }
    }
  });
};

defineExpose({ initDialog });
</script>

<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加新产品' : '编辑产品'"
      width="500"
      :before-close="beforeClose"
    >
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        label-width="auto"
      >
        <!-- 业务日期 -->
        <el-form-item label="业务日期" prop="lastQuoteDate">
          <el-date-picker
            v-model="ruleForm.lastQuoteDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- 供应商 -->
        <el-form-item label="供应商" prop="supplierName">
          <el-input v-model="ruleForm.supplierName" />
        </el-form-item>

        <!-- 料号 -->
        <el-form-item label="料号" prop="materialCode">
          <el-input v-model="ruleForm.materialCode" />
        </el-form-item>

        <!-- 品名 -->
        <el-form-item label="品名" prop="productName">
          <el-input v-model="ruleForm.productName" />
        </el-form-item>

        <!-- 规格 -->
        <el-form-item label="规格" prop="specification">
          <el-input v-model="ruleForm.specification" />
        </el-form-item>

        <!-- 条码 -->
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="ruleForm.barcode" />
        </el-form-item>

        <!-- 单位 -->
        <el-form-item label="单位" prop="unit">
          <el-input v-model="ruleForm.unit" />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格" prop="referenceCost">
          <el-input v-model="ruleForm.referenceCost" />
        </el-form-item>

        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button type="primary" @click="submitForm">
              {{ dialogType === "add" ? "添加" : "更新" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
