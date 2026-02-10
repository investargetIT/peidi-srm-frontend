<script setup lang="ts">
import { getProductInfo } from "@/api/user";
import PdUpload from "@/components/PdUpload/index.vue";
import { dayjs, ElMessage } from "element-plus";
import { nextTick, reactive, ref, watch } from "vue";

const props = defineProps({
  supplierGradeEnum: {
    type: Array<any>,
    required: true
  },
  productTree: {
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
  },
  productTreeLoading: {
    type: Boolean,
    required: true
  }
});

// productTreeLoading消息提示对象
const productTreeLoadingMessage = ref();

const visible = ref(false);
const formType = ref<"add" | "edit">("add");

const formRef = ref();
const formData = reactive({
  id: "",
  companyName: "",
  companyAddress: "",
  registrationInfo: "",
  businessLicense: [],
  productionLicense: [],
  relatedCertificate: [],
  supplierProduct: [],
  bankAccount: "",
  taxNumber: "",
  invoiceInfo: "",
  contractInfo: [],
  supplierGradeId: "",
  contactInfo_Person: "",
  contactInfo_Info: "",
  hasSignAgreement: false,
  agreementExpiry: ""
});
const rules = {
  companyName: [{ required: true, message: "输入公司名称", trigger: "blur" }]
};

const handleSubmit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      const formTemp = {
        ...formData,
        contactInfo: JSON.stringify([
          {
            person: formData.contactInfo_Person,
            info: formData.contactInfo_Info
          }
        ]),
        supplierProduct: formatSupplierProduct(formData?.supplierProduct || []),
        agreementExpiry: formData.agreementExpiry
          ? dayjs(formData.agreementExpiry).format("YYYY-MM-DD")
          : ""
      };
      // console.log("提交表单:", formData, formTemp);
      if (formType.value === "add") {
        props.addFn(formTemp, () => {
          visible.value = false;
        });
      }
      if (formType.value === "edit") {
        props.updateFn(formTemp, () => {
          visible.value = false;
        });
      }
    }
  });
};

const handleClose = () => {
  formRef.value?.resetFields();
  if (productTreeLoadingMessage.value) {
    productTreeLoadingMessage.value?.close();
  }
};

//#region 产品信息相关逻辑
// 提交时格式化产品信息
const formatSupplierProduct = (source = []) => {
  // console.log("格式化产品信息:", source);

  // 使用更高效的数组方法和解构赋值
  return source
    .filter(item => item?.[0] === "rootFactory" || item?.[0] === "rootPdzc")
    .map(item => {
      // 根据类型提取对应的值
      return item?.[0] === "rootFactory" ? item?.[3] : item?.[1];
    })
    .filter(Boolean); // 过滤掉 false 值
};

// 编辑时初始化产品信息
const handleSupplierProductInit = async supplierProduct => {
  if (!supplierProduct || !Array.isArray(supplierProduct)) {
    return [];
  }

  try {
    // 获取所有产品详细信息
    const promiseArr = supplierProduct.map(item =>
      getProductInfo({ id: item })
    );
    const res = await Promise.all(promiseArr);

    // 分类处理工厂类产品和PDZC类产品
    const resFactory = res.filter(
      (item: any) =>
        item?.data?.parentCategoryId !== null && item?.data?.enable === true
    );
    const resPdzc = res.filter(
      (item: any) =>
        item?.data?.parentCategoryId === null && item?.data?.enable === true
    );

    // 构建工厂类产品的级联选择器值 [rootFactory, 一级ID, 二级ID, 三级ID]
    const cascaderValue = resFactory
      .map((item: any) => {
        if (item?.data) {
          return [
            "rootFactory",
            +item.data.parentCategoryId, // 一级分类ID
            +item.data.categoryId, // 二级分类ID
            item.data.id // 三级产品ID
          ];
        }
        return null;
      })
      .filter(Boolean);

    // 构建PDZC类产品的级联选择器值 [rootPdzc, 三级产品ID]
    const cascaderValuePdzc = resPdzc
      .map((item: any) => {
        if (item?.data) {
          return [
            "rootPdzc",
            item.data.id // 三级产品ID
          ];
        }
        return null;
      })
      .filter(Boolean);

    // 合并两种类型的产品信息
    return [...cascaderValue, ...cascaderValuePdzc];
  } catch (error) {
    console.error("处理供应商产品信息失败:", error);
    ElMessage.error("处理供应商产品信息失败:" + error.message);
    return [];
  }
};
//#endregion

const initFormData = async (type: "add" | "edit", row?: any) => {
  if (props.productTreeLoading) {
    productTreeLoadingMessage.value = ElMessage.info({
      message: "产品信息数据加载中...",
      duration: 0
    });
  }

  visible.value = true;
  formType.value = type;

  nextTick(async () => {
    if (row) {
      // console.log("初始化表单:", row);
      Object.assign(formData, row);

      // 处理联系人信息
      const contactInfo = row?.contactInfo;
      if (contactInfo) {
        let temp = {
          person: "",
          info: ""
        };
        try {
          temp = JSON.parse(contactInfo)?.[0] || {};
        } catch (e) {
          console.warn("解析联系人信息失败:", e);
        }

        // console.log("初始化表单 contactInfo:", temp);
        formData.contactInfo_Person = temp.person || "";
        formData.contactInfo_Info = temp.info || "";
      }

      // 处理产品信息
      if (row?.supplierProduct && type === "edit") {
        try {
          const supplierProduct = await handleSupplierProductInit(
            row.supplierProduct
          );
          formData.supplierProduct = supplierProduct;
          // console.log("初始化表单 supplierProduct:", supplierProduct);
        } catch (error) {
          console.error("初始化产品信息失败:", error);
        }
      }
    }
  });
};

watch(
  () => props.productTreeLoading,
  (newVal, oldVal) => {
    if (!newVal) {
      if (productTreeLoadingMessage.value) {
        productTreeLoadingMessage.value?.close();
        ElMessage.success("产品信息数据加载完成");
      }
    }
  }
);

defineExpose({
  initFormData
});
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="formType === 'add' ? '添加供应商' : '编辑供应商'"
      width="600"
      top="5vh"
      append-to-body
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="110px"
        label-position="top"
        :rules="rules"
      >
        <!-- 公司名称 -->
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="formData.companyName" />
        </el-form-item>

        <!-- 公司地址 -->
        <el-form-item label="公司地址" prop="companyAddress">
          <el-input v-model="formData.companyAddress" />
        </el-form-item>

        <!-- 联系人 -->
        <el-form-item label="联系人" prop="contactInfo_Person">
          <el-input v-model="formData.contactInfo_Person" />
        </el-form-item>

        <!-- 联系方式 -->
        <el-form-item label="联系方式" prop="contactInfo_Info">
          <el-input v-model="formData.contactInfo_Info" />
        </el-form-item>

        <!-- 注册信息 -->
        <el-form-item label="注册信息" prop="registrationInfo">
          <el-input v-model="formData.registrationInfo" />
        </el-form-item>

        <!-- 营业执照 -->
        <el-form-item label="营业执照" prop="businessLicense">
          <PdUpload
            v-model="formData.businessLicense"
            accept=""
            :file-size="50"
          />
        </el-form-item>

        <!-- 生产许可证 -->
        <el-form-item label="生产许可证" prop="productionLicense">
          <PdUpload
            v-model="formData.productionLicense"
            accept=""
            :file-size="50"
          />
        </el-form-item>

        <!-- 相关证书 -->
        <el-form-item label="相关证书" prop="relatedCertificate">
          <PdUpload
            v-model="formData.relatedCertificate"
            accept=""
            :file-size="50"
          />
        </el-form-item>

        <!-- 产品信息 -->
        <el-form-item label="产品信息" prop="supplierProduct">
          <el-cascader
            v-model="formData.supplierProduct"
            filterable
            :props="{
              multiple: true
            }"
            placeholder="请选择产品信息"
            :options="productTree"
            style="width: 100%"
            :disabled="props.productTreeLoading"
          >
          </el-cascader>
        </el-form-item>

        <!-- 银行账号 -->
        <el-form-item label="银行账号" prop="bankAccount">
          <el-input v-model="formData.bankAccount" />
        </el-form-item>

        <!-- 税号 -->
        <el-form-item label="税号" prop="taxNumber">
          <el-input v-model="formData.taxNumber" />
        </el-form-item>

        <!-- 开户行 -->
        <el-form-item label="开户行" prop="invoiceInfo">
          <el-input v-model="formData.invoiceInfo" />
        </el-form-item>

        <!-- 合同信息 -->
        <el-form-item label="合同信息" prop="contractInfo">
          <PdUpload v-model="formData.contractInfo" accept="" :file-size="50" />
        </el-form-item>

        <!-- 供应商类型 -->
        <el-form-item label="供应商类型" prop="supplierGradeId">
          <el-select
            v-model="formData.supplierGradeId"
            placeholder="请选择供应商类型"
          >
            <el-option
              v-for="item in supplierGradeEnum"
              :label="item.value"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>

        <!-- 年度框架协议 -->
        <el-form-item label="年度框架协议" prop="hasSignAgreement">
          <el-checkbox v-model="formData.hasSignAgreement" label="已签订" />
        </el-form-item>

        <!-- 年框协议到期时间 -->
        <el-form-item label="年框协议到期时间" prop="agreementExpiry">
          <el-date-picker
            v-model="formData.agreementExpiry"
            type="date"
            placeholder="请选择年框协议到期时间"
          />
        </el-form-item>

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
