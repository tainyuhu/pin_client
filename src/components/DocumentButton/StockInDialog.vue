<template>
  <el-dialog
    title="新增入庫單"
    :visible.sync="visibleSync"
    :width="isMobile ? '100%' : '680px'"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-in-dialog"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :label-width="isMobile ? '90px' : '100px'"
      size="small"
    >
      <!-- 基本信息區塊 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="15">
          <el-col :xs="24" :sm="12">
            <el-form-item label="系統單號">
              <el-input
                v-model="form.number"
                disabled
                placeholder="系統自動生成"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="異動日期">
              <el-date-picker
                v-model="form.date"
                type="datetime"
                disabled
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 商品信息區塊 -->
      <div
        v-for="(product, productIndex) in form.products"
        :key="product.id"
        class="form-section"
      >
        <div class="section-header">
          <div class="section-title">商品信息 #{{ productIndex + 1 }}</div>
          <el-button
            v-if="form.products.length > 1"
            type="text"
            class="delete-btn"
            icon="el-icon-delete"
            @click="removeProduct(productIndex)"
            >刪除</el-button
          >
        </div>

        <el-form-item
          :label="'選擇產品'"
          :prop="'products.' + productIndex + '.productId'"
          :rules="rules.productId"
        >
          <el-select
            v-model="product.productId"
            placeholder="請選擇產品"
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 批次信息 -->
        <div
          v-for="(batch, batchIndex) in product.batches"
          :key="batch.id"
          class="batch-section"
        >
          <div class="batch-header">
            <div class="batch-title">批次 #{{ batchIndex + 1 }}</div>
            <el-button
              v-if="product.batches.length > 1"
              type="text"
              class="delete-btn"
              icon="el-icon-delete"
              @click="removeBatch(productIndex, batchIndex)"
              >刪除</el-button
            >
          </div>

          <el-row :gutter="15">
            <el-col :xs="24" :sm="12">
              <el-form-item
                label="批次號碼"
                :prop="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.batchNumber'
                "
                :rules="rules.batchNumber"
              >
                <el-input
                  v-model="batch.batchNumber"
                  placeholder="請輸入批次號碼"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                label="入庫數量"
                :prop="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.quantity'
                "
                :rules="rules.quantity"
              >
                <el-input-number
                  v-model="batch.quantity"
                  :min="1"
                  style="width: 100%"
                  controls-position="right"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="有效期限"
            :prop="
              'products.' +
                productIndex +
                '.batches.' +
                batchIndex +
                '.expiryDate'
            "
            :rules="rules.expiryDate"
          >
            <el-date-picker
              v-model="batch.expiryDate"
              type="date"
              placeholder="選擇有效期限"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </div>

        <div class="batch-actions">
          <el-button
            type="text"
            icon="el-icon-plus"
            @click="addBatch(productIndex)"
            >新增批次</el-button
          >
        </div>
      </div>

      <!-- 新增產品按鈕 -->
      <div class="product-actions">
        <el-button
          type="success"
          plain
          size="small"
          icon="el-icon-plus"
          @click="addProduct"
          >新增產品</el-button
        >
      </div>

      <!-- 備註 -->
      <div class="form-section">
        <div class="section-title">其他信息</div>
        <el-form-item label="備註" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="請輸入備註"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" plain>取消</el-button>
      <el-button type="success" @click="submitForm" :loading="loading">
        確認
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
//import api from "@/api"; // 取消註釋確保 API 可用

export default {
  name: "StockInDialog",

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    productData: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      loading: false,
      productOptions: [],
      form: {
        number: "",
        date: "",
        products: [],
        remark: ""
      },
      rules: {
        productId: [
          { required: true, message: "請選擇產品", trigger: "change" }
        ],
        quantity: [{ required: true, message: "請輸入數量", trigger: "blur" }],
        batchNumber: [
          { required: true, message: "請輸入批次號碼", trigger: "blur" }
        ],
        expiryDate: [
          { required: true, message: "請選擇有效期限", trigger: "change" }
        ],
        remark: [{ max: 500, message: "備註最多500字", trigger: "blur" }]
      },
      windowWidth: window.innerWidth
    };
  },

  computed: {
    visibleSync: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
    isMobile() {
      return this.windowWidth < 768;
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initForm();
        this.loadProductData();
      }
    },
    productData: {
      handler(val) {
        if (val && val.length > 0) {
          this.productOptions = val.map(item => ({
            id: item.id,
            name: item.name || item.productName
          }));
        }
      },
      immediate: true
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    initForm() {
      // 確保至少有一個產品和一個批次
      this.form = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        products: [this.createEmptyProduct()],
        remark: ""
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },

    createEmptyProduct() {
      return {
        id: Date.now() + Math.floor(Math.random() * 1000), // 添加唯一ID
        productId: "",
        batches: [this.createEmptyBatch()]
      };
    },

    createEmptyBatch() {
      return {
        id: Date.now() + Math.floor(Math.random() * 1000), // 添加唯一ID
        batchNumber: "",
        quantity: 1,
        expiryDate: ""
      };
    },

    addProduct() {
      this.form.products.push(this.createEmptyProduct());
    },

    removeProduct(productIndex) {
      this.form.products.splice(productIndex, 1);
    },

    addBatch(productIndex) {
      this.form.products[productIndex].batches.push(this.createEmptyBatch());
    },

    removeBatch(productIndex, batchIndex) {
      this.form.products[productIndex].batches.splice(batchIndex, 1);
    },

    generateNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const sequence = "00001"; // 實際應該從後端獲取序號
      return `IN${year}${month}${day}${sequence}`;
    },

    getCurrentDateTime() {
      const date = new Date();
      return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    },

    // 載入產品資料
    async loadProductData() {
      if (this.productData && this.productData.length > 0) {
        return; // 如果已經有产品数据，则不需要重新加载
      }

      try {
        this.loading = true;
        // 使用API加載產品資料，如果已通過props傳入則不需要
        const response = await api.getProductList();
        this.productOptions = response.data || [];
      } catch (error) {
        this.$message.error("獲取產品資料失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    // 提交表單
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.loading = true;
            // 構建提交的數據
            const submitData = {
              ...this.form,
              type: "in",
              operator: "admin" // 實際應從登入用戶獲取
            };

            // 呼叫API創建入庫單
            const response = await api.createStockIn(submitData);
            this.$message.success("入庫單創建成功");
            this.visibleSync = false;
            // 向父組件發送成功事件
            this.$emit("success", response.data);
          } catch (error) {
            this.$message.error("入庫單創建失敗: " + error.message);
          } finally {
            this.loading = false;
          }
        }
      });
    },

    handleCancel() {
      this.handleClose();
    },

    handleClose() {
      const hasData =
        this.form.products.some(
          product =>
            product.productId ||
            product.batches.some(
              batch =>
                batch.batchNumber || batch.quantity !== 1 || batch.expiryDate
            )
        ) || this.form.remark;

      if (hasData) {
        // 使用 MessageBox 而不是 $confirm
        this.$msgbox({
          title: "提示",
          message: "確認關閉？未保存的數據將丟失",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            // 用户点击确定，关闭对话框
            this.visibleSync = false;
          })
          .catch(() => {
            // 用户点击取消，什么都不做
          });
      } else {
        // 如果没有数据，直接关闭
        this.visibleSync = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-in-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    background-color: #4caf50;
    border-bottom: 1px solid #43a047;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
  }

  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: #ffffff;
  }

  :deep(.el-dialog__body) {
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    padding: 24px 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
  }
}

.form-section {
  position: relative;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    position: relative;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 500;
    color: #303133;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 30px;
      height: 2px;
      background-color: #4caf50;
    }
  }

  :deep(.el-form-item:last-child) {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.batch-section {
  position: relative;
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  border-left: 3px solid #4caf50;

  &:last-child {
    margin-bottom: 8px;
  }
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.batch-title {
  font-size: 14px;
  font-weight: 500;
  color: #4caf50;
}

.batch-actions {
  margin-top: 8px;

  :deep(.el-button) {
    color: #4caf50;
  }
}

.product-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  :deep(.el-button) {
    color: #4caf50;
  }
}

.delete-btn {
  color: #f56c6c !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .stock-in-dialog {
    :deep(.el-dialog__body) {
      max-height: calc(100vh - 120px);
      padding: 16px;
    }

    :deep(.el-dialog__header) {
      padding: 12px 16px;
    }

    :deep(.el-dialog__footer) {
      padding: 12px 16px;
    }
  }

  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .batch-section {
    padding: 10px;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

// 美化輸入框和選擇器
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: 4px;
  border-color: #dcdfe6;
  transition: all 0.2s;

  &:hover,
  &:focus {
    border-color: #4caf50;
  }
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__inner) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
