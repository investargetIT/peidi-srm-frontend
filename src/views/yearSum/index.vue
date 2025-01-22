<template>
  <div class="relative pt-4">
    <el-select
      v-model="selectedYear"
      placeholder="选择年份"
      @change="filterTableData"
      class="!absolute top-[-21px] right-0 !w-[120px]"
    >
      <el-option
        v-for="year in [2021, 2022, 2023, 2024, 2025]"
        :key="year"
        :label="year + '年度'"
        :value="year"
      />
    </el-select>
    <el-button
      @click="toggleMonthlyData"
      :icon="showMonthlyData ? ArrowUp : ArrowDown"
      class="!absolute top-[-21px] right-[126px] !w-[120px]"
    >
      {{ showMonthlyData ? "收起月度数据" : "展开月度数据" }}
    </el-button>
    <el-table :data="tableData" @cell-dblclick="handleCellDblClick">
      <el-table-column
        fixed="left"
        prop="categoryId"
        width="140px"
        label="类别"
      >
        <template #default="scope">
          <el-select
            v-if="isEditing(scope.$index, 'categoryId')"
            v-model="scope.row.categoryId"
            @blur="saveEdit(scope.$index, 'categoryId')"
            @change="markUnsavedChanges()"
            :style="{
              width: 120 + 'px',
              height: '40px',
              lineHeight: '30px',
              marginLeft: '-10px'
            }"
            ref="inputCategory"
          >
            <el-option
              v-for="item in allCateData"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{
            allCateData.find(item => item.id == scope.row.categoryId)
              ?.categoryName || scope.row.categoryId
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        width="140px"
        prop="materialNumber"
        label="料号 + 品名 "
      >
        <template #default="scope">
          <el-select
            v-if="isEditing(scope.$index, 'materialNumber')"
            v-model="scope.row.productId"
            @blur="saveEdit(scope.$index, 'materialNumber')"
            @change="
              () => {
                const item = cateAllPd.find(
                  item => item.id == scope.row.productId
                );
                if (item) {
                  scope.row.materialNumber = item.materialCode;
                  scope.row.productName = item.productName;
                }
                markUnsavedChanges();
              }
            "
            :style="{
              width: 100 + 'px',
              height: '40px',
              lineHeight: '30px',
              marginLeft: '-10px'
            }"
            ref="inputMaterialNumber"
          >
            <el-option
              v-for="item in cateAllPd"
              :key="item.id"
              :label="item.materialCode + '&' + item.productName"
              :value="item.id"
            />
          </el-select>

          <span
            v-if="
              !isEditing(scope.$index, 'materialNumber') &&
              (scope.row.materialNumber || scope.row.materialCode)
            "
            >{{
              (scope.row.materialNumber || scope.row.materialCode) +
              "&" +
              scope.row.productName
            }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        :label="selectedYear - 1 + '年度'"
        align="center"
      >
        <el-table-column prop="cnt" label="数量">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'cnt')"
              v-model="scope.row.cnt"
              @blur="saveEdit(scope.$index, 'cnt')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.cnt) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputQuantity"
              type="number"
            />
            <span v-else>{{ scope.row.cnt }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'amount')"
              v-model="scope.row.amount"
              @blur="saveEdit(scope.$index, 'amount')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.amount) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              type="number"
              ref="inputAmount"
            />
            <span v-else>{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="averagePrice" label="平均价格">
          <template #default="scope">
            <span>{{ scope.row.averagePrice }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        fixed="left"
        :label="selectedYear + '年度'"
        align="center"
      >
        <el-table-column prop="estimatedPurchaseQuantity" label="预计采购量">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'estimatedPurchaseQuantity')"
              v-model="scope.row.estimatedPurchaseQuantity"
              @blur="saveEdit(scope.$index, 'estimatedPurchaseQuantity')"
              @input="markUnsavedChanges"
              :style="{
                width:
                  getInputWidth(scope.row.estimatedPurchaseQuantity) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputEstimatedCashFlow"
              type="number"
            />
            <span v-else>{{ scope.row.estimatedPurchaseQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="controlPrice" label="控价目标">
          <template #default="scope">
            <el-input
              type="number"
              v-if="isEditing(scope.$index, 'controlPrice')"
              v-model="scope.row.controlPrice"
              @blur="saveEdit(scope.$index, 'controlPrice')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.controlPrice) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputControlPriceTarget"
            />
            <span v-else>{{ scope.row.controlPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetDrop" label="目标降幅">
          <template #default="scope">
            <span>{{ scope.row.targetDrop }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 继续添加其他列 -->
      <template v-if="showMonthlyData">
        <el-table-column
          v-for="month in 12"
          :key="month"
          align="center"
          :label="`${month}月`"
        >
          <el-table-column :prop="`month-${month}-cnt`" label="采购量">
            <template #default="scope">
              <el-input
                v-if="isEditing(scope.$index, `month-${month}-cnt`)"
                v-model="scope.row.purchaseMonthly[month - 1].cnt"
                @blur="saveEdit(scope.$index, `month-${month}-cnt`)"
                @input="markUnsavedChanges"
                type="number"
                :style="{
                  width:
                    getInputWidth(scope.row.purchaseMonthly[month - 1].cnt) +
                    'px',
                  height: '30px',
                  lineHeight: '30px'
                }"
                :ref="'month-' + index"
              />
              <span v-else>{{ scope.row.purchaseMonthly[month - 1].cnt }}</span>
            </template>
          </el-table-column>
          <el-table-column :prop="`month-${month}-amount`" label="采购金额">
            <template #default="scope">
              <el-input
                type="number"
                v-if="isEditing(scope.$index, `month-${month}-amount`)"
                v-model="scope.row.purchaseMonthly[month - 1].amount"
                @blur="saveEdit(scope.$index, `month-${month}-amount`)"
                @input="markUnsavedChanges"
                :style="{
                  width:
                    getInputWidth(scope.row.purchaseMonthly[month - 1].amount) +
                    'px',
                  height: '30px',
                  lineHeight: '30px'
                }"
                :ref="`inputMonthlyPurchasesAmount${month}`"
              />
              <span v-else>{{
                scope.row.purchaseMonthly[month - 1].amount
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :prop="`averagePrice-${month}`" label="平均价">
            <template #default="scope">
              <span>{{
                scope.row.purchaseMonthly[month - 1].averagePrice
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :prop="`yearOverYearGrowth-${month}`"
            label="较上一年涨幅"
          >
            <template #default="scope">
              <span>{{
                scope.row.purchaseMonthly[month - 1].yearOverYearGrowth !=
                "NaN%"
                  ? scope.row.purchaseMonthly[month - 1].yearOverYearGrowth
                  : "-"
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :prop="`targetGrowth-${month}`"
            label="较控制目标涨幅"
          >
            <template #default="scope">
              <span>{{
                scope.row.purchaseMonthly[month - 1].targetGrowth != "NaN%"
                  ? scope.row.purchaseMonthly[month - 1].targetGrowth
                  : "-"
              }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </template>
      <el-table-column :label="'合计'" align="center">
        <el-table-column prop="purchaseQuantity" label="采购数量">
          <template #default="scope">
            <span>{{ scope.row.purchaseQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseAmount" label="采购金额">
          <template #default="scope">
            <span>{{ scope.row.purchaseAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseAveragePrice" label="采购平均价格">
          <template #default="scope">
            <span>{{ scope.row.purchaseAveragePrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearIncrease" label="较去年涨幅">
          <template #default="scope">
            <span>{{ scope.row.lastYearIncrease }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="controlTargetIncrease" label="较控制目标涨幅">
          <template #default="scope">
            <span>{{ scope.row.controlTargetIncrease }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearTotalDifference" label="较去年总差额">
          <template #default="scope">
            <span>{{ scope.row.lastYearTotalDifference }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="danger" @click="handleDelete(scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="float-right flex">
      <el-button
        class="float-right mt-2 !w-[120px] mr-2"
        type="default"
        @click="addRow"
        >新增</el-button
      >
      <el-button
        @click="saveAllChanges"
        type="primary"
        class="float-right mt-2 !w-[120px] relative !ml-2"
      >
        保存
        <span v-if="hasUnsavedChanges" class="unsaved-changes-dot"></span>
        <!-- <span class="unsaved-changes-dot"></span> -->
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import {
  getAllCate,
  getCatePd,
  getYearList,
  updateYearList,
  deleteYearList
} from "@/api/user.ts";
const selectedYear = ref(null);
selectedYear.value = 2022;
const uniqueYears = computed(() => {
  const years = tableData.value.map(item => item.year);
  return [...new Set(years)];
});

// 监听selectedYear的变化，重新请求数据
const filterTableData = () => {
  getYearListFun();
};

const getYearListFun = () => {
  getYearList({
    searchStr: JSON.stringify({
      searchName: "year",
      searchType: "equals",
      searchValue: selectedYear.value
    })
  }).then(res => {
    const { data } = res;
    tableData.value = data;
    // purchaseMonthly这个数组按照month从小到大排序
    tableData.value.forEach(item => {
      item.purchaseMonthly.sort((a, b) => a.month - b.month);
    });
    calculateAverages();
  });
};
getYearListFun();

const addRow = () => {
  const array = Array.from({ length: 12 }, (_, index) => ({
    cnt: "",
    amount: "",
    averagePrice: "",
    yearOverYearGrowth: "",
    targetGrowth: "",
    month: index + 1
  }));
  tableData.value.push({
    year: selectedYear.value,
    categoryId: "",
    materialNumber: "",
    productId: "",
    productName: "",
    cnt: "",
    amount: "",
    averagePrice: "",
    estimatedPurchaseQuantity: "",
    controlPrice: "",
    targetDrop: "",
    purchaseQuantity: "",
    purchaseAmount: "",
    purchaseAveragePrice: "",
    lastYearIncrease: "",
    controlTargetIncrease: "",
    lastYearTotalDifference: "",
    relatedUpstreamMaterial: "",
    purchaseQuantityChange: "",
    purchaseAmountChange: "",
    purchaseMonthly: JSON.parse(JSON.stringify(array))
  });
  console.log("tableData", tableData.value);
};

// const tableData = computed(() => {
//   if (!selectedYear.value) {
//     return tableData.value;
//   }
//   hasUnsavedChanges.value = false;

//   return tableData.value.filter(item => item.year === selectedYear.value);
// });
const showMonthlyData = ref(false);
function toggleMonthlyData() {
  showMonthlyData.value = !showMonthlyData.value;
}
const calculateAverages = () => {
  tableData.value.forEach(row => {
    // 计算年度平均价格
    if (row.cnt && row.amount) {
      row.averagePrice = row.amount / row.cnt;
      row.averagePrice = Number(row.averagePrice.toFixed(2));
    }

    // 计算月度平均价格
    row.purchaseMonthly.forEach(month => {
      if (month.cnt && month.amount) {
        month.averagePrice = month.amount / month.cnt;
        month.averagePrice = Number(month.averagePrice.toFixed(2));
      }
      // if (month.yearOverYearGrowth) {
      month.yearOverYearGrowth =
        (
          ((Number(month.averagePrice) - Number(row.averagePrice)) * 100) /
          Number(row.averagePrice)
        ).toFixed(2) + "%";
      // }
      // if (month.targetGrowth) {
      month.targetGrowth =
        (
          ((Number(month.averagePrice) - Number(row.controlPrice)) * 100) /
          Number(row.controlPrice)
        ).toFixed(2) + "%";
      // }
    });

    // 计算目标降幅
    if (row.controlPrice && row.averagePrice) {
      row.targetDrop =
        Math.abs(
          (
            ((row.controlPrice - row.averagePrice) / row.controlPrice) *
            100
          ).toFixed(2)
        ) + "%";
    }

    // 计算总采购量和总采购金额
    row.purchaseQuantity = row.purchaseMonthly.reduce(
      (sum, month) => sum + Number(month.cnt),
      0
    );
    row.purchaseAmount = row.purchaseMonthly.reduce(
      (sum, month) => sum + Number(month.amount),
      0
    );

    // 计算采购平均价格并保留两位小数
    if (row.purchaseQuantity && row.purchaseAmount) {
      row.purchaseAveragePrice = (
        row.purchaseAmount / row.purchaseQuantity
      ).toFixed(2);
    }

    // 计算较去年涨幅
    if (row.averagePrice && row.purchaseAveragePrice) {
      row.lastYearIncrease =
        (
          ((row.purchaseAveragePrice - row.averagePrice) / row.averagePrice) *
          100
        ).toFixed(2) + "%";
    }

    // 计算较控制目标涨幅
    if (row.controlPrice && row.purchaseAveragePrice) {
      row.controlTargetIncrease =
        (
          ((row.purchaseAveragePrice - row.controlPrice) / row.controlPrice) *
          100
        ).toFixed(2) + "%";
    }

    // 计算较去年总差额
    if (row.purchaseAmount && row.amount) {
      row.lastYearTotalDifference = (
        (row.purchaseAveragePrice - row.averagePrice) *
        row.purchaseQuantity
      ).toFixed(2);
    }
  });
};
const allCateData = ref([]);
const cateAllPd = ref([]);
const getAllCateFun = () => {
  getAllCate({}).then(res => {
    console.log("res", res);
    if (res?.code) {
      allCateData.value = res?.data || [];
    }
  });
};

const getAllPd = categoryId => {
  if (!categoryId) {
    return;
  }
  getCatePd({
    categoryId: categoryId
    // categoryId : 14
  }).then(res => {
    if (res?.code == 200) {
      cateAllPd.value = res?.data || [];
    }
  });
};
onMounted(() => {
  getAllCateFun();
});
const tableData = ref([]);

calculateAverages();

const handleDelete = rowIndex => {
  // 判断这一行是否有id这个属性，有的话就是已经保存到数据库的数据，需要调用删除接口。没有的话就直接删掉
  if (tableData.value[rowIndex].id) {
    deleteYearList(tableData.value[rowIndex]).then(res => {
      if (res?.code == 200) {
        tableData.value.splice(rowIndex, 1);
        ElMessage.success("删除成功");
      }
    });
  } else {
    tableData.value.splice(rowIndex, 1);
    ElMessage.success("删除成功");
  }
};

const editing = reactive({});
const inputYear = ref(null);
const inputCategory = ref(null);
const inputMaterialNumber = ref(null);
const inputProductName = ref(null);
const inputQuantity = ref(null);
const inputAmount = ref(null);
const inputAveragePrice = ref(null);
const inputEstimatedCashFlow = ref(null);
const inputControlPriceTarget = ref(null);
const inputTargetDrop = ref(null);
const inputPurchaseQuantity = ref(null);
const inputPurchaseAmount = ref(null);
const inputPurchaseAveragePrice = ref(null);
const inputLastYearIncrease = ref(null);
const inputControlTargetIncrease = ref(null);
const inputLastYearTotalDifference = ref(null);
const inputRelatedUpstreamMaterial = ref(null);
const inputPurchaseQuantityChange = ref(null);
const inputPurchaseAmountChange = ref(null);
const inputMonthlyPurchases = ref([
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null
]);

function handleCellDblClick(row, column, cell, event) {
  const index = tableData.value.indexOf(row);
  let field = column.property;
  // 如果点的是料号，那么请求一下getAllPd
  if (field === "materialNumber") {
    getAllPd(row.categoryId);
  }
  // 检查是否是月份采购量列
  if (field === undefined) {
    const monthMatch = column.label.match(/(\d+)月/);
    if (monthMatch) {
      const month = monthMatch[1];
      field = `month-${month}-${event.target.dataset.field}`;
    }
  }
  if (!editing[index]) {
    editing[index] = {};
  }
  editing[index][field] = true;
  console.log("editing", editing);
  nextTick(() => {
    console.log("inputCategory", inputCategory.value);
    if (column.property === "year") {
      inputYear.value.focus();
    } else if (column.property === "categoryId") {
      inputCategory.value.focus();
    } else if (column.property === "materialNumber") {
      inputMaterialNumber.value.focus();
    } else if (column.property === "productName") {
      inputProductName.value.focus();
    } else if (column.property === "cnt") {
      inputQuantity.value.focus();
    } else if (column.property === "amount") {
      inputAmount.value.focus();
    } else if (column.property === "averagePrice") {
      inputAveragePrice.value.focus();
    } else if (column.property === "estimatedPurchaseQuantity") {
      inputEstimatedCashFlow.value.focus();
    } else if (column.property === "controlPrice") {
      inputControlPriceTarget.value.focus();
    } else if (column.property === "targetDrop") {
      inputTargetDrop.value.focus();
    } else if (column.property === "purchaseQuantity") {
      inputPurchaseQuantity.value.focus();
    } else if (column.property === "purchaseAmount") {
      inputPurchaseAmount.value.focus();
    } else if (column.property === "purchaseAveragePrice") {
      inputPurchaseAveragePrice.value.focus();
    } else if (column.property === "lastYearIncrease") {
      inputLastYearIncrease.value.focus();
    } else if (column.property === "controlTargetIncrease") {
      inputControlTargetIncrease.value.focus();
    } else if (column.property === "lastYearTotalDifference") {
      inputLastYearTotalDifference.value.focus();
    } else if (column.property === "relatedUpstreamMaterial") {
      inputRelatedUpstreamMaterial.value.focus();
    } else if (column.property === "purchaseQuantityChange") {
      inputPurchaseQuantityChange.value.focus();
    } else if (column.property === "purchaseAmountChange") {
      inputPurchaseAmountChange.value.focus();
    } else if (column.property.startsWith("month-")) {
      const input = document.querySelector(`.el-input__inner`);
      console.log("input", input);
      if (input) {
        input.focus();
      }
    }
  });
}

function isEditing(rowIndex, column) {
  return editing[rowIndex] && editing[rowIndex][column];
}

function saveEdit(rowIndex, column) {
  const row = tableData.value[rowIndex];
  const value = row[column];
  if (editing[rowIndex]) {
    editing[rowIndex][column] = false;
  }

  // 验证输入值
  if (column === "amount" && (isNaN(value) || value <= 0)) {
    ElMessage.error("金额必须为正数");
    return;
  }

  calculateAverages();
}

function saveAllChanges() {
  // 在这里添加同步到服务端的逻辑
  console.log("保存所有修改", tableData.value);
  updateYearList([...tableData.value]);
  hasUnsavedChanges.value = false;
  ElMessage.success("保存成功");
}
const hasUnsavedChanges = ref(false);

function markUnsavedChanges() {
  hasUnsavedChanges.value = true;
}

function getInputWidth(value) {
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.style.whiteSpace = "nowrap";
  span.textContent = value;
  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);
  return width + 20; // 添加一些额外的空间
}
</script>
<style scoped>
.unsaved-changes-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
}
</style>
