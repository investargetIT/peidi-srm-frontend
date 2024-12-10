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

const tableData = ref([]);

const currentPage = ref([]);
const pageSizeArr = ref([5, 10, 15, 20]);
const pageSize = ref(pageSizeArr.value[3]);

const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const currentPageNum = ref(1);

const getAllCateFun = () => {
  getAllCate({}).then(res => {
    console.log("res", res);
    if (res?.code) {
      tableData.value = res?.data || [];
    }
  });
};

const getCurrentPage = () => {
  getPageCate({
    pageNo: Number(currentPageNum.value),
    pageSize: Number(pageSize.value)
  }).then(res => {
    console.log("res", res);
    if (res?.code) {
      currentPage.value = res?.data?.records || [];
    }
  });
};

getAllCateFun();
getCurrentPage();

// 清除新增分类信息
const clearNewCateData = () => {
  newCateData.value.name = "";
  newCateData.value.code = "";
};

const addCateData = async () => {
  if (!formRef) return;
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      addCate({
        categoryCode: "" + newCateData.value.code,
        categoryName: "" + newCateData.value.name
      })
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("添加分类成功", { type: "success" });
            dialogFormVisible.value = false;
            clearNewCateData();
            getAllCateFun();
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

const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const newCateData = ref({
  name: "",
  code: "",
  date1: "",
  date2: "",
  delivery: false,
  type: [],
  resource: "",
  desc: ""
});

const activeCateData = ref({});
const dialogUpdateVisible = ref(false);
const dialogDeleteVisible = ref(false);

// 更新分类接口
const updateCateData = val => {
  console.log("activeCateData", activeCateData.value);

  if (
    !activeCateData.value.categoryCode ||
    !activeCateData.value.categoryName ||
    !activeCateData.value.id
  ) {
    return;
  }
  updateCate({
    categoryCode: "" + activeCateData.value.categoryCode,
    categoryName: "" + activeCateData.value.categoryName,
    id: activeCateData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("更新分类成功", { type: "success" });
        dialogUpdateVisible.value = false;
        getAllCateFun();
        getCurrentPage();
      } else {
        message("更新分类失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("更新分类失败", { type: "error" });
    });
};

// 打开更新弹窗
const openUpdatePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogUpdateVisible.value = true;
};

// 删除弹窗打开
const deletePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogDeleteVisible.value = true;
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
  deleteCate({
    categoryCode: "" + activeCateData.value.categoryCode,
    categoryName: "" + activeCateData.value.categoryName,
    id: activeCateData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除分类成功", { type: "success" });
        dialogUpdateVisible.value = false;
        getAllCateFun();
        getCurrentPage();
      } else {
        message("删除分类失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("删除分类失败", { type: "error" });
    });
};

const changeCurrentPage = val => {
  console.log("val", val);
};

watch([currentPageNum, pageSize], () => {
  console.log("currentPageNum", currentPageNum.value);
  getCurrentPage();
});

const formRef = ref(null);
const rules = ref({
  name: [{ required: true, message: "Please input name", trigger: "blur" }],
  code: [{ required: true, message: "Please input code", trigger: "blur" }]
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
        clearNewCateData();
      "
    >
      添加分类
    </el-button>
    <el-table :data="currentPage" style="width: 90%">
      <el-table-column fixed prop="categoryName" label="主分类" width="250" />
      <el-table-column prop="categoryCode" label="编码" width="220" />
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="large"
            @click="openUpdatePop(scope)"
          >
            更新
          </el-button>
          <el-button link type="primary" @click="deletePop(scope)" size="large"
            >删除</el-button
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
      :total="tableData.length"
    />
    <el-dialog v-model="dialogFormVisible" title="添加新分类" width="500">
      <el-form :rules="rules" ref="formRef" :model="newCateData">
        <el-form-item label="主分类" prop="name" :label-width="formLabelWidth">
          <el-input v-model="newCateData.name" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="主分类编码"
          prop="code"
          :label-width="formLabelWidth"
        >
          <el-input type="text" v-model="newCateData.code" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="addCateData"> 添加 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogUpdateVisible" title="编辑分类" width="500">
      <el-form :model="activeCateData">
        <el-form-item label="主分类" :label-width="formLabelWidth">
          <el-input v-model="activeCateData.categoryName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="主分类编码" :label-width="formLabelWidth">
          <el-input
            type="text"
            v-model="activeCateData.categoryCode"
            autocomplete="off"
          />
        </el-form-item>
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
