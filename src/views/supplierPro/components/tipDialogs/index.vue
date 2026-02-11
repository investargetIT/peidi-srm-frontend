<script setup lang="ts">
import { STATUS_COLOR_CONFIG } from "@/constants/color";
import { ref } from "vue";

type DialogTypeType =
  | "supplier_serviceStatus"
  | "productFilePdzc_contractPrice"
  | "productFilePdzc_supplierInfo";

const visible = ref(false);
const dialogType = ref("productFilePdzc_supplierInfo");

defineExpose({
  show(type: DialogTypeType) {
    dialogType.value = type;
    visible.value = true;
  }
});
</script>

<template>
  <div>
    <el-dialog v-model="visible" title="解释说明" width="600" append-to-body>
      <div
        class="text-[#0a0a0a] text-[14px]"
        v-if="dialogType === 'supplier_serviceStatus'"
      >
        <p class="font-bold mb-[10px]">服务状态判断条件：</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.info }"
            >
              灰色 -未签年框：
            </span>
            年框未勾选已签订 或 未上传年框文件
            <strong>（不是未签年框状态，后面统一称为年框已传 ）</strong>
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.success }"
            >
              绿色 -有效期内：
            </span>
            年框已传，且 协议起始日期 < 当前时间 < 协议到期时间
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.warning }"
            >
              黄色 -临近到期：
            </span>
            年框已传，且 协议起始日期 < 当前时间 < 协议到期时间，且
            (协议到期时间 - 30天) < 当前时间
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.danger }"
            >
              红色 -已过期：
            </span>
            年框已传，且 协议到期时间 < 当前时间
          </li>
        </ul>
      </div>

      <div
        class="text-[#0a0a0a] text-[14px]"
        v-if="dialogType === 'productFilePdzc_contractPrice'"
      >
        <p class="font-bold mb-[10px]">协议价状态判断条件：</p>
        <ul class="list-disc list-inside space-y-1">
          <li>报价情况1：未签年框</li>
          <li>
            报价情况2：<strong>补充协议 </strong>有上传文件 但
            <strong> 价格变动原因 </strong>未填写
          </li>
          <li>未满足以上条件，显示<strong> 协议价</strong></li>
          <li>若无法获取该供应商信息，显示<strong> 协议价信息错误</strong></li>
        </ul>
      </div>

      <div
        class="text-[#0a0a0a] text-[14px]"
        v-if="dialogType === 'productFilePdzc_supplierInfo'"
      >
        <p class="font-bold mb-[10px]">供应商圆点颜色判断条件：</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.info }"
            >
              灰色 -供应商未签年框
            </span>
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.success }"
            >
              绿色 -在年框有效期内
            </span>
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.warning }"
            >
              黄色 -年框临近到期
            </span>
          </li>
          <li>
            <span
              class="font-bold"
              :style="{ color: STATUS_COLOR_CONFIG.danger }"
            >
              红色 -年框已过期
            </span>
          </li>
          <li>详情见 供应商管理 服务状态解释</li>
        </ul>

        <p class="font-bold mb-[10px] mt-[10px]">
          注意：若无法获取该供应商信息，供应商底部年框状态 显示 年框信息错误
        </p>
      </div>

      <template #footer>
        <div>
          <el-button type="primary" @click="visible = false">
            已了解
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
