<!-- ImageUploader.vue -->
<template>
  <div class="image-uploader">
    <!-- 上傳限制提示 -->
    <div class="upload-info">
      <el-popover
        placement="bottom"
        trigger="hover"
        popper-class="constraints-popover"
      >
        <div class="constraints-content">
          <h4 class="constraints-title">上傳要求</h4>
          <div class="constraints-list">
            <div class="constraint-item">
              <i class="el-icon-picture-outline"></i>
              <span
                >格式：{{
                  acceptTypes
                    .map(type => type.split("/")[1].toUpperCase())
                    .join("、")
                }}</span
              >
            </div>
            <div class="constraint-item">
              <i class="el-icon-upload2"></i>
              <span>大小：{{ maxSize }}MB</span>
            </div>
            <div class="constraint-item">
              <i class="el-icon-full-screen"></i>
              <span>尺寸：{{ width }}x{{ height }}px</span>
            </div>
          </div>
        </div>
        <el-button slot="reference" type="text" class="info-button">
          <i class="el-icon-warning-outline"></i>
        </el-button>
      </el-popover>
    </div>

    <el-upload
      class="uploader"
      action="#"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :auto-upload="false"
    >
      <!-- 預覽圖片 -->
      <div v-if="imageUrl" class="preview-container">
        <img
          :src="imageUrl"
          class="preview-image"
          @click="handlePreviewClick"
        />
        <div class="image-actions">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-zoom-in"
            circle
            class="preview-button"
            @click.stop="handlePreviewClick"
          ></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            circle
            @click.stop="handleRemove"
          ></el-button>
        </div>
      </div>

      <!-- 上傳按鈕 -->
      <div v-else class="upload-trigger">
        <i class="el-icon-plus"></i>
        <div class="upload-text">{{ placeholder }}</div>
      </div>
    </el-upload>

    <!-- 錯誤提示 -->
    <div v-if="errorMessage" class="error-message">
      <i class="el-icon-warning-outline"></i>
      {{ errorMessage }}
    </div>

    <!-- 上傳進度 -->
    <el-progress
      v-if="uploadProgress > 0 && uploadProgress < 100"
      :percentage="uploadProgress"
      :stroke-width="4"
    ></el-progress>

    <!-- 圖片預覽對話框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :append-to-body="true"
      class="preview-dialog"
      width="90%"
    >
      <img :src="imageUrl" class="dialog-image" alt="Preview" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ImageUploader",

  props: {
    value: {
      type: [String, File],
      default: ""
    },
    placeholder: {
      type: String,
      default: "點擊或拖曳上傳圖片"
    },
    maxSize: {
      type: Number,
      default: 5 // 預設5MB
    },
    acceptTypes: {
      type: Array,
      default: () => ["image/jpeg", "image/png", "image/gif"]
    },
    width: {
      type: Number,
      default: 148
    },
    height: {
      type: Number,
      default: 148
    }
  },

  data() {
    return {
      imageUrl: "",
      uploadProgress: 0,
      errorMessage: "",
      loading: false,
      dialogVisible: false
    };
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal && typeof newVal === "string") {
          this.imageUrl = newVal;
        }
      }
    }
  },

  methods: {
    // 處理預覽點擊
    handlePreviewClick() {
      this.dialogVisible = true;
    },

    // 上傳前驗證
    beforeUpload(file) {
      this.errorMessage = "";

      // 檢查文件類型
      if (!this.acceptTypes.includes(file.type)) {
        this.errorMessage = `只支持 ${this.acceptTypes
          .map(type => type.split("/")[1].toUpperCase())
          .join("、")} 格式`;
        return false;
      }

      // 檢查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < this.maxSize;
      if (!isLtMaxSize) {
        this.errorMessage = `圖片大小不能超過 ${this.maxSize}MB!`;
        return false;
      }

      // 檢查圖片尺寸
      return new Promise((resolve, reject) => {
        const image = new Image();
        const _URL = window.URL || window.webkitURL;
        image.src = _URL.createObjectURL(file);
        image.onload = () => {
          if (this.width && this.height) {
            if (image.width !== this.width || image.height !== this.height) {
              this.errorMessage = `圖片尺寸必須為 ${this.width}x${
                this.height
              } 像素`;
              reject();
            }
          }
          resolve();
        };
      });
    },

    // 處理文件改變
    handleChange(file) {
      if (file && file.raw) {
        // 模擬上傳進度
        this.simulateUpload();

        // 讀取預覽
        const reader = new FileReader();
        reader.onload = e => {
          this.imageUrl = e.target.result;
          this.$emit("input", file.raw);
          this.$emit("change", file.raw);
        };
        reader.readAsDataURL(file.raw);
      }
    },

    // 移除圖片
    handleRemove() {
      this.imageUrl = "";
      this.uploadProgress = 0;
      this.$emit("input", "");
      this.$emit("remove");
    },

    // 模擬上傳進度
    simulateUpload() {
      this.uploadProgress = 0;
      const timer = setInterval(() => {
        if (this.uploadProgress < 99) {
          this.uploadProgress += 10;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            this.uploadProgress = 100;
            setTimeout(() => {
              this.uploadProgress = 0;
            }, 500);
          }, 200);
        }
      }, 100);
    }
  }
};
</script>

<style lang="scss" scoped>
.image-uploader {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  position: relative;

  // 上傳資訊按鈕樣式
  .upload-info {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;

    .info-button {
      padding: 4px;
      border-radius: 50%;
      height: 24px;
      width: 24px;
      border: none;
      background: rgba(64, 158, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        color: #409eff;
        font-size: 16px;
      }

      &:hover {
        background: rgba(64, 158, 255, 0.2);
      }
    }
  }

  .uploader {
    ::v-deep .el-upload {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      width: 100%;
    }
  }

  .preview-container {
    position: relative;
    width: v-bind(width + "px");
    height: v-bind(height + "px");
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    overflow: hidden;

    @media (max-width: 768px) {
      width: 100%;
      max-width: v-bind(width + "px");
      margin: 0 auto;
    }

    &:hover .image-actions {
      opacity: 1;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }

    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;

      @media (max-width: 768px) {
        opacity: 1;
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .upload-trigger {
    width: v-bind(width + "px");
    height: v-bind(height + "px");
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;

    @media (max-width: 768px) {
      width: 100%;
      max-width: v-bind(width + "px");
      margin: 0 auto;
    }

    &:hover {
      border-color: #409eff;

      .el-icon-plus {
        color: #409eff;
      }

      .upload-text {
        color: #409eff;
      }
    }

    &:active {
      border-color: #3a8ee6;

      .el-icon-plus {
        color: #3a8ee6;
      }

      .upload-text {
        color: #3a8ee6;
      }
    }

    .el-icon-plus {
      font-size: 28px;
      color: #8c939d;
      margin-bottom: 8px;
      transition: color 0.3s;
    }

    .upload-text {
      color: #8c939d;
      font-size: 14px;
      transition: color 0.3s;
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    color: #f56c6c;
    font-size: 12px;
    margin-top: 8px;
    line-height: 1;

    i {
      margin-right: 4px;
      font-size: 14px;
    }
  }

  ::v-deep .el-progress {
    margin-top: 8px;
  }
}

// 限制條件彈出框樣式
::v-deep .constraints-popover {
  max-width: 300px;
  padding: 0;

  .constraints-content {
    padding: 12px 16px;

    .constraints-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 8px;
    }

    .constraints-list {
      .constraint-item {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #606266;
        margin-bottom: 6px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          margin-right: 4px;
          font-size: 14px;
          color: #909399;
          flex-shrink: 0;
        }

        span {
          white-space: nowrap;
        }
      }
    }
  }
}

// 預覽對話框樣式
.preview-dialog {
  ::v-deep .el-dialog {
    margin-top: 8vh !important;

    @media (max-width: 768px) {
      margin: 0 !important;
      width: 100% !important;
      height: 100%;
      max-width: 100vw !important;
      display: flex;
      flex-direction: column;
    }

    .el-dialog__header {
      padding: 12px;
    }

    .el-dialog__body {
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      @media (max-width: 768px) {
        flex: 1;
        overflow: auto;
      }
    }
  }

  .dialog-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;

    @media (max-width: 768px) {
      width: 100%;
      height: auto;
    }
  }
}
</style>
