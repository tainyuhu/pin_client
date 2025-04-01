<!-- components/GiftForm.vue -->
<template>
  <div class="gift-form" :class="giftType">
    <div class="form-header">
      <div class="header-left">
        <div class="title">{{ value.name || "未命名贈品" }}</div>
        <el-tag v-if="isRequired" type="danger" size="small" effect="plain">
          必填
        </el-tag>
      </div>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="disabled"
        @click="$emit('remove')"
      />
    </div>

    <div class="form-content">
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="贈品名稱"
            :required="isRequired"
            :error="formErrors.name"
          >
            <el-input
              v-model="formData.name"
              @input="updateField('name', $event)"
              @blur="validateField('name')"
              :disabled="disabled"
              placeholder="請輸入贈品名稱"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="贈品規格">
            <el-input
              v-model="formData.specification"
              @input="updateField('specification', $event)"
              :disabled="disabled"
              placeholder="請輸入贈品規格"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 滿額贈品門檻設定 -->
      <el-row v-if="giftType === 'threshold'" :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="贈品門檻"
            required
            :error="formErrors.thresholdAmount"
          >
            <el-input-number
              v-model="formData.thresholdAmount"
              @change="updateField('thresholdAmount', $event)"
              @blur="validateField('thresholdAmount')"
              :min="0"
              :disabled="disabled"
              :controls-position="'right'"
              style="width: 100%"
            >
              <template #prefix>
                <span class="input-prefix">NT$</span>
              </template>
            </el-input-number>
            <div class="form-item-hint">消費金額達到此門檻即可獲得贈品</div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 數量設定 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="單位">
            <el-input
              v-model="formData.unit"
              @input="updateField('unit', $event)"
              :disabled="disabled"
              placeholder="如：個、件"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="贈品數量"
            :required="isRequired"
            :error="formErrors.stockLimit"
          >
            <el-input-number
              v-model="formData.stockLimit"
              @change="updateField('stockLimit', $event)"
              @blur="validateField('stockLimit')"
              :min="0"
              :disabled="disabled"
              :controls-position="'right'"
              style="width: 100%"
            >
              <template #suffix>
                <span class="input-suffix">{{ formData.unit || "件" }}</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="每人限領">
            <el-input-number
              v-model="formData.perPersonLimit"
              @change="updateField('perPersonLimit', $event)"
              :min="0"
              :disabled="disabled"
              :controls-position="'right'"
              style="width: 100%"
            >
              <template #suffix>
                <span class="input-suffix">{{ formData.unit || "件" }}</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 圖片上傳 -->
      <div class="image-section">
        <div class="image-header">
          <span class="image-title">贈品圖片</span>
          <span class="image-hint">建議尺寸 800x800px，檔案大小不超過 2MB</span>
        </div>

        <el-upload
          :disabled="disabled"
          action="/api/upload"
          list-type="picture-card"
          :on-success="handleImageSuccess"
          :on-preview="handleImagePreview"
          :on-remove="handleImageRemove"
          :before-upload="beforeImageUpload"
          multiple
        >
          <div class="upload-content">
            <i class="el-icon-plus"></i>
            <div class="upload-text">上傳圖片</div>
          </div>
        </el-upload>

        <el-dialog :visible.sync="previewVisible" append-to-body>
          <img width="100%" :src="previewImageUrl" alt="Preview" />
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GiftForm",

  props: {
    value: {
      type: Object,
      required: true,
      default: () => ({
        name: "",
        specification: "",
        unit: "",
        stockLimit: 0,
        perPersonLimit: 0,
        thresholdAmount: 0,
        images: []
      })
    },
    giftType: {
      type: String,
      required: true,
      validator: value => ["bonus", "threshold"].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formData: { ...this.value },
      formErrors: {
        name: "",
        stockLimit: "",
        thresholdAmount: ""
      },
      previewVisible: false,
      previewImageUrl: ""
    };
  },

  computed: {
    typeText() {
      return {
        bonus: "加碼贈品",
        threshold: "滿額贈品"
      }[this.giftType];
    },

    tagType() {
      return {
        bonus: "success",
        threshold: "warning"
      }[this.giftType];
    },

    isRequired() {
      return true;
    }
  },

  watch: {
    value: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true
    }
  },

  methods: {
    updateField(key, value) {
      this.formErrors[key] = "";
      this.formData[key] = value;
      this.$emit("input", { ...this.formData });
    },

    validateField(field) {
      if (this.isRequired) {
        if (field === "name" && !this.formData.name) {
          this.formErrors.name = "請輸入贈品名稱";
          return false;
        }
        if (field === "stockLimit" && this.formData.stockLimit <= 0) {
          this.formErrors.stockLimit = "請輸入有效的贈品數量";
          return false;
        }
        if (
          this.giftType === "threshold" &&
          field === "thresholdAmount" &&
          this.formData.thresholdAmount <= 0
        ) {
          this.formErrors.thresholdAmount = "請輸入有效的門檻金額";
          return false;
        }
      }
      return true;
    },

    validateAll() {
      const fields = ["name", "stockLimit"];
      if (this.giftType === "threshold") {
        fields.push("thresholdAmount");
      }

      return fields.every(field => this.validateField(field));
    },

    handleImageSuccess(response) {
      const images = [...(this.formData.images || []), response.url];
      this.updateField("images", images);
    },

    handleImageRemove(file) {
      const images = this.formData.images.filter(url => url !== file.url);
      this.updateField("images", images);
    },

    handleImagePreview(file) {
      this.previewImageUrl = file.url;
      this.previewVisible = true;
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
.gift-form {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
  background: #ffffff;
  margin-bottom: 24px;

  &.bonus {
    border-left: 4px solid #4caf50;

    &:hover {
      border-color: #4caf50;
      box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
    }

    .form-header {
      background: linear-gradient(
        to right,
        rgba(76, 175, 80, 0.05),
        transparent
      );
    }
  }

  &.threshold {
    border-left: 4px solid #ff9800;

    &:hover {
      border-color: #ff9800;
      box-shadow: 0 4px 16px rgba(255, 152, 0, 0.15);
    }

    .form-header {
      background: linear-gradient(
        to right,
        rgba(255, 152, 0, 0.05),
        transparent
      );
    }
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e0e0e0;
    border-radius: 12px 12px 0 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .el-tag {
        padding: 0 12px;
        height: 24px;
        line-height: 24px;
        border-radius: 12px;
      }
    }

    .el-button {
      padding: 8px;
      border-radius: 8px;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .form-content {
    padding: 24px;

    .el-row {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .el-form-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item__label) {
        padding-bottom: 8px;
        font-weight: 500;
        color: #2c3e50;
      }

      :deep(.el-input) {
        .el-input__inner {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;

          &:hover {
            border-color: #409eff;
          }

          &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
          }
        }
      }

      :deep(.el-input-number) {
        .el-input-number__decrease,
        .el-input-number__increase {
          border-radius: 8px;
          transition: all 0.2s;

          &:hover {
            background-color: #f5f7fa;
            color: #409eff;
          }
        }
      }
    }

    .form-item-hint {
      font-size: 13px;
      color: #909399;
      margin-top: 6px;
      line-height: 1.4;
    }
  }

  .image-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px dashed #e0e0e0;

    .image-header {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .image-title {
        font-size: 15px;
        font-weight: 500;
        color: #2c3e50;
      }

      .image-hint {
        font-size: 13px;
        color: #909399;
      }
    }

    :deep(.el-upload--picture-card) {
      width: 140px;
      height: 140px;
      border-radius: 12px;
      border: 1px dashed #d9d9d9;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
      }
    }

    :deep(.el-upload-list--picture-card) {
      .el-upload-list__item {
        width: 140px;
        height: 140px;
        border-radius: 12px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      height: 100%;
      color: #909399;

      i {
        font-size: 28px;
        transition: all 0.3s;
      }

      .upload-text {
        font-size: 13px;
        line-height: 1;
      }

      &:hover {
        i {
          transform: scale(1.1);
          color: #409eff;
        }
      }
    }
  }

  .input-prefix,
  .input-suffix {
    color: #909399;
    font-size: 14px;
    padding: 0 8px;
  }
}

@media screen and (max-width: 768px) {
  .gift-form {
    .form-content {
      padding: 16px;
    }

    .el-col {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .image-section {
      .image-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  }
}
</style>
