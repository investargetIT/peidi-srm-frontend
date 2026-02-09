<script setup lang="ts">
import { ElMessageBox } from "element-plus";

const props = defineProps({
  tableData: {
    type: Array,
    required: true
  },
  deleteFn: {
    type: Function,
    required: true
  },
  addOrEditFn: {
    type: Function,
    required: true
  }
});

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除分类【${row.categoryName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      props.deleteFn(row.id);
    })
    .catch(() => {});
};

const handleAddMainCate = () => {
  props.addOrEditFn("add", null);
};

const handleAddChildCate = (row: any) => {
  props.addOrEditFn("add", row);
};

const handleUpdateCate = (row: any) => {
  props.addOrEditFn("edit", row);
};
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between mb-[20px]">
        <div class="text-[#0a0a0a]">工厂产品分类表</div>
        <el-button type="primary" @click="handleAddMainCate"
          >添加主分类</el-button
        >
      </div>

      <div>
        <el-table
          :data="tableData"
          border
          row-key="id"
          :tree-props="{ children: 'children' }"
          :header-cell-style="{ color: '#0a0a0a' }"
        >
          <el-table-column
            prop="categoryName"
            label="主分类"
            :resizable="false"
          />
          <el-table-column
            prop="categoryCode"
            label="编码"
            :resizable="false"
          />
          <el-table-column label="操作" :resizable="false">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="handleUpdateCate(scope.row)"
              >
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
              <el-button
                link
                type="primary"
                v-if="scope.row.level === 1"
                @click="handleAddChildCate(scope.row)"
              >
                添加子分类
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>
