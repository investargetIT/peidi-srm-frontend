<script setup lang="ts">
import { computed } from "vue";

interface Props {
  /** 圆圈颜色 */
  color?: string;
  /** 圆圈大小 (像素值) */
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 12
});

// 计算样式
const circleStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundColor: props.color,
    borderWidth: `${Math.max(1, Math.floor(props.size / 6))}px`
  };
});
</script>

<template>
  <div
    class="inline-block rounded-full border border-current transition-all duration-300 hover:scale-110 hover:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
    :style="circleStyle"
  ></div>
</template>
