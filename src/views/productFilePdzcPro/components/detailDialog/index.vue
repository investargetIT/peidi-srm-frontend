<script setup lang="ts">
import PdUpload from "@/components/PdUpload/index.vue";
import { ElMessageBox } from "element-plus";
import { nextTick, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import RulesCard from "../../components/priceRulesCard/index.vue";

const router = useRouter();

const props = defineProps({
  supplierList: {
    type: Array<any>,
    required: true
  },
  specGoodsList: {
    type: Array<any>,
    required: true
  },
  addFn: {
    type: Function,
    required: true
  },
  updateFn: {
    type: Function,
    required: true
  }
});

const visible = ref(false);
const formType = ref<"add" | "edit">("add");

const formRef = ref();
const formData = reactive({
  id: "",
  supplierProduct: [], // 供应商ID
  materialCode: "", // 料号
  productName: "", // 品名
  specification: "", // 规格
  barcode: "", // 条码
  unit: "", // 单位
  referenceCost: "", // 价格
  supplementaryAgreement: [], // 补充协议（如有涨价）
  priceChangeReason: "" // 价格变动原因
});
const rules = {
  materialCode: [{ required: true, message: "输选择料号", trigger: "change" }]
};

const handleMaterialCodeChange = (val: string) => {
  const selectedItem = props.specGoodsList.find(item => item.u9No === val);
  if (selectedItem) {
    formData.productName = selectedItem.specName;
    formData.barcode = selectedItem.barcode;
  }
};

const handleSubmit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      // console.log("提交表单:", formData);
      if (formType.value === "add") {
        props.addFn(formData, () => {
          visible.value = false;
        });
      }
      if (formType.value === "edit") {
        props.updateFn(formData, () => {
          visible.value = false;
        });
      }
    }
  });
};

const handleClose = () => {
  formRef.value?.resetFields();
};

const initFormData = (type: "add" | "edit", row?: any) => {
  visible.value = true;
  formType.value = type;
  nextTick(() => {
    if (row) {
      // console.log("初始化表单:", row);
      Object.assign(formData, row);

      // 供应商逻辑：supplierList用于回显 supplierProduct用于修改
      formData.supplierProduct = row?.supplierList?.map(item => item.id) ?? [];
    }
  });
};

defineExpose({
  initFormData
});

const handleAddSupplier = () => {
  ElMessageBox.confirm("是否跳转到供应商管理页面添加供应商？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      router.push({ name: "supplierPro" });
    })
    .catch(() => {});
};
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="formType === 'add' ? '添加产品' : '编辑产品'"
      width="600"
      append-to-body
      align-center
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="110px"
        :rules="rules"
      >
        <!-- 供应商 -->
        <el-form-item label="供应商" prop="supplierProduct">
          <el-space>
            <el-select
              v-model="formData.supplierProduct"
              placeholder="请选择供应商（最多选择1个）"
              clearable
              filterable
              style="width: 345px"
              multiple
              :multiple-limit="1"
            >
              <el-option
                v-for="item in props.supplierList"
                :key="item.id"
                :label="item.companyName"
                :value="item.id"
              />
            </el-select>
            <el-button type="primary" size="default" @click="handleAddSupplier">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-space>
        </el-form-item>

        <!-- 料号 -->
        <el-form-item label="料号" prop="materialCode">
          <el-select
            v-model="formData.materialCode"
            placeholder="请选择料号（自动匹配品名和条码）"
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
          <el-input v-model="formData.productName" disabled />
        </el-form-item>

        <!-- 规格 -->
        <el-form-item label="规格" prop="specification">
          <el-input v-model="formData.specification" />
        </el-form-item>

        <!-- 条码 -->
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="formData.barcode" disabled />
        </el-form-item>

        <!-- 单位 -->
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格" prop="referenceCost">
          <el-input v-model="formData.referenceCost" />
        </el-form-item>

        <div class="mb-[20px]">
          <RulesCard type="detail">
            <!-- 补充协议 -->
            <el-form-item label="补充协议" prop="supplementaryAgreement">
              <PdUpload
                v-model="formData.supplementaryAgreement"
                accept=""
                :file-size="50"
              />
            </el-form-item>

            <!-- 价格变动原因 -->
            <el-form-item label="价格变动原因" prop="priceChangeReason">
              <el-input
                v-model="formData.priceChangeReason"
                placeholder="请输入价格变动原因"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </RulesCard>
        </div>

        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button type="primary" @click="handleSubmit">
              {{ formType === "add" ? "添加" : "编辑" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: #0a0a0a;
}
</style>
