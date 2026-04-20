<script setup lang="ts">
import { SERVICE_STATUS_ENUM } from "@/views/supplierPro/constants/index";
import { Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

const props = defineProps({
  fetchSupplierList: {
    type: Function,
    required: true
  },
  supplierGradeEnum: {
    type: Array as PropType<any[]>,
    required: true
  }
});

const searchInfoRef = ref();
const searchInfo = reactive({
  companyName: "",
  serviceStatus: null,
  supplierGradeId: "",
  rating: ""
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
        <el-form-item label="服务状态" prop="serviceStatus">
          <el-select
            v-model="searchInfo.serviceStatus"
            placeholder="请选择服务状态"
            clearable
          >
            <el-option
              v-for="item in SERVICE_STATUS_ENUM"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商类型" prop="supplierGradeId">
          <el-select
            v-model="searchInfo.supplierGradeId"
            placeholder="请选择供应商类型"
            clearable
          >
            <el-option
              v-for="item in supplierGradeEnum"
              :label="item.value"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商评级" prop="rating">
          <el-select
            v-model="searchInfo.rating"
            placeholder="请选择供应商评级"
            clearable
          >
            <el-option
              v-for="item in ['A', 'B', 'C', 'D']"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
