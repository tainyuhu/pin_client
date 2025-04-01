<!-- StockListDialog.vue -->
<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-list-dialog"
  >
    <div class="dialog-content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
        <!-- 品號 (不可編輯) -->
        <LabelInput
          label="品號"
          name="productCode"
          v-model="formData.productCode"
          :disabled="true"
        />

        <!-- 品名 (不可編輯) -->
        <LabelInput
          label="品名"
          name="productName"
          v-model="formData.productName"
          :disabled="true"
        />

        <!-- 類別 (不可編輯) -->
        <LabelInput
          label="類別"
          name="category"
          v-model="formData.category"
          :disabled="true"
        />

        <!-- 批號 -->
        <LabelInput
          label="批號"
          name="batchNumber"
          v-model="formData.batchNumber"
          :rules="rules.batchNumber"
        />

        <!-- 現有數量 -->
        <LabelInput
          label="現有數量"
          name="quantity"
          v-model="formData.quantity"
          type="number"
          :rules="rules.quantity"
        />

        <!-- 箱數 (不可編輯) -->
        <LabelInput
          label="箱數"
          name="boxCount"
          v-model="formData.boxCount"
          type="number"
          :disabled="true"
        />

        <!-- 原價 -->
        <LabelInput
          label="原價"
          name="originalPrice"
          v-model="formData.originalPrice"
          type="number"
          :rules="rules.originalPrice"
        />

        <!-- 安全存量 -->
        <LabelInput
          label="安全存量"
          name="safetyStock"
          v-model="formData.safetyStock"
          type="number"
          :rules="rules.safetyStock"
        />

        <!-- 效期 -->
        <el-form-item label="效期" prop="expiryDate" required>
          <el-date-picker
            v-model="formData.expiryDate"
            type="date"
            placeholder="選擇效期"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 修改原因 -->
        <el-form-item label="修改原因" prop="remark">
          <el-input
            type="textarea"
            v-model="formData.remark"
            :rows="3"
            placeholder="請輸入修改原因"
          />
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        確定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import LabelInput from "@/components/BaseForm/LabelInput.vue";

export default {
  name: "StockListDialog",

  components: {
    LabelInput
  },

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
      loading: false,
      formData: {
        productCode: "",
        productName: "",
        batchNumber: "",
        quantity: "",
        boxCount: "",
        originalPrice: "",
        safetyStock: "",
        expiryDate: "",
        remark: "",
        category: ""
      },
      rules: {
        batchNumber: [
          { required: true, message: "請輸入批號", trigger: "blur" }
        ],
        quantity: [
          { required: true, message: "請輸入現有數量", trigger: "blur" },
          { type: "number", message: "請輸入數字", trigger: "blur" },
          { type: "number", min: 0, message: "數量不能小於0", trigger: "blur" }
        ],
        originalPrice: [
          { required: true, message: "請輸入原價", trigger: "blur" },
          { type: "number", message: "請輸入數字", trigger: "blur" },
          { type: "number", min: 0, message: "原價不能小於0", trigger: "blur" }
        ],
        safetyStock: [
          { required: true, message: "請輸入安全存量", trigger: "blur" },
          { type: "number", message: "請輸入數字", trigger: "blur" },
          {
            type: "number",
            min: 0,
            message: "安全存量不能小於0",
            trigger: "blur"
          }
        ],
        expiryDate: [
          { required: true, message: "請選擇效期", trigger: "change" }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          const threeYearsAgo = Date.now() - 3 * 365 * 24 * 60 * 60 * 1000;
          return time.getTime() < threeYearsAgo;
        }
      }
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
    title() {
      return "編輯庫存資訊";
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initFormData();
      }
    }
  },

  methods: {
    // 初始化表單數據
    initFormData() {
      this.formData = {
        ...this.formData,
        ...this.data
      };
    },

    // 關閉對話框
    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
      this.dialogVisible = false;
    },

    // 提交表單
    async handleSubmit() {
      if (!this.$refs.form) return;

      try {
        this.loading = true;
        const valid = await new Promise(resolve => {
          this.$refs.form.validate(valid => {
            resolve(valid);
          });
        });

        if (valid) {
          await this.$emit("save", { ...this.formData });
          this.$message.success("保存成功");
          this.handleClose();
        } else {
          this.$message.warning("請檢查並填寫完整資訊");
        }
      } catch (error) {
        console.error("提交失敗:", error);
        this.$message.error("提交失敗，請稍後重試");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .stock-list-dialog {
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
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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

  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    min-height: 300px;
    overflow: hidden;
  }
}

.dialog-content {
  max-height: calc(70vh - 140px);
  min-height: 260px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 18px;

  &__error {
    padding-top: 4px;
  }
}
</style>
