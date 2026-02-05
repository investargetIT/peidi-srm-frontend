<script setup lang="ts">
import { computed, reactive, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { FormInstance } from "element-plus";
import { message } from "@/utils/message";
import { getToken, formatToken } from "@/utils/auth";
import { baseUrlApi } from "@/api/user";

const router = useRouter();

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
const dialogImageUrl = ref("");
const dialogImageVisible = ref(false);

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  id: "",
  businessDate: "", // 业务日期
  supplierProduct: [], // 供应商ID
  materialCode: "", // 料号
  productName: "", // 品名
  specification: "", // 规格
  barcode: "", // 条码
  unit: "", // 单位
  referenceCost: "", // 价格
  hasSignAgreement: false, // 已签订年度框架协议
  supplementaryAgreement: [] // 补充协议（如有涨价）
});
const uploadUrl = baseUrlApi("/supplier/upload"); // 替换为实际的后端上传接口地址

const rules = {
  materialCode: [{ required: true, message: "请选择料号", trigger: "change" }]
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
        // 特殊处理补充协议字段
        if (key === "supplementaryAgreement" && row[key]) {
          // 将字符串数组转换为文件对象数组
          ruleForm[key] = row[key].map(fileUrl => ({
            name: fileUrl.split("/").pop(),
            url: fileUrl
          }));
        } else {
          ruleForm[key] = row[key];
        }
      });
    });
  } else {
    // 添加模式下清空表单
    Object.keys(ruleForm).forEach(key => {
      if (key === "supplementaryAgreement") {
        ruleForm[key] = [];
      } else if (key === "supplierProduct") {
        ruleForm[key] = [];
      } else {
        ruleForm[key] = "";
      }
    });
    ruleForm.hasSignAgreement = false;
  }
  dialogVisible.value = true;
};

const handleMaterialCodeChange = (val: string) => {
  const selectedItem = props.specGoodsList.find(item => item.u9No === val);
  if (selectedItem) {
    ruleForm.productName = selectedItem.specName;
    ruleForm.barcode = selectedItem.barcode;
  }
};

const submitForm = () => {
  ruleFormRef.value?.validate(valid => {
    if (valid) {
      // 处理补充协议文件，提取文件路径
      const formData = { ...ruleForm };
      if (
        formData.supplementaryAgreement &&
        formData.supplementaryAgreement.length > 0
      ) {
        formData.supplementaryAgreement = formData.supplementaryAgreement
          .map(file => {
            // 如果是新上传的文件，使用response.data
            if (file.response && file.response.code === 200) {
              return file.response.data;
            }
            // 如果是已存在的文件，使用url
            else if (file.url) {
              return file.url;
            }
            return null;
          })
          .filter(url => url !== null);
      }

      if (dialogType.value === "add") {
        props.addCateData(formData, () => {
          dialogVisible.value = false;
        });
      } else {
        props.updateCateData(formData, () => {
          dialogVisible.value = false;
        });
      }
    }
  });
};

// 判断是否可以修改价格
const canModifyPrice = computed(() => {
  if (!ruleForm.supplierProduct || ruleForm.supplierProduct.length === 0) {
    return true;
  }
  const supplier = props.supplierList.find(
    item => item.id === ruleForm.supplierProduct[0]
  );
  // 简化的逻辑：未签约或有补充协议时可以修改价格
  return (
    !supplier?.hasSignAgreement || supplier?.supplementaryAgreement?.length > 0
  );
});

const handleAddSupplier = () => {
  router.push({ name: "supplier" });
};

// 文件上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    message("文件上传成功", { type: "success" });
  } else {
    message("文件上传失败: " + response.msg, { type: "error" });
  }
};

// 文件上传失败处理
const handleUploadError = (error, file, fileList) => {
  message("文件上传失败: " + error.message, { type: "error" });
};

// 文件预览
const handlePictureCardPreview = file => {
  dialogImageUrl.value = file.url || file.response?.data;
  dialogImageVisible.value = true;
};

// 文件移除前的处理
const beforeRemove = (file, fileList) => {
  return true; // 允许移除
};

defineExpose({ initDialog });
</script>

<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加新产品' : '编辑产品'"
      width="800"
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
          <el-space>
            <el-select
              v-model="ruleForm.supplierProduct"
              placeholder="请选择供应商"
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
            v-model="ruleForm.materialCode"
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
          <el-input v-model="ruleForm.productName" disabled />
        </el-form-item>

        <!-- 规格 -->
        <el-form-item label="规格" prop="specification">
          <el-input v-model="ruleForm.specification" />
        </el-form-item>

        <!-- 条码 -->
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="ruleForm.barcode" disabled />
        </el-form-item>

        <!-- 单位 -->
        <el-form-item label="单位" prop="unit">
          <el-input v-model="ruleForm.unit" />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格" prop="referenceCost">
          <el-input
            v-model="ruleForm.referenceCost"
            :disabled="!canModifyPrice"
          >
            <template #prepend>CNY</template>
          </el-input>
        </el-form-item>

        <el-card shadow="never" style="background-color: rgb(249 250 251)">
          <el-form-item prop="" label="年度框架协议">
            <el-checkbox
              v-model="ruleForm.hasSignAgreement"
              label="已签订年度框架协议"
              size="small"
            />
          </el-form-item>
          <el-form-item
            prop=""
            label="补充协议（如有涨价）"
            v-if="ruleForm.hasSignAgreement"
          >
            <el-upload
              v-model:file-list="ruleForm.supplementaryAgreement"
              class="upload-demo"
              :action="uploadUrl"
              :accept="'*'"
              :auto-upload="true"
              list-type="text"
              :headers="{
                Authorization: formatToken(getToken().accessToken)
              }"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-preview="handlePictureCardPreview"
              :before-remove="beforeRemove"
            >
              <el-button>上传补充协议</el-button>
            </el-upload>
          </el-form-item>

          <p class="text-[12px] text-[#666]">
            {{
              ruleForm.hasSignAgreement
                ? "已签约供应商产品报价原则上不变。如需涨价，需签署补充协议并上传后方可更新报价。"
                : "未签约供应商报价按季度更新。"
            }}
          </p>
        </el-card>

        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button type="primary" @click="submitForm">
              {{ dialogType === "add" ? "添加" : "更新" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogImageVisible" width="800">
      <img w-full :src="dialogImageUrl" alt="预览图片" />
    </el-dialog>
  </div>
</template>
