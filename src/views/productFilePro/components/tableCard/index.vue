<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    required: true
  },
  supplierList: {
    type: Array<any>,
    required: true
  },
  openDetailDialog: {
    type: Function,
    required: true
  },
  deleteFn: {
    type: Function,
    required: true
  },
  fetchProductPage: {
    type: Function,
    required: true
  }
});

const paginationInfo = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 30, 40]
});

const tableRowClassName = ({ row }: { row: any }) => {
  if (!row.enable) {
    return "warning-row";
  }
  return "";
};

const handleAddClick = () => {
  props.openDetailDialog("add");
};

const handleEditClick = (row: any) => {
  props.openDetailDialog("edit", row);
};

const handleDeleteClick = (row: any) => {
  ElMessageBox.confirm(`确定删除料号【${row.materialCode}】的产品吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      props.deleteFn(row.id);
    })
    .catch(() => {});
};

watch(
  [() => paginationInfo.value.currentPage, () => paginationInfo.value.pageSize],
  ([newCurrentPage, newPageSize], [oldCurrentPage, oldPageSize]) => {
    if (newCurrentPage !== oldCurrentPage || newPageSize !== oldPageSize) {
      props.fetchProductPage();
    }
  }
);

const getPaginationInfo = () => {
  return paginationInfo.value;
};

const setPaginationInfo = ({ currentPage, total }) => {
  if (currentPage) {
    paginationInfo.value.currentPage = currentPage;
  }
  if (total !== undefined && total !== null) {
    paginationInfo.value.total = total;
  }
};

defineExpose({
  getPaginationInfo,
  setPaginationInfo
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between mb-[20px]">
        <div class="text-[#0a0a0a]">工厂产品列表</div>
        <el-button type="primary" @click="handleAddClick"> 添加产品 </el-button>
      </div>

      <el-table
        :data="props.tableData"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
        :row-class-name="tableRowClassName"
      >
        <el-table-column fixed prop="materialCode" label="料号" />
        <el-table-column prop="userInfo" label="信息维护人" width="150px" />
        <el-table-column prop="parentCategoryName" label="主分类" />
        <el-table-column prop="categoryName" label="子分类" />
        <el-table-column prop="managementLevelName" label="管理等级" />
        <el-table-column prop="productName" label="品名" />
        <el-table-column prop="specification" label="规格" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="referenceCost" label="价格" />
        <el-table-column prop="lastQuoteDate" label="最近一次报价时间" />
        <el-table-column prop="supplyAllYea" label="常年正常供应" />
        <el-table-column prop="supplierName" label="供应商">
          <template #default="scope">
            <div>
              <div
                v-for="supplierId in scope.row.supplierProduct"
                :key="supplierId"
              >
                {{
                  props.supplierList.find(item => item.id === supplierId)
                    ?.companyName || supplierId
                }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="125px">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleEditClick(scope.row)"
              :disabled="!scope.row.enable"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDeleteClick(scope.row)"
              :disabled="!scope.row.enable"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center mt-[20px]">
        <el-pagination
          v-model:current-page="paginationInfo.currentPage"
          v-model:page-size="paginationInfo.pageSize"
          :page-sizes="paginationInfo.pageSizes"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :total="paginationInfo.total"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table .warning-row) {
  color: #ccc;
  background-color: #f5f7fa;
}
</style>
