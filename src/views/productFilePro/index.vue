<script setup lang="ts">
import {
  addPd,
  deletePd,
  getAllCate,
  getEnum,
  getPagePd,
  getPageSupplier,
  updatePd
} from "@/api/user";
import { buildTree } from "@/utils/common";
import { storageLocal } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import DetailDialog from "./components/detailDialog/index.vue";
import SearchCard from "./components/searchCard/index.vue";
import TableCard from "./components/tableCard/index.vue";

const router = useRoute();
const PARENT_CATEGORY_NAME = (router.name as string) || "";
//@ts-ignore
const USER_ID = storageLocal().getItem("dataSource")?.id || null;

const loading = ref(true);
const allCateData = ref([]);
const categoryNameList = ref([]);
const supplierList = ref([]);
const manageLevelEnum = ref([]);
const productTableData = ref([]);
const tableCardRef = ref();

//#region 搜索相关
const searchCardRef = ref();
const getSearchStr = () => {
  const searchStr = [
    { searchName: "type", searchType: "equals", searchValue: `\"factory\"` },
    {
      searchName: "parentCategoryName",
      searchType: "equals",
      searchValue: `\"${PARENT_CATEGORY_NAME}\"`
    }
  ];

  const searchInfo = searchCardRef.value?.getSearchInfo();
  if (searchInfo?.categoryName) {
    searchStr.push({
      searchName: "categoryName",
      searchType: "equals",
      searchValue: `\"${searchInfo.categoryName}\"`
    });
  }
  if (searchInfo?.productName) {
    searchStr.push({
      searchName: "productName",
      searchType: "like",
      searchValue: `${searchInfo.productName}`
    });
  }

  return JSON.stringify(searchStr);
};
//#endregion

//#region 请求相关
const fetchAllCate = () => {
  return getAllCate({})
    .then((res: any) => {
      // console.log("获取所有分类", res);
      if (res?.code == 200) {
        allCateData.value = buildTree(res?.data || []);
        // console.log("获取所有分类", allCateData.value, PARENT_CATEGORY_NAME);

        categoryNameList.value =
          allCateData.value.find(
            (item: any) => item.categoryName === PARENT_CATEGORY_NAME
          )?.children || [];
      } else {
        ElMessage.error("获取所有分类失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取所有分类失败:" + error.message);
    });
};

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

// 获取管理等级枚举
const fetchManageLevelEnum = () => {
  return getEnum({
    type: "management_level"
  })
    .then((res: any) => {
      if (res?.code == 200) {
        manageLevelEnum.value = res?.data || [];
      } else {
        ElMessage.error("获取管理等级枚举" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取管理等级枚举:" + error.message);
    });
};

const fetchProductPage = () => {
  loading.value = true;
  return getPagePd({
    pageNo: tableCardRef.value?.getPaginationInfo()?.currentPage || 1,
    pageSize: tableCardRef.value?.getPaginationInfo()?.pageSize || 10,
    searchStr: getSearchStr(),
    sortStr: JSON.stringify([{ sortName: "id", sortType: "desc" }])
  })
    .then((res: any) => {
      // console.log("工厂产品列表:", res);

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

      if (res?.code == 200) {
        productTableData.value = res?.data?.records || [];
      } else {
        ElMessage.error("获取工厂产品列表失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取工厂产品列表失败:" + error.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

const fetchAdd = (data: any, callback?: () => void) => {
  // console.log("添加数据:", data);
  // return;
  addPd({
    ...data,
    type: "factory",
    userId: USER_ID
  })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("添加产品成功");
        if (callback) callback();
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
    type: "factory",
    userId: USER_ID
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
  await fetchAllCate();
  await fetchSupplierList();
  await fetchManageLevelEnum();
  await fetchProductPage();
});
</script>

<template>
  <div>
    <div>
      <SearchCard
        ref="searchCardRef"
        :categoryNameList="categoryNameList"
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
        :loading="loading"
      />
    </div>

    <div>
      <DetailDialog
        ref="detailDialogRef"
        :allCateData="allCateData"
        :manageLevelEnum="manageLevelEnum"
        :supplierList="supplierList"
        :addFn="fetchAdd"
        :updateFn="fetchUpdate"
      />
    </div>
  </div>
</template>
