<script setup lang="ts">
import {
  baseUrlApi,
  downLoadFile,
  getEnum,
  getAllCate,
  getAllSup,
  getCatePd,
  addPd,
  updateQuota,
  deleteQuota,
  deletePd,
  getPageQuota,
  getPagePd,
  addQuota
} from "@/api/user";
import { computed, ref, watch } from "vue";
import { message } from "@/utils/message";
import { getToken, formatToken } from "@/utils/auth";
import { http } from "../../utils/http";
import { jsonp } from "vue-jsonp";
const DOWNLOADFILE_URL = "../../../public/templete.xlsx";
defineOptions({
  name: "Welcome"
});
const NZD_RATE = ref(4.23);
const USD_RATE = ref(7.25);

// 拿到当前的人民币的汇率
const changeCoin = () => {
  const coinUrl =
    "https://api.k780.com/?app=finance.rate&scur=USD&appkey=APPKEY&sign=SIGN&format=json";
  jsonp("http://api.k780.com/?app=finance.rate&format=json", {
    tcur: "CNY",
    scur: "NZD,USD",
    appkey: "18220",
    sign: "9b97118c7cf61df11c736c79ce94dcf9",
    callbackQuery: "jsoncallback"
  })
    .then(res => {
      console.log("res1111", res);
      const { success, lists } = res;
      if (success && lists.length) {
        lists.map(item => {
          if (item.scur == "NZD") {
            NZD_RATE.value = Number(item.rate);
          }
          if (item.scur == "USD") {
            USD_RATE.value = Number(item.rate);
          }
        });
      }
    })
    .catch(err => {
      console.log("err", err);
    });
};
changeCoin();

const allCateData = ref([]);

const currentPage = ref([]);

const enums = ref([]);
const getEnums = () => {
  getEnum({
    type: "currency"
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
const pageSize = ref(pageSizeArr.value[0]);
const total = ref(0);

const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const currentPageNum = ref(1);

const getCurrentPage = () => {
  getPageQuota({
    pageNo: Number(currentPageNum.value),
    pageSize: Number(pageSize.value)
  }).then(res => {
    console.log("res", res);
    if (res?.code) {
      // currentPage.value = res?.data?.records || [];
      currentPage.value = res?.data?.records || [];

      currentPage.value.map(item => {
        let relaArr: any = [];
        item.relatedFile.map(item => {
          relaArr.push({
            name: item,
            url: item
          });
        });
        let legendArr: any = [];
        item.legend.map(item => {
          legendArr.push({
            name: item,
            url: item
          });
        });
        item.relatedFile = JSON.parse(JSON.stringify(relaArr));
        item.legend = JSON.parse(JSON.stringify(legendArr));
      });
      console.log("currentPage.value", currentPage.value);

      total.value = res?.data?.total;
    }
  });
};

getAllCateFun();
getCurrentPage();
getEnums();

// 清除新增报价信息
const clearnewQuotaData = () => {
  newQuotaData.value = {
    // // 联系人
    // "contactPerson": "string",
    // // 联系电话
    // "contactPhone": "string",
    // //
    // "currencyId": 0,
    // //
    // "id": 0,
    // "legend": [
    //   "string"
    // ],
    // // 起订量
    // "minimumOrderQuantity": 0,
    // "productId": 0,
    // "quotation": 0,
    // "quotationDate": "string",
    // "relatedFile": [
    //   "string"
    // ],
    // // 备注
    // "remarks": "string",
    // "seasonality": "string",
    // "supplierId": 0,
    // "supplierLocation": "string",
    // // 税率
    // "taxRate": 0
  };
};

function getTargetString(input) {
  const subStr = input.substring("srm/supplier/".length);
  if (subStr.length > 20) {
    return "..." + subStr.slice(-10);
  }
  return subStr;
}

const addCateData = async () => {
  // if (!newQuotaData.value.code || !newQuotaData.value.name) {
  //   return
  // }
  if (!quotaRef.value) return;
  await quotaRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      let relFile = [];
      let picArr = [];
      newQuotaData.value.relatedFile?.map(item => {
        if (item.response.code == 200) {
          relFile.push(item.response.data);
        }
      });
      newQuotaData.value.legend?.map(item => {
        if (item.response.code == 200) {
          picArr.push(item.response.data);
        }
      });

      console.log(
        "newQuotaData.value",
        relFile,
        newQuotaData.value.relatedFile
      );

      addQuota({
        contactPerson: newQuotaData.value.contactPerson,
        contactPhone: newQuotaData.value.contactPhone,
        currencyId: enums.value.find(item => item.value == currency.value).id,
        legend: picArr,
        minimumOrderQuantity: Number(newQuotaData.value.minimumOrderQuantity),
        productId: newQuotaData.value.productId,
        quotation: Number(newQuotaData.value.quotation),
        quotationDate: newQuotaData.value.quotationDate,
        relatedFile: relFile,
        remarks: newQuotaData.value.remarks,
        seasonality: newQuotaData.value.seasonality,
        supplierId: newQuotaData.value.supplierId,
        supplierLocation: newQuotaData.value.supplierLocation,
        taxRate: Number(newQuotaData.value.taxRate)
      })
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("添加报价成功", { type: "success" });
            dialogFormVisible.value = false;
            clearnewQuotaData();
            getCurrentPage();
          } else {
            message("添加报价失败--" + msg, { type: "error" });
          }
        })
        .catch(err => {
          message("添加报价失败", { type: "error" });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};

const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const newQuotaData = ref({
  // 联系人
  contactPerson: "string",
  // 联系电话
  contactPhone: "string",
  // 货币类型
  currencyId: 0,
  // 图例
  legend: ["string"],
  //起订量
  minimumOrderQuantity: 0,
  // 商品id
  productId: 0,
  // 报价金额
  quotation: 0,
  // 报价日期
  quotationDate: "string",
  // 相关文件OSS地址
  relatedFile: ["string"],
  // 备注
  remarks: "string",
  // 季节性
  seasonality: "string",
  // 供应商id
  supplierId: 0,
  // 所在地
  supplierLocation: "string",
  // 税点百分比
  taxRate: 0,
  categoryId: 0
});

const activeCateData = ref({});
const dialogUpdateVisible = ref(false);
const dialogDeleteVisible = ref(false);

// 更新报价接口
const updateCateData = val => {
  console.log("dddd");

  // kong
  let relFile = [];
  let picArr = [];
  newQuotaData.value.relatedFile.map(item => {
    if (item.response?.code == 200) {
      relFile.push(item.response.data);
    } else if (item.url) {
      relFile.push(item.url);
    }
  });
  newQuotaData.value.legend.map(item => {
    if (item.response?.code == 200) {
      picArr.push(item.response.data);
    } else if (item.url) {
      picArr.push(item.url);
    }
  });
  updateQuota({
    contactPerson: newQuotaData.value.contactPerson,
    contactPhone: newQuotaData.value.contactPhone,
    currencyId: enums.value.find(item => item.value == currency.value).id,
    legend: picArr,
    minimumOrderQuantity: Number(newQuotaData.value.minimumOrderQuantity),
    productId: newQuotaData.value.productId,
    quotation: Number(newQuotaData.value.quotation),
    quotationDate: newQuotaData.value.quotationDate,
    relatedFile: relFile,
    remarks: newQuotaData.value.remarks,
    seasonality: newQuotaData.value.seasonality,
    supplierId: newQuotaData.value.supplierId,
    supplierLocation: newQuotaData.value.supplierLocation,
    taxRate: Number(newQuotaData.value.taxRate),
    id: newQuotaData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("更新报价成功", { type: "success" });
        dialogFormVisible.value = false;
        getCurrentPage();
      } else {
        message("更新报价失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("更新报价失败", { type: "error" });
    });
};

// 打开更新弹窗
const openUpdatePop = val => {
  popType.value = "update";
  newQuotaData.value = JSON.parse(JSON.stringify(val.row));
  dialogFormVisible.value = true;
  setTimeout(() => {
    // console.log('document.querySelector()',document.querySelector('.ssss')?.querySelector('.el-select__placeholder')?.children[0].innerText = activeCateData.value.categoryName);
    document
      .querySelector(".updateProId")
      .querySelector(".el-select__placeholder").children[0].innerText =
      `${newQuotaData.value.materialCode}(${newQuotaData.value.productName})`;
    // document.querySelector('.dddd').querySelector('.el-select__placeholder').children[0].innerText = activeCateData.value.managementLevelName;
  }, 100);
};
const popType = ref("new");
// 删除弹窗打开
const deletePop = val => {
  newQuotaData.value = JSON.parse(JSON.stringify(val.row));
  dialogDeleteVisible.value = true;
};
const cateAllPd = ref([]);

const getAllPd = () => {
  if (!newQuotaData.value.categoryId) {
    return;
  }
  getCatePd({
    categoryId: newQuotaData.value.categoryId
    // categoryId : 14
  }).then(res => {
    if (res?.code) {
      cateAllPd.value = res?.data || [];
    }
  });
};
watch(
  () => newQuotaData.value.categoryId,
  () => {
    getAllPd();
  },
  { deep: true }
);
getAllPd();
// 删除报价的方法
const deleteCateFun = () => {
  console.log("activeCateData.value", newQuotaData.value);
  deleteQuota({
    id: newQuotaData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除报价成功", { type: "success" });
        dialogUpdateVisible.value = false;
        getCurrentPage();
      } else {
        message("删除报价失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("删除报价失败", { type: "error" });
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

const currency = ref("CNY");

const handleFileChange = (file, files) => {
  console.log("file,files", file, files);
};

const uploadUrl = baseUrlApi("/supplier/upload"); // 替换为实际的后端上传接口地址
const uploadQuotaUrl = baseUrlApi("/quotation/new/file"); // 替换为实际的后端上传接口地址
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const handlePictureCardPreview = uploadFile => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const allSuplier = ref([]);
const getAllSupFun = () => {
  getAllSup({}).then(res => {
    const { code, data } = res;
    if (code == 200) {
      allSuplier.value = data;
    }
  });
};
getAllSupFun();

const uploadFile = () => {};

const downloadFileFun = name => {
  const data = getToken();
  const token = formatToken(data.accessToken);
  return (
    baseUrlApi("/common/download") +
    `?objectName=${name}&authorization=${token}`
  );
};
const uploadSuccess = res => {
  console.log("res", res);
  const { code, msg } = res;
  if (code == 200) {
    message("上传成功", { type: "success" });
    getCurrentPage();
  } else {
    message(msg, { type: "error" });
  }
};

const rmb = computed(() => {
  if (!newQuotaData.value.quotation) {
    return "";
  }
  if (currency.value == "CNY") {
    return newQuotaData.value.quotation;
  }
  if (currency.value == "NZD") {
    return (NZD_RATE.value * newQuotaData.value.quotation).toFixed(2);
  }
  if (currency.value == "USD") {
    return (USD_RATE.value * newQuotaData.value.quotation).toFixed(2);
  }
});

const quotaRules = ref({
  productId: [{ required: true, message: "选择料号", trigger: "change" }],
  supplierId: [{ required: true, message: "选择公司名", trigger: "blur" }],
  contactPerson: [{ required: true, message: "填写联系人", trigger: "blur" }],
  contactPhone: [
    { required: true, message: "填写联系人电话", trigger: "blur" }
  ],
  supplierLocation: [{ required: true, message: "填写产地", trigger: "blur" }],
  taxRate: [{ required: true, message: "填写税点", trigger: "blur" }],
  seasonality: [{ required: true, message: "填写季节性", trigger: "blur" }],
  quotation: [{ required: true, message: "填写报价", trigger: "blur" }],
  quotationDate: [{ required: true, message: "填写报价日期", trigger: "blur" }],
  minimumOrderQuantity: [
    { required: true, message: "填写起订量", trigger: "blur" }
  ],
  remarks: [{ required: false, message: "填写产地", trigger: "blur" }]
});
const quotaRef = ref(null);
</script>

<template>
  <div class="container">
    <!-- <img :src="downloadFile1111()" alt=""> -->
    <el-button class="download" type="primary" size="large">
      <a :href="DOWNLOADFILE_URL">下载报价模版</a>
    </el-button>

    <el-upload
      class="uploadFile"
      :action="uploadQuotaUrl"
      :accept="'.xlsx'"
      :auto-upload="true"
      :headers="{
        Authorization: formatToken(getToken().accessToken)
      }"
      :on-success="uploadSuccess"
    >
      <el-button type="primary" size="large"> 上传报价文件 </el-button>
    </el-upload>

    <el-button
      class="addCate"
      type="primary"
      size="large"
      @click="
        dialogFormVisible = true;
        popType = 'new';
        clearnewQuotaData();
      "
    >
      添加报价
    </el-button>
    <el-table :data="currentPage" :row-class-name="addClass" style="width: 90%">
      <el-table-column fixed prop="contactPerson" label="联系人" />
      <el-table-column prop="contactPhone" label="电话" />
      <el-table-column prop="supplierLocation" label="产地" />
      <el-table-column prop="seasonality" label="季节性" />
      <el-table-column prop="quotation" label="报价" />
      <el-table-column
        label="单位"
        :formatter="
          () => {
            return 'Kg';
          }
        "
      />
      <el-table-column prop="currencyName" label="货币" />
      <el-table-column prop="quotationDate" label="报价日期" />
      <el-table-column prop="minimumOrderQuantity" label="起订量" />
      <el-table-column prop="taxRate" label="税点" />
      <el-table-column prop="relatedFile" label="相关文件">
        <template #default="scope"
          ><a
            v-for="item in scope.row.relatedFile"
            :href="downloadFileFun(item.url)"
            >{{ getTargetString(item.url) }}</a
          ></template
        >
      </el-table-column>
      <el-table-column prop="legend" label="图例">
        <template #default="scope"
          ><a
            v-for="item in scope.row.legend"
            :href="downloadFileFun(item.url)"
            >{{ getTargetString(item.url) }}</a
          ></template
        >
      </el-table-column>
      <el-table-column prop="remarks" label="备注" />
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
    <el-dialog
      top="10vh"
      v-model="dialogFormVisible"
      title="添加新报价"
      width="800"
    >
      <el-form ref="quotaRef" :rules="quotaRules" :model="newQuotaData">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主分类">
              <el-select
                v-model="newQuotaData.categoryId"
                :placeholder="activeCateData.categoryName"
              >
                <el-option
                  v-for="item in allCateData"
                  :label="item.categoryName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="productId" class="updateProId" label="料号">
              <el-select v-model="newQuotaData.productId">
                <el-option
                  v-for="item in cateAllPd"
                  :label="`${item.materialCode}(${item.productName})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="supplierId" label="公司名">
              <!-- <el-input type="text" v-model="newQuotaData.supplierId" autocomplete="off" /> -->
              <el-select v-model="newQuotaData.supplierId">
                <el-option
                  v-for="item in allSuplier"
                  :label="`${item.companyName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="contactPerson" label="联系人">
              <el-input
                type="text"
                v-model="newQuotaData.contactPerson"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="contactPhone" label="电话">
              <el-input
                type="text"
                v-model="newQuotaData.contactPhone"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="supplierLocation" label="产地">
              <el-input
                type="text"
                v-model="newQuotaData.supplierLocation"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="taxRate" label="税点">
              <el-input
                type="text"
                v-model="newQuotaData.taxRate"
                autocomplete="off"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="7">
            <el-form-item prop="seasonality" label="季节性">
              <el-input
                type="text"
                v-model="newQuotaData.seasonality"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="quotation" label="报价">
              <el-input
                :span="6"
                :gutter="20"
                type="number"
                v-model="newQuotaData.quotation"
                autocomplete="off"
              >
                <template :span="6" #append>¥{{ rmb }}</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="单位">
              <el-select :span="6" v-model="currency" placeholder="选择货币">
                <el-option label="NZD" value="NZD"></el-option>
                <el-option label="CNY" value="CNY"></el-option>
                <el-option label="USD" value="USD"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="quotationDate" label="报价日期">
              <el-date-picker
                v-model="newQuotaData.quotationDate"
                type="date"
                placeholder="Pick a day"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="minimumOrderQuantity" label="起订量">
              <el-input
                type="text"
                v-model="newQuotaData.minimumOrderQuantity"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单位">
              <el-input type="text" disabled value="kg" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="相关文件">
              <el-upload
                v-model:file-list="newQuotaData.relatedFile"
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
                <el-button>上传相关文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="图例上传">
              <el-upload
                v-model:file-list="newQuotaData.legend"
                class="upload-demo"
                :on-preview="handlePictureCardPreview"
                :on-change="handleFileChange"
                :action="uploadUrl"
                :accept="'.jpg,.png,.jpeg'"
                :auto-upload="true"
                list-type="text"
                :headers="{
                  Authorization: formatToken(getToken().accessToken)
                }"
              >
                <el-button>上传图例</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="remarks" label="备注">
          <el-input
            type="text"
            v-model="newQuotaData.remarks"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="popType == 'update' ? updateCateData() : addCateData()"
          >
            {{ popType == "update" ? "更新" : "添加" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogDeleteVisible" title="" width="500">
      <span>确定删除该报价吗？</span>
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

.download {
  position: absolute;
  top: 4px;
  right: 164px;
}

.uploadFile {
  position: absolute;
  top: 4px;
  right: 294px;
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

.upload-demo {
  /* transform: scale(0.6); */
}
</style>
