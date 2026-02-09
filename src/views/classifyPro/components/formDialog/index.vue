<script setup lang="ts">
import { nextTick } from "process";
import { computed, reactive, ref } from "vue";

const props = defineProps({
  categoryList: {
    type: Array<any>,
    required: true
  },
  addFn: {
    type: Function,
    required: true
  },
  updateFn: {
    type: Function,
    required: true
  }
});

const visible = ref(false);
const formType = ref<"add" | "edit">("add");
const level = ref(2);

const formRef = ref(null);
const formData = reactive({
  categoryName: "",
  categoryCode: "",
  parentId: "",
  id: ""
});
const rules = ref({
  categoryName: [{ required: true, message: "请输入", trigger: "blur" }]
});

const getFormTypeName = computed(() => {
  return formType.value === "add" ? "添加" : "编辑";
});

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate((valid: any) => {
    if (valid) {
      if (formType.value === "add") {
        props.addFn(
          {
            ...formData,
            level: level.value
          },
          () => {
            visible.value = false;
          }
        );
      } else {
        props.updateFn(
          {
            ...formData,
            level: level.value
          },
          () => {
            visible.value = false;
          }
        );
      }
    }
  });
};

const handleClose = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

const initDialog = (type: "add" | "edit", row: any) => {
  // console.log("初始化弹窗:", type, row);
  formType.value = type;
  if (type === "add") {
    if (row === null) {
      level.value = 1;
    } else {
      level.value = 2;
    }
  } else {
    level.value = row.level;
  }

  visible.value = true;
  nextTick(() => {
    if (type === "add") {
      formData.parentId = row?.id || "";
    } else {
      formData.categoryName = row?.categoryName || "";
      formData.categoryCode = row?.categoryCode || "";
      formData.parentId = row?.parentId || "";
      formData.id = row?.id || "";
    }
  });
};

defineExpose({
  initDialog
});
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="
        level === 1 ? getFormTypeName + '主分类' : getFormTypeName + '子分类'
      "
      width="600"
      append-to-body
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <template v-if="level === 1">
          <el-form-item label="主分类名称" prop="categoryName">
            <el-input v-model="formData.categoryName" />
          </el-form-item>
          <el-form-item
            prop="categoryCode"
            label="主分类编码"
            v-if="formType === 'edit'"
          >
            <el-input v-model="formData.categoryCode" disabled />
          </el-form-item>
        </template>

        <template v-if="level === 2">
          <el-form-item label="主分类" prop="parentId">
            <el-select
              v-model="formData.parentId"
              placeholder="请选择主分类"
              disabled
            >
              <el-option
                v-for="item in props.categoryList"
                :label="item.categoryName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="子分类名称" prop="categoryName">
            <el-input v-model="formData.categoryName" />
          </el-form-item>
          <el-form-item
            label="子分类编码"
            prop="categoryCode"
            v-if="formType === 'edit'"
          >
            <el-input v-model="formData.categoryCode" disabled />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="handleSubmit">
          {{ getFormTypeName }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: #0a0a0a;
}
</style>
