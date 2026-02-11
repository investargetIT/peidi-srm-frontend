<script setup lang="ts">
import PdUpload from "@/components/PdUpload/index.vue";
import { ElMessageBox } from "element-plus";
import { PropType, computed, nextTick, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  allCateData: {
    type: Array as PropType<any[]>,
    required: true
  },
  manageLevelEnum: {
    type: Array as PropType<any[]>,
    required: true
  },
  supplierList: {
    type: Array as PropType<any[]>,
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
  parentCategoryId: "",
  categoryId: "",
  managementLevelId: "",
  productName: "",
  supplierId: "",
  specification: "",
  unit: "",
  supplyAllYea: "",
  enName: "",
  referenceCost: "",
  photoList: [],
  harvestSeason: ""
});
const rules = {
  parentCategoryId: [
    { required: true, message: "请选择主分类", trigger: "change" }
  ],
  categoryId: [{ required: true, message: "请选择子分类", trigger: "change" }],
  managementLevelId: [
    { required: true, message: "请选择管理等级分类", trigger: "change" }
  ],
  productName: [{ required: true, message: "请输入品名", trigger: "blur" }],
  referenceCost: [
    {
      validator: (rule, value, callback) => {
        const regex =
          /^\+?(?!(?:0+(?:\.0+)?|\.0+$)(?:$|0+\.?0*$))(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
        if (!regex.test(value) && value !== "") {
          callback(new Error("价格必须为数字且大于0"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ]
};

const handleparentCategoryIdChange = () => {
  // console.log("主分类变化:", formData.parentCategoryId);
  formData.categoryId = "";
};

const subCategoryList = computed(() => {
  if (formData.parentCategoryId) {
    // console.log("主分类变化:", formData.parentCategoryId, props.allCateData);
    // 找到对应的主分类项
    const parentCategory = props.allCateData.find(
      item => item.id.toString() === formData.parentCategoryId.toString()
    );

    // 返回该主分类下的所有子分类
    return parentCategory?.children || [];
  }
  return [];
});

const handleSubmit = () => {
  // console.log("提交表单:", formData);
  formRef.value?.validate(valid => {
    if (valid) {
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

      // 不传harvestSeason默认会变成0，0月不展示
      formData.harvestSeason = formData.harvestSeason || "";
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
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="110px"
        :rules="rules"
      >
        <!-- 主分类 -->
        <el-form-item prop="parentCategoryId" label="主分类">
          <el-select
            v-model="formData.parentCategoryId"
            placeholder="选择主分类"
            @change="handleparentCategoryIdChange"
          >
            <el-option
              v-for="item in allCateData"
              :label="item.categoryName"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>

        <!-- 子分类 -->
        <el-form-item prop="categoryId" label="子分类">
          <el-select
            v-model="formData.categoryId"
            placeholder="选择子分类"
            :disabled="!formData.parentCategoryId"
          >
            <el-option
              v-for="item in subCategoryList"
              :label="item.categoryName"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>

        <!-- 管理等级分类 -->
        <el-form-item prop="managementLevelId" label="管理等级分类">
          <el-select
            v-model="formData.managementLevelId"
            placeholder="选择管理等级分类"
          >
            <el-option
              v-for="item in manageLevelEnum"
              :label="item.value"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>

        <!-- 品名 -->
        <el-form-item prop="productName" label="品名">
          <el-input type="text" v-model="formData.productName" />
        </el-form-item>

        <!-- 供应商 -->
        <el-form-item label="供应商" prop="supplierId">
          <el-space>
            <el-select
              v-model="formData.supplierId"
              placeholder="请选择供应商"
              clearable
              filterable
              style="width: 345px"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.companyName"
                :value="item.id.toString()"
              />
            </el-select>
            <el-button type="primary" size="default" @click="handleAddSupplier">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-space>
        </el-form-item>

        <!-- 规格 -->
        <el-form-item prop="specification" label="规格">
          <el-input v-model="formData.specification" />
        </el-form-item>

        <!-- 单位 -->
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" />
        </el-form-item>

        <!-- 常年正常供应 -->
        <el-form-item prop="supplyAllYea" label="常年正常供应">
          <el-input v-model="formData.supplyAllYea" />
        </el-form-item>

        <!-- 英文名 -->
        <el-form-item prop="enName" label="英文名">
          <el-input v-model="formData.enName" />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item prop="referenceCost" label="价格">
          <el-input v-model="formData.referenceCost" />
        </el-form-item>

        <!-- 照片 -->
        <el-form-item prop="photoList" label="照片">
          <PdUpload v-model="formData.photoList" accept="" :file-size="50" />
        </el-form-item>

        <!-- 收获季节 -->
        <el-form-item prop="harvestSeason" label="收获季节">
          <el-select
            v-model="formData.harvestSeason"
            placeholder="选择收获季节"
            clearable
          >
            <el-option v-for="item in 12" :label="item + '月'" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button @click="visible = false"> 取消 </el-button>
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
