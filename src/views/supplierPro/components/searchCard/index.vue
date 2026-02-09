<script setup lang="ts">
import { reactive, ref } from "vue";

const props = defineProps({
  fetchSupplierList: {
    type: Function,
    required: true
  }
});

const searchInfoRef = ref();
const searchInfo = reactive({
  companyName: "",
  contactInfo: ""
});

const handleSearchClick = () => {
  props.fetchSupplierList();
};

const handleResetClick = () => {
  searchInfoRef.value?.resetFields();
  props.fetchSupplierList();
};

const getSearchInfo = () => {
  return searchInfo;
};

defineExpose({
  getSearchInfo
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <el-form ref="searchInfoRef" :model="searchInfo" inline>
        <el-form-item label="公司名称" prop="companyName">
          <el-input
            v-model="searchInfo.companyName"
            placeholder="请输入公司名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系信息" prop="contactInfo">
          <el-input
            v-model="searchInfo.contactInfo"
            placeholder="请输入联系信息"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearchClick">搜索</el-button>
          <el-button @click="handleResetClick">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card__body) {
  padding-bottom: 0;
}

:deep(.el-form-item__label) {
  color: #0a0a0a;
}

.el-input {
  --el-input-width: 240px;
}

.el-select {
  --el-select-width: 240px;
}
</style>
