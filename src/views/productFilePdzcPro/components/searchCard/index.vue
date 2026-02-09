<script setup lang="ts">
import { reactive, ref } from "vue";

const props = defineProps({
  supplierList: {
    type: Array<any>,
    required: true
  },
  fetchProductPage: {
    type: Function,
    required: true
  }
});

const searchInfoRef = ref();
const searchInfo = reactive({
  supplierId: "",
  barcode: ""
});

const handleSearchClick = () => {
  props.fetchProductPage();
};

const handleResetClick = () => {
  searchInfoRef.value?.resetFields();
  props.fetchProductPage();
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
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="searchInfo.supplierId"
            placeholder="请选择供应商"
            clearable
          >
            <el-option
              v-for="item in props.supplierList"
              :label="item.companyName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条码" prop="barcode">
          <el-input
            v-model="searchInfo.barcode"
            placeholder="请输入条码"
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
