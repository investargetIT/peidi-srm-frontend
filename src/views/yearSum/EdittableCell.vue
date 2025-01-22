<template>
  <div>
    <el-input
      v-if="isEditing"
      :model-value="inputValue"
      @input="updateValue"
      @blur="saveEdit"
      :style="{
        width: getInputWidth(inputValue) + 'px',
        height: '30px',
        lineHeight: '30px'
      }"
      ref="inputRef"
    />
    <span v-else>{{ inputValue }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  isEditing: {
    type: Boolean,
    required: true
  },
  inputRef: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["update:modelValue", "save-edit"]);

const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue;
  }
);

function updateValue(value) {
  inputValue.value = value;
  emit("update:modelValue", value);
}

function saveEdit() {
  emit("save-edit", inputValue.value);
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

onMounted(() => {
  if (props.isEditing) {
    const input = document.querySelector(`[ref=${props.inputRef}]`);
    if (input) {
      input.focus();
    }
  }
});
</script>
