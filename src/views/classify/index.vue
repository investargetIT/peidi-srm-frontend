<script setup lang="ts">
import {
  getAllCate,
  addCate,
  updateCate,
  deleteCate,
  getPageCate
} from "@/api/user";
import { ref, watch } from "vue";
import { message } from "@/utils/message";

defineOptions({
  name: "Welcome"
});

const categoryList = ref([]);
const currentPage = ref<any[]>([]);
const pageSizeArr = ref([5, 10, 15, 20]);
const pageSize = ref(pageSizeArr.value[3]);
const curLevel = ref(1);
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const newCateData = ref({
  categoryName: "",
  // categoryCode: "",
  parentName: "",
  parentId: "",
  date1: "",
  date2: "",
  delivery: false,
  type: [],
  resource: "",
  desc: ""
});
const currentPageNum = ref(1);
const total = ref(0);
const activeCateData = ref({});
const dialogUpdateVisible = ref(false);
const dialogDeleteVisible = ref(false);
const formRef = ref(null);
const subFormRef = ref(null);
const rules = ref({
  categoryName: [
    { required: true, message: "Please input name", trigger: "blur" }
  ],
  categoryCode: [
    { required: true, message: "Please input code", trigger: "blur" }
  ],
  parentId: [
    { required: true, message: "Please input parentId", trigger: "blur" }
  ]
});

const handleSizeChange = (val: number) => {
  pageSize.value = val;
};

const fetchTableData = async () => {
  const listRes = await getAllCate({});
  if (listRes?.code) {
    const tempList = listRes?.data || [];
    categoryList.value = tempList?.filter(item => item.level === 1) || [];
    getCurrentPage();
  }
};

const getCurrentPage = () => {
  getPageCate({
    pageNo: Number(currentPageNum.value),
    pageSize: Number(pageSize.value)
  }).then(res => {
    if (res?.code) {
      const tempArr = buildTree(res?.data?.records || []);
      currentPage.value = tempArr;
      total.value = res?.data?.total;
    }
  });
};

fetchTableData();

// 清除新增分类信息
const clearNewCateData = () => {
  newCateData.value.categoryName = "";
  newCateData.value.categoryCode = "";
  newCateData.value.parentId = "";
};

const addCateData = async () => {
  if (!formRef) return;
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      const sendConfig = {
        ...newCateData.value,
        level: curLevel.value
      };
      if (curLevel.value === 2) {
        sendConfig.parentName = categoryList.value?.find(
          item => item.id === newCateData.value.parentCode
        )?.categoryName;
        sendConfig.parentId = newCateData.value.parentId;
      }
      addCate(sendConfig)
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("添加分类成功", { type: "success" });
            dialogFormVisible.value = false;
            clearNewCateData();
            fetchTableData();
          } else {
            message("添加分类失败--" + msg, { type: "error" });
          }
        })
        .catch(err => {
          message("添加分类失败", { type: "error" });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};

// 更新分类接口
const updateCateData = val => {
  if (
    !activeCateData.value.categoryCode ||
    !activeCateData.value.categoryName ||
    !activeCateData.value.id
  ) {
    return;
  }
  const sendConfig = {
    // categoryCode: "" + activeCateData.value.categoryCode,
    categoryName: "" + activeCateData.value.categoryName,
    id: activeCateData.value.id,
    level: curLevel.value
  };
  if (curLevel.value === 2) {
    sendConfig.parentName = categoryList.value?.find(
      item => item.id === activeCateData.value.parentId
    )?.categoryName;
    sendConfig.parentId = activeCateData.value.parentId;
  }
  updateCate(sendConfig)
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("更新分类成功", { type: "success" });
        dialogUpdateVisible.value = false;
        fetchTableData();
      } else {
        message("更新分类失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("更新分类失败", { type: "error" });
    });
};

const buildTree = (data: any[]) => {
  const map = new Map<number, any>(); // 节点映射表，用于快速查找父节点
  const roots: any[] = []; // 最终的树形结构根节点列表

  // 深拷贝数据，避免污染原始数据
  const copiedData = JSON.parse(JSON.stringify(data));
  const copiedCategoryList = JSON.parse(JSON.stringify(categoryList.value));

  // 处理 data 中的一级节点（直接作为根节点）
  copiedData.forEach((node: any) => {
    node.children = []; // 初始化子节点列表
    if (node.level === 1) {
      map.set(node.id, node);
      roots.push(node); // 加入根节点列表
    }
  });

  // 处理 data 中的二级节点（挂载到父节点）
  copiedData.forEach((node: any) => {
    if (node.level === 2) {
      // 优先从 data 中查找父节点
      let parent = map.get(node.parentId);
      if (!parent) {
        // 从 categoryList 中查找父节点
        const categoryParent = copiedCategoryList.find(
          (c: any) => c.id === node.parentId
        );
        if (categoryParent) {
          // 若父节点未加入 map，则初始化并加入根节点
          if (!map.has(categoryParent.id)) {
            const clonedParent = { ...categoryParent, children: [] };
            map.set(clonedParent.id, clonedParent);
            roots.push(clonedParent);
          }
          parent = map.get(categoryParent.id);
        }
      }
      // 挂载到父节点（若存在）
      parent?.children.push(node);
    }
  });

  return roots;
};

// 打开更新弹窗
const openUpdatePop = val => {
  const tempData = JSON.parse(JSON.stringify(val.row));
  activeCateData.value = tempData;
  if (tempData.level === 2) {
    activeCateData.value.parentId = categoryList.value.find(
      item => item.id === tempData.parentId
    )?.id;
  }
  dialogUpdateVisible.value = true;
  curLevel.value = val.row.level;
};

// 删除弹窗打开
const deletePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogDeleteVisible.value = true;
  curLevel.value = val.row.level;
};

// 删除分类的方法
const deleteCateFun = () => {
  if (
    !activeCateData.value.categoryCode ||
    !activeCateData.value.categoryName ||
    !activeCateData.value.id
  ) {
    return;
  }
  const sendConfig = {
    categoryCode: "" + activeCateData.value.categoryCode,
    categoryName: "" + activeCateData.value.categoryName,
    id: activeCateData.value.id
  };
  if (curLevel.value === 2) {
    sendConfig.parentId = activeCateData.value.parentId;
  }
  deleteCate(sendConfig)
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除分类成功", { type: "success" });
        dialogUpdateVisible.value = false;
        fetchTableData();
      } else {
        message("删除分类失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("删除分类失败", { type: "error" });
    });
};

const addChildCate = val => {
  dialogFormVisible.value = true;
  curLevel.value = 2;
  newCateData.value = { parentId: val.row.id };
};

const changeCurrentPage = val => {
  console.log("val", val);
};

watch([currentPageNum, pageSize], () => {
  console.log("currentPageNum", currentPageNum.value);
  getCurrentPage();
});
</script>

<template>
  <div class="container">
    <el-button
      class="addCate"
      type="primary"
      size="large"
      @click="
        dialogFormVisible = true;
        curLevel = 1;
        clearNewCateData();
      "
    >
      添加主分类
    </el-button>
    <el-table
      :data="currentPage"
      style="width: 90%; margin-bottom: 20px"
      border
      default-expand-all
      row-key="id"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column fixed prop="categoryName" label="主分类" width="250" />
      <el-table-column prop="categoryCode" label="编码" width="220" />
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="large"
            @click.stop="openUpdatePop(scope)"
          >
            更新
          </el-button>
          <el-button
            link
            type="primary"
            @click.stop="deletePop(scope)"
            size="large"
            >删除</el-button
          >
          <el-button
            link
            type="primary"
            v-if="scope.row.level === 1"
            @click="addChildCate(scope)"
            size="large"
            >添加子分类</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      v-model:current-page="currentPageNum"
      @current-change="changeCurrentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizeArr"
      @size-change="handleSizeChange"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    />
    <el-dialog
      v-model="dialogFormVisible"
      :title="curLevel === 1 ? '添加主分类' : '添加子分类'"
      width="500"
      destroy-on-close
    >
      <el-form :rules="rules" ref="formRef" :model="newCateData">
        <template v-if="curLevel === 1">
          <el-form-item
            label="主分类名称"
            prop="categoryName"
            :label-width="formLabelWidth"
          >
            <el-input v-model="newCateData.categoryName" autocomplete="off" />
          </el-form-item>

          <!-- <el-form-item
            label="主分类编码"
            prop="categoryCode"
            :label-width="formLabelWidth"
          >
            <el-input
              type="text"
              v-model="newCateData.categoryCode"
              autocomplete="off"
            />
          </el-form-item> -->
        </template>

        <template v-if="curLevel === 2">
          <el-form-item
            prop="parentId"
            label="主分类"
            :label-width="formLabelWidth"
          >
            <el-select
              v-model="newCateData.parentId"
              placeholder="选择主分类"
              disabled
            >
              <el-option
                v-for="item in categoryList"
                :label="item.categoryName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="子分类名称"
            prop="categoryName"
            :label-width="formLabelWidth"
          >
            <el-input v-model="newCateData.categoryName" autocomplete="off" />
          </el-form-item>
          <!-- <el-form-item
            label="子分类编码"
            prop="categoryCode"
            :label-width="formLabelWidth"
          >
            <el-input
              type="text"
              v-model="newCateData.categoryCode"
              autocomplete="off"
            />
          </el-form-item> -->
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="addCateData"> 添加 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogUpdateVisible"
      :title="curLevel === 1 ? '编辑主分类' : '编辑子分类'"
      width="500"
      destroy-on-close
    >
      <el-form :model="activeCateData" :rules="rules" ref="subFormRef">
        <template v-if="curLevel === 1">
          <el-form-item
            prop="categoryName"
            label="主分类"
            :label-width="formLabelWidth"
          >
            <el-input
              v-model="activeCateData.categoryName"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item
            prop="categoryCode"
            label="主分类编码"
            :label-width="formLabelWidth"
          >
            <el-input
              type="text"
              v-model="activeCateData.categoryCode"
              autocomplete="off"
              disabled
            />
          </el-form-item>
        </template>
        <template v-if="curLevel === 2">
          <el-form-item
            label="主分类"
            prop="parentId"
            :label-width="formLabelWidth"
          >
            <el-select class="ssss" v-model="activeCateData.parentId" disabled>
              <el-option
                v-for="item in categoryList"
                :label="item.categoryName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="子分类名称"
            prop="categoryName"
            :label-width="formLabelWidth"
          >
            <el-input
              v-model="activeCateData.categoryName"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item
            label="子分类编码"
            prop="categoryCode"
            :label-width="formLabelWidth"
          >
            <el-input
              type="text"
              v-model="activeCateData.categoryCode"
              autocomplete="off"
              disabled
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="updateCateData"> 更新 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogDeleteVisible" title="" width="500">
      <span>确定删除该分类吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogDeleteVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="
              dialogDeleteVisible = false;
              deleteCateFun();
            "
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 54px;
  margin: 0 !important;
}

.addCate {
  position: absolute;
  top: 4px;
  right: 64px;
}

.pagination {
  margin-top: 20px;
}
</style>
