<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  addPd,
  deletePd,
  getPagePd,
  updatePd,
  getPageSupplier,
  getSpecGoodsList
} from "@/api/user";
import { message } from "@/utils/message";
import DetailDialog from "./detailDialog.vue";
import { debounce } from "@pureadmin/utils";

const loading = ref(false);

const addClass = ({ row }) => {
  if (row.enable === false) {
    return "disabled-row";
  }
};

const searchInfo = ref({
  materialCode: "",
  supplierId: ""
});

const currentPage = ref([
  // {
  //   id: 1000000000,
  //   businessDate: "2023-10-01", // 业务日期
  //   supplierId: "深圳市XX电子有限公司", // 供应商
  //   materialCode: "MAT123456", // 料号
  //   productName: "碳膜电阻", // 品名
  //   specification: "1/4W 100Ω ±5%", // 规格
  //   barcode: "BAR123456789", // 条码
  //   unit: "个", // 单位
  //   referenceCost: "0.50" // 价格
  // }
]);

const paginationConfig = ref({
  currentPageNum: 1,
  pageSize: 20,
  pageSizeArr: [5, 10, 15, 20],
  total: 0
});

const supplierList = ref([]);
const specGoodsList = ref([]);

//#region 请求相关

// 供应商列表
const fetchSupplierList = () => {
  return getPageSupplier({
    pageNo: 1,
    pageSize: 10e3
  }).then((res: any) => {
    // console.log("供应商列表：", res);
    supplierList.value = res.data.records || [];
  });
};

// 获取料号
const fetchSpecGoodsList = () => {
  return getSpecGoodsList({
    searchStr: JSON.stringify([
      { searchName: "u9No", searchType: "like", searchValue: "." }
    ])
  }).then((res: any) => {
    // console.log("料号表：", res.data);
    specGoodsList.value = res.data.filter(item => item.u9No !== "") || [];
  });
};

const getCurrentPage = () => {
  const searchStr: any = [
    { searchName: "type", searchType: "equals", searchValue: `\"pdzc\"` },
    { searchName: "enable", searchType: "equals", searchValue: `true` }
  ];
  Object.keys(searchInfo.value).forEach(key => {
    if (searchInfo.value[key]) {
      searchStr.push({
        searchName: key,
        searchType: "like",
        searchValue: searchInfo.value[key]
      });
    }
  });

  return getPagePd({
    pageNo: paginationConfig.value.currentPageNum,
    pageSize: paginationConfig.value.pageSize,
    searchStr: JSON.stringify(searchStr),
    sortStr: JSON.stringify([{ sortName: "id", sortType: "desc" }])
  })
    .then((res: any) => {
      // console.log("智创产品列表：", res);

      // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
      if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
        paginationConfig.value.currentPageNum = res.data?.pages;
        return;
      }

      // 更新总页数
      paginationConfig.value.total = res.data?.total || 0;

      currentPage.value = res.data.records || [];
    })
    .catch(err => {
      message("获取智创产品列表失败:" + err.message, { type: "error" });
    });
};

const deleteCateFun = id => {
  // message("已删除 产品id：" + id);
  // return;
  deletePd({ id })
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除产品成功", { type: "success" });
        getCurrentPage();
      } else {
        message("删除产品失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("删除产品失败", { type: "error" });
    });
};

const addCateData = (data: any, callback?: () => void) => {
  // message("调用添加接口");
  console.log("添加数据:", data);
  // return;
  addPd({
    ...data,
    type: "pdzc"
  })
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("添加产品成功", { type: "success" });
        if (callback) callback();
        getCurrentPage();
      } else {
        message("添加产品失败:" + msg, { type: "error" });
      }
    })
    .catch(error => {
      message("添加产品失败:" + error.message, { type: "error" });
    });
};

const updateCateData = (data: any, callback?: () => void) => {
  // message("调用更新接口");
  console.log("更新数据:", data);
  // return;
  updatePd({
    ...data
  })
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("更新产品成功", { type: "success" });
        if (callback) callback();
        getCurrentPage();
      } else {
        message("更新产品失败:" + msg, { type: "error" });
      }
    })
    .catch(error => {
      message("更新产品失败:" + error.message, { type: "error" });
    });
};
//#endregion

const deletePop = val => {
  console.log("deletePop", val.row);

  if (val.row.id == null) {
    message("id不能为空", { type: "error" });
    return;
  }

  ElMessageBox.confirm("确认删除该产品吗？", "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteCateFun(val.row.id);
    })
    .catch(() => {});
};

const detailDialogRef = ref(null);

const handleAddClick = () => {
  detailDialogRef.value.initDialog("add");
};

const handleUpdateClick = row => {
  detailDialogRef.value.initDialog("edit", row);
};

onMounted(async () => {
  loading.value = true;
  await fetchSupplierList();
  await fetchSpecGoodsList();
  await getCurrentPage();
  loading.value = false;
});

const debouncedGetCurrentPage = debounce(() => {
  getCurrentPage();
}, 500);

watch(
  [searchInfo],
  () => {
    debouncedGetCurrentPage();
  },
  { deep: true }
);

watch(
  () => [
    paginationConfig.value.currentPageNum,
    paginationConfig.value.pageSize
  ],
  () => {
    getCurrentPage();
  },
  { deep: true }
);
</script>

<template>
  <div>
    <div class="flex justify-between mb-[20px]">
      <el-space>
        <el-select
          v-model="searchInfo.supplierId"
          style="width: 240px"
          placeholder="请选择供应商"
          :disabled="loading"
          filterable
          clearable
        >
          <el-option
            v-for="item in supplierList"
            :key="item.id"
            :label="item.companyName"
            :value="item.id"
          />
        </el-select>
        <el-input
          v-model="searchInfo.materialCode"
          style="width: 240px"
          placeholder="请输入料号"
          :disabled="loading"
          clearable
        />
      </el-space>
      <div>
        <el-button
          type="primary"
          size="large"
          @click="handleAddClick"
          :disabled="loading"
        >
          添加产品
        </el-button>
      </div>
    </div>

    <el-table
      :data="currentPage"
      :row-class-name="addClass"
      v-loading="loading"
      element-loading-text="加载中..."
      :header-cell-style="{ color: '#0a0a0a' }"
      size="small"
    >
      <el-table-column prop="businessDate" label="业务日期" />
      <el-table-column prop="supplierId" label="供应商">
        <template #default="scope">
          {{
            supplierList.find(item => item.id === scope.row.supplierId)
              ?.companyName || "-"
          }}
        </template>
      </el-table-column>
      <el-table-column prop="materialCode" label="料号" />
      <el-table-column prop="productName" label="品名" />
      <el-table-column prop="specification" label="规格" />
      <el-table-column prop="barcode" label="条码" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="referenceCost" label="价格" />

      <el-table-column fixed="right" label="操作" width="125">
        <template #default="scope">
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="primary"
            size="large"
            @click="handleUpdateClick(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="danger"
            @click="deletePop(scope)"
            size="large"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-[20px]">
      <el-pagination
        v-model:current-page="paginationConfig.currentPageNum"
        v-model:page-size="paginationConfig.pageSize"
        :page-sizes="paginationConfig.pageSizeArr"
        layout="total, sizes, prev, pager, next, jumper"
        :total="paginationConfig.total"
      />
    </div>

    <DetailDialog
      ref="detailDialogRef"
      :addCateData="addCateData"
      :updateCateData="updateCateData"
      :supplierList="supplierList"
      :specGoodsList="specGoodsList"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.disabled-row) {
  color: #ccc;
  background-color: #f5f7fa;
}
</style>
