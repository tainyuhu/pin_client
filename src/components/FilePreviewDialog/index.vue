<!-- components/Common/FilePreviewDialog.vue -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :append-to-body="true"
    custom-class="file-preview-dialog"
  >
    <div class="file-preview-container" v-loading="loading">
      <!-- 檔案預覽區域 -->
      <div class="preview-main">
        <div class="preview-wrapper" v-if="currentFile">
          <!-- 圖片預覽 -->
          <div v-if="isImageFile" class="image-preview">
            <el-image
              :src="currentFile.url"
              :preview-src-list="imageUrlList"
              fit="contain"
              class="preview-image"
              @error="handleImageError"
            >
              <div slot="error" class="error-placeholder">
                <i class="el-icon-picture-outline"></i>
                <p>圖片載入失敗</p>
              </div>
            </el-image>
          </div>

          <!-- PDF 預覽 -->
          <div v-else-if="isPdfFile" class="pdf-preview">
            <iframe
              :src="currentFile.url + '#toolbar=1'"
              frameborder="0"
              class="pdf-viewer"
            ></iframe>
          </div>

          <!-- 視頻預覽 -->
          <div v-else-if="isVideoFile" class="video-preview">
            <video
              controls
              class="video-player"
              :src="currentFile.url"
              @error="handleVideoError"
            ></video>
          </div>

          <!-- 音頻預覽 -->
          <div v-else-if="isAudioFile" class="audio-preview">
            <audio
              controls
              class="audio-player"
              :src="currentFile.url"
              @error="handleAudioError"
            ></audio>
            <div class="audio-info">
              <i class="el-icon-headset"></i>
              <p>{{ currentFile.name }}</p>
            </div>
          </div>

          <!-- 其他不支持直接預覽的文件 -->
          <div v-else class="unsupported-preview">
            <div class="file-icon">
              <i :class="getFileIcon(currentFile.type)"></i>
            </div>
            <p class="file-name">{{ currentFile.name }}</p>
            <p class="file-type">
              {{ getFileTypeDescription(currentFile.type) }}
            </p>
            <p class="file-message">此檔案類型不支援直接預覽，請下載後查看</p>
            <el-button type="primary" @click="downloadFile">下載檔案</el-button>
          </div>
        </div>

        <!-- 無檔案時的佔位 -->
        <div v-else class="no-file-placeholder">
          <i class="el-icon-document"></i>
          <p>無檔案可預覽</p>
        </div>
      </div>

      <!-- 檔案信息與操作區域 -->
      <div class="file-info-panel" v-if="currentFile">
        <h4 class="file-title">{{ currentFile.name }}</h4>

        <div class="file-meta">
          <div class="meta-item">
            <span class="label">類型：</span>
            <span class="value">{{
              getFileTypeDescription(currentFile.type)
            }}</span>
          </div>
          <div class="meta-item" v-if="currentFile.size">
            <span class="label">大小：</span>
            <span class="value">{{ formatFileSize(currentFile.size) }}</span>
          </div>
          <div class="meta-item" v-if="currentFile.uploadTime">
            <span class="label">上傳時間：</span>
            <span class="value">{{
              formatDateTime(currentFile.uploadTime)
            }}</span>
          </div>
          <div class="meta-item" v-if="currentFile.uploader">
            <span class="label">上傳者：</span>
            <span class="value">{{ currentFile.uploader }}</span>
          </div>
          <div class="meta-item" v-if="currentFile.description">
            <span class="label">描述：</span>
            <span class="value description">{{ currentFile.description }}</span>
          </div>
        </div>
      </div>

      <!-- 多檔案預覽導航 -->
      <div class="file-navigation" v-if="files && files.length > 1">
        <div class="current-position">
          {{ currentIndex + 1 }} / {{ files.length }}
        </div>

        <div class="navigation-buttons">
          <el-button
            type="text"
            icon="el-icon-arrow-left"
            :disabled="currentIndex === 0"
            @click="showPreviousFile"
            >上一個</el-button
          >

          <el-button
            type="text"
            icon="el-icon-arrow-right"
            :disabled="currentIndex === files.length - 1"
            @click="showNextFile"
            class="right-arrow"
            >下一個</el-button
          >
        </div>

        <div class="file-thumbnails">
          <div
            v-for="(file, index) in files"
            :key="index"
            :class="['thumbnail-item', { active: index === currentIndex }]"
            @click="currentIndex = index"
          >
            <div class="thumbnail">
              <i :class="getFileIcon(file.type)"></i>
            </div>
            <div class="thumbnail-name">
              {{ truncateFileName(file.name, 10) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <div class="left-actions">
        <!-- <el-button 
            v-if="currentFile && canDownloadFile" 
            type="success" 
            size="small" 
            icon="el-icon-download"
            @click="downloadFile"
          >下載</el-button>
          
          <el-button 
            v-if="currentFile && canPrintFile" 
            type="info" 
            size="small" 
            icon="el-icon-printer"
            @click="printFile"
          >打印</el-button> -->

        <!-- 其他可能的操作按鈕 -->
      </div>

      <el-button @click="closeDialog">關閉</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "FilePreviewDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    files: {
      type: Array,
      default: () => []
      // 期望的格式:
      // {
      //   name: '文件名.jpg',
      //   url: 'https://example.com/path/to/file.jpg',
      //   type: 'image/jpeg', // MIME 類型
      //   size: 1024, // 檔案大小（字節）
      //   uploadTime: '2023-01-01 12:00:00', // 上傳時間
      //   uploader: '王小明', // 上傳者
      //   description: '這是描述文字' // 檔案描述
      // }
    },
    title: {
      type: String,
      default: "檔案預覽"
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      currentIndex: this.initialIndex,
      loading: false,
      imageZoom: 1
    };
  },

  computed: {
    dialogTitle() {
      return (
        this.title ||
        (this.currentFile ? `檔案預覽 - ${this.currentFile.name}` : "檔案預覽")
      );
    },

    currentFile() {
      if (!this.files || !this.files.length) {
        return null;
      }
      return this.files[this.currentIndex] || this.files[0];
    },

    imageUrlList() {
      return this.files
        .filter(file => this.isImageType(file.type))
        .map(file => file.url);
    },

    isImageFile() {
      return this.currentFile && this.isImageType(this.currentFile.type);
    },

    isPdfFile() {
      return this.currentFile && this.currentFile.type === "application/pdf";
    },

    isVideoFile() {
      return (
        this.currentFile &&
        this.currentFile.type &&
        this.currentFile.type.startsWith("video/")
      );
    },

    isAudioFile() {
      return (
        this.currentFile &&
        this.currentFile.type &&
        this.currentFile.type.startsWith("audio/")
      );
    },

    canDownloadFile() {
      return this.currentFile && this.currentFile.url;
    },

    canPrintFile() {
      return this.isImageFile || this.isPdfFile;
    }
  },

  watch: {
    visible(newVal) {
      this.dialogVisible = newVal;
    },

    dialogVisible(newVal) {
      this.$emit("update:visible", newVal);
      if (!newVal) {
        // 重置縮放
        this.imageZoom = 1;
      }
    },

    initialIndex(newVal) {
      this.currentIndex = newVal;
    },

    files() {
      // 當文件數組變化時重置當前索引
      this.currentIndex = 0;
    }
  },

  methods: {
    closeDialog() {
      this.dialogVisible = false;
    },

    showPreviousFile() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },

    showNextFile() {
      if (this.currentIndex < this.files.length - 1) {
        this.currentIndex++;
      }
    },

    handleImageError() {
      this.$message.error("圖片載入失敗");
    },

    handleVideoError() {
      this.$message.error("視頻載入失敗");
    },

    handleAudioError() {
      this.$message.error("音頻載入失敗");
    },

    downloadFile() {
      if (!this.currentFile || !this.currentFile.url) {
        this.$message.warning("無法下載此檔案");
        return;
      }

      // 創建一個臨時的 a 標籤並點擊它來下載文件
      const link = document.createElement("a");
      link.href = this.currentFile.url;
      link.download = this.currentFile.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    printFile() {
      if (this.isImageFile) {
        // 創建一個新窗口用於打印圖片
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
              <head>
                <title>打印 - ${this.currentFile.name}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100vh;
                  }
                </style>
              </head>
              <body onload="window.print();window.close()">
                <img src="${this.currentFile.url}" alt="${
          this.currentFile.name
        }">
              </body>
            </html>
          `);
        printWindow.document.close();
      } else if (this.isPdfFile) {
        // 對於 PDF，直接使用瀏覽器內置的打印功能
        const printFrame = document.createElement("iframe");
        printFrame.style.display = "none";
        printFrame.src = this.currentFile.url;
        document.body.appendChild(printFrame);

        printFrame.onload = () => {
          printFrame.contentWindow.print();
          // 延遲移除 iframe，確保打印對話框有時間顯示
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        };
      } else {
        this.$message.warning("此檔案類型不支援直接打印");
      }
    },

    isImageType(type) {
      const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/svg+xml"
      ];
      return imageTypes.includes(type) || (type && type.startsWith("image/"));
    },

    getFileIcon(type) {
      if (!type) return "el-icon-document";

      if (type.startsWith("image/")) return "el-icon-picture-outline";
      if (type === "application/pdf") return "el-icon-document-checked";
      if (type.startsWith("video/")) return "el-icon-video-camera";
      if (type.startsWith("audio/")) return "el-icon-headset";

      if (
        type.includes("word") ||
        type === "application/msword" ||
        type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return "el-icon-document-add";
      }

      if (
        type.includes("excel") ||
        type === "application/vnd.ms-excel" ||
        type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        return "el-icon-s-grid";
      }

      if (
        type.includes("powerpoint") ||
        type === "application/vnd.ms-powerpoint" ||
        type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        return "el-icon-data-board";
      }

      if (
        type === "application/zip" ||
        type === "application/x-rar-compressed"
      ) {
        return "el-icon-folder-opened";
      }

      // 默認文件圖標
      return "el-icon-document";
    },

    getFileTypeDescription(type) {
      if (!type) return "未知檔案類型";

      const typeMap = {
        "image/jpeg": "JPEG 圖片",
        "image/png": "PNG 圖片",
        "image/gif": "GIF 圖片",
        "image/svg+xml": "SVG 圖片",
        "application/pdf": "PDF 文件",
        "video/mp4": "MP4 視頻",
        "audio/mpeg": "MP3 音頻",
        "application/msword": "Word 文件",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "Word 文件",
        "application/vnd.ms-excel": "Excel 文件",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "Excel 文件",
        "application/vnd.ms-powerpoint": "PowerPoint 文件",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          "PowerPoint 文件",
        "application/zip": "ZIP 壓縮檔",
        "application/x-rar-compressed": "RAR 壓縮檔",
        "text/plain": "純文本文件",
        "text/html": "HTML 文件"
      };

      return typeMap[type] || type;
    },

    formatFileSize(size) {
      if (size < 1024) {
        return size + " B";
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + " KB";
      } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + " MB";
      } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
      }
    },

    formatDateTime(dateTime) {
      if (!dateTime) return "";

      // 如果已經是格式化的日期時間字符串，直接返回
      if (typeof dateTime === "string" && dateTime.includes("-")) {
        return dateTime;
      }

      // 否則嘗試格式化 Date 對象
      try {
        const date = new Date(dateTime);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      } catch (e) {
        return dateTime.toString();
      }
    },

    truncateFileName(name, maxLength) {
      if (!name) return "";

      if (name.length <= maxLength) {
        return name;
      }

      // 找到文件擴展名
      const lastDotIndex = name.lastIndexOf(".");
      if (lastDotIndex === -1) {
        // 無擴展名
        return name.substring(0, maxLength) + "...";
      }

      const extension = name.substring(lastDotIndex);
      const nameWithoutExt = name.substring(0, lastDotIndex);

      // 計算可用於文件名的長度
      const availableLength = maxLength - extension.length - 3; // 3 為 '...' 的長度
      if (availableLength <= 0) {
        // 如果擴展名太長，只返回截斷的文件名
        return name.substring(0, maxLength) + "...";
      }

      return nameWithoutExt.substring(0, availableLength) + "..." + extension;
    }
  }
};
</script>

<style lang="scss" scoped>
.file-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;

  .preview-main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 16px;
    position: relative;

    .preview-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .image-preview,
      .pdf-preview,
      .video-preview,
      .audio-preview,
      .unsupported-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .preview-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
      }

      .pdf-viewer {
        width: 100%;
        height: 400px;
        border: none;
      }

      .video-player {
        max-width: 100%;
        max-height: 400px;
      }

      .audio-player {
        width: 100%;
        max-width: 400px;
      }

      .audio-info {
        margin-top: 16px;
        text-align: center;

        i {
          font-size: 48px;
          color: #409eff;
        }

        p {
          margin-top: 8px;
          color: #606266;
        }
      }

      .unsupported-preview {
        text-align: center;
        padding: 24px;

        .file-icon {
          font-size: 64px;
          color: #909399;
          margin-bottom: 16px;
        }

        .file-name {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .file-type {
          color: #909399;
          margin-bottom: 16px;
        }

        .file-message {
          color: #909399;
          margin-bottom: 24px;
        }
      }
    }

    .no-file-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #909399;

      i {
        font-size: 64px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
      }
    }

    .error-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #f56c6c;

      i {
        font-size: 64px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
      }
    }
  }

  .file-info-panel {
    background-color: #f5f7fa;
    padding: 16px;
    border-radius: 4px;

    .file-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #303133;
      word-break: break-all;
    }

    .file-meta {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;

      .meta-item {
        display: flex;

        .label {
          color: #909399;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .value {
          color: #606266;
          word-break: break-all;

          &.description {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }

  .file-navigation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border-top: 1px solid #ebeef5;
    padding-top: 16px;

    .current-position {
      font-size: 14px;
      color: #909399;
    }

    .navigation-buttons {
      display: flex;
      gap: 16px;

      .right-arrow {
        margin-left: 0;
      }
    }

    .file-thumbnails {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 8px 0;
      width: 100%;

      .thumbnail-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        border: 2px solid transparent;
        transition: all 0.3s;

        &.active {
          border-color: #409eff;
          background-color: rgba(64, 158, 255, 0.1);
        }

        &:hover {
          background-color: #f5f7fa;
        }

        .thumbnail {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          background-color: #f5f7fa;
          margin-bottom: 4px;

          i {
            font-size: 24px;
            color: #909399;
          }
        }

        .thumbnail-name {
          font-size: 12px;
          color: #606266;
          text-align: center;
          max-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;

  .left-actions {
    display: flex;
    gap: 8px;
  }
}

.file-preview-dialog {
  ::v-deep .el-dialog__header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #409eff, #67c23a);
    margin-right: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

/* 響應式樣式 */
@media screen and (max-width: 768px) {
  .file-preview-container {
    .file-info-panel {
      .file-meta {
        grid-template-columns: 1fr;
      }
    }

    .file-navigation {
      .file-thumbnails {
        .thumbnail-item {
          .thumbnail {
            width: 32px;
            height: 32px;

            i {
              font-size: 20px;
            }
          }

          .thumbnail-name {
            max-width: 60px;
          }
        }
      }
    }
  }
}
</style>
