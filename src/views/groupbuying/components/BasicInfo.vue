<!-- components/BasicInfo.vue -->
<template>
  <div class="basic-info">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <i class="el-icon-info"></i>
          <h3>基本資訊</h3>
        </div>
      </template>

      <div class="form-content">
        <div class="form-section">
          <el-form-item
            label="活動標題"
            prop="basicInfo.title"
            class="title-item"
          >
            <el-input
              :value="formValue.title"
              @input="updateValue('title', $event)"
              :disabled="disabled"
              placeholder="請輸入活動標題"
            />
          </el-form-item>

          <el-form-item label="活動說明" prop="basicInfo.description">
            <el-input
              type="textarea"
              :value="formValue.description"
              @input="updateValue('description', $event)"
              :rows="4"
              :disabled="disabled"
              placeholder="請詳細描述活動內容及規則"
              resize="none"
            />
          </el-form-item>
        </div>

        <!-- 時間設定區塊 -->
        <div class="form-section time-settings">
          <div class="section-header">
            <span class="section-title">活動時間</span>
          </div>

          <div class="section-content">
            <!-- 開始時間 -->
            <el-form-item label="開始時間" prop="basicInfo.startTimeType">
              <el-radio-group
                :value="formValue.startTimeType"
                @input="updateValue('startTimeType', $event)"
                :disabled="disabled"
                class="start-time-group"
              >
                <el-radio label="now">立即開始</el-radio>
                <el-radio label="scheduled">預計開始</el-radio>
              </el-radio-group>

              <div
                v-if="formValue.startTimeType === 'scheduled'"
                class="datetime-picker"
              >
                <el-date-picker
                  :value="formValue.startTime"
                  @input="updateValue('startTime', $event)"
                  type="datetime"
                  :disabled="disabled"
                  placeholder="選擇開始時間"
                  style="width: 100%"
                />
              </div>
            </el-form-item>

            <!-- 收單時間 -->
            <el-form-item
              label="收單時間"
              prop="basicInfo.endTime"
              class="end-time"
            >
              <el-date-picker
                :value="formValue.endTime"
                @input="updateValue('endTime', $event)"
                type="datetime"
                :disabled="disabled"
                placeholder="選擇收單時間"
                style="width: 100%"
              />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-title">活動主視覺</span>
          </div>

          <div class="upload-container">
            <el-upload
              :disabled="disabled"
              action="/api/upload"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
              class="image-uploader"
            >
              <div v-if="!formValue.mainImage" class="upload-placeholder">
                <i class="el-icon-plus upload-icon"></i>
                <span>上傳圖片</span>
                <div class="upload-hint">建議尺寸 1200x600px</div>
              </div>
              <div v-else class="image-preview-wrapper">
                <el-image
                  :src="formValue.mainImage"
                  fit="cover"
                  class="preview-image"
                >
                  <div slot="error" class="image-error">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="image-overlay">
                  <i class="el-icon-edit"></i>
                  <span>點擊更換</span>
                </div>
              </div>
            </el-upload>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "BasicInfo",
  props: {
    value: {
      type: Object,
      required: true,
      default: () => ({
        title: "",
        description: "",
        startTimeType: "now",
        startTime: null,
        endTime: null,
        mainImage: null
      })
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formValue() {
      return (
        this.value || {
          title: "",
          description: "",
          startTimeType: "now",
          startTime: null,
          endTime: null,
          mainImage: null
        }
      );
    }
  },

  methods: {
    updateValue(key, val) {
      const newValue = { ...this.formValue, [key]: val };
      this.$emit("input", newValue);
    },

    handleImageSuccess(response) {
      this.updateValue("mainImage", response.url);
    },

    beforeImageUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        this.$message.error("只能上傳圖片檔案!");
      }
      if (!isLt2M) {
        this.$message.error("圖片大小不能超過 2MB!");
      }
      return isImage && isLt2M;
    }
  }
};
</script>

<style lang="scss" scoped>
.basic-info {
  margin-bottom: 24px;

  .info-card {
    transition: all 0.3s;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    i {
      color: #409eff;
      font-size: 22px;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .form-content {
    padding: 24px;

    .form-section {
      padding: 16px 0;

      &:not(:last-child) {
        border-bottom: 1px dashed #ebeef5;
        margin-bottom: 16px;
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #606266;
      }
    }

    .section-content {
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .el-form-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .time-settings {
    .start-time-group {
      margin-bottom: 20px;

      .el-radio {
        margin-right: 24px;

        &:last-child {
          margin-right: 0;
        }
      }
    }

    .datetime-picker {
      margin-top: 16px;
    }
  }

  .upload-container {
    width: 100%;
    padding: 8px 0;

    .image-uploader {
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;

        .upload-placeholder {
          color: #409eff;
        }

        .image-overlay {
          opacity: 1;
        }
      }
    }

    .upload-placeholder {
      width: 400px;
      height: 200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #909399;
      background-color: #f8f9fa;

      .upload-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      span {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .upload-hint {
        font-size: 12px;
        color: #909399;
      }
    }

    .image-preview-wrapper {
      position: relative;
      width: 400px;
      height: 200px;
      margin: 0 auto;

      .preview-image {
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
        color: white;

        i {
          font-size: 24px;
          margin-bottom: 8px;
        }

        span {
          font-size: 14px;
        }
      }
    }

    .image-error {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f7fa;
      color: #909399;
      font-size: 24px;
    }
  }
}

@media screen and (max-width: 768px) {
  .basic-info {
    .form-content {
      padding: 16px;
    }

    .section-content {
      padding: 12px;
    }

    .time-settings {
      .start-time-group {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .el-radio {
          margin: 0;
        }
      }
    }

    .upload-container {
      .upload-placeholder,
      .image-preview-wrapper {
        width: 100%;
        height: 160px;
      }
    }
  }
}
</style>
