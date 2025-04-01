<template>
  <el-card class="stock-out-card">
    <!-- 商品選擇區 -->
    <div class="product-header">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="商品名稱" :label-width="labelWidth">
            <div class="product-select-wrapper">
              <el-select
                v-model="selectedProduct"
                placeholder="請選擇商品"
                @change="handleProductChange"
                class="product-select"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.productCode"
                  :label="item.productName"
                  :value="item.productCode"
                >
                  <span>{{ item.productName }}</span>
                  <span class="text-gray-500 ml-2"
                    >({{ item.productCode }})</span
                  >
                </el-option>
              </el-select>
              <el-button
                type="primary"
                :disabled="!selectedProduct"
                class="quick-fill-btn"
                @click="handleQuickFillAll"
              >
                <i class="el-icon-magic-stick"></i>
                一鍵顯示全部批號
              </el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 批號列表 -->
    <div class="batch-list">
      <div
        v-for="(batch, batchIndex) in localBatches"
        :key="batch.id"
        class="batch-item"
      >
        <div class="batch-header">
          <span class="batch-number">批號 #{{ batchIndex + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            class="remove-batch-btn"
            :disabled="localBatches.length === 1"
            @click="removeBatch(batchIndex)"
          >
            <i class="el-icon-delete"></i>
          </el-button>
        </div>

        <el-row :gutter="20">
          <el-col :sm="12" :xs="24">
            <el-form-item label="批號" :label-width="labelWidth">
              <div class="batch-select-wrapper">
                <el-select
                  v-model="batch.batchNumber"
                  placeholder="請選擇批號"
                  @change="val => handleBatchChange(val, batchIndex)"
                  class="batch-select"
                >
                  <el-option
                    v-for="option in getBatchOptions()"
                    :key="option.batchNumber"
                    :label="option.batchNumber"
                    :value="option.batchNumber"
                  >
                    <div class="batch-option">
                      <span class="batch-number">{{ option.batchNumber }}</span>
                      <span class="batch-info">
                        箱數: {{ option.boxCount }} | 數量:
                        {{ option.quantity }}
                      </span>
                    </div>
                  </el-option>
                </el-select>
                <el-button
                  type="warning"
                  size="small"
                  :disabled="!batch.batchNumber"
                  class="quick-return-btn"
                  @click="handleQuickReturnBatch(batch.batchNumber)"
                >
                  全部
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="效期" :label-width="labelWidth">
              <div class="expiry-date">
                {{ formatExpiryDate(getBatchExpiry(batch.batchNumber)) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :sm="12" :xs="12">
            <el-form-item label="箱數" :label-width="labelWidth">
              <el-input-number
                v-model="batch.boxCount"
                :min="0"
                :max="getMaxBoxCount(batch.batchNumber)"
                :controls-position="'right'"
                class="quantity-input"
                @change="val => handleBoxCountChange(val, batchIndex)"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="12">
            <el-form-item label="數量" :label-width="labelWidth">
              <el-input-number
                v-model="batch.quantity"
                :min="0"
                :max="getMaxQuantity(batch.batchNumber)"
                :controls-position="'right'"
                class="quantity-input"
                @change="val => handleQuantityChange(val, batchIndex)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 操作按鈕區 -->
    <div class="action-buttons">
      <el-button
        type="success"
        :disabled="!selectedProduct"
        class="add-batch-btn"
        @click="addBatch"
      >
        <i class="el-icon-plus"></i>
        新增批號
      </el-button>

      <el-button
        type="danger"
        v-if="showRemove"
        class="remove-product-btn"
        @click="$emit('remove')"
      >
        <i class="el-icon-delete"></i>
        刪除商品
      </el-button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "StockOutProductItem",

  props: {
    inventoryData: {
      type: Array,
      default: () => []
    },
    showRemove: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      selectedProduct: "",
      localBatches: [
        {
          id: Date.now(),
          batchNumber: "",
          boxCount: 0,
          quantity: 0
        }
      ]
    };
  },

  computed: {
    labelWidth() {
      return window.innerWidth < 768 ? "80px" : "100px";
    },

    productList() {
      const productMap = new Map();
      this.inventoryData.forEach(item => {
        if (!productMap.has(item.productCode)) {
          productMap.set(item.productCode, {
            productCode: item.productCode,
            productName: item.productName
          });
        }
      });
      return Array.from(productMap.values());
    },

    currentStockItems() {
      return this.inventoryData.filter(
        item => item.productCode === this.selectedProduct && item.quantity > 0
      );
    }
  },

  methods: {
    handleProductChange(value) {
      this.localBatches = [
        {
          id: Date.now(),
          batchNumber: "",
          boxCount: 0,
          quantity: 0
        }
      ];
    },

    // 新增：一鍵顯示全部批號功能
    handleQuickFillAll() {
      const availableBatches = this.getBatchOptions();
      this.localBatches = availableBatches.map(batch => ({
        id: Date.now() + Math.random(),
        batchNumber: batch.batchNumber,
        boxCount: 0,
        quantity: 0
      }));
    },

    getBatchOptions() {
      return this.currentStockItems.map(item => ({
        batchNumber: item.batchNumber,
        boxCount: item.boxCount,
        quantity: item.quantity
      }));
    },

    getBatchExpiry(batchNumber) {
      const item = this.currentStockItems.find(
        item => item.batchNumber === batchNumber
      );
      return item ? item.expiryDate : null;
    },

    formatExpiryDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    },

    handleBatchChange(value, batchIndex) {
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === value
      );

      if (stockItem) {
        this.localBatches[batchIndex].boxCount = 0;
        this.localBatches[batchIndex].quantity = 0;
      }
    },

    getMaxBoxCount(batchNumber) {
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === batchNumber
      );
      return stockItem ? stockItem.boxCount : 0;
    },

    getMaxQuantity(batchNumber) {
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === batchNumber
      );
      return stockItem ? stockItem.quantity : 0;
    },

    // 修改：全部批號功能
    handleQuickReturnBatch(batchNumber) {
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === batchNumber
      );

      if (stockItem) {
        const batchIndex = this.localBatches.findIndex(
          batch => batch.batchNumber === batchNumber
        );

        if (batchIndex !== -1) {
          this.localBatches[batchIndex].boxCount = stockItem.boxCount;
          this.localBatches[batchIndex].quantity = stockItem.quantity;
        }
      }
    },

    handleBoxCountChange(value, batchIndex) {
      const batch = this.localBatches[batchIndex];
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === batch.batchNumber
      );

      if (stockItem) {
        const quantityPerBox = Math.floor(
          stockItem.quantity / stockItem.boxCount
        );
        batch.quantity = value * quantityPerBox;

        if (batch.quantity > stockItem.quantity) {
          batch.quantity = stockItem.quantity;
          batch.boxCount = Math.floor(stockItem.quantity / quantityPerBox);
          this.$message.warning("已超過可用庫存數量，自動調整");
        }
      }
    },

    handleQuantityChange(value, batchIndex) {
      const batch = this.localBatches[batchIndex];
      const stockItem = this.currentStockItems.find(
        item => item.batchNumber === batch.batchNumber
      );

      if (stockItem) {
        const quantityPerBox = Math.floor(
          stockItem.quantity / stockItem.boxCount
        );
        batch.boxCount = Math.floor(value / quantityPerBox);

        if (value > stockItem.quantity) {
          batch.quantity = stockItem.quantity;
          batch.boxCount = Math.floor(stockItem.quantity / quantityPerBox);
          this.$message.warning("已超過可用庫存數量，自動調整");
        }
      }
    },

    addBatch() {
      if (!this.selectedProduct) {
        this.$message.warning("請先選擇商品");
        return;
      }
      this.localBatches.push({
        id: Date.now(),
        batchNumber: "",
        boxCount: 0,
        quantity: 0
      });
    },

    removeBatch(batchIndex) {
      if (this.localBatches.length > 1) {
        this.localBatches.splice(batchIndex, 1);
      } else {
        this.$message.warning("至少需要保留一個批號");
      }
    },

    validateBatches() {
      let isValid = true;

      if (!this.selectedProduct) {
        this.$message.warning("請選擇商品");
        return false;
      }

      for (const batch of this.localBatches) {
        if (!batch.batchNumber) {
          this.$message.warning("請選擇批號");
          isValid = false;
          break;
        }

        if (batch.quantity === 0) {
          this.$message.warning("請輸入出庫數量");
          isValid = false;
          break;
        }

        const maxQuantity = this.getMaxQuantity(batch.batchNumber);
        if (batch.quantity > maxQuantity) {
          this.$message.warning(
            `批號 ${batch.batchNumber} 出庫數量不能超過庫存數量`
          );
          isValid = false;
          break;
        }
      }

      return isValid;
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-out-card {
  .product-header {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 20px;
    margin-bottom: 20px;
    padding-top: 20px;
  }

  .product-select-wrapper {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .product-select {
    flex: 1;
    min-width: 200px;
  }

  .quick-fill-btn {
    white-space: nowrap;
  }

  .batch-list {
    .batch-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      .batch-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .batch-number {
          font-weight: 600;
          color: #409eff;
        }
      }
    }
  }

  .batch-select-wrapper {
    display: flex;
    gap: 8px;

    .batch-select {
      flex: 1;
    }

    .quick-return-btn {
      white-space: nowrap;
    }
  }

  .batch-option {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .batch-info {
      color: #909399;
      font-size: 0.9em;
    }
  }

  .expiry-date {
    line-height: 32px;
    padding: 0 12px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
  }

  .quantity-input {
    width: 100%;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;

    .add-batch-btn {
      flex: 1;
      max-width: 200px;
    }

    .remove-product-btn {
      flex: 1;
      max-width: 200px;
    }
  }
}

@media (max-width: 768px) {
  .stock-out-card {
    .product-select-wrapper {
      flex-direction: column;
      gap: 8px;

      .product-select,
      .quick-fill-btn {
        width: 100%;
      }
    }

    .batch-list {
      .batch-item {
        padding: 12px;

        .batch-header {
          margin-bottom: 12px;
        }
      }
    }

    .batch-select-wrapper {
      flex-direction: column;
      gap: 8px;

      .batch-select,
      .quick-return-btn {
        width: 100%;
      }
    }

    .action-buttons {
      flex-direction: column;
      gap: 8px;

      .add-batch-btn,
      .remove-product-btn {
        max-width: 100%;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    padding-right: 8px;
  }

  :deep(.el-card__body) {
    padding: 15px;
  }

  .expiry-date {
    font-size: 14px;
  }

  .batch-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .batch-info {
      font-size: 12px;
    }
  }
}

// 通用樣式
.text-gray-500 {
  color: #909399;
}

.ml-2 {
  margin-left: 8px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 加入動畫效果
.batch-item {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.quick-return-btn,
.quick-fill-btn {
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: scale(1.02);
  }
}

// 優化按鈕樣式
.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  i {
    margin-right: 4px;
  }
}

// 批號列表動畫
.batch-list {
  .batch-item {
    animation: slideIn 0.3s ease;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
