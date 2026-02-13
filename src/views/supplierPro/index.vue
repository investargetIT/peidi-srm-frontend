<script setup lang="ts">
import {
  addSupplier,
  deleteSupplier,
  fetchProductList,
  getAllCate,
  getEnum,
  getPageSupplier,
  updateSupplier
} from "@/api/user";
import { buildTree } from "@/utils/common";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import DetailDialog from "./components/detailDialog/index.vue";
import SearchCard from "./components/searchCard/index.vue";
import TableCard from "./components/tableCard/index.vue";

const loading = ref(false);
const supplierGradeEnum = ref([]);
const productTree = ref([]);
const productTreeLoading = ref(true);
const supplierTableData = ref([]);
const tableCardRef = ref();

//#region 搜索相关
const searchCardRef = ref();
const getSearchStr = () => {
  const searchStr = [];

  const searchInfo = searchCardRef.value?.getSearchInfo();
  if (searchInfo?.companyName) {
    searchStr.push({
      searchName: "companyName",
      searchType: "like",
      searchValue: `${searchInfo.companyName}`
    });
  }

  if (searchInfo?.serviceStatus) {
    searchStr.push({
      searchName: "serviceStatus",
      searchType: "equals",
      searchValue: `\"${searchInfo.serviceStatus}\"`
    });
  }

  if (searchInfo?.supplierGradeId) {
    searchStr.push({
      searchName: "supplierGradeId",
      searchType: "equals",
      searchValue: `\"${searchInfo.supplierGradeId}\"`
    });
  }

  if (searchInfo?.rating) {
    searchStr.push({
      searchName: "rating",
      searchType: "equals",
      searchValue: `\"${searchInfo.rating}\"`
    });
  }

  return JSON.stringify(searchStr);
};
//#endregion

//#region 请求相关
const fetchSupplierGradeEnum = () => {
  return getEnum({
    type: "supplier_grade"
  })
    .then((res: any) => {
      if (res?.code == 200) {
        supplierGradeEnum.value =
          res?.data.sort((a: any, b: any) => a.id - b.id) || [];
      } else {
        ElMessage.error("获取供应商等级枚举失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取枚举失败:" + error.message);
    });
};

const fetchSupplierList = () => {
  loading.value = true;
  return getPageSupplier({
    pageNo: tableCardRef.value?.getPaginationInfo()?.currentPage || 1,
    pageSize: tableCardRef.value?.getPaginationInfo()?.pageSize || 10,
    searchStr: getSearchStr(),
    sortStr: JSON.stringify([
      { sortName: "serviceStatus", sortType: "asc" },
      { sortName: "id", sortType: "desc" }
    ])
  })
    .then((res: any) => {
      if (res?.code === 200) {
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

        supplierTableData.value = res?.data?.records || [];
      } else {
        ElMessage.error("获取供应商列表失败:" + res?.msg);
      }
    })
    .catch((error: any) => {
      ElMessage.error("获取供应商列表失败:" + error?.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

const fetchAddSupplier = (data: any, callback?: () => void) => {
  addSupplier({ ...data })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("添加供应商成功");
        callback?.();
        fetchSupplierList();
      } else {
        ElMessage.error("添加供应商失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("添加供应商失败:" + error.message);
    });
};

const fetchUpdateSupplier = (data: any, callback?: () => void) => {
  updateSupplier({
    ...data
  })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("更新供应商成功");
        callback?.();
        fetchSupplierList();
      } else {
        ElMessage.error("更新供应商失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("更新供应商失败:" + error.message);
    });
};

const fetchDeleteSupplier = (id: string | number) => {
  deleteSupplier({ id })
    .then((res: any) => {
      if (res.code == 200) {
        ElMessage.success("删除供应商成功");

        fetchSupplierList();
      } else {
        ElMessage.error("删除供应商失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("删除供应商失败:" + error?.message);
    });
};

// 获取产品信息树
const fetchMergeTreeData = async () => {
  try {
    // 获取分类和产品数据
    const [catRes, productRes]: any = await Promise.all([
      getAllCate({}),
      fetchProductList({
        // searchStr: JSON.stringify([
        //   { searchName: "enable", searchType: "equals", searchValue: "true" }
        // ])
      })
    ]);

    // 处理原始数据
    const categoryTree = catRes?.code ? buildTree(catRes.data || []) : [];
    let productTreeData = productRes?.code ? productRes.data || [] : [];
    // console.log("获取产品信息树:", categoryTree, productTreeData);

    // productTreeData需要根据materialCode去重一次
    productTreeData = productTreeData.reduce((acc: any, cur: any) => {
      if (!acc.find((item2: any) => item2.materialCode == cur.materialCode)) {
        acc.push(cur);
      }
      return acc;
    }, []);

    // 构建基础树结构（三级：父分类->子分类->产品）
    const level1Map = {};
    productTreeData.forEach(item => {
      const { parentCategoryId, categoryId } = item;
      if (!parentCategoryId || !categoryId) return;

      // 第一级：父分类
      if (!level1Map[parentCategoryId]) {
        level1Map[parentCategoryId] = {
          value: parseInt(parentCategoryId, 10),
          label: item.parentCategoryName || parentCategoryId,
          children: {}
        };
      }

      // 第二级：子分类
      const level1Node = level1Map[parentCategoryId];
      if (!level1Node.children[categoryId]) {
        level1Node.children[categoryId] = {
          value: parseInt(categoryId, 10),
          label: item.categoryName || categoryId,
          children: []
        };
      }

      // 第三级：产品
      level1Node.children[categoryId].children.push({
        value: item.id,
        label: item.productName || "Unnamed"
      });
    });

    // 转换为标准树形结构
    const productTreeStructure = Object.values(level1Map).map(
      (level1: any) => ({
        ...level1,
        children: Object.values(level1.children)
      })
    );

    // 合并分类树和产品树
    const treeMap = {};
    const idToNodeMap = {};

    // 构建基础分类树并建立映射
    const processNode = node => {
      const convertedNode = {
        value: node.id,
        label: node.categoryName,
        children: []
      };
      idToNodeMap[node.id] = convertedNode;

      if (node.children && node.children.length > 0) {
        convertedNode.children = node.children.map(child => processNode(child));
      }
      return convertedNode;
    };

    categoryTree.forEach(item => {
      const convertedNode = processNode(item);
      treeMap[item.id] = convertedNode;
    });

    const baseTree = Object.values(treeMap);

    // 将产品数据挂载到对应分类节点
    productTreeStructure.forEach(level1 => {
      level1.children.forEach(level2 => {
        const targetNode = idToNodeMap[level2.value];
        if (targetNode) {
          targetNode.children.push(...level2.children);
        }
      });
    });

    // 提取智创产品
    const pdzcTree = productTreeData
      .filter(item => item.type === "pdzc")
      .map(item => ({
        value: item.id,
        label: item.productName,
        children: []
      }));

    // 构建最终的根节点结构
    productTree.value = [
      {
        value: "rootFactory",
        label: "工厂产品",
        children: baseTree
      },
      {
        value: "rootPdzc",
        label: "智创产品",
        children: pdzcTree
      }
    ];

    productTreeLoading.value = false;
  } catch (error) {
    ElMessage.error("获取产品树失败: " + error?.message);
    productTreeLoading.value = false;
  }
};
//#endregion

//#region 详情弹窗相关
const detailDialogRef = ref();
const openDetailDialog = (type: "add" | "edit", row?: any) => {
  detailDialogRef.value.initFormData(type, row);
};
//#endregion

onMounted(async () => {
  await fetchSupplierGradeEnum();
  fetchMergeTreeData();
  await fetchSupplierList();
});
</script>

<template>
  <div>
    <div>
      <SearchCard
        ref="searchCardRef"
        :fetchSupplierList="fetchSupplierList"
        :loading="loading"
        :supplierGradeEnum="supplierGradeEnum"
      />
    </div>

    <div class="mt-[20px]">
      <TableCard
        ref="tableCardRef"
        :tableData="supplierTableData"
        :openDetailDialog="openDetailDialog"
        :deleteFn="fetchDeleteSupplier"
        :fetchSupplierList="fetchSupplierList"
        :loading="loading"
      />
    </div>

    <div>
      <DetailDialog
        ref="detailDialogRef"
        :supplierGradeEnum="supplierGradeEnum"
        :productTree="productTree"
        :addFn="fetchAddSupplier"
        :updateFn="fetchUpdateSupplier"
        :productTreeLoading="productTreeLoading"
      />
    </div>
  </div>
</template>
