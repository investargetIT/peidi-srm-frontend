<template>
  <div class="relative pt-4">
    <el-select
      v-model="selectedYear"
      placeholder="选择年份"
      @change="filterTableData"
      class="!absolute top-[-21px] right-0 !w-[120px]"
    >
      <el-option
        v-for="year in uniqueYears"
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
    <el-table :data="filteredTableData" @cell-dblclick="handleCellDblClick">
      <el-table-column fixed="left" prop="category" label="类别">
        <template #default="scope">
          <el-input
            v-if="isEditing(scope.$index, 'category')"
            v-model="scope.row.category"
            @blur="saveEdit(scope.$index, 'category')"
            @input="markUnsavedChanges"
            :style="{
              width: getInputWidth(scope.row.category) + 'px',
              height: '30px',
              lineHeight: '30px'
            }"
            ref="inputCategory"
          />
          <span v-else>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="materialNumber" label="料号">
        <template #default="scope">
          <el-input
            v-if="isEditing(scope.$index, 'materialNumber')"
            v-model="scope.row.materialNumber"
            @blur="saveEdit(scope.$index, 'materialNumber')"
            @input="markUnsavedChanges"
            :style="{
              width: getInputWidth(scope.row.materialNumber) + 'px',
              height: '30px',
              lineHeight: '30px'
            }"
            ref="inputMaterialNumber"
          />
          <span v-else>{{ scope.row.materialNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="productName" label="品名">
        <template #default="scope">
          <el-input
            v-if="isEditing(scope.$index, 'productName')"
            v-model="scope.row.productName"
            @blur="saveEdit(scope.$index, 'productName')"
            @input="markUnsavedChanges"
            :style="{
              width: getInputWidth(scope.row.productName) + 'px',
              height: '30px',
              lineHeight: '30px'
            }"
            ref="inputProductName"
          />
          <span v-else>{{ scope.row.productName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        :label="selectedYear - 1 + '年度'"
        align="center"
      >
        <el-table-column prop="quantity" label="数量">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'quantity')"
              v-model="scope.row.quantity"
              @blur="saveEdit(scope.$index, 'quantity')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.quantity) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputQuantity"
            />
            <span v-else>{{ scope.row.quantity }}</span>
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
              ref="inputAmount"
            />
            <span v-else>{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="averagePrice" label="平均价格">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'averagePrice')"
              v-model="scope.row.averagePrice"
              @blur="saveEdit(scope.$index, 'averagePrice')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.averagePrice) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputAveragePrice"
            />
            <span v-else>{{ scope.row.averagePrice }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        fixed="left"
        :label="selectedYear + '年度'"
        align="center"
      >
        <el-table-column prop="estimatedCashFlow" label="预估现金流">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'estimatedCashFlow')"
              v-model="scope.row.estimatedCashFlow"
              @blur="saveEdit(scope.$index, 'estimatedCashFlow')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.estimatedCashFlow) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputEstimatedCashFlow"
            />
            <span v-else>{{ scope.row.estimatedCashFlow }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="controlPriceTarget" label="控价目标">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'controlPriceTarget')"
              v-model="scope.row.controlPriceTarget"
              @blur="saveEdit(scope.$index, 'controlPriceTarget')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.controlPriceTarget) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputControlPriceTarget"
            />
            <span v-else>{{ scope.row.controlPriceTarget }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetDrop" label="目标降幅">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'targetDrop')"
              v-model="scope.row.targetDrop"
              @blur="saveEdit(scope.$index, 'targetDrop')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.targetDrop) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputTargetDrop"
            />
            <span v-else>{{ scope.row.targetDrop }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 继续添加其他列 -->
      <template v-if="showMonthlyData">
        <el-table-column
          v-for="month in 2"
          :key="month"
          align="center"
          :label="`${month}月`"
        >
          <el-table-column :prop="`month-${month}-quantity`" label="采购量">
            <template #default="scope">
              <el-input
                v-if="isEditing(scope.$index, `month-${month}-quantity`)"
                v-model="scope.row.monthlyPurchases[month - 1].quantity"
                @blur="saveEdit(scope.$index, `month-${month}-quantity`)"
                @input="markUnsavedChanges"
                :style="{
                  width:
                    getInputWidth(
                      scope.row.monthlyPurchases[month - 1].quantity
                    ) + 'px',
                  height: '30px',
                  lineHeight: '30px'
                }"
                :ref="'month-' + index"
              />
              <span v-else>{{
                scope.row.monthlyPurchases[month - 1].quantity
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :prop="`month-${month}-amount`" label="采购金额">
            <template #default="scope">
              <el-input
                v-if="isEditing(scope.$index, `month-${month}-amount`)"
                v-model="scope.row.monthlyPurchases[month - 1].amount"
                @blur="saveEdit(scope.$index, `month-${month}-amount`)"
                @input="markUnsavedChanges"
                :style="{
                  width:
                    getInputWidth(
                      scope.row.monthlyPurchases[month - 1].amount
                    ) + 'px',
                  height: '30px',
                  lineHeight: '30px'
                }"
                :ref="`inputMonthlyPurchasesAmount${month}`"
              />
              <span v-else>{{
                scope.row.monthlyPurchases[month - 1].amount
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :prop="`averagePrice-${month}`" label="平均价">
            <template #default="scope">
              <span>{{
                scope.row.monthlyPurchases[month - 1].averagePrice
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :prop="`yearOverYearGrowth-${month}`"
            label="较上一年涨幅"
          >
            <template #default="scope">
              <span>{{
                scope.row.monthlyPurchases[month - 1].yearOverYearGrowth
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :prop="`targetGrowth-${month}`"
            label="较控制目标涨幅"
          >
            <template #default="scope">
              <span>{{
                scope.row.monthlyPurchases[month - 1].targetGrowth
              }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </template>
      <el-table-column :label="'合计'" align="center">
        <el-table-column prop="purchaseQuantity" label="采购数量">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'purchaseQuantity')"
              v-model="scope.row.purchaseQuantity"
              @blur="saveEdit(scope.$index, 'purchaseQuantity')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.purchaseQuantity) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputPurchaseQuantity"
            />
            <span v-else>{{ scope.row.purchaseQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseAmount" label="采购金额">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'purchaseAmount')"
              v-model="scope.row.purchaseAmount"
              @blur="saveEdit(scope.$index, 'purchaseAmount')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.purchaseAmount) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputPurchaseAmount"
            />
            <span v-else>{{ scope.row.purchaseAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseAveragePrice" label="采购平均价格">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'purchaseAveragePrice')"
              v-model="scope.row.purchaseAveragePrice"
              @blur="saveEdit(scope.$index, 'purchaseAveragePrice')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.purchaseAveragePrice) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputPurchaseAveragePrice"
            />
            <span v-else>{{ scope.row.purchaseAveragePrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearIncrease" label="去年涨幅">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'lastYearIncrease')"
              v-model="scope.row.lastYearIncrease"
              @blur="saveEdit(scope.$index, 'lastYearIncrease')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.lastYearIncrease) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputLastYearIncrease"
            />
            <span v-else>{{ scope.row.lastYearIncrease }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="controlTargetIncrease" label="控价目标涨幅">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'controlTargetIncrease')"
              v-model="scope.row.controlTargetIncrease"
              @blur="saveEdit(scope.$index, 'controlTargetIncrease')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.controlTargetIncrease) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputControlTargetIncrease"
            />
            <span v-else>{{ scope.row.controlTargetIncrease }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearTotalDifference" label="去年总差额">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'lastYearTotalDifference')"
              v-model="scope.row.lastYearTotalDifference"
              @blur="saveEdit(scope.$index, 'lastYearTotalDifference')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.lastYearTotalDifference) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputLastYearTotalDifference"
            />
            <span v-else>{{ scope.row.lastYearTotalDifference }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="relatedUpstreamMaterial" label="相关上游物料">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'relatedUpstreamMaterial')"
              v-model="scope.row.relatedUpstreamMaterial"
              @blur="saveEdit(scope.$index, 'relatedUpstreamMaterial')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.relatedUpstreamMaterial) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputRelatedUpstreamMaterial"
            />
            <span v-else>{{ scope.row.relatedUpstreamMaterial }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseQuantityChange" label="采购数量变化">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'purchaseQuantityChange')"
              v-model="scope.row.purchaseQuantityChange"
              @blur="saveEdit(scope.$index, 'purchaseQuantityChange')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.purchaseQuantityChange) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputPurchaseQuantityChange"
            />
            <span v-else>{{ scope.row.purchaseQuantityChange }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseAmountChange" label="采购金额变化">
          <template #default="scope">
            <el-input
              v-if="isEditing(scope.$index, 'purchaseAmountChange')"
              v-model="scope.row.purchaseAmountChange"
              @blur="saveEdit(scope.$index, 'purchaseAmountChange')"
              @input="markUnsavedChanges"
              :style="{
                width: getInputWidth(scope.row.purchaseAmountChange) + 'px',
                height: '30px',
                lineHeight: '30px'
              }"
              ref="inputPurchaseAmountChange"
            />
            <span v-else>{{ scope.row.purchaseAmountChange }}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <el-button
      @click="saveAllChanges"
      type="primary"
      class="float-right mt-2 !w-[120px] relative"
    >
      保存
      <span v-if="hasUnsavedChanges" class="unsaved-changes-dot"></span>
      <!-- <span class="unsaved-changes-dot"></span> -->
    </el-button>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, reactive } from "vue";
import { ElMessage } from "element-plus";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
const selectedYear = ref(null);
selectedYear.value = 2022;
const uniqueYears = computed(() => {
  const years = tableData.value.map(item => item.year);
  return [...new Set(years)];
});

const filteredTableData = computed(() => {
  if (!selectedYear.value) {
    return tableData.value;
  }
  hasUnsavedChanges.value = false;

  return tableData.value.filter(item => item.year === selectedYear.value);
});
const showMonthlyData = ref(false);
function toggleMonthlyData() {
  showMonthlyData.value = !showMonthlyData.value;
}
const tableData = ref([
  {
    year: 2021,
    category: "电子",
    materialNumber: "A001",
    productName: "电阻",
    quantity: 1000,
    amount: 5000,
    averagePrice: 5,
    estimatedCashFlow: 4500,
    controlPriceTarget: 4.5,
    targetDrop: 0.1,
    purchaseQuantity: 900,
    purchaseAmount: 4050,
    purchaseAveragePrice: 4.5,
    lastYearIncrease: 0.1,
    controlTargetIncrease: 0.05,
    lastYearTotalDifference: 500,
    relatedUpstreamMaterial: "B001",
    purchaseQuantityChange: 0.1,
    purchaseAmountChange: 0.1,
    monthlyPurchases: [
      {
        quantity: 100,
        amount: 1000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      },
      {
        quantity: 200,
        amount: 2000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      }
    ]
  },
  {
    year: 2022,
    category: "机械",
    materialNumber: "A002",
    productName: "齿轮",
    quantity: 2000,
    amount: 10000,
    averagePrice: 5,
    estimatedCashFlow: 9000,
    controlPriceTarget: 4.5,
    targetDrop: 0.1,
    purchaseQuantity: 1800,
    purchaseAmount: 8100,
    purchaseAveragePrice: 4.5,
    lastYearIncrease: 0.1,
    controlTargetIncrease: 0.05,
    lastYearTotalDifference: 1000,
    relatedUpstreamMaterial: "B002",
    purchaseQuantityChange: 0.1,
    purchaseAmountChange: 0.1,
    monthlyPurchases: [
      {
        quantity: 100,
        amount: 1000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      },
      {
        quantity: 200,
        amount: 2000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      }
    ]
  },
  {
    year: 2023,
    category: "化工",
    materialNumber: "A003",
    productName: "塑料",
    quantity: 3000,
    amount: 15000,
    averagePrice: 5,
    estimatedCashFlow: 13500,
    controlPriceTarget: 4.5,
    targetDrop: 0.1,
    purchaseQuantity: 2700,
    purchaseAmount: 12150,
    purchaseAveragePrice: 4.5,
    lastYearIncrease: 0.1,
    controlTargetIncrease: 0.05,
    lastYearTotalDifference: 1500,
    relatedUpstreamMaterial: "B003",
    purchaseQuantityChange: 0.1,
    purchaseAmountChange: 0.1,
    monthlyPurchases: [
      {
        quantity: 100,
        amount: 1000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      },
      {
        quantity: 200,
        amount: 2000,
        averagePrice: 10,
        yearOverYearGrowth: 5,
        targetGrowth: 3
      }
    ]
  }
]);

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
  const index = filteredTableData.value.indexOf(row);
  let field = column.property;
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
    } else if (column.property === "category") {
      inputCategory.value.focus();
    } else if (column.property === "materialNumber") {
      inputMaterialNumber.value.focus();
    } else if (column.property === "productName") {
      inputProductName.value.focus();
    } else if (column.property === "quantity") {
      inputQuantity.value.focus();
    } else if (column.property === "amount") {
      inputAmount.value.focus();
    } else if (column.property === "averagePrice") {
      inputAveragePrice.value.focus();
    } else if (column.property === "estimatedCashFlow") {
      inputEstimatedCashFlow.value.focus();
    } else if (column.property === "controlPriceTarget") {
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
}

function saveAllChanges() {
  // 在这里添加同步到服务端的逻辑
  console.log("保存所有修改", tableData.value);
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
