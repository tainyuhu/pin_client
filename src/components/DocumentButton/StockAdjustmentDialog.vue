<template>
  <el-dialog
    title="庫存調整單"
    :visible.sync="visibleSync"
    :width="isMobile ? '100%' : '800px'"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-adjustment-dialog"
  >
    <div class="adjustment-container">
      <!-- 基本信息區塊 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-form
          ref="headerForm"
          :model="formData"
          :rules="headerRules"
          label-width="90px"
          size="small"
        >
          <el-row :gutter="15">
            <el-col :xs="24" :sm="12">
              <el-form-item label="調整單號" prop="number">
                <el-input
                  v-model="formData.number"
                  disabled
                  placeholder="系統自動生成"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="調整日期" prop="date">
                <el-date-picker
                  v-model="formData.date"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  placeholder="選擇日期時間"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="15">
            <el-col :xs="24" :sm="12">
              <el-form-item label="調整類型" prop="adjustmentType">
                <el-select
                  v-model="formData.adjustmentType"
                  placeholder="請選擇調整類型"
                  style="width: 100%"
                >
                  <el-option
                    label="盤點調整"
                    value="inventory_check"
                  ></el-option>
                  <el-option
                    label="損耗補充"
                    value="loss_supplement"
                  ></el-option>
                  <el-option
                    label="數量糾正"
                    value="quantity_correction"
                  ></el-option>
                  <el-option label="系統錯誤" value="system_error"></el-option>
                  <el-option label="其他原因" value="other"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="操作人員" prop="operator">
                <el-input
                  v-model="formData.operator"
                  placeholder="請輸入操作人員"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="調整說明" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="3"
              placeholder="請輸入詳細說明"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 產品選擇區塊 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">產品選擇</div>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="addAdjustment"
          >
            新增調整
          </el-button>
        </div>

        <!-- 產品調整列表 -->
        <div
          v-for="(item, index) in formData.adjustments"
          :key="item.id"
          class="adjustment-item"
        >
          <div class="item-header">
            <div class="item-title">調整項目 #{{ index + 1 }}</div>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              circle
              @click="removeAdjustment(index)"
              v-if="formData.adjustments.length > 1"
            ></el-button>
          </div>

          <!-- 品號選擇 -->
          <el-form label-width="90px" size="small">
            <el-form-item label="產品">
              <el-select
                v-model="item.productId"
                filterable
                placeholder="請選擇產品"
                style="width: 100%"
                @change="handleProductChange(item)"
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <!-- 顯示總庫存 -->
          <div v-if="item.productId" class="stock-summary">
            <div class="summary-label">當前總庫存:</div>
            <div class="summary-value">{{ item.totalStock || 0 }}</div>
          </div>

          <!-- 批號處理選項 -->
          <div v-if="item.productId" class="batch-options">
            <el-radio-group
              v-model="item.batchMode"
              @change="handleBatchModeChange(item)"
            >
              <el-radio label="existing">調整現有批號</el-radio>
              <el-radio label="new">新增批號</el-radio>
            </el-radio-group>
          </div>

          <!-- 現有批號列表 -->
          <div
            v-if="item.productId && item.batchMode === 'existing'"
            class="existing-batches"
          >
            <div v-if="item.loading" class="loading-batch">
              <i class="el-icon-loading"></i> 載入批號中...
            </div>
            <div v-else-if="item.batches.length === 0" class="no-batch">
              此產品無現有批號資料，請選擇新增批號。
            </div>
            <el-table
              v-else
              :data="item.batches"
              style="width: 100%"
              size="small"
              border
            >
              <el-table-column
                prop="batchNumber"
                label="批號"
                min-width="120"
              ></el-table-column>
              <el-table-column
                prop="currentStock"
                label="當前庫存"
                width="90"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="expiryDate"
                label="有效期限"
                width="110"
              ></el-table-column>
              <el-table-column label="調整數量" width="120" align="center">
                <template slot-scope="scope">
                  <el-input-number
                    v-model="scope.row.adjustmentQuantity"
                    :min="-scope.row.currentStock"
                    :step="1"
                    size="mini"
                    controls-position="right"
                    @change="calculateNewStock(scope.row)"
                  ></el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="調整後庫存" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag
                    :type="
                      getStockTagType(
                        scope.row.newStock,
                        scope.row.currentStock
                      )
                    "
                  >
                    {{ scope.row.newStock }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 新批號輸入 -->
          <div
            v-if="item.productId && item.batchMode === 'new'"
            class="new-batch"
          >
            <el-form label-width="90px" size="small">
              <el-form-item label="批號">
                <el-input
                  v-model="item.newBatch.batchNumber"
                  placeholder="請輸入批號"
                ></el-input>
              </el-form-item>
              <el-form-item label="數量">
                <el-input-number
                  v-model="item.newBatch.quantity"
                  :min="1"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
              <el-form-item label="有效期限">
                <el-date-picker
                  v-model="item.newBatch.expiryDate"
                  type="date"
                  placeholder="選擇有效期限"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 警告訊息顯示 -->
      <div
        v-if="formErrors.length > 0"
        class="form-section validation-warnings"
      >
        <div class="section-title">
          <i class="el-icon-warning"></i> 警告訊息
        </div>
        <ul class="warning-list">
          <li v-for="(error, index) in formErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- 操作按鈕 -->
      <div class="dialog-footer">
        <el-button plain @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">
          確認提交
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
//import api from "@/api";

export default {
  name: "StockAdjustmentDialog",

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
      // 表單資料
      formData: {
        number: "",
        date: "",
        adjustmentType: "",
        operator: "",
        remark: "",
        adjustments: []
      },
      // 表單驗證規則
      headerRules: {
        date: [
          { required: true, message: "請選擇調整日期", trigger: "change" }
        ],
        adjustmentType: [
          { required: true, message: "請選擇調整類型", trigger: "change" }
        ],
        operator: [
          { required: true, message: "請輸入操作人員", trigger: "blur" }
        ],
        remark: [{ required: true, message: "請輸入調整說明", trigger: "blur" }]
      },
      loading: false,
      windowWidth: window.innerWidth,
      productOptions: [],
      formErrors: []
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
        this.initDialog();
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

    // 初始化對話框
    initDialog() {
      this.formData = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        adjustmentType: "",
        operator: "",
        remark: "",
        adjustments: []
      };
      this.formErrors = [];
      this.addAdjustment(); // 默認添加一個調整項目
    },

    // 生成單號
    generateNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const sequence = "00001"; // 實際應該從後端獲取序號
      return `ADJ${year}${month}${day}${sequence}`;
    },

    // 獲取當前日期時間
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
        this.productOptions = this.productData.map(item => ({
          id: item.id,
          name: item.name || item.productName
        }));
        return;
      }

      try {
        this.loading = true;
        // 使用API加載產品資料
        const response = await api.getProductList();
        if (response.data && response.data.length > 0) {
          this.productOptions = response.data.map(item => ({
            id: item.id,
            name: item.name || item.productName
          }));
        }
      } catch (error) {
        console.error("獲取產品資料失敗:", error);
        this.$msgbox({
          title: "錯誤",
          message: "獲取產品資料失敗: " + (error.message || error),
          type: "error"
        });

        // 測試數據，實際開發時應該刪除
        this.productOptions = [
          { id: "1", name: "口罩" },
          { id: "2", name: "酒精" },
          { id: "3", name: "體溫計" },
          { id: "4", name: "感冒藥" },
          { id: "5", name: "膠布" }
        ];
      } finally {
        this.loading = false;
      }
    },

    // 添加新調整項目
    addAdjustment() {
      this.formData.adjustments.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        productId: "",
        totalStock: 0,
        batchMode: "existing", // 'existing' 或 'new'
        loading: false,
        batches: [],
        newBatch: {
          batchNumber: "",
          quantity: 1,
          expiryDate: ""
        }
      });
    },

    // 移除調整項目
    removeAdjustment(index) {
      this.$msgbox({
        title: "確認",
        message: "確定要移除此調整項目嗎？",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.formData.adjustments.splice(index, 1);
          if (this.formData.adjustments.length === 0) {
            this.addAdjustment(); // 至少保留一個調整項目
          }
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    // 處理品號變更
    async handleProductChange(adjustment) {
      if (!adjustment.productId) return;

      adjustment.loading = true;
      adjustment.batches = [];
      adjustment.totalStock = 0;

      try {
        // 實際環境應該調用API獲取批號資料
        // const response = await api.getProductBatches(adjustment.productId);
        // adjustment.batches = response.data.batches;
        // adjustment.totalStock = response.data.totalStock;

        // 測試數據，實際開發時應該刪除
        setTimeout(() => {
          // 模擬從API獲取批號數據
          const batchCount = Math.floor(Math.random() * 5) + 1;
          const batches = [];
          let totalStock = 0;

          for (let i = 0; i < batchCount; i++) {
            const currentStock = Math.floor(Math.random() * 100) + 1;
            totalStock += currentStock;

            batches.push({
              id: Date.now() + i,
              batchNumber: `B${adjustment.productId}${String(i + 1).padStart(
                3,
                "0"
              )}`,
              currentStock: currentStock,
              expiryDate: this.getRandomExpiryDate(),
              adjustmentQuantity: 0,
              newStock: currentStock
            });
          }

          adjustment.batches = batches;
          adjustment.totalStock = totalStock;
          adjustment.loading = false;
        }, 500);
      } catch (error) {
        console.error("獲取批號資料失敗:", error);
        this.$msgbox({
          title: "錯誤",
          message: "獲取批號資料失敗: " + (error.message || error),
          type: "error"
        });
        adjustment.loading = false;
      }
    },

    // 處理批號模式變更
    handleBatchModeChange(adjustment) {
      if (adjustment.batchMode === "new") {
        // 切換到新增批號模式
        adjustment.newBatch = {
          batchNumber: "",
          quantity: 1,
          expiryDate: ""
        };
      } else {
        // 切換到現有批號模式
        // 如果尚未載入批號資料，重新載入
        if (adjustment.batches.length === 0 && !adjustment.loading) {
          this.handleProductChange(adjustment);
        }
      }
    },

    // 計算新庫存
    calculateNewStock(batch) {
      batch.newStock = batch.currentStock + batch.adjustmentQuantity;

      // 檢查是否為負數
      if (batch.newStock < 0) {
        batch.newStock = 0;
        batch.adjustmentQuantity = -batch.currentStock;
      }
    },

    // 獲取庫存標籤類型
    getStockTagType(newStock, currentStock) {
      if (newStock > currentStock) return "success";
      if (newStock < currentStock) return "danger";
      return "info";
    },

    // 生成隨機有效期限（用於測試數據）
    getRandomExpiryDate() {
      const today = new Date();
      // 隨機1-365天後過期
      const daysToAdd = Math.floor(Math.random() * 365) + 1;
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + daysToAdd);

      return expiryDate.toISOString().slice(0, 10);
    },

    // 驗證表單
    validateForm() {
      this.formErrors = [];

      // 驗證基本信息
      let headerValid = false;
      this.$refs.headerForm.validate(valid => {
        headerValid = valid;
      });

      if (!headerValid) {
        this.formErrors.push("請完成基本信息的填寫");
        return false;
      }

      // 驗證產品調整資料
      for (let i = 0; i < this.formData.adjustments.length; i++) {
        const adjustment = this.formData.adjustments[i];

        if (!adjustment.productId) {
          this.formErrors.push(`調整項目 #${i + 1} 未選擇產品`);
          return false;
        }

        if (adjustment.batchMode === "existing") {
          // 檢查是否有批號被調整
          const hasBatchAdjustment = adjustment.batches.some(
            batch => batch.adjustmentQuantity !== 0
          );

          if (!hasBatchAdjustment) {
            this.formErrors.push(`調整項目 #${i + 1} 未調整任何批號數量`);
            return false;
          }
        } else {
          // 檢查新批號資訊
          if (!adjustment.newBatch.batchNumber) {
            this.formErrors.push(`調整項目 #${i + 1} 未輸入批號`);
            return false;
          }

          if (
            !adjustment.newBatch.quantity ||
            adjustment.newBatch.quantity <= 0
          ) {
            this.formErrors.push(`調整項目 #${i + 1} 批號數量必須大於0`);
            return false;
          }

          if (!adjustment.newBatch.expiryDate) {
            this.formErrors.push(`調整項目 #${i + 1} 未選擇有效期限`);
            return false;
          }
        }
      }

      return true;
    },

    // 收集提交資料
    collectSubmitData() {
      const products = [];

      this.formData.adjustments.forEach(adjustment => {
        if (adjustment.batchMode === "existing") {
          // 收集現有批號的調整
          const adjustedBatches = adjustment.batches.filter(
            batch => batch.adjustmentQuantity !== 0
          );

          if (adjustedBatches.length > 0) {
            products.push({
              productId: adjustment.productId,
              productName: this.getProductName(adjustment.productId),
              batches: adjustedBatches.map(batch => ({
                batchNumber: batch.batchNumber,
                currentStock: batch.currentStock,
                adjustmentQuantity: batch.adjustmentQuantity,
                newStock: batch.newStock,
                expiryDate: batch.expiryDate
              }))
            });
          }
        } else {
          // 收集新批號的調整
          products.push({
            productId: adjustment.productId,
            productName: this.getProductName(adjustment.productId),
            batches: [
              {
                batchNumber: adjustment.newBatch.batchNumber,
                currentStock: 0,
                adjustmentQuantity: adjustment.newBatch.quantity,
                newStock: adjustment.newBatch.quantity,
                expiryDate: adjustment.newBatch.expiryDate,
                isNewBatch: true
              }
            ]
          });
        }
      });

      return {
        number: this.formData.number,
        date: this.formData.date,
        adjustmentType: this.formData.adjustmentType,
        operator: this.formData.operator,
        remark: this.formData.remark,
        products: products
      };
    },

    // 獲取產品名稱
    getProductName(productId) {
      const product = this.productOptions.find(p => p.id === productId);
      return product ? product.name : productId;
    },

    // 提交表單
    submitForm() {
      if (!this.validateForm()) {
        this.$msgbox({
          title: "錯誤",
          message: "表單驗證失敗，請檢查輸入",
          type: "error"
        });
        return;
      }

      const submitData = this.collectSubmitData();

      // 確認提交
      this.$msgbox({
        title: "確認",
        message: "確定要提交此庫存調整單嗎？",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          this.loading = true;

          try {
            // 實際環境應該調用API提交資料
            // const response = await api.submitStockAdjustment(submitData);

            // 模擬API調用
            setTimeout(() => {
              this.loading = false;

              this.$msgbox({
                title: "成功",
                message: "庫存調整單提交成功",
                type: "success"
              });

              this.$emit("success", submitData);
            }, 1000);
          } catch (error) {
            this.loading = false;

            this.$msgbox({
              title: "錯誤",
              message: "提交失敗: " + (error.message || error),
              type: "error"
            });
          }
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    // 處理取消
    handleCancel() {
      this.handleClose();
    },

    // 處理關閉
    handleClose() {
      // 檢查表單是否有變更
      if (
        this.formData.adjustmentType ||
        this.formData.remark ||
        this.formData.adjustments.some(item => item.productId)
      ) {
        // 有變更，顯示確認對話框
        this.$msgbox({
          title: "確認",
          message: "確定要關閉嗎？未保存的數據將會丟失",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.visibleSync = false;
            this.$emit("cancel");
          })
          .catch(() => {
            // 用戶取消操作
          });
      } else {
        // 無變更，直接關閉
        this.visibleSync = false;
        this.$emit("cancel");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-adjustment-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #409eff 0%, #64b5f6 100%);
    border-bottom: 1px solid #409eff;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
  }

  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: #ffffff;
    font-size: 18px;

    &:hover {
      opacity: 0.8;
    }
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

.adjustment-container {
  position: relative;
}

.form-section {
  position: relative;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .section-title {
    position: relative;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;

    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 16px;
      background-color: #409eff;
      margin-right: 8px;
      border-radius: 2px;
    }

    i {
      margin-right: 8px;
      color: #e6a23c;
    }
  }

  &.validation-warnings {
    background: #fff8f8;
    border-left: 3px solid #f56c6c;

    .section-title {
      color: #f56c6c;

      &:before {
        background-color: #f56c6c;
      }

      i {
        color: #f56c6c;
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.adjustment-item {
  background: #ffffff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 3px solid #409eff;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-title {
  font-weight: 500;
  color: #303133;
  font-size: 15px;
}

.stock-summary {
  display: flex;
  align-items: center;
  margin: 12px 0;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 2px solid #409eff;
}

.summary-label {
  font-size: 13px;
  color: #606266;
  margin-right: 8px;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

.batch-options {
  margin: 16px 0;
}

.existing-batches,
.new-batch {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.loading-batch,
.no-batch {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.loading-batch i {
  margin-right: 8px;
  color: #409eff;
}

.warning-list {
  margin: 0;
  padding-left: 20px;

  li {
    color: #f56c6c;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .adjustment-item {
    padding: 12px;
  }

  .existing-batches,
  .new-batch {
    padding: 8px;
    margin-top: 8px;
  }

  .stock-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-label {
    margin-bottom: 4px;
  }
}
</style>
