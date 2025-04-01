<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="照片查看器"
    width="80%"
    top="5vh"
    :before-close="handleClose"
    class="photo-viewer-dialog"
  >
    <div class="dialog-header">
      <div class="dialog-header-left">
        <h3 class="dialog-title">
          客訴單號: {{ complaintId }} - 照片 ({{ photos.length }}張)
        </h3>
      </div>
      <div class="dialog-header-right">
        <el-upload
          action="#"
          :http-request="uploadPhoto"
          :show-file-list="false"
          :multiple="true"
          :accept="'.jpg,.jpeg,.png,.gif'"
          :before-upload="beforeUpload"
        >
          <el-button type="primary" icon="el-icon-upload2">
            上傳新照片
          </el-button>
        </el-upload>
      </div>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜尋照片描述..."
        prefix-icon="el-icon-search"
        clearable
        class="search-input"
      ></el-input>
      <el-select
        v-model="typeFilter"
        placeholder="照片類型"
        clearable
        class="type-filter"
      >
        <el-option
          v-for="type in photoTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        ></el-option>
      </el-select>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
    </div>

    <div v-else-if="filteredPhotos.length === 0" class="empty-state">
      <i class="el-icon-picture-outline"></i>
      <p>
        {{ searchQuery || typeFilter ? "沒有符合條件的照片" : "尚未上傳照片" }}
      </p>
      <el-button
        v-if="searchQuery || typeFilter"
        type="text"
        @click="resetFilters"
      >
        清除篩選條件
      </el-button>
    </div>

    <div v-else class="photo-gallery">
      <div
        v-for="(photo, index) in filteredPhotos"
        :key="photo.id"
        class="photo-item"
        @click="previewPhoto(index)"
      >
        <div class="photo-container">
          <img :src="photo.url" :alt="photo.description" class="photo-image" />
          <div class="photo-type">
            <el-tag size="mini" :type="getPhotoTypeTag(photo.type)">
              {{ getPhotoTypeLabel(photo.type) }}
            </el-tag>
          </div>
          <div class="photo-actions">
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click.stop="confirmDelete(photo)"
              title="刪除照片"
            ></el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle
              @click.stop="editPhoto(photo)"
              title="編輯描述"
            ></el-button>
          </div>
        </div>
        <div class="photo-info">
          <div class="photo-description" :title="photo.description">
            {{ photo.description || "無描述" }}
          </div>
          <div class="photo-meta">
            <span class="upload-time">{{ formatDate(photo.uploadTime) }}</span>
            <span class="upload-user">{{ photo.uploadUser }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 照片預覽 -->
    <el-dialog
      width="80%"
      top="5vh"
      title="照片預覽"
      :visible.sync="previewVisible"
      append-to-body
      class="photo-preview-dialog"
    >
      <div class="preview-container">
        <div class="preview-actions">
          <el-button
            v-if="previewIndex > 0"
            type="primary"
            icon="el-icon-arrow-left"
            circle
            @click="previewIndex--"
          ></el-button>
          <span class="preview-counter">
            {{ previewIndex + 1 }} / {{ filteredPhotos.length }}
          </span>
          <el-button
            v-if="previewIndex < filteredPhotos.length - 1"
            type="primary"
            icon="el-icon-arrow-right"
            circle
            @click="previewIndex++"
          ></el-button>
        </div>
        <div class="preview-image-container">
          <img
            v-if="currentPreviewPhoto"
            :src="currentPreviewPhoto.url"
            :alt="currentPreviewPhoto.description"
            class="preview-image"
          />
        </div>
        <div v-if="currentPreviewPhoto" class="preview-details">
          <h4>照片詳情</h4>
          <p>
            <strong>描述:</strong>
            {{ currentPreviewPhoto.description || "無描述" }}
          </p>
          <p>
            <strong>類型:</strong>
            {{ getPhotoTypeLabel(currentPreviewPhoto.type) }}
          </p>
          <p>
            <strong>上傳時間:</strong>
            {{ formatDetailDate(currentPreviewPhoto.uploadTime) }}
          </p>
          <p><strong>上傳人員:</strong> {{ currentPreviewPhoto.uploadUser }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 編輯照片對話框 -->
    <el-dialog
      title="編輯照片資訊"
      :visible.sync="editDialogVisible"
      width="500px"
      append-to-body
      @closed="resetEditForm"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="照片類型" prop="type">
          <el-select
            v-model="editForm.type"
            placeholder="請選擇照片類型"
            style="width: 100%"
          >
            <el-option
              v-for="type in photoTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="照片描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="請輸入照片描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePhotoEdit">確認</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/date";

export default {
  name: "PhotoViewerDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    photos: {
      type: Array,
      default: () => []
    },
    complaintId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchQuery: "",
      typeFilter: "",
      previewVisible: false,
      previewIndex: 0,
      editDialogVisible: false,
      currentEditPhoto: null,
      editForm: {
        id: "",
        type: "",
        description: ""
      },
      editRules: {
        type: [{ required: true, message: "請選擇照片類型", trigger: "change" }]
      },
      photoTypes: [
        { value: "product", label: "商品照片", tag: "primary" },
        { value: "damage", label: "損壞照片", tag: "danger" },
        { value: "package", label: "包裝照片", tag: "warning" },
        { value: "receipt", label: "收據/憑證", tag: "info" },
        { value: "other", label: "其他", tag: "info" }
      ]
    };
  },
  computed: {
    filteredPhotos() {
      let result = [...this.photos];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          photo =>
            (photo.description &&
              photo.description.toLowerCase().includes(query)) ||
            (photo.uploadUser && photo.uploadUser.toLowerCase().includes(query))
        );
      }

      if (this.typeFilter) {
        result = result.filter(photo => photo.type === this.typeFilter);
      }

      return result;
    },
    currentPreviewPhoto() {
      return this.filteredPhotos[this.previewIndex] || null;
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    }
  },
  methods: {
    formatDate(dateStr) {
      return formatDate(dateStr, "YYYY-MM-DD");
    },
    formatDetailDate(dateStr) {
      return formatDate(dateStr, "YYYY-MM-DD HH:mm:ss");
    },
    handleClose() {
      this.dialogVisible = false;
    },
    getPhotoTypeLabel(type) {
      const found = this.photoTypes.find(item => item.value === type);
      return found ? found.label : type;
    },
    getPhotoTypeTag(type) {
      const found = this.photoTypes.find(item => item.value === type);
      return found ? found.tag : "";
    },
    previewPhoto(index) {
      this.previewIndex = index;
      this.previewVisible = true;
    },
    resetFilters() {
      this.searchQuery = "";
      this.typeFilter = "";
    },
    editPhoto(photo) {
      this.currentEditPhoto = photo;
      this.editForm = {
        id: photo.id,
        type: photo.type,
        description: photo.description
      };
      this.editDialogVisible = true;
    },
    resetEditForm() {
      this.editForm = {
        id: "",
        type: "",
        description: ""
      };
      this.currentEditPhoto = null;
    },
    savePhotoEdit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          // 更新本地顯示的照片資訊
          const index = this.photos.findIndex(p => p.id === this.editForm.id);
          if (index !== -1) {
            const updatedPhoto = {
              ...this.photos[index],
              type: this.editForm.type,
              description: this.editForm.description
            };

            // 提交後端 API 更新
            this.$emit("update-photo", updatedPhoto);

            // 更新本地數據
            this.$set(this.photos, index, updatedPhoto);
          }

          this.editDialogVisible = false;
        }
      });
    },
    confirmDelete(photo) {
      this.$confirm("確定要刪除這張照片嗎？此操作不可恢復！", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$emit("delete-photo", photo.id);
        })
        .catch(() => {
          // 取消刪除操作
        });
    },
    beforeUpload(file) {
      // 檢查檔案類型
      const isImage = ["image/jpeg", "image/png", "image/gif"].includes(
        file.type
      );
      if (!isImage) {
        this.$message.error("只能上傳 JPG, PNG, GIF 格式的圖片！");
        return false;
      }

      // 檢查檔案大小 (限制為 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        this.$message.error("圖片大小不能超過 5MB！");
        return false;
      }

      return true;
    },
    uploadPhoto(options) {
      this.loading = true;

      // 顯示上傳中訊息
      const loadingMessage = this.$message({
        message: "上傳中...",
        type: "info",
        duration: 0
      });

      // 準備表單數據
      const formData = new FormData();
      formData.append("photo", options.file);
      formData.append("complaintId", this.complaintId);
      formData.append("type", "product"); // 預設類型，可在上傳後修改

      // 呼叫父元件的添加照片方法
      this.$emit("add-photo", {
        file: options.file,
        complaintId: this.complaintId,
        type: "product",
        description: "",
        onSuccess: () => {
          this.loading = false;
          loadingMessage.close();
          this.$message.success("照片上傳成功");
        },
        onError: error => {
          this.loading = false;
          loadingMessage.close();
          this.$message.error(`上傳失敗: ${error.message || "未知錯誤"}`);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.photo-viewer-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .dialog-title {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }

  .filter-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;

    .search-input {
      flex: 1;
    }

    .type-filter {
      width: 180px;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    background: #f9f9f9;
    border-radius: 8px;

    i {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #909399;
      margin-bottom: 16px;
    }
  }

  .photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    margin-top: 20px;

    .photo-item {
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      background: white;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

        .photo-actions {
          opacity: 1;
        }
      }

      .photo-container {
        position: relative;
        height: 180px;
        overflow: hidden;

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .photo-type {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1;
        }

        .photo-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          gap: 8px;
          z-index: 1;
        }
      }

      .photo-info {
        padding: 12px;

        .photo-description {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 8px;
          color: #303133;
          height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }

        .photo-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;

          .upload-time {
            flex: 1;
          }

          .upload-user {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .photo-preview-dialog {
    ::v-deep .el-dialog__body {
      padding: 0;
    }

    .preview-container {
      display: flex;
      flex-direction: column;

      .preview-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f5f7fa;

        .preview-counter {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .preview-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #000;
        height: 60vh;
        overflow: hidden;

        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }

      .preview-details {
        padding: 20px;
        background: white;

        h4 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #303133;
        }

        p {
          margin: 8px 0;
          line-height: 1.6;
          color: #606266;
        }
      }
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .photo-viewer-dialog {
    .filter-section {
      flex-direction: column;

      .type-filter {
        width: 100%;
      }
    }

    .photo-gallery {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 15px;

      .photo-item {
        .photo-container {
          height: 160px;
        }
      }
    }

    .photo-preview-dialog {
      .preview-image-container {
        height: 40vh;
      }
    }
  }
}
</style>
