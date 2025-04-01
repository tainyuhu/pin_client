<template>
  <el-dialog
    title="新增出庫單"
    :visible.sync="visibleSync"
    :width="isMobile ? '100%' : '680px'"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-out-dialog"
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
            @change="loadProductBatches(productIndex)"
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

        <!-- 批次選擇 -->
        <div v-if="product.productId" class="batch-selection-section">
          <div v-if="product.loading" class="loading-batches">
            <el-loading :text="'載入批次中...'" />
          </div>

          <div
            v-else-if="product.availableBatches.length === 0"
            class="no-batches"
          >
            <el-empty
              description="此產品無可用庫存"
              :image-size="80"
            ></el-empty>
          </div>

          <div v-else class="batch-table-container">
            <div class="batch-header-section">
              <div class="batch-selection-title">
                可用批次
                <el-tag type="info" size="mini" class="batch-count-tag"
                  >{{ product.availableBatches.length }} 個</el-tag
                >
              </div>
              <div class="batch-header-actions">
                <div class="batch-search">
                  <el-input
                    v-model="product.batchSearch"
                    placeholder="搜尋批次號碼"
                    prefix-icon="el-icon-search"
                    clearable
                    size="small"
                  >
                    <el-button
                      slot="append"
                      icon="el-icon-refresh"
                      @click="product.batchSearch = ''"
                    ></el-button>
                  </el-input>
                </div>
                <el-button
                  type="text"
                  class="collapse-btn"
                  @click="product.collapseBatches = !product.collapseBatches"
                >
                  {{ product.collapseBatches ? "展開" : "收合" }}
                  <i
                    :class="
                      product.collapseBatches
                        ? 'el-icon-arrow-down'
                        : 'el-icon-arrow-up'
                    "
                  ></i>
                </el-button>
              </div>
            </div>

            <div v-show="!product.collapseBatches">
              <el-table
                ref="batchTable"
                :data="filteredBatches(product)"
                style="width: 100%"
                size="small"
                border
                class="batch-table"
                row-class-name="batch-table-row"
                header-row-class-name="batch-table-header"
                @selection-change="handleSelectionChange($event, productIndex)"
                :row-key="row => row.id"
              >
                <el-table-column
                  type="selection"
                  width="55"
                  :reserve-selection="true"
                ></el-table-column>
                <el-table-column
                  prop="batchNumber"
                  label="批次號碼"
                  min-width="120"
                  sortable
                ></el-table-column>
                <el-table-column
                  prop="availableQuantity"
                  label="可用數量"
                  width="100"
                  sortable
                >
                  <template slot-scope="scope">
                    <span class="quantity-badge">{{
                      scope.row.availableQuantity
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="expiryDate"
                  label="有效期限"
                  width="120"
                  sortable
                >
                  <template slot-scope="scope">
                    <el-tag
                      :type="getExpiryTagType(scope.row.expiryDate)"
                      size="mini"
                    >
                      {{ scope.row.expiryDate }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      class="batch-action-btn"
                      @click="
                        setBatchMaxQuantity(scope.row, productIndex, true)
                      "
                    >
                      <i class="el-icon-check"></i> 批次全出
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="出庫數量" width="150">
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.outQuantity"
                      :min="0"
                      :max="scope.row.availableQuantity"
                      size="mini"
                      controls-position="right"
                      class="batch-quantity-input"
                      @change="validateBatchQuantity(scope.row, productIndex)"
                    ></el-input-number>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div v-if="product.collapseBatches" class="collapsed-summary">
              <div class="collapsed-info">
                <el-tag type="info"
                  >已選擇 {{ product.selectedBatches.length }} 個批次</el-tag
                >
                <el-tag type="danger"
                  >總出庫數量:
                  {{ calculateTotalOutQuantity(productIndex) }}</el-tag
                >
              </div>
              <el-button type="text" @click="product.collapseBatches = false"
                >查看詳情</el-button
              >
            </div>
          </div>

          <div
            v-if="
              product.availableBatches.length > 0 && !product.collapseBatches
            "
            class="batch-selection-footer"
          >
            <div class="batch-actions">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-shopping-cart-full"
                @click="setMaxQuantityForAllBatches(productIndex)"
              >
                產品一次出庫全部
              </el-button>
              <el-button
                type="info"
                size="mini"
                icon="el-icon-refresh"
                @click="setDefaultQuantityForAllBatches(productIndex)"
              >
                重置數量
              </el-button>
            </div>
            <div class="batch-total">
              <el-tag type="danger" effect="dark" size="medium">
                總出庫數量:
                <span class="batch-total-value">{{
                  calculateTotalOutQuantity(productIndex)
                }}</span>
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增產品按鈕 -->
      <div class="product-actions">
        <el-button
          type="danger"
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
        <el-form-item label="出庫原因" prop="reason">
          <el-select
            v-model="form.reason"
            placeholder="請選擇出庫原因"
            style="width: 100%"
          >
            <el-option label="正常銷售" value="sale"></el-option>
            <el-option label="產品報廢" value="scrap"></el-option>
            <el-option label="產品過期" value="expired"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
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
      <el-button type="danger" @click="submitForm" :loading="loading">
        確認
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
//import api from "@/api"; // 取消註釋確保 API 可用

export default {
  name: "StockOutDialog",

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
        reason: "",
        remark: ""
      },
      rules: {
        productId: [
          { required: true, message: "請選擇產品", trigger: "change" }
        ],
        reason: [
          { required: true, message: "請選擇出庫原因", trigger: "change" }
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
      // 確保至少有一個產品
      this.form = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        products: [this.createEmptyProduct()],
        reason: "",
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
        availableBatches: [],
        loading: false,
        selectedBatches: [],
        batchSearch: "", // 批次搜索
        collapseBatches: false // 批次是否被收合
      };
    },

    addProduct() {
      this.form.products.push(this.createEmptyProduct());
    },

    removeProduct(productIndex) {
      this.form.products.splice(productIndex, 1);
    },

    generateNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const sequence = "00001"; // 實際應該從後端獲取序號
      return `OUT${year}${month}${day}${sequence}`;
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

    // 載入產品批次數據
    async loadProductBatches(productIndex) {
      const product = this.form.products[productIndex];
      if (!product.productId) return;

      try {
        product.loading = true;
        product.availableBatches = [];

        // 使用API載入此產品的可用批次
        // 實際應該調用後端API獲取數據
        const response = await api.getProductBatches(product.productId);

        // 格式化批次數據
        product.availableBatches = (response.data || []).map(batch => ({
          ...batch,
          outQuantity: 0, // 默認出庫數量為0
          batchNumber: batch.batchNumber || batch.batch_number,
          availableQuantity:
            batch.availableQuantity ||
            batch.available_quantity ||
            batch.quantity,
          expiryDate: batch.expiryDate || batch.expiry_date
        }));
      } catch (error) {
        this.$message.error("獲取產品批次失敗: " + error.message);

        // 測試數據，實際開發時應該刪除
        product.availableBatches = [
          {
            id: 1,
            batchNumber: "B20250314001",
            availableQuantity: 100,
            expiryDate: "2026-03-14",
            outQuantity: 0
          },
          {
            id: 2,
            batchNumber: "B20250228002",
            availableQuantity: 50,
            expiryDate: "2026-02-28",
            outQuantity: 0
          }
        ];
      } finally {
        product.loading = false;
      }
    },

    // 計算指定產品的總出庫數量
    calculateTotalOutQuantity(productIndex) {
      const product = this.form.products[productIndex];
      return product.availableBatches.reduce((total, batch) => {
        return total + (batch.outQuantity || 0);
      }, 0);
    },

    // 根據有效期限計算標籤類型
    getExpiryTagType(expiryDate) {
      if (!expiryDate) return "";

      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

      if (diffMonths < 0) return "danger"; // 已過期
      if (diffMonths < 3) return "warning"; // 接近過期
      if (diffMonths < 6) return "info"; // 中等期限
      return "success"; // 期限充足
    },

    // 過濾批次數據
    filteredBatches(product) {
      if (!product.batchSearch) {
        return product.availableBatches;
      }

      const searchText = product.batchSearch.toLowerCase();
      return product.availableBatches.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchText)
      );
    },

    // 處理表格選擇變更事件
    handleSelectionChange(selection, productIndex) {
      const product = this.form.products[productIndex];
      const selectedIds = selection.map(item => item.id);

      // 找出之前選中但現在被取消選中的批次
      const deselectedBatches = product.selectedBatches.filter(
        batch => !selectedIds.includes(batch.id)
      );

      // 將被取消選中的批次數量設為0
      deselectedBatches.forEach(batch => {
        const batchInTable = product.availableBatches.find(
          item => item.id === batch.id
        );
        if (batchInTable) {
          batchInTable.outQuantity = 0;
        }
      });

      // 更新選中批次集合
      product.selectedBatches = selection;
    },

    // 驗證批次出庫數量
    validateBatchQuantity(batch, productIndex) {
      if (batch.outQuantity > batch.availableQuantity) {
        batch.outQuantity = batch.availableQuantity;
        this.$message.warning("出庫數量不能超過可用數量");
      }
      if (batch.outQuantity < 0) {
        batch.outQuantity = 0;
      }

      // 如果數量大於0，自動選中該行；如果數量為0，取消選中
      this.$nextTick(() => {
        const batchTable = this.$refs.batchTable[productIndex];
        if (batch.outQuantity > 0) {
          batchTable.toggleRowSelection(batch, true);
        } else if (batch.outQuantity === 0) {
          batchTable.toggleRowSelection(batch, false);
        }
      });
    },

    // 設置單個批次的最大出庫數量
    setBatchMaxQuantity(batch, productIndex, toggleSelection = false) {
      batch.outQuantity = batch.availableQuantity;

      // 如果需要同時選中該行
      if (toggleSelection) {
        this.$nextTick(() => {
          const batchTable = this.$refs.batchTable[productIndex];
          batchTable.toggleRowSelection(batch, true);
        });
      }

      this.$message.success(
        `已設置批次 ${batch.batchNumber} 為最大出庫數量: ${
          batch.availableQuantity
        }`
      );
    },

    // 設置產品所有批次的最大出庫數量
    setMaxQuantityForAllBatches(productIndex) {
      const product = this.form.products[productIndex];
      const batchTable = this.$refs.batchTable[productIndex];

      // 先清除所有選擇
      batchTable.clearSelection();

      // 設置所有批次為最大數量並選中
      product.availableBatches.forEach(batch => {
        batch.outQuantity = batch.availableQuantity;
        batchTable.toggleRowSelection(batch, true);
      });

      this.$message.success("已設置所有批次為最大出庫數量並選中");
    },

    // 重置產品所有批次的出庫數量為0
    setDefaultQuantityForAllBatches(productIndex) {
      const product = this.form.products[productIndex];
      const batchTable = this.$refs.batchTable[productIndex];

      // 清除所有選擇並設置數量為0
      product.availableBatches.forEach(batch => {
        batch.outQuantity = 0;
      });
      batchTable.clearSelection();

      this.$message.success("已重置所有批次出庫數量為0");
    },

    // 收集所有選中的批次用於提交
    collectSelectedBatches() {
      const selectedProducts = [];

      this.form.products.forEach(product => {
        if (product.productId) {
          // 過濾出已選中且數量大於0的批次
          const batches = product.selectedBatches.filter(
            batch => batch.outQuantity > 0
          );

          if (batches.length > 0) {
            selectedProducts.push({
              productId: product.productId,
              batches: batches.map(batch => ({
                batchNumber: batch.batchNumber,
                quantity: batch.outQuantity,
                batchId: batch.id
              }))
            });
          }
        }
      });

      return selectedProducts;
    },

    // 提交表單
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 檢查是否有選擇批次
          const hasSelectedBatches = this.form.products.some(
            product =>
              product.selectedBatches &&
              product.selectedBatches.length > 0 &&
              product.selectedBatches.some(batch => batch.outQuantity > 0)
          );

          if (!hasSelectedBatches) {
            this.$message.error("請至少選擇一個批次進行出庫");
            return;
          }

          try {
            this.loading = true;
            // 構建提交的數據
            const submitData = {
              number: this.form.number,
              date: this.form.date,
              products: this.collectSelectedBatches(),
              reason: this.form.reason,
              remark: this.form.remark,
              type: "out",
              operator: "admin" // 實際應從登入用戶獲取
            };

            // 呼叫API創建出庫單
            const response = await api.createStockOut(submitData);
            this.$message.success("出庫單創建成功");
            this.visibleSync = false;
            // 向父組件發送成功事件
            this.$emit("success", response.data);
          } catch (error) {
            this.$message.error("出庫單創建失敗: " + error.message);
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
      // 檢查表單是否有數據
      const hasData =
        this.form.products.some(
          product =>
            product.productId ||
            product.availableBatches.some(batch => batch.outQuantity > 0)
        ) ||
        this.form.reason ||
        this.form.remark;

      if (hasData) {
        // 使用 MessageBox 顯示確認對話框
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
.stock-out-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #f56c6c 0%, #ff9a9e 100%);
    border-bottom: 1px solid #f56c6c;
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

  &:last-child {
    margin-bottom: 0;
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
      background-color: #f56c6c;
      margin-right: 8px;
      border-radius: 2px;
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

.batch-selection-section {
  margin-top: 16px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.batch-selection-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
}

.loading-batches,
.no-batches {
  padding: 20px 0;
  text-align: center;
  color: #909399;
}

.batch-table {
  margin-bottom: 12px;
}

.batch-selection-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.batch-total {
  font-size: 14px;
}

.batch-total-value {
  font-weight: bold;
  margin-left: 4px;
}

.batch-quantity-input {
  width: 100%;

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    z-index: 1;
  }
}

.product-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  :deep(.el-button) {
    color: #f56c6c;
  }
}

.delete-btn {
  color: #f56c6c !important;

  &:hover {
    color: #ff8f8f !important;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.el-button) {
    border-radius: 20px;
    padding: 9px 24px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  :deep(.el-button--danger) {
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);

    &:hover {
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .stock-out-dialog {
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

  .batch-selection-section {
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
  padding: 0 12px;

  &:hover,
  &:focus {
    border-color: #f56c6c;
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__inner) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

// 表格中的選擇框
:deep(.el-table__row .el-checkbox__inner) {
  &:hover {
    border-color: #f56c6c;
  }

  &::after {
    box-sizing: content-box;
  }
}

:deep(.el-table__row.selected) {
  background-color: #fff8f8;
}
</style>
