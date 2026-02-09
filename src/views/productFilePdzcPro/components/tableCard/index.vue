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

// 得到供应商的值
const getSupplierName = (arr: any[]) => {
  if (arr && arr.length > 0) {
    const supplierId = arr[0];
    return (
      props.supplierList.find(item => item.id === supplierId)?.companyName ||
      supplierId
    );
  }
  return "-";
};
const handleAddClick = () => {
  props.openDetailDialog("add");
};

const handleEditClick = (row: any) => {
  props.openDetailDialog("edit", row);
};

const handleDeleteClick = (row: any) => {
  ElMessageBox.confirm(
    `确定删除【${row.supplierList?.[0]?.companyName ?? ""}】-【${row.productName}】吗?`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
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

const getHasSignAgreementStatus = (row: any) => {
  const hasSignAgreement = row.supplierList?.[0]?.hasSignAgreement;
  return {
    text: hasSignAgreement ? "已签" : "未签",
    type: (hasSignAgreement ? "success" : "info") as
      | "success"
      | "warning"
      | "info"
      | "primary"
      | "danger"
  };
};
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between mb-[20px]">
        <div class="text-[#0a0a0a]">智创产品列表</div>
        <el-button type="primary" @click="handleAddClick"> 添加产品 </el-button>
      </div>

      <el-table
        :data="props.tableData"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
      >
        <el-table-column prop="supplierList" label="供应商" min-width="150px">
          <template #default="scope">
            <div>
              {{ scope.row.supplierList?.[0]?.companyName ?? "" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="productName" label="品名" min-width="200px" />
        <el-table-column prop="specification" label="规格" min-width="150px" />
        <el-table-column prop="barcode" label="条码" min-width="130px" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="referenceCost" label="价格" />

        <el-table-column prop="" label="年框合同">
          <template #default="scope">
            <el-tag :type="getHasSignAgreementStatus(scope.row).type">
              {{ getHasSignAgreementStatus(scope.row).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="125px">
          <template #default="scope">
            <el-button link type="primary" @click="handleEditClick(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDeleteClick(scope.row)">
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
