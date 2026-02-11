<script setup lang="ts">
import { Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

const props = defineProps({
  categoryNameList: {
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
  categoryName: "",
  productName: ""
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
        <el-form-item label="子分类" prop="categoryName">
          <el-select
            v-model="searchInfo.categoryName"
            style="width: 240px"
            placeholder="请选择子分类"
            filterable
            clearable
          >
            <el-option
              v-for="item in categoryNameList"
              :label="item.categoryName"
              :value="item.categoryName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="品名" prop="productName">
          <el-input
            v-model="searchInfo.productName"
            placeholder="请输入品名"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchClick" :icon="Search">
            搜索
          </el-button>
          <el-button @click="handleResetClick" :icon="Refresh">重置</el-button>
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
