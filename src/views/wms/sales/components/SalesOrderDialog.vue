<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="650px"
    :close-on-click-modal="false"
    custom-class="list-dialog"
    @closed="handleClosed"
  >
    <div class="dialog-content">
      <!-- 訂單資訊卡片 -->
      <div class="order-card">
        <div class="order-number">
          <div class="badge">訂單單號:</div>
          <div class="number">{{ formData.orderNumber }}</div>
        </div>

        <div class="order-info">
          <div class="info-row">
            <div class="info-item">
              <i class="el-icon-user"></i>
              <span>客戶: {{ formData.customerName }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-date"></i>
              <span>出貨日期: {{ formatDate(formData.shipmentDate) }}</span>
            </div>
          </div>
          <div class="status-tag">
            <span class="status-label">狀態:</span>
            <el-tag :type="getStatusType(formData.status)" size="medium">
              {{ getStatusLabel(formData.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 表單區域 -->
      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        label-position="top"
        size="medium"
        class="modern-form"
      >
        <div class="section-title">
          <i class="el-icon-phone-outline"></i>
          <span>聯絡資訊</span>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="聯絡人" prop="contactPerson">
              <el-input
                v-model="formData.contactPerson"
                placeholder="請輸入聯絡人姓名"
                maxlength="30"
                show-word-limit
                prefix-icon="el-icon-user"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="聯絡電話" prop="contactPhone">
              <div class="phone-inputs">
                <el-input
                  v-model="formData.contactPhone"
                  placeholder="請輸入聯絡電話"
                  maxlength="20"
                  prefix-icon="el-icon-phone"
                ></el-input>
                <el-input
                  v-model="formData.extension"
                  placeholder="分機"
                  maxlength="10"
                  class="extension-input"
                ></el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="送貨地址" prop="shippingAddress">
          <el-input
            v-model="formData.shippingAddress"
            placeholder="請輸入完整送貨地址"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            prefix-icon="el-icon-location"
          ></el-input>
        </el-form-item>

        <el-form-item label="備註" prop="notes">
          <el-input
            v-model="formData.notes"
            placeholder="可輸入備註說明"
            type="textarea"
            :rows="2"
            maxlength="500"
            show-word-limit
            prefix-icon="el-icon-document"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>

    <!-- 對話框底部按鈕 -->
    <span slot="footer" class="dialog-footer">
      <el-button plain @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">
        儲存變更
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/date";
import { statusOptions } from "@/constants/tableColumns";

export default {
  name: "SalesOrderDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        id: null,
        orderNumber: "",
        customerName: "",
        shipmentDate: "",
        status: "",
        contactPerson: "",
        contactPhone: "",
        extension: "",
        shippingAddress: "",
        notes: ""
      },
      // 表單驗證規則
      rules: {
        contactPerson: [
          { required: true, message: "請輸入聯絡人姓名", trigger: "blur" },
          { max: 30, message: "聯絡人姓名不能超過30個字符", trigger: "blur" }
        ],
        contactPhone: [
          { required: true, message: "請輸入聯絡電話", trigger: "blur" },
          { max: 20, message: "聯絡電話不能超過20個字符", trigger: "blur" },
          {
            pattern: /^[0-9-+()（）]+$/,
            message: "聯絡電話格式不正確",
            trigger: "blur"
          }
        ],
        shippingAddress: [
          { required: true, message: "請輸入送貨地址", trigger: "blur" },
          { max: 200, message: "送貨地址不能超過200個字符", trigger: "blur" }
        ],
        notes: [{ max: 500, message: "備註不能超過500個字符", trigger: "blur" }]
      },
      // 狀態選項
      statusOptions: statusOptions.salesStatusOptions
    };
  },
  computed: {
    dialogTitle() {
      return this.formData.id ? `編輯訂單單` : "新增訂單單";
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    data: {
      handler(val) {
        if (val) {
          this.formData = { ...this.getDefaultFormData(), ...val };
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    // 獲取狀態標籤樣式
    getStatusType(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },
    // 獲取狀態顯示文字
    getStatusLabel(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },
    // 獲取默認表單數據
    getDefaultFormData() {
      return {
        id: null,
        orderNumber: "",
        customerName: "",
        shipmentDate: new Date(),
        status: "pending",
        contactPerson: "",
        contactPhone: "",
        extension: "",
        shippingAddress: "",
        notes: ""
      };
    },
    // 提交表單
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$message({
            message: "請檢查並修正表單中的錯誤",
            type: "warning",
            duration: 2000
          });
          return;
        }

        this.submitting = true;

        // 只保留可編輯的字段，避免修改其他數據
        const editableData = {
          id: this.formData.id,
          orderNumber: this.formData.orderNumber,
          contactPerson: this.formData.contactPerson,
          contactPhone: this.formData.contactPhone,
          extension: this.formData.extension,
          shippingAddress: this.formData.shippingAddress,
          notes: this.formData.notes
        };

        this.$emit("save", editableData);

        // 注意：實際保存操作應該在父組件中完成，並在成功後關閉對話框
        // 這裡不會自動關閉對話框，而是等待父組件中的操作完成後再關閉
        this.submitting = false;
      });
    },
    // 對話框關閉時重置表單
    handleClosed() {
      this.$refs.form.resetFields();
      this.formData = this.getDefaultFormData();
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .list-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #1989fa, #5cadff);
    padding: 15px 20px;
    border-radius: 4px 4px 0 0;
    margin-right: 0;

    .el-dialog__title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .el-dialog__headerbtn {
      top: 15px;

      .el-dialog__close {
        color: #ffffff;
        font-weight: 600;

        &:hover {
          color: #f2f6fc;
        }
      }
    }
  }
}

.dialog-content {
  padding: 0 0 16px;
}

.order-card {
  background-color: #f8f9fa;
  color: #303133;
  padding: 16px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .order-number {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;

    .badge {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin-right: 12px;
    }

    .number {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      letter-spacing: 0.5px;
    }
  }

  .order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-row {
      display: flex;
      gap: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 18px;
        color: #1890ff;
      }

      span {
        font-size: 15px;
        color: #303133;
      }
    }

    .status-tag {
      display: flex;
      align-items: center;

      .status-label {
        margin-right: 8px;
        font-weight: 500;
        color: #606266;
      }
    }
  }
}

::v-deep .el-tag {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
}

.modern-form {
  padding: 0 24px;

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    i {
      font-size: 20px;
      color: #1890ff;
      margin-right: 10px;
    }

    span {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
    font-size: 15px;
    color: #606266;
    line-height: 1.2;
    padding-bottom: 8px;
  }

  ::v-deep .el-input__inner {
    height: 42px;
    border-radius: 6px;
    border-color: #e4e7ed;

    &:focus,
    &:hover {
      border-color: #1890ff;
    }
  }

  ::v-deep .el-textarea__inner {
    border-radius: 6px;
    padding: 12px;
    line-height: 1.5;

    &:focus,
    &:hover {
      border-color: #1890ff;
    }
  }

  .phone-inputs {
    display: flex;
    gap: 8px;

    .extension-input {
      width: 80px;
      flex-shrink: 0;
    }
  }
}

::v-deep .el-button {
  padding: 10px 24px;
  font-size: 15px;
  border-radius: 6px;
  transition: all 0.3s;

  &--primary {
    background-color: #1890ff;
    border: none;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4);
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .list-dialog {
    width: 95% !important;
    margin-top: 5vh !important;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .info-row {
      flex-direction: column;
      gap: 12px;
    }

    .status-tag {
      align-self: flex-start;
    }
  }

  .phone-inputs {
    flex-direction: column;

    .extension-input {
      width: 100% !important;
    }
  }
}
</style>
