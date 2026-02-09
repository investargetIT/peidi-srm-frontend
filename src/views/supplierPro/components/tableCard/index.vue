<script setup lang="ts">
import { Upload } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";
import { exportAllSupplier } from "../../utils/exportExcel";

const props = defineProps({
  tableData: {
    type: Array,
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
  fetchSupplierList: {
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

const handleAddClick = () => {
  props.openDetailDialog("add");
};

const handleEditClick = (row: any) => {
  props.openDetailDialog("edit", row);
};

const handleDeleteClick = (row: any) => {
  ElMessageBox.confirm(`确定删除供应商【${row.companyName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      props.deleteFn(row.id);
    })
    .catch(() => {});
};

// 格式化联系信息
const formatContactInfo = (contactInfo: string) => {
  if (!contactInfo) {
    return [];
  }
  try {
    return JSON.parse(contactInfo).map(item => ({
      name: item.person,
      info: item.info
    }));
  } catch {
    return [];
  }
};

watch(
  [() => paginationInfo.value.currentPage, () => paginationInfo.value.pageSize],
  ([newCurrentPage, newPageSize], [oldCurrentPage, oldPageSize]) => {
    if (newCurrentPage !== oldCurrentPage || newPageSize !== oldPageSize) {
      props.fetchSupplierList();
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

//#region 导出相关
const exportLoading = ref(false);
const handleExportClick = async () => {
  exportLoading.value = true;
  await exportAllSupplier();
  exportLoading.value = false;
};
//#endregion
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between mb-[20px]">
        <div class="text-[#0a0a0a]">供应商列表</div>

        <el-space>
          <el-button
            color="#217346"
            @click="handleExportClick"
            :loading="exportLoading"
            :icon="Upload"
          >
            导出全部供应商
          </el-button>
          <el-button type="primary" @click="handleAddClick">
            添加供应商
          </el-button>
        </el-space>
      </div>

      <el-table
        :data="props.tableData"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
      >
        <el-table-column prop="companyName" label="公司名称" />
        <el-table-column prop="companyAddress" label="地址" />
        <el-table-column prop="contactInfo" label="联系信息">
          <template #default="scope">
            <div
              v-for="item in formatContactInfo(scope.row.contactInfo)"
              :key="item.name"
            >
              {{ item.name }}: {{ item.info }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="supplierGradeName" label="供应商类型" />

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
