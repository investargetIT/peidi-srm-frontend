<script setup lang="ts">
import {
  addCate,
  deleteCate,
  getAllCate,
  getPageCate,
  updateCate
} from "@/api/user";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import FormDialog from "./components/formDialog/index.vue";
import TableCard from "./components/tableCard/index.vue";

const categoryList = ref([]);
const categoryTableData = ref([]);

//#region 格式化工具
const formatCategoryTree = (data: any[]) => {
  const nodeMap = new Map<number, any>();
  const treeRoots: any[] = [];

  // 深拷贝数据避免污染原始数据
  const copiedData = JSON.parse(JSON.stringify(data));
  const copiedCategoryList = JSON.parse(JSON.stringify(categoryList.value));

  // 处理一级节点
  copiedData.forEach((node: any) => {
    if (node.level === 1) {
      node.children = [];
      nodeMap.set(node.id, node);
      treeRoots.push(node);
    }
  });

  // 处理二级节点
  copiedData.forEach((node: any) => {
    if (node.level === 2) {
      let parent = nodeMap.get(node.parentId);

      // 从categoryList中查找父节点
      if (!parent) {
        const categoryParent = copiedCategoryList.find(
          (c: any) => c.id === node.parentId
        );

        if (categoryParent && !nodeMap.has(categoryParent.id)) {
          const clonedParent = { ...categoryParent, children: [] };
          nodeMap.set(clonedParent.id, clonedParent);
          treeRoots.push(clonedParent);
        }

        parent = nodeMap.get(categoryParent?.id);
      }

      parent?.children.push(node);
    }
  });

  return treeRoots;
};
//#endregion

//#region 请求相关逻辑
const fetchCategoryPage = () => {
  return getPageCate({
    pageNo: 1,
    pageSize: 10e3
  })
    .then((res: any) => {
      if (res?.code === 200) {
        const tempArr = formatCategoryTree(res?.data?.records || []);
        // console.log("格式化后的分类列表:", tempArr);
        categoryTableData.value = tempArr;
      } else {
        ElMessage.error("获取分类列表失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取分类列表失败:" + error?.message);
    });
};

const fetchAllCate = () => {
  return getAllCate({})
    .then((res: any) => {
      if (res?.code === 200) {
        const temp = res?.data || [];
        categoryList.value = temp?.filter(item => item.level === 1) || [];
      } else {
        ElMessage.error("获取所有分类失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取所有分类失败:" + error?.message);
    });
};

const fetchDeleteCate = (id: number | string) => {
  // console.log("删除分类id:", id);
  // return;
  deleteCate({ id })
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("删除分类成功");
        fetchCategoryPage();
      } else {
        ElMessage.error("删除分类失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("删除分类失败:" + error?.message);
    });
};

const fetchAddCate = (data: any, callback?: () => void) => {
  // console.log("添加分类数据:", data);
  // return;
  addCate(data)
    .then((res: any) => {
      if (res?.code == 200) {
        ElMessage.success("添加分类成功");
        callback?.();
        fetchCategoryPage();
      } else {
        ElMessage.error("添加分类失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("添加分类失败:" + error?.message);
    });
};

const fetchUpdateCate = (data: any, callback?: () => void) => {
  // console.log("编辑分类数据:", data);
  // return;
  updateCate(data)
    .then((res: any) => {
      if (res.code == 200) {
        ElMessage.success("编辑分类成功");
        callback?.();
        fetchCategoryPage();
      } else {
        ElMessage.error("编辑分类失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("编辑分类失败:" + error?.message);
    });
};

//#endregion

const formDialogRef = ref();
const handleAddOrEditClick = (type: "add" | "edit", row: any) => {
  formDialogRef.value.initDialog(type, row);
};

onMounted(async () => {
  await fetchAllCate();
  fetchCategoryPage();
});
</script>

<template>
  <div>
    <div>
      <TableCard
        :tableData="categoryTableData"
        :deleteFn="fetchDeleteCate"
        :addOrEditFn="handleAddOrEditClick"
      />
    </div>

    <div>
      <FormDialog
        :categoryList="categoryList"
        :addFn="fetchAddCate"
        :updateFn="fetchUpdateCate"
        ref="formDialogRef"
      />
    </div>
  </div>
</template>
