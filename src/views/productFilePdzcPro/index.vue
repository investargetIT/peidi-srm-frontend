<script setup lang="ts">
import {
  addPd,
  deletePd,
  getPagePd,
  getPageSupplier,
  getSpecGoodsList,
  updatePd
} from "@/api/user";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import DetailDialog from "./components/detailDialog/index.vue";
import SearchCard from "./components/searchCard/index.vue";
import TableCard from "./components/tableCard/index.vue";

const supplierList = ref([]);
const specGoodsList = ref([]);
const productTableData = ref([]);
const tableCardRef = ref();

//#region 搜索相关
const searchCardRef = ref();
const getSearchStr = () => {
  const searchStr = [
    { searchName: "type", searchType: "equals", searchValue: `\"pdzc\"` },
    { searchName: "enable", searchType: "equals", searchValue: `true` }
  ];

  const searchInfo = searchCardRef.value?.getSearchInfo();
  if (searchInfo?.supplierId) {
    searchStr.push({
      searchName: "supplierId",
      searchType: "equals",
      searchValue: `\"${searchInfo.supplierId}\"`
    });
  }
  if (searchInfo?.barcode) {
    searchStr.push({
      searchName: "barcode",
      searchType: "like",
      searchValue: `${searchInfo.barcode}`
    });
  }

  return JSON.stringify(searchStr);
};
//#endregion
//#region 请求相关
const fetchSupplierList = () => {
  return getPageSupplier({
    pageNo: 1,
    pageSize: 10e3
  })
    .then((res: any) => {
      // console.log("供应商列表：", res);
      if (res?.code === 200) {
        supplierList.value = res.data.records || [];
      } else {
        ElMessage.error("获取供应商列表失败：" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取供应商列表失败：" + error.message);
    });
};

// 获取料号
const fetchSpecGoodsList = () => {
  return getSpecGoodsList({
    searchStr: JSON.stringify([
      { searchName: "u9No", searchType: "like", searchValue: "." }
    ])
  })
    .then((res: any) => {
      // console.log("料号列表：", res.data);
      if (res?.code === 200) {
        specGoodsList.value = res.data.filter(item => item.u9No !== "") || [];
      } else {
        ElMessage.error("获取料号列表失败：" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取料号列表失败：" + error.message);
    });
};

const fetchProductPage = () => {
  return getPagePd({
    pageNo: tableCardRef.value?.getPaginationInfo()?.currentPage || 1,
    pageSize: tableCardRef.value?.getPaginationInfo()?.pageSize || 10,
    searchStr: getSearchStr(),
    sortStr: JSON.stringify([{ sortName: "id", sortType: "desc" }])
  })
    .then((res: any) => {
      // console.log("智创产品列表：", res);

      // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
      if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
        tableCardRef.value?.setPaginationInfo({
          currentPage: res.data?.pages
        });
        return;
      }

      // 更新总页数
      tableCardRef.value?.setPaginationInfo({
        total: res.data?.total || 0
      });

      if (res?.code === 200) {
        productTableData.value = res.data.records || [];
      } else {
        ElMessage.error("获取智创产品列表失败：" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取智创产品列表失败:" + error.message);
    });
};

const fetchAdd = (data: any, callback?: () => void) => {
  // console.log("添加数据:", data);
  // return;
  addPd({
    ...data,
    type: "pdzc",
    supplierId: data.supplierProduct.join(",") // 用于筛选供应商
  })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("添加产品成功");
        callback?.();
        fetchProductPage();
      } else {
        ElMessage.error("添加产品失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("添加产品失败:" + error.message);
    });
};

const fetchUpdate = (data: any, callback?: () => void) => {
  // console.log("更新数据:", data);
  // return;
  updatePd({
    ...data,
    supplierId: data.supplierProduct.join(",")
  })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("更新产品成功");
        if (callback) callback();
        fetchProductPage();
      } else {
        ElMessage.error("更新产品失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("更新产品失败:" + error.message);
    });
};

const fetchDelete = (id: string | number) => {
  deletePd({ id })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("删除产品成功");
        fetchProductPage();
      } else {
        ElMessage.error("删除产品失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("删除产品失败:" + error.message);
    });
};
//#endregion

//#region 详情弹窗相关
const detailDialogRef = ref();
const openDetailDialog = (type: "add" | "edit", row?: any) => {
  detailDialogRef.value.initFormData(type, row);
};
//#endregion

onMounted(async () => {
  await fetchSupplierList();
  await fetchSpecGoodsList();
  await fetchProductPage();
});
</script>

<template>
  <div>
    <div>
      <SearchCard
        ref="searchCardRef"
        :supplierList="supplierList"
        :fetchProductPage="fetchProductPage"
      />
    </div>

    <div class="mt-[20px]">
      <TableCard
        ref="tableCardRef"
        :tableData="productTableData"
        :supplierList="supplierList"
        :openDetailDialog="openDetailDialog"
        :deleteFn="fetchDelete"
        :fetchProductPage="fetchProductPage"
      />
    </div>

    <div>
      <DetailDialog
        ref="detailDialogRef"
        :supplierList="supplierList"
        :specGoodsList="specGoodsList"
        :addFn="fetchAdd"
        :updateFn="fetchUpdate"
      />
    </div>
  </div>
</template>
