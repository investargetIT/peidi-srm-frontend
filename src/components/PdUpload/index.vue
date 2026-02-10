<script setup lang="ts">
import { getFileDownLoadPath } from "@/api/user";
import { formatToken, getToken } from "@/utils/auth";
import type { UploadInstance, UploadProps } from "element-plus";
import { ElImage, ElMessage, UploadFile, UploadUserFile } from "element-plus";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { generateID } from "./utils/index";

// ==================== 类型定义 ====================
interface CustomUploadFile extends UploadUserFile {
  relativeUrl?: string;
  isNew?: boolean;
  status?: "uploading" | "success" | "fail";
  percentage?: number;
  fileType?: "image" | "file";
}

interface Props {
  modelValue: string[];
  limit?: number | null; // 修改为可选的数字或null（null表示无限制）
  action?: string;
  accept?: string;
  headers?: Record<string, any>;
  autoUpload?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  fileSize?: number;
  fileNameLength?: number;
}

interface Emits {
  (e: "update:modelValue", value: string[]): void;
  (e: "upload-success", file: UploadFile, fileList: UploadFile[]): void;
  (
    e: "upload-error",
    error: Error,
    file: UploadFile,
    fileList: UploadFile[]
  ): void;
  (e: "remove", file: UploadFile, fileList: UploadFile[]): void;
}

// ==================== 组件配置 ====================
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  limit: null, // 默认无限制
  action: "https://api.peidigroup.cn/srm/supplier/upload",
  accept: "",
  headers: () => ({}),
  autoUpload: true,
  withCredentials: false,
  multiple: true,
  disabled: false,
  fileSize: 10,
  fileNameLength: 100
});

const emit = defineEmits<Emits>();

// ==================== 响应式数据 ====================
const fileList = ref<CustomUploadFile[]>([]);
const uploadRef = ref<UploadInstance>();
const imagePreviewVisible = ref(false);
const imagePreviewUrl = ref("");

// ==================== 工具方法 ====================
// 获取文件完整URL
const getFileUrl = async (relativeUrl: string) => {
  try {
    const res: any = await getFileDownLoadPath({ objectName: relativeUrl });
    return res.data || "";
  } catch (error) {
    console.error("获取文件地址失败:", error);
    return "";
  }
};

// 生成“xxx_唯一字符串.扩展名”的新文件名
const getNewFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // 没有扩展名的情况，直接加后缀
    return `${fileName}_${generateID()}`;
  }

  const nameWithoutExt = fileName.slice(0, lastDotIndex);
  const ext = fileName.slice(lastDotIndex); // 比如 ".png"
  return `${nameWithoutExt}_${generateID()}${ext}`;
};

// 判断文件类型
const getFileType = (fileName: string): "image" | "file" => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return imageExtensions.includes(extension) ? "image" : "file";
};

// 获取文件图标
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, string> = {
    // 图片
    jpg: "Picture",
    jpeg: "Picture",
    png: "Picture",
    gif: "Picture",
    bmp: "Picture",
    webp: "Picture",
    svg: "Picture",
    // 文档
    pdf: "Document",
    doc: "Document",
    docx: "Document",
    txt: "Document",
    md: "Document",
    // 表格
    xls: "Document",
    xlsx: "Document",
    csv: "Document",
    // 其他
    zip: "Folder",
    rar: "Folder",
    "7z": "Folder"
  };
  return iconMap[extension] || "Document";
};

// ==================== 文件操作方法 ====================
// 初始化文件列表
const initFileList = async () => {
  if (!props.modelValue.length) {
    fileList.value = [];
    return;
  }

  const promises = props.modelValue.map(async (relativeUrl, index) => {
    const existingFile = fileList.value.find(
      file =>
        file.relativeUrl === relativeUrl || file.url?.includes(relativeUrl)
    );

    if (existingFile) {
      return {
        ...existingFile,
        relativeUrl,
        fileType: getFileType(existingFile.name || "")
      };
    }

    const url = await getFileUrl(relativeUrl);
    const fileName = relativeUrl.split("/").pop() || `file-${index}`;

    return {
      name: fileName,
      url,
      relativeUrl,
      status: "success" as const,
      fileType: getFileType(fileName)
    } as CustomUploadFile;
  });

  fileList.value = await Promise.all(promises);
};

// 查找文件索引
const findFileIndex = (uploadFile: UploadFile) => {
  return fileList.value.findIndex(file => file.uid === uploadFile.uid);
};

// 更新文件状态
const updateFileStatus = (
  index: number,
  updates: Partial<CustomUploadFile>
) => {
  if (index !== -1) {
    fileList.value[index] = { ...fileList.value[index], ...updates };
  }
};

// ==================== 上传处理方法 ====================
// 上传前验证与重命名
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
  const isLtSize = rawFile.size / 1024 / 1024 < props.fileSize;
  if (!isLtSize) {
    ElMessage.error(`文件大小不能超过 ${props.fileSize}MB!`);
    return Promise.reject(new Error("Size limit exceeded"));
  }

  const isLtNameLength = rawFile.name.length <= props.fileNameLength;
  if (!isLtNameLength) {
    ElMessage.error(`文件名长度不能超过 ${props.fileNameLength} 个字符!`);
    return Promise.reject(new Error("Name length limit exceeded"));
  }

  // 1. 从 rawFile 上取出我们在 onChange 里挂载的新名字
  const newName = (rawFile as any).customNewName;

  // 如果还没算好名字（极少见情况）， fallback 一下
  const finalName = newName || getNewFileName(rawFile.name);

  // 2. 创建新文件对象用于上传
  const newFile = new File([rawFile], finalName, {
    type: rawFile.type,
    lastModified: rawFile.lastModified
  });

  // 3. 【关键】返回 Promise<File>，el-upload 会用它上传（服务器收到新名字）
  return Promise.resolve(newFile);
};

// 文件状态改变
const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  const index = findFileIndex(uploadFile);

  if (index === -1 && uploadFile.status === "ready") {
    const rawFile = uploadFile.raw;
    if (!rawFile) return;

    // 1. 生成新文件名
    const newName = getNewFileName(rawFile.name);

    // 2. 【关键】将新名字挂载到 rawFile 对象上，以便 beforeUpload 能获取到
    // (beforeUpload 只能拿到 rawFile，拿不到 uploadFile 对象本身，只能这样传值)
    (rawFile as any).customNewName = newName;
    // 同时把 uid 也挂载上去，方便追踪
    (rawFile as any).uid = uploadFile.uid;

    // 3. 【关键】更新 UI 列表显示新名字
    const newFile: CustomUploadFile = {
      ...uploadFile,
      name: newName, // UI 立即显示新名字
      status: "uploading",
      percentage: 0,
      fileType: getFileType(newName)
    };
    fileList.value.push(newFile);
  }
};

// 上传进度
const handleProgress: UploadProps["onProgress"] = (event, uploadFile) => {
  const index = findFileIndex(uploadFile);

  if (index !== -1) {
    // 不需要再改 name，handleChange 已经改过
    updateFileStatus(index, { percentage: event.percent, status: "uploading" });
  }
};

// 上传成功
const handleSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile,
  uploadFiles
) => {
  if (response.code === 200) {
    const relativeUrl = response.data;
    const index = findFileIndex(uploadFile);

    updateFileStatus(index, {
      // name 不需要再改了，handleChange 里已经是新的了
      url: URL.createObjectURL(uploadFile.raw!),
      relativeUrl,
      status: "success",
      percentage: 100,
      isNew: true
    });

    const newFileUrls = [...props.modelValue, relativeUrl];
    emit("update:modelValue", newFileUrls);
    emit("upload-success", uploadFile, uploadFiles);
    ElMessage.success("上传成功");
  }
};

// 上传失败
const handleError: UploadProps["onError"] = (
  error,
  uploadFile,
  uploadFiles
) => {
  const index = findFileIndex(uploadFile);
  updateFileStatus(index, { status: "fail" });

  console.error("上传失败:", error);
  ElMessage.error("上传失败");
  emit("upload-error", error as Error, uploadFile, uploadFiles);
};

// ==================== 用户交互方法 ====================
// 移除文件
const handleRemove = (file: CustomUploadFile) => {
  // 释放 Blob URL
  if (file.url?.startsWith("blob:")) {
    URL.revokeObjectURL(file.url);
  }

  if (file.relativeUrl) {
    const newFileUrls = props.modelValue.filter(
      url => url !== file.relativeUrl
    );
    emit("update:modelValue", newFileUrls);
  }

  fileList.value = fileList.value.filter(item => item.uid !== file.uid);
  emit("remove", file as UploadFile, fileList.value as UploadFile[]);
  ElMessage.success("删除成功");
};

// 预览图片
const handlePreview = (file: CustomUploadFile) => {
  if (file.url) {
    imagePreviewUrl.value = file.url;
    imagePreviewVisible.value = true;
  }
};

// 下载文件
const handleDownload = (file: CustomUploadFile) => {
  if (!file.url) return;

  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==================== 计算属性 ====================
const computedHeaders = computed(() => ({
  Authorization: formatToken(getToken().accessToken),
  ...props.headers
}));

const tipText = computed(() => {
  let text = `最多上传 ${props.limit === null ? "无限制" : props.limit} 个文件`;
  text += `，单个文件不超过 ${props.fileSize}MB`;
  if (props.accept) {
    text += `，支持 ${props.accept}`;
  }
  return text;
});

// ==================== 生命周期 ====================
watch(
  () => [...props.modelValue],
  async (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      await initFileList();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await initFileList();
});

onBeforeUnmount(() => {
  fileList.value.forEach(file => {
    if (file.url?.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }
  });
});

// ==================== 暴露方法 ====================
defineExpose({
  uploadRef,
  submitUpload: () => uploadRef.value?.submit(),
  clearFiles: () => {
    fileList.value = [];
    emit("update:modelValue", []);
  },
  getFileList: () => fileList.value
});
</script>

<template>
  <div class="pdUpload-wrapper">
    <!-- 隐藏原生文件列表的上传组件 -->
    <el-upload
      ref="uploadRef"
      :action="action"
      :headers="computedHeaders"
      :limit="limit"
      :accept="accept"
      :auto-upload="autoUpload"
      :show-file-list="false"
      :with-credentials="withCredentials"
      :multiple="multiple"
      :disabled="disabled"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :class="{ 'pdUpload-disabled': disabled }"
      class="pdUpload-component"
    >
      <template #trigger>
        <el-button type="primary" :disabled="disabled">
          <el-icon class="el-icon--left"><Plus /></el-icon>
          上传文件
        </el-button>
      </template>

      <template #tip>
        <div class="pdUpload-tip">
          <div class="pdUpload-tip-text">{{ tipText }}</div>
        </div>
      </template>
    </el-upload>

    <!-- 自定义文件列表 -->
    <div v-if="fileList.length > 0" class="pdUpload-file-list">
      <div v-for="file in fileList" :key="file.uid" class="pdUpload-file-item">
        <!-- 文件图标 -->
        <div class="pdUpload-file-icon-wrapper">
          <el-icon class="pdUpload-file-icon">
            <component :is="getFileIcon(file.name || '')" />
          </el-icon>
          <div v-if="file.fileType === 'image'" class="pdUpload-image-badge">
            图
          </div>
        </div>

        <!-- 文件信息 -->
        <div class="pdUpload-file-info">
          <div class="pdUpload-file-name" :title="file.name">
            {{ file.name }}
          </div>

          <!-- 上传进度条 -->
          <div v-if="file.status === 'uploading'" class="pdUpload-progress">
            <el-progress
              :percentage="file.percentage"
              :stroke-width="4"
              :show-text="false"
            />
            <span class="pdUpload-progress-text">{{ file.percentage }}%</span>
          </div>

          <!-- 上传状态 -->
          <div v-else class="pdUpload-file-status">
            <el-tag
              :type="file.status === 'success' ? 'success' : 'danger'"
              size="small"
            >
              {{ file.status === "success" ? "已上传" : "上传失败" }}
            </el-tag>
          </div>
        </div>

        <!-- 文件操作 -->
        <div class="pdUpload-file-actions">
          <!-- 图片预览按钮 -->
          <el-button
            v-if="file.fileType === 'image' && file.status === 'success'"
            link
            type="primary"
            size="small"
            @click="handlePreview(file)"
          >
            预览
          </el-button>

          <!-- 下载按钮 -->
          <el-button
            v-if="file.status === 'success'"
            link
            type="primary"
            size="small"
            @click="handleDownload(file)"
          >
            下载
          </el-button>

          <!-- 删除按钮 -->
          <el-button
            link
            type="danger"
            size="small"
            @click="handleRemove(file)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      title="图片预览"
      width="800"
      destroy-on-close
      align-center
    >
      <div class="pdUpload-preview-container">
        <el-image :src="imagePreviewUrl" fit="contain">
          <template #error>
            <div class="pdUpload-image-error">
              <el-icon><Picture /></el-icon>
              <div>加载失败</div>
            </div>
          </template>
        </el-image>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.pdUpload-wrapper {
  width: 100%;

  .pdUpload-component {
    margin-bottom: 16px;
  }

  .pdUpload-tip {
    margin-top: 8px;

    .pdUpload-tip-text {
      font-size: 12px;
      line-height: 1.5;
      color: #909399;
    }
  }

  .pdUpload-file-list {
    overflow: hidden;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
  }

  .pdUpload-file-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f5f7fa;
    }

    .pdUpload-file-icon-wrapper {
      position: relative;
      margin-right: 12px;

      .pdUpload-file-icon {
        font-size: 24px;
        color: #409eff;
      }

      .pdUpload-image-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        padding: 0 5px;
        font-size: 10px;
        line-height: 16px;
        color: white;
        background-color: #f56c6c;
        border-radius: 10px;
      }
    }

    .pdUpload-file-info {
      flex: 1;
      min-width: 0;

      .pdUpload-file-name {
        margin-bottom: 6px;
        overflow: hidden;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pdUpload-progress {
        display: flex;
        gap: 10px;
        align-items: center;

        :deep(.el-progress) {
          flex: 1;
        }

        .pdUpload-progress-text {
          min-width: 40px;
          font-size: 12px;
          color: #909399;
          text-align: right;
        }
      }

      .pdUpload-file-status {
        margin-top: 4px;
      }
    }

    .pdUpload-file-actions {
      display: flex;
      flex-shrink: 0;
      gap: 12px;
      margin-left: 12px;
    }
  }

  .pdUpload-preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    .pdUpload-image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #c0c4cc;

      .el-icon {
        margin-bottom: 12px;
        font-size: 48px;
      }
    }
  }

  .pdUpload-disabled {
    cursor: not-allowed;
    opacity: 0.6;

    :deep(.el-upload) {
      cursor: not-allowed;
    }
  }
}
</style>
