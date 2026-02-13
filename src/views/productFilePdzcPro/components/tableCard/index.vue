<script setup lang="ts">
import TipDialog from "@/views/supplierPro/components/tipDialogs/index.vue";
import { formatSupplierStatusClient } from "@/views/supplierPro/utils/index";
import {
  Delete,
  Edit,
  Plus,
  RefreshRight,
  Search
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";
import StatusCircle from "./statusCircle.vue";
import RiPulseLine from "@iconify-icons/ri/pulse-line";
import PriceChart from "../priceChart/index.vue";

export type TagType = "success" | "warning" | "info" | "primary" | "danger";

const tipDialogRef = ref();

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
  },
  loading: {
    type: Boolean,
    default: false
  },
  setSortStr: {
    type: Function,
    required: true
  },
  handleSearchBarcode: {
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

const getIsContractInfo = (row: any) => {
  const supplierInfo = getSupplierInfo(row);
  if (supplierInfo) {
    const isContractInfo =
      supplierInfo?.contractInfo && supplierInfo?.contractInfo?.length > 0;
    return {
      text: isContractInfo ? "合同已签" : "合同未签",
      type: (isContractInfo ? "success" : "info") as TagType
    };
  }
  return {
    text: "合同信息错误",
    type: "danger" as TagType
  };
};
const getHasSignAgreementStatus = (row: any) => {
  const supplierInfo = getSupplierInfo(row);
  if (supplierInfo) {
    const hasSignAgreement = supplierInfo?.hasSignAgreement;
    const signAgreement = supplierInfo?.signAgreement || [];
    const isSign = hasSignAgreement && signAgreement.length > 0;
    return {
      text: isSign ? "已签年框" : "未签年框",
      type: (isSign ? "success" : "info") as TagType
    };
  }
  return {
    text: "年框信息错误",
    type: "danger" as TagType
  };
};
/**
 * 协议价判断条件：
 * 1. 补充协议没有内容 --> 报价
 * 2. 未签年框 或 年框已过期 --> 报价
 * 3. 其余 --> 协议价
 * @param row
 */
const getIsContractPriceStatus = (row: any) => {
  // 补充协议
  const supplementaryAgreement = row?.supplementaryAgreement || [];
  // 价格变动原因
  // const priceChangeReason = row?.priceChangeReason || "";
  // 服务状态
  const serviceStatus = row?.serviceStatus || null;

  if (supplementaryAgreement.length === 0) {
    return {
      text: "报价",
      type: "info" as TagType
    };
  }

  if (!serviceStatus) {
    return {
      text: "协议价信息错误",
      type: "danger" as TagType
    };
  }

  if (serviceStatus === 4 || serviceStatus === 3) {
    return {
      text: "报价",
      type: "info" as TagType
    };
  }

  if (serviceStatus === 2 || serviceStatus === 1) {
    return {
      text: "协议价",
      type: "success" as TagType
    };
  }

  return {
    text: "协议价信息错误",
    type: "danger" as TagType
  };
};

// 获取供应商详细信息
const getSupplierInfo = (row: any) => {
  const id = row.supplierId;
  if (id === null || id === "") {
    return null;
  }
  if (props.supplierList && props.supplierList.length > 0) {
    return props.supplierList.find(item => item.id.toString() === id);
  }
  return null;
};

//#region 排序逻辑
function handleSortChange(column: any) {
  let temp: { sortName: string; sortType: string }[] = [];
  // console.log("排序事件", column);
  // 处理排序逻辑
  if (column.column.sortable === "custom") {
    // 自定义排序逻辑
    // 这里可以根据 column.prop 来判断是哪个列在排序
    // 并根据 column.order 来判断排序方向（ascending 或 descending）
    // 最后更新表格数据即可
    if (!column.order) {
      temp = [];
    }
    if (column.order === "descending") {
      temp = [
        {
          sortName: column.prop,
          sortType: "desc"
        }
      ];
    }
    if (column.order === "ascending") {
      temp = [
        {
          sortName: column.prop,
          sortType: "asc"
        }
      ];
    }

    props.setSortStr(temp);
  }
}
//#endregion

// 点击查询条码
const handleSearchBarcode = (row: any) => {
  if (row.barcode) {
    props.handleSearchBarcode(row.barcode);
  }
};
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between mb-[20px]">
        <div class="text-[#0a0a0a]">智创产品列表</div>
        <el-button type="primary" @click="handleAddClick" :icon="Plus">
          添加产品
        </el-button>
      </div>

      <el-table
        :data="props.tableData"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
        :style="{ height: 'calc(100vh - 330px)', minHeight: '500px' }"
        v-loading="props.loading"
        element-loading-text="加载中..."
        @sort-change="handleSortChange"
      >
        <el-table-column prop="supplierName" label="供应商" min-width="150px">
          <template #header>
            <div class="flex items-center">
              <span class="mr-[3px]">供应商</span>
              <el-icon
                class="pb-[3px] cursor-pointer"
                size="16"
                @click="tipDialogRef?.show('productFilePdzc_supplierInfo')"
              >
                <QuestionFilled />
              </el-icon>
            </div>
          </template>

          <template #default="scope">
            <div>
              <div class="flex items-center mb-[5px]">
                <StatusCircle
                  :size="12"
                  :color="formatSupplierStatusClient(scope.row).color"
                />
                <div class="ml-[5px]">
                  <span>{{ scope.row.supplierName }}</span>
                </div>
              </div>
              <el-space wrap>
                <el-tag
                  size="small"
                  :type="getHasSignAgreementStatus(scope.row).type"
                >
                  {{ getHasSignAgreementStatus(scope.row).text }}
                </el-tag>
                <el-tag size="small" type="primary">
                  {{ scope.row.rating }}
                </el-tag>
              </el-space>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="barcode" label="条码" min-width="130px">
          <template #default="scope">
            <div class="flex items-center">
              {{ scope.row.barcode }}
              <div v-if="scope.row.barcode" class="ml-[1px]">
                <el-tooltip
                  effect="dark"
                  content="点击快捷查询条码"
                  placement="top"
                  :show-after="150"
                >
                  <el-button
                    link
                    size="small"
                    type="primary"
                    :icon="Search"
                    @click="handleSearchBarcode(scope.row)"
                  />
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="品名" min-width="200px" />
        <el-table-column prop="specification" label="规格" min-width="150px" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="referenceCost" label="价格" sortable="custom">
          <template #default="scope">
            <div class="flex items-center">
              {{ scope.row.referenceCost }}
              <div class="ml-[5px]">
                <el-popover
                  title=""
                  content=""
                  placement="top-start"
                  :width="500"
                  :show-after="150"
                  trigger="hover"
                >
                  <template #reference>
                    <el-button link size="small" type="primary" @click="">
                      <IconifyIconOffline :icon="RiPulseLine" />
                    </el-button>
                  </template>

                  <div>
                    <PriceChart :source="scope.row" />
                  </div>
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="" label="协议价状态">
          <template #header>
            <div class="flex items-center">
              <span class="mr-[3px]">协议价状态</span>
              <el-icon
                class="pb-[3px] cursor-pointer"
                size="16"
                @click="tipDialogRef?.show('productFilePdzc_contractPrice')"
              >
                <QuestionFilled />
              </el-icon>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="getIsContractPriceStatus(scope.row).type">
              {{ getIsContractPriceStatus(scope.row).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="125px">
          <template #default="scope">
            <el-space wrap :size="16">
              <el-button
                link
                type="primary"
                @click="handleEditClick(scope.row)"
                :icon="Edit"
              />

              <el-button
                link
                type="danger"
                @click="handleDeleteClick(scope.row)"
                :icon="Delete"
              />

              <el-tooltip
                effect="dark"
                content="同步u9数据"
                placement="top"
                :show-after="150"
              >
                <el-button link type="primary" @click="" :icon="RefreshRight" />
              </el-tooltip>
            </el-space>
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

    <TipDialog ref="tipDialogRef" />
  </div>
</template>
