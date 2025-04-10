<script setup lang="ts">
import {
  baseUrlApi,
  getEnum,
  getAllCate,
  addPd,
  updatePd,
  deletePd,
  getPagePd
} from "@/api/user";
import { ref, watch, ToRefs, toRefs } from "vue";
import { message } from "@/utils/message";
import { debounce } from "@pureadmin/utils";
import { getUserDataSource, formatToken, getToken } from "@/utils/auth.ts";
defineOptions({
  name: "Welcome"
});

const allCateData = ref([]);

const currentPage = ref([]);

const enums = ref([]);
const getEnums = () => {
  getEnum({
    type: "management_level"
  })
    .then(res => {
      const { code, data } = res;
      if (code == 200) {
        enums.value = data;
      }
    })
    .catch(res => {
      message("获取枚举失败--", { type: "error" });
    });
};

const getAllCateFun = () => {
  getAllCate({}).then(res => {
    console.log("res", res);
    if (res?.code) {
      allCateData.value = res?.data || [];
    }
  });
};
const pageSizeArr = ref([5, 10, 15, 20]);
const pageSize = ref(pageSizeArr.value[3]);
const total = ref(0);

const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const currentPageNum = ref(1);
const searchInfo = ref({
  categoryName: "",
  productName: ""
});

// searchInfo变动时重新获取数据，但是不能调用搜索太频繁了
watch(
  [searchInfo],
  () => {
    debounce(() => {
      getCurrentPage();
    }, 500)();
  },
  { deep: true }
);
const getCurrentPage = () => {
  const searchStr: any = [];
  if (searchInfo.value.categoryName) {
    searchStr.push({
      searchName: "categoryName",
      searchType: "like",
      searchValue: searchInfo.value.categoryName
    });
  }
  if (searchInfo.value.productName) {
    searchStr.push({
      searchName: "productName",
      searchType: "like",
      searchValue: searchInfo.value.productName
    });
  }

  getPagePd({
    pageNo: Number(currentPageNum.value),
    pageSize: Number(pageSize.value),
    searchStr: JSON.stringify(searchStr)
  }).then(res => {
    console.log("res", res);
    if (res?.code) {
      currentPage.value = res?.data?.records || [];
      currentPage.value = res?.data?.records || [];
      total.value = res?.data?.total;
    }
  });
};

getAllCateFun();
getCurrentPage();
getEnums();

// 清除新增分类信息
const clearnewProdctData = () => {
  newProdctData.value = {
    // 主分类id
    categoryId: "",
    // 管理等级
    // "categoryName": "",

    managementLevelId: "",
    // "managementLevelName": "",
    // 品名
    productName: "",
    // 规格
    specification: "",
    // 单位 buchuan
    // 常年正常供应
    supplyAllYea: "",
    unit: "公斤",
    // 英文名
    enName: "",
    // 价格
    referenceCost: "",
    // 收获季节
    harvestSeason: "",
    // 照片
    photoList: []
  };
};

const addCateData = async () => {
  // if (!newProdctData.value.code || !newProdctData.value.name) {
  //   return
  // }
  if (!pdNewRef.value) return;
  await pdNewRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("===点击新建数据==");
      console.log(newProdctData.value);
      const imageList = [] as any[];
      const { photoList, ...rest } = newProdctData.value;
      console.log("==rest数据==");
      console.log(rest);
      console.log(photoList);
      photoList?.map(item => {
        if (item.response.code == 200) {
          imageList.push(JSON.stringify(item));
        }
      });
      addPd({
        ...rest,
        photoList: imageList
      })
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("添加分类成功", { type: "success" });
            dialogFormVisible.value = false;
            clearnewProdctData();
            getCurrentPage();
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
const newProdctData = ref({
  // 主分类id
  categoryId: "",
  // "categoryName": "",
  // 管理等级
  managementLevelId: "",
  // "managementLevelName": "",

  // 品名
  productName: "",
  // 规格
  specification: "",
  // 单位 buchuan
  // 常年正常供应
  supplyAllYea: "",
  unit: "公斤",
  enName: "",
  referenceCost: "",
  harvestSeason: "",
  photoList: []
});

const activeCateData = ref({});
const dialogUpdateVisible = ref(false);
const dialogDeleteVisible = ref(false);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);

// 更新分类接口
const updateCateData = async val => {
  // kong
  if (!pdUpdateRef.value) return;
  await pdUpdateRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      console.log("===表单信息数据==");
      console.log(activeCateData);
      updatePd({
        categoryId: "" + activeCateData.value.categoryId,
        managementLevelId: "" + activeCateData.value.managementLevelId,
        productName: "" + activeCateData.value.productName,
        specification: "" + activeCateData.value.specification,
        supplyAllYea: "" + activeCateData.value.supplyAllYea,
        id: activeCateData.value.id
      })
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("更新分类成功", { type: "success" });
            dialogUpdateVisible.value = false;
            getCurrentPage();
          } else {
            message("更新分类失败--" + msg, { type: "error" });
          }
        })
        .catch(err => {
          message("更新分类失败", { type: "error" });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};

// 打开更新弹窗
const openUpdatePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogUpdateVisible.value = true;
  setTimeout(() => {
    // console.log('document.querySelector()',document.querySelector('.ssss')?.querySelector('.el-select__placeholder')?.children[0].innerText = activeCateData.value.categoryName);
    document
      .querySelector(".ssss")
      .querySelector(".el-select__placeholder").children[0].innerText =
      activeCateData.value.categoryName;
    document
      .querySelector(".dddd")
      .querySelector(".el-select__placeholder").children[0].innerText =
      activeCateData.value.managementLevelName;
  }, 100);
};

// 删除弹窗打开
const deletePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogDeleteVisible.value = true;
};

// 删除分类的方法
const deleteCateFun = () => {
  console.log("activeCateData.value", activeCateData.value);
  deletePd({
    id: activeCateData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除分类成功", { type: "success" });
        dialogUpdateVisible.value = false;
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

const addClass = ({ row }) => {
  if (row.enable === false) {
    return "disabled-row";
  }
};

const handlePictureCardPreview = uploadFile => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const handleFileChange = (file, files) => {
  console.log("file,files", file, files);
};

const uploadUrl = baseUrlApi("/supplier/upload");
const pdNewRef = ref(null);
const pdUpdateRef = ref(null);
const pdRules = {
  categoryId: [{ required: true, message: "请选择主分类", trigger: "change" }],
  managementLevelId: [
    { required: true, message: "请选择管理等级分类", trigger: "change" }
  ],
  productName: [{ required: true, message: "请输入品名", trigger: "blur" }],
  specification: [{ required: true, message: "请输入规格", trigger: "blur" }],
  supplyAllYea: [
    { required: true, message: "请输入常年正常供应", trigger: "blur" }
  ],
  enName: [{ required: true, message: "请输入英文名", trigger: "blur" }],
  referenceCost: [{ required: true, message: "请输入价格", trigger: "blur" }]
};
</script>

<template>
  <div class="container">
    <div class="button-con absolute top-2 left-[60px] flex gap-2">
      <el-input
        v-model="searchInfo.categoryName"
        style="width: 240px"
        placeholder="请输入主分类"
      />
      <el-input
        v-model="searchInfo.productName"
        style="width: 240px"
        placeholder="请输入品名"
      />
    </div>
    <el-button
      class="addCate"
      type="primary"
      size="large"
      @click="
        dialogFormVisible = true;
        clearnewProdctData();
      "
    >
      添加产品
    </el-button>
    <el-table :data="currentPage" :row-class-name="addClass" style="width: 90%">
      <el-table-column fixed prop="materialCode" label="料号" />
      <el-table-column prop="categoryName" label="主分类" />
      <el-table-column prop="managementLevelName" label="管理等级" />
      <el-table-column prop="productName" label="品名" />
      <el-table-column prop="specification" label="规格" />
      <el-table-column
        label="单位"
        :formatter="
          () => {
            return 'Kg';
          }
        "
      />
      <el-table-column prop="referenceCost" label="价格" />
      <el-table-column prop="lastQuoteDate" label="最近一次报价时间" />
      <el-table-column prop="supplyAllYea" label="常年正常供应" />
      <el-table-column prop="supplierName" label="品牌" />
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="primary"
            size="large"
            @click="openUpdatePop(scope)"
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
    <el-dialog v-model="dialogFormVisible" title="添加新产品" width="500">
      <el-form ref="pdNewRef" :rules="pdRules" :model="newProdctData">
        <el-form-item
          prop="categoryId"
          label="主分类"
          :label-width="formLabelWidth"
        >
          <el-select
            v-model="newProdctData.categoryId"
            placeholder="选择主分类"
          >
            <el-option
              v-for="item in allCateData"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="managementLevelId"
          label="管理等级分类"
          :label-width="formLabelWidth"
        >
          <el-select
            v-model="newProdctData.managementLevelId"
            placeholder="选择管理等级分类"
          >
            <el-option
              v-for="item in enums"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="productName"
          label="品名"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="newProdctData.productName"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="specification"
          label="规格"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="newProdctData.specification"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="单位" :label-width="formLabelWidth">
          <el-input
            type="text"
            :disabled="true"
            :value="newProdctData.unit"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="supplyAllYea"
          label="常年正常供应"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="newProdctData.supplyAllYea"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="enName"
          label="英文名"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="newProdctData.enName"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="referenceCost"
          label="价格"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="newProdctData.referenceCost"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="photoList"
          label="照片"
          :label-width="formLabelWidth"
        >
          <el-upload
            v-model:file-list="newProdctData.photoList"
            class="upload-demo"
            :on-preview="handlePictureCardPreview"
            :on-change="handleFileChange"
            :action="uploadUrl"
            :accept="'*'"
            :auto-upload="true"
            list-type="text"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
          >
            <el-button>上传照片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item
          prop="harvestSeason"
          label="收获季节"
          :label-width="formLabelWidth"
        >
          <el-select
            class="dddd"
            v-model="newProdctData.harvestSeason"
            placeholder="选择收获季节"
          >
            <el-option v-for="item in 12" :label="item" :value="item" />
          </el-select>
          <span>月份</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="addCateData"> 添加 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogUpdateVisible" title="编辑产品" width="500">
      <el-form ref="pdUpdateRef" :rules="pdRules" :model="activeCateData">
        <el-form-item
          label="主分类"
          prop="categoryId"
          :label-width="formLabelWidth"
        >
          <el-select
            class="ssss"
            v-model="activeCateData.categoryId"
            :placeholder="activeCateData.categoryName"
          >
            <el-option
              v-for="item in allCateData"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="管理等级分类"
          prop="managementLevelId"
          :label-width="formLabelWidth"
        >
          <el-select
            class="dddd"
            v-model="activeCateData.managementLevelId"
            placeholder="选择管理等级分类"
          >
            <el-option
              v-for="item in enums"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="品名"
          prop="productName"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="activeCateData.productName"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          label="规格"
          prop="specification"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="activeCateData.specification"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="单位" :label-width="formLabelWidth">
          <el-input
            type="text"
            :disabled="true"
            :value="'kg'"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          label="常年正常供应"
          prop="supplyAllYea"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="activeCateData.supplyAllYea"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          label="英文名"
          prop="enName"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="activeCateData.enName"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="referenceCost"
          label="价格"
          :label-width="formLabelWidth"
        >
          <el-input
            type="text"
            v-model="activeCateData.referenceCost"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          prop="photoList"
          label="照片"
          :label-width="formLabelWidth"
        >
          <el-upload
            v-model:file-list="activeCateData.photoList"
            class="upload-demo"
            :on-preview="handlePictureCardPreview"
            :on-change="handleFileChange"
            :action="uploadUrl"
            :accept="'*'"
            :auto-upload="true"
            list-type="text"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
          >
            <el-button>上传照片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item
          prop="harvestSeason"
          label="收获季节"
          :label-width="formLabelWidth"
        >
          <el-select
            class="dddd"
            v-model="activeCateData.harvestSeason"
            placeholder="选择管理等级分类"
          >
            <el-option v-for="item in 12" :label="item" :value="item" />
          </el-select>
          <span>月份</span>
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
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
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

<style>
.disabled-row {
  color: #ccc;
  background-color: #f5f7fa;
}
</style>
