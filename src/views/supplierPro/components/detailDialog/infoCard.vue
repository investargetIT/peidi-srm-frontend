<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div>
    <el-card
      shadow="never"
      style=" background: rgb(249 250 251);border-radius: 10px"
    >
      <p class="text-[16px] text-[#0a0a0a] mb-[12px]">{{ props.title }}</p>
      <slot />
    </el-card>
  </div>
</template>
