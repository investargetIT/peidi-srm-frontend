<script setup lang="ts">
import {
  getEnum,
  getPageSupplier,
  getAllCate,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getPagePd,
  getProductInfo,
  fetchProductList
} from "@/api/user";
import { ref, watch, reactive } from "vue";
import { message } from "@/utils/message";
import { baseUrlApi, getCatePd } from "../../api/user";
import { getToken, formatToken, getUserDataSource } from "@/utils/auth";
import * as XLSX from "xlsx";
import { debounce } from "@pureadmin/utils";
import { buildTree } from "../../utils/common";
import type { CascaderProps } from "element-plus";
import { ElMessage } from "element-plus";
import { expirableLocalStorage } from "@/utils/customLocalStorage";

defineOptions({
  name: "Welcome"
});

const allCateData = ref([]);
const cateAllPd = ref([]);
const currentPage = ref([]);
const emptyCate = ref<number[]>([]);
const enums = ref([]);
const pageSizeArr = ref([5, 10, 15, 20]);
const pageSize = ref(pageSizeArr.value[3]);
const total = ref(0);
const currentPageNum = ref(1);
const dialogFormVisible = ref(false);
const newSupplierData = ref({
  // 银行账号
  bankAccount: "",
  // 营业执照
  businessLicense: [],
  // 公司地址
  companyAddress: "",
  // 公司名称
  companyName: "",
  // 联系方式 + 联系人
  contactInfo: [
    {
      person: "",
      info: ""
    }
  ],
  // 合同信息
  contractInfo: [],
  id: 0,
  // 开票信息
  invoiceInfo: "",
  // 生产许可证
  productionLicense: [],
  // 注册信息
  registrationInfo: "",
  // 相关证书
  relatedCertificate: [],
  // supplier_grade 枚举接口传ID回来
  supplierGradeId: "",
  // 接口  下拉选择  传id number【】
  supplierProduct: [],
  // 税号
  taxNumber: "string",
  categoryId: "",
  // 产品信息
  productInfo: ""
});
const activeCateData = ref({});
const dialogUpdateVisible = ref(false);
const dialogDeleteVisible = ref(false);
const openType = ref("new");
const uploadUrl = baseUrlApi("/supplier/upload"); // 替换为实际的后端上传接口地址
const selectedRows = ref([]);
const selectedRowCount = ref(0);
const supplierFormRef = ref("");
const supplierRules = {
  companyName: [{ required: true, message: "输入公司名称", trigger: "blur" }],
  companyAddress: [
    { required: true, message: "输入公司地址", trigger: "blur" }
  ],
  registrationInfo: [
    { required: true, message: "输入注册信息", trigger: "blur" }
  ],
  supplierProduct: [
    { required: true, message: "输入供应产品", trigger: "blur" }
  ],
  bankAccount: [{ required: true, message: "输入银行账号", trigger: "blur" }],
  taxNumber: [{ required: true, message: "输入税号", trigger: "blur" }],
  invoiceInfo: [{ required: true, message: "输入开票信息", trigger: "blur" }],
  productInfo: [{ required: true, message: "请选择产品", trigger: "blur" }]
};
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const searchInfo = ref({
  supplierName: "",
  supplierPerson: ""
});
const allProductList = ref([]);

const getEnums = () => {
  getEnum({
    type: "supplier_grade"
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

const getAllPd = () => {
  if (!newSupplierData.value.categoryId) {
    return;
  }
  getCatePd({
    categoryId: newSupplierData.value.categoryId
    // categoryId : 14
  }).then(res => {
    if (res?.code) {
      cateAllPd.value = res?.data || [];
    }
  });
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
};

const getCurrentPage = () => {
  const searchStr: any = [];
  if (searchInfo.value.supplierName) {
    searchStr.push({
      searchName: "companyName",
      searchType: "like",
      searchValue: searchInfo.value.supplierName
    });
  }
  if (searchInfo.value.supplierPerson) {
    searchStr.push({
      searchName: "contactInfo",
      searchType: "like",
      searchValue: searchInfo.value.supplierPerson
    });
  }
  getPageSupplier({
    pageNo: Number(currentPageNum.value),
    pageSize: Number(pageSize.value),
    searchStr: JSON.stringify(searchStr)
  }).then(res => {
    if (res?.code) {
      currentPage.value = res?.data?.records || [];
      // businessLicense
      currentPage.value.map(item => {
        let busArr: any = [];
        // 商业执照转一下
        item.businessLicense.map(item => {
          busArr.push({
            name: item,
            url: item
          });
        });
        item.businessLicense = JSON.parse(JSON.stringify(busArr));

        let proArr: any = [];
        // productionLicense  转一下
        item.productionLicense.map(item => {
          proArr.push({
            name: item,
            url: item
          });
        });
        item.productionLicense = JSON.parse(JSON.stringify(proArr));

        // relatedCertificate 转一下
        let relatedArr: any = [];

        item.relatedCertificates.map(item => {
          relatedArr.push({
            name: item,
            url: item
          });
        });
        item.relatedCertificate = JSON.parse(JSON.stringify(relatedArr));

        // contractInfo

        let contractInfoArr: any = [];

        item.contractInfo.map(item => {
          contractInfoArr.push({
            name: item,
            url: item
          });
        });
        item.contractInfo = JSON.parse(JSON.stringify(contractInfoArr));

        let info = JSON.parse(item.contactInfo);
        // 联系人和联系方式转一下
        item.contactInfoPerson = [];
        item.contactInfoWay = [];
        info.map(item1 => {
          item.contactInfoPerson.push(item1.person);
          item.contactInfoWay.push(item1.info);
        });
        item.contactInfoPerson.join(",");
        item.contactInfoWay.join(",");
        item.contactInfo = info;
      });
      total.value = res?.data?.total;
    }
  });
};

// 清除新增分类信息
const clearnewSupplierData = () => {
  newSupplierData.value = {
    // 银行账号
    bankAccount: "",
    // 营业执照
    businessLicense: [],
    // 公司地址
    companyAddress: "",
    // 公司名称
    companyName: "",
    // 联系方式 + 联系人
    contactInfo: [
      {
        person: "",
        info: ""
      }
    ],
    // 合同信息
    contractInfo: [],
    id: 0,
    // 开票信息
    invoiceInfo: "",
    // 生产许可证
    productionLicense: [],
    // 注册信息
    registrationInfo: "",
    // 相关证书
    relatedCertificate: [],
    // supplier_grade 枚举接口传ID回来
    supplierGradeId: "",
    // 接口  下拉选择  传id number【】
    supplierProduct: [],
    // 税号
    taxNumber: ""
  };
};

const addCateData = async () => {
  // if (!newSupplierData.value.code || !newSupplierData.value.name) {
  //   return
  // }
  if (!supplierFormRef.value) return;
  await supplierFormRef.value.validate((valid, fields) => {
    if (valid) {
      let busFile = [];
      newSupplierData.value.businessLicense.map(item => {
        if (item.response.code == 200) {
          busFile.push(item.response.data);
        }
      });

      let proFile = [];
      newSupplierData.value.productionLicense.map(item => {
        if (item.response.code == 200) {
          proFile.push(item.response.data);
        }
      });

      let relaFile = [];
      newSupplierData.value.relatedCertificate.map(item => {
        if (item.response.code == 200) {
          relaFile.push(item.response.data);
        }
      });

      let contractInfoFile = [];
      newSupplierData.value.contractInfo.map(item => {
        if (item.response.code == 200) {
          contractInfoFile.push(item.response.data);
        }
      });

      const sendConfig = {
        // 银行账号
        bankAccount: newSupplierData.value.bankAccount,
        // 营业执照
        businessLicense: busFile,
        // 公司地址
        companyAddress: newSupplierData.value.companyAddress,
        // 公司名称
        companyName: newSupplierData.value.companyName,
        // 联系方式 + 联系人
        contactInfo: JSON.stringify(newSupplierData.value.contactInfo),
        // 合同信息
        contractInfo: contractInfoFile,
        // 开票信息
        invoiceInfo: newSupplierData.value.invoiceInfo,
        // 生产许可证
        productionLicense: proFile,
        // 注册信息
        registrationInfo: newSupplierData.value.registrationInfo,
        // 相关证书
        relatedCertificate: relaFile,
        // supplier_grade 枚举接口传ID回来
        supplierGradeId: newSupplierData.value.supplierGradeId,
        // 接口  下拉选择  传id number【】
        supplierProduct: getProductList(newSupplierData.value.productInfo),
        // 税号
        taxNumber: newSupplierData.value.taxNumber
      };
      addSupplier(sendConfig)
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("添加供应商成功", { type: "success" });
            dialogFormVisible.value = false;
            clearnewSupplierData();
            getCurrentPage();
          } else {
            message("添加供应商失败--" + msg, { type: "error" });
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

const getProductList = (source = []) => {
  const resultArr: number[] = [];
  source?.map(item => {
    resultArr.push(item?.[2]);
  });
  return resultArr.filter(item => item);
};

// 更新分类接口
const updateCateData = async () => {
  // kong
  if (!supplierFormRef.value) return;
  await supplierFormRef.value.validate((valid, fields) => {
    if (valid) {
      let busFile = [];
      newSupplierData.value.businessLicense.map(item => {
        if (item.response?.code == 200) {
          busFile.push(item.response.data);
        } else if (item.url) {
          busFile.push(item.url);
        }
      });

      let proFile = [];
      newSupplierData.value.productionLicense.map(item => {
        if (item.response?.code == 200) {
          proFile.push(item.response.data);
        } else if (item.url) {
          proFile.push(item.url);
        }
      });

      let relaFile = [];
      newSupplierData.value.relatedCertificate.map(item => {
        if (item.response?.code == 200) {
          relaFile.push(item.response.data);
        } else if (item.url) {
          relaFile.push(item.url);
        }
      });

      let contractInfoArr = [];
      newSupplierData.value.contractInfo.map(item => {
        if (item.response?.code == 200) {
          contractInfoArr.push(item.response.data);
        } else if (item.url) {
          contractInfoArr.push(item.url);
        }
      });
      const sendConfig = {
        id: newSupplierData.value.id,
        // 银行账号
        bankAccount: newSupplierData.value.bankAccount,
        // 营业执照
        businessLicense: busFile,
        // 公司地址
        companyAddress: newSupplierData.value.companyAddress,
        // 公司名称
        companyName: newSupplierData.value.companyName,
        // 联系方式 + 联系人
        contactInfo: JSON.stringify(newSupplierData.value.contactInfo),
        // 合同信息
        contractInfo: contractInfoArr,
        // 开票信息
        invoiceInfo: newSupplierData.value.invoiceInfo,
        // 生产许可证
        productionLicense: proFile,
        // 注册信息
        registrationInfo: newSupplierData.value.registrationInfo,
        // 相关证书
        relatedCertificate: relaFile,
        // supplier_grade 枚举接口传ID回来
        supplierGradeId: newSupplierData.value.supplierGradeId,
        // 接口  下拉选择  传id number【】
        supplierProduct: getProductList(newSupplierData.value.productInfo),
        // 税号
        taxNumber: newSupplierData.value.taxNumber
      };
      updateSupplier(sendConfig)
        .then(res => {
          const { code, data, msg } = res;
          if (res.code == 200) {
            message("更新供应商成功", { type: "success" });
            dialogUpdateVisible.value = false;
            dialogFormVisible.value = false;

            getCurrentPage();
          } else {
            message("更新供应商失败--" + msg, { type: "error" });
          }
        })
        .catch(err => {
          message("更新供应商失败", { type: "error" });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};

// 打开更新弹窗
const openUpdatePop = val => {
  openType.value = "update";
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  newSupplierData.value = JSON.parse(JSON.stringify(val.row));
  const promiseArr = val.row?.supplierProduct?.map(item => {
    return getProductInfo({ id: item });
  });
  Promise.all(promiseArr).then(res => {
    // 构建级联选择器的值
    const cascaderValue = res
      .map(item => {
        if (item?.data) {
          // 返回 [一级ID, 二级ID, 三级ID] 格式的数据
          return [
            +item.data.parentCategoryId, // 一级分类ID
            +item.data.categoryId, // 二级分类ID
            item.data.id // 三级产品ID
          ];
        }
        return null;
      })
      .filter(Boolean); // 过滤掉空值

    // 设置级联选择器的值
    newSupplierData.value.productInfo = cascaderValue;
  });

  dialogFormVisible.value = true;
};

// 删除弹窗打开
const deletePop = val => {
  activeCateData.value = JSON.parse(JSON.stringify(val.row));
  dialogDeleteVisible.value = true;
};

// 删除分类的方法
const deleteCateFun = () => {
  deleteSupplier({
    id: activeCateData.value.id
  })
    .then(res => {
      const { code, data, msg } = res;
      if (res.code == 200) {
        message("删除供应商成功", { type: "success" });
        dialogUpdateVisible.value = false;
        getCurrentPage();
      } else {
        message("删除供应商失败--" + msg, { type: "error" });
      }
    })
    .catch(err => {
      message("删除供应商失败", { type: "error" });
    });
};

const changeCurrentPage = val => {
  console.log("val", val);
};

const addClass = ({ row }) => {
  if (row.enable === false) {
    return "disabled-row";
  }
};

const handleUploadSuccess = (response, from, fileList, ddd) => {
  if (from == "businessLicense") {
    newSupplierData.value.businessLicense = response.data;
    message("添加营业执照成功", { type: "success" });
  } else if (from == "productionLicense") {
    newSupplierData.value.productionLicense = response.data;
    message("生产许可证", { type: "success" });
  } else if (from == "relatedCertificate") {
    newSupplierData.value.relatedCertificate = response.data;
    message("相关证书", { type: "success" });
  } else if (from == "contractInfo") {
    newSupplierData.value.contractInfo = response.data;
    message("合同信息", { type: "success" });
  }
};

const beforeUpload = file => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 10;

  if (!isJpgOrPng) {
    message("添加分类成功", { type: "error" });

    return false;
  }
  if (!isLt2M) {
    message("添加分类成功", { type: "error" });

    return false;
  }
  return true;
};

const handleSelectionChange = val => {
  console.log("val", val);

  selectedRows.value = val;
  selectedRowCount.value = val.length;
};

const exportOut = () => {
  if (!selectedRows.value.length) {
    return;
  }
  console.log("selectedRows.value", selectedRows.value);
  // 获取数据
  const data = [
    ["公司名称", "地址", "联系方式", "联系人", "供应商类型", "供应产品"]
  ];
  selectedRows.value.map(item => {
    let arr = [];
    arr.push(item.companyName);
    arr.push(item.companyAddress);
    arr.push(item.contactInfoWay.join(","));
    arr.push(item.contactInfoPerson.join(","));
    arr.push(item.supplierGradeName);
    arr.push(item.supplierProductName.join(","));
    data.push(JSON.parse(JSON.stringify(arr)));
  });
  // 创建 Workbook 对象
  const workbook = XLSX.utils.book_new();

  // 创建 Worksheet 对象
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // 将 Worksheet 添加到 Workbook 中
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 生成 Excel 文件并下载
  XLSX.writeFile(workbook, "data.xlsx");
};

const handlePictureCardPreview = uploadFile => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

function convertToTree(data) {
  const level1Map = {};

  data.forEach(item => {
    const { parentCategoryId, categoryId } = item;

    if (!parentCategoryId || !categoryId) return;

    // 处理第一级：使用 parentCategoryName 作为 label
    if (!level1Map[parentCategoryId]) {
      level1Map[parentCategoryId] = {
        value: parseInt(parentCategoryId, 10),
        label: item.parentCategoryName || parentCategoryId, // 优先用名称，无则用ID
        children: {}
      };
    }

    // 处理第二级：使用 categoryName 作为 label
    const level1Node = level1Map[parentCategoryId];
    if (!level1Node.children[categoryId]) {
      level1Node.children[categoryId] = {
        value: parseInt(categoryId, 10),
        label: item.categoryName || categoryId, // 优先用名称，无则用ID
        children: []
      };
    }

    // 处理第三级：使用 productName 作为 label
    level1Node.children[categoryId].children.push({
      value: item.id,
      label: item.productName || "Unnamed"
    });
  });

  // 转换为树形结构
  return Object.values(level1Map).map(level1 => ({
    ...level1,
    children: Object.values(level1.children)
  }));
}

/**
 * 将 sourceData 和原始返回数据合并为完整树结构
 * @param {Array} sourceData 原始分类数据（包含层级关系）
 * @param {Array} rawTreeData 原始返回的树数据（包含第三级节点）
 * @returns {Array} 合并后的完整树结构
 */
const mergeTreeData = (sourceData, rawTreeData) => {
  // 1. 将 sourceData 转换为目标格式的树结构（仅保留一、二级）
  const buildBaseTree = data => {
    const treeMap = {}; // 一级节点映射表：parentId => 节点
    const idToNodeMap = {}; // 所有节点映射表：id => 节点（用于快速查找）

    // 递归处理节点
    const processNode = node => {
      const convertedNode = {
        value: node.id,
        label: node.categoryName,
        children: []
      };
      idToNodeMap[node.id] = convertedNode; // 记录节点映射

      if (node.children && node.children.length > 0) {
        convertedNode.children = node.children.map(child => processNode(child));
      }
      return convertedNode;
    };

    // 遍历 sourceData，构建树
    data.forEach(item => {
      const convertedNode = processNode(item);
      treeMap[item.id] = convertedNode; // 一级节点直接记录
    });

    return { tree: Object.values(treeMap), idToNodeMap };
  };

  // 2. 将 rawTreeData 的第三级节点挂载到 sourceData 对应的二级节点下
  const attachLeafNodes = (sourceTree, idToNodeMap, rawData) => {
    rawData.forEach(level1 => {
      level1.children.forEach(level2 => {
        // 根据 rawTreeData 的 level2.value（即 categoryId）找到对应的二级节点
        const targetLevel2Node = idToNodeMap[level2.value];
        if (targetLevel2Node) {
          // 将第三级节点添加到该二级节点的 children 中
          targetLevel2Node.children.push(...level2.children);
        }
      });
    });
    return sourceTree;
  };

  // 执行合并
  const { tree: baseTree, idToNodeMap } = buildBaseTree(sourceData);
  return attachLeafNodes(baseTree, idToNodeMap, rawTreeData);
};

const fetchMergeTreeData = async () => {
  let curCatList = [] as any;
  let curProductList = [] as any;
  const curCatRes = await getAllCate({});
  if (curCatRes?.code) {
    curCatList = buildTree(curCatRes?.data || []);
  }
  // 缓存读取所有产品数据
  const curLocalProductData = expirableLocalStorage.getJSON("productList");
  // 检查本地缓存中是否存在产品列表数据
  if (curLocalProductData) {
    // 如果存在缓存数据，直接使用缓存数据并转换为树形结构
    curProductList = convertToTree(curLocalProductData);
  } else {
    // 如果没有缓存数据，从接口获取产品列表
    const curProductRes = await fetchProductList({});
    if (curCatRes?.code) {
      // 将接口返回的数据转换为树形结构
      curProductList = convertToTree(curProductRes?.data || []);
      // 将新获取的数据存入本地缓存
      expirableLocalStorage.setJSON("productList", curProductRes?.data || []);
    }
  }
  const mergedTree = mergeTreeData(curCatList, curProductList);
  allProductList.value = mergedTree;
};

// 响应式数据
// const cascaderProps = reactive({
//   lazy: true,
//   multiple: true,
//   // checkStrictly: true,
//   async lazyLoad(node, resolve) {
//     try {
//       let nodes = [];

//       if (node.level === 0) {
//         // 加载第一级数据（直接使用现有数据）
//         nodes = allCateData.value.map(item => ({
//           value: item.id,
//           label: item.categoryName,
//           leaf: false,
//           level: 1
//         }));
//       } else if (node.level === 1) {
//         // 加载第二级数据（直接使用现有子节点）

//         const parent = allCateData.value.find(p => p.id === node.value);
//         nodes = (parent?.children || []).map(child => ({
//           value: child.id,
//           label: child.categoryName,
//           disabled: emptyCate.value.includes(child.id), // 动态禁用空分类
//           leaf: false,
//           level: 2
//         }));
//       } else if (node.level === 2) {
//         // 动态加载第三级数据
//         nodes = await loadThirdLevelData(node.value);
//       }

//       setTimeout(() => {
//         resolve(nodes);
//       }, 500);
//     } catch (error) {
//       console.error("加载失败:", error);
//       ElMessage.error("数据加载失败");
//       resolve([]);
//     }
//   }
// });

// const loadThirdLevelData = async parentId => {
//   const res = await getCatePd({
//     categoryId: parentId
//   });
//   const nodes = res?.data?.map(item => ({
//     value: item?.id,
//     label: item?.productName,
//     leaf: true // 第三级设为叶子节点
//   }));
//   if (!nodes?.length) {
//     emptyCate.value = [...emptyCate.value, parentId];
//   }
//   return nodes;
// };

// searchInfo变动时重新获取数据，但是不能调用搜索太频繁了
watch(
  [searchInfo],
  () => {
    debounce(getCurrentPage, 500)();
  },
  { deep: true }
);

watch([currentPageNum, pageSize], () => {
  console.log("currentPageNum", currentPageNum.value);
  getCurrentPage();
});

watch(
  () => newSupplierData.value.categoryId,
  () => {
    getAllPd();
  }
);

getCurrentPage();
getEnums();
fetchMergeTreeData();
</script>

<template>
  <div class="container">
    <div class="button-con absolute top-2 left-[60px] flex gap-2">
      <el-input
        v-model="searchInfo.supplierName"
        style="width: 240px"
        placeholder="请输入公司名称"
      />
      <el-input
        v-model="searchInfo.supplierPerson"
        style="width: 240px"
        placeholder="请输入公司联系人"
      />
    </div>
    <el-button class="exportbtn" type="primary" size="large" @click="exportOut">
      导出所选供应商({{ selectedRowCount }})
    </el-button>
    <el-button
      class="addCate"
      type="primary"
      size="large"
      @click="
        dialogFormVisible = true;
        openType = 'new';
        clearnewSupplierData();
      "
    >
      添加供应商
    </el-button>
    <el-table
      :data="currentPage"
      @selection-change="handleSelectionChange"
      :row-class-name="addClass"
      style="width: 90%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="companyName" label="公司名称" />
      <el-table-column prop="companyAddress" label="地址" />
      <el-table-column prop="contactInfoWay" label="联系方式" />
      <el-table-column prop="contactInfoPerson" label="联系人" />
      <el-table-column prop="supplierGradeName" label="供应商类型" />
      <el-table-column prop="supplierProductName" label="供应产品" />
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            :disabled="scope.row.enable === false"
            link
            type="primary"
            size="large"
            @click="openUpdatePop(scope)"
          >
            编辑
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
      v-model="dialogFormVisible"
      :title="openType == 'new' ? '添加新供应商' : '更新供应商'"
      width="800"
    >
      <el-form
        ref="supplierFormRef"
        :model="newSupplierData"
        :rules="supplierRules"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="companyName" label="公司名称">
              <el-input
                type="text"
                v-model="newSupplierData.companyName"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="companyAddress" label="公司地址">
              <el-input
                type="text"
                v-model="newSupplierData.companyAddress"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="item in newSupplierData.contactInfo" :gutter="20">
          <!-- <el-row v-for="item in newSupplierData.contactInfo"> -->
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input type="text" v-model="item.person" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式">
              <el-input type="text" v-model="item.info" autocomplete="off" />
            </el-form-item>
          </el-col>
          <!-- </el-row> -->
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="registrationInfo" label="注册信息">
              <el-input
                type="text"
                v-model="newSupplierData.registrationInfo"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="营业执照">
              <el-upload
                v-model:file-list="newSupplierData.businessLicense"
                class="upload-demo"
                :on-preview="handlePictureCardPreview"
                :action="uploadUrl"
                :accept="'*'"
                :auto-upload="true"
                list-type="text"
                :headers="{
                  Authorization: formatToken(getToken().accessToken)
                }"
              >
                <el-button>上传营业执照</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="生产许可证">
              <el-upload
                v-model:file-list="newSupplierData.productionLicense"
                class="upload-demo"
                :on-preview="handlePictureCardPreview"
                :action="uploadUrl"
                :accept="'*'"
                :auto-upload="true"
                list-type="text"
                :headers="{
                  Authorization: formatToken(getToken().accessToken)
                }"
              >
                <el-button>上传生产许可证</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="相关证书">
              <el-upload
                v-model:file-list="newSupplierData.relatedCertificate"
                class="upload-demo"
                :on-preview="handlePictureCardPreview"
                :action="uploadUrl"
                :accept="'*'"
                :auto-upload="true"
                list-type="text"
                :headers="{
                  Authorization: formatToken(getToken().accessToken)
                }"
              >
                <el-button>上传相关证书</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="productInfo" label="产品信息">
              <el-cascader
                clearable
                filterable
                style="width: 400px"
                :props="{
                  multiple: true
                }"
                :options="allProductList"
                placeholder="请选择产品"
                v-model="newSupplierData.productInfo"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="bankAccount" label="银行账号">
              <el-input
                type="text"
                v-model="newSupplierData.bankAccount"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="taxNumber" label="税号">
              <el-input
                type="text"
                v-model="newSupplierData.taxNumber"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="invoiceInfo" label="开票信息">
              <el-input
                type="text"
                v-model="newSupplierData.invoiceInfo"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="合同信息">
              <el-upload
                v-model:file-list="newSupplierData.contractInfo"
                class="upload-demo"
                :on-preview="handlePictureCardPreview"
                :action="uploadUrl"
                :accept="'*'"
                :auto-upload="true"
                list-type="text"
                :headers="{
                  Authorization: formatToken(getToken().accessToken)
                }"
              >
                <el-button>上传合同信息</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="supplierGradeId" label="供应商分级">
              <el-select v-model="newSupplierData.supplierGradeId">
                <el-option
                  v-for="item in enums"
                  :label="item.value"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="openType == 'new' ? addCateData() : updateCateData()"
          >
            {{ openType == "new" ? "添加" : "更新" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogDeleteVisible" title="" width="500">
      <span>确定删除该供应商吗？</span>
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

.exportbtn {
  position: absolute;
  top: 4px;
  right: 204px;
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
