<script setup lang="ts">
const props = defineProps({
  type: {
    type: String as PropType<"main" | "detail">,
    required: true
  }
});
</script>

<template>
  <div>
    <!-- 总规则 -->
    <div v-if="type === 'main'">
      <el-card
        shadow="never"
        style="
          background: rgb(239 246 255);
          border: 1px solid rgb(191 219 254);
          border-radius: 10px;
        "
      >
        <ul class="text-[14px] text-[#1E40AF] list-disc list-inside space-y-1">
          <li>
            <strong>协议价</strong
            >产品：已纳入合同或补充协议，可直接下单，财务可付款
          </li>
          <li><strong>非协议价（报价）</strong>产品：仅为报价参考，不可下单</li>
          <li>同一供应商下可同时存在协议价与非协议价产品</li>
        </ul>
      </el-card>
    </div>
    <!-- 详细规则 -->
    <div v-if="type === 'detail'">
      <el-card
        shadow="never"
        style=" background: rgb(249 250 251);border-radius: 10px"
      >
        <p class="text-[16px] text-[#0a0a0a] mb-[12px]">协议价设置</p>
        <ul
          class="text-[14px] text-[#71717A] list-disc list-inside space-y-1 mb-[16px]"
        >
          <li>
            协议价产品可直接下单，财务可付款；非协议价仅为报价参考，不可下单。
          </li>
          <li>接受涨价：请上传补充协议，价格更新后标记为协议价</li>
          <li>
            不接受涨价：可更新为新报价（非协议价），建议上传沟通记录作为说明
          </li>
        </ul>
        <slot />
      </el-card>
    </div>
  </div>
</template>
