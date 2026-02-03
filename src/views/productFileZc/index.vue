<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { addPd, deletePd, getPagePd, updatePd } from "@/api/user";
import { message } from "@/utils/message";
import DetailDialog from "./detailDialog.vue";

const searchInfo = ref({
  materialCode: ""
});

const currentPage = ref([
  {
    id: 1000000000,
    lastQuoteDate: "2023-10-01", // 业务日期
    supplierName: "深圳市XX电子有限公司", // 供应商
    materialCode: "MAT123456", // 料号
    productName: "碳膜电阻", // 品名
    specification: "1/4W 100Ω ±5%", // 规格
    barcode: "BAR123456789", // 条码
    unit: "个", // 单位
    referenceCost: "0.50" // 价格
  }
]);

const addClass = ({ row }) => {
  if (row.enable === false) {
    return "disabled-row";
  }
};

const paginationConfig = ref({
  currentPageNum: 1,
  pageSize: 10,
  pageSizeArr: [10, 20, 30, 40, 50],
  total: 0
});

//#region 请求相关
const getCurrentPage = () => {
  const searchStr: any = [];
  getPagePd({
    pageNo: 1,
    pageSize: 11
  }).then(res => {
    console.log("智创产品列表：", res);
  });
};

const deleteCateFun = id => {
  message("已删除 产品id：" + id);
  return;
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

const addCateData = () => {
  message("调用添加接口");
  return;
  addPd({})
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("添加产品成功", { type: "success" });
        getCurrentPage();
      } else {
        message("添加产品失败:" + msg, { type: "error" });
      }
    })
    .catch(error => {
      message("添加产品失败:" + error.message, { type: "error" });
    });
};

const updateCateData = (formData: any) => {
  message("调用更新接口");
  return;
  updatePd({})
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("更新产品成功", { type: "success" });
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

onMounted(() => {
  getCurrentPage();
});
</script>

<template>
  <div>
    <div class="flex justify-between mb-[20px]">
      <el-space>
        <el-input
          v-model="searchInfo.materialCode"
          style="width: 240px"
          placeholder="请输入料号"
        />
      </el-space>
      <div>
        <el-button type="primary" size="large" @click="handleAddClick">
          添加产品
        </el-button>
      </div>
    </div>

    <el-table :data="currentPage" :row-class-name="addClass">
      <el-table-column prop="lastQuoteDate" label="业务日期" />
      <el-table-column prop="supplierName" label="供应商" />
      <el-table-column prop="materialCode" label="料号" />
      <el-table-column prop="productName" label="品名" />
      <el-table-column prop="specification" label="规格" />
      <el-table-column prop="barcode" label="条码" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="referenceCost" label="价格" />

      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="primary"
            size="large"
            @click="handleUpdateClick(scope.row)"
          >
            更新
          </el-button>
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="primary"
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
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.disabled-row) {
  color: #ccc;
  background-color: #f5f7fa;
}
</style>
