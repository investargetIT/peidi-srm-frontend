<script setup lang="ts">
import { computed, reactive, ref, nextTick } from "vue";
import { FormInstance } from "element-plus";
import { message } from "@/utils/message";

const props = defineProps({
  addCateData: {
    type: Function,
    required: true
  },
  updateCateData: {
    type: Function,
    required: true
  },
  supplierList: {
    type: Array<any>,
    required: true
  },
  specGoodsList: {
    type: Array<any>,
    required: true
  }
});

const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  id: "",
  businessDate: "", // 业务日期
  supplierId: "", // 供应商ID
  materialCode: "", // 料号
  productName: "", // 品名
  specification: "", // 规格
  barcode: "", // 条码
  unit: "", // 单位
  referenceCost: "" // 价格
});

const rules = {
  productName: [
    { required: true, message: "请输入品名", trigger: "change" },
    { required: true, message: "请输入品名", trigger: "blur" }
  ]
};

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

const handleMaterialCodeChange = (val: string) => {
  const selectedItem = props.specGoodsList.find(item => item.u9No === val);
  // console.log("当前选择的料号:", selectedItem);
  if (selectedItem) {
    ruleForm.productName = selectedItem.specName;
    ruleForm.barcode = selectedItem.barcode;
  }
};

const submitForm = () => {
  ruleFormRef.value?.validate(valid => {
    if (valid) {
      if (dialogType.value === "add") {
        props.addCateData(ruleForm, () => {
          dialogVisible.value = false;
        });
      } else {
        props.updateCateData(ruleForm, () => {
          dialogVisible.value = false;
        });
      }
    }
  });
};

// 判断是否可以修改价格
const canModifyPrice = computed(() => (supplierId: number | string) => {
  const result = props.supplierList.find(item => item.id == supplierId);
  // console.log("getSupplierInfo:", result);
  if (result?.hasSignAgreement) {
    if (result?.supplementaryAgreement?.length > 0) return true;
    return false;
  }
  return true;
});

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
        :rules="rules"
      >
        <!-- 业务日期 -->
        <el-form-item label="业务日期" prop="businessDate">
          <el-date-picker
            v-model="ruleForm.businessDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- 供应商 -->
        <el-form-item label="供应商" prop="supplierName">
          <el-select
            v-model="ruleForm.supplierId"
            placeholder="请选择供应商"
            clearable
            filterable
          >
            <el-option
              v-for="item in props.supplierList"
              :key="item.id"
              :label="item.companyName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 料号 -->
        <el-form-item label="料号" prop="materialCode">
          <el-select
            v-model="ruleForm.materialCode"
            placeholder="请选择料号（自动匹配品名和条码）"
            clearable
            filterable
            @change="handleMaterialCodeChange"
          >
            <el-option
              v-for="item in props.specGoodsList"
              :key="item.u9No"
              :label="item.u9No"
              :value="item.u9No"
            />
          </el-select>
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
          <el-input
            v-model="ruleForm.referenceCost"
            :disabled="!canModifyPrice(ruleForm.supplierId)"
          >
            <template #prepend>CNY</template>
          </el-input>
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
