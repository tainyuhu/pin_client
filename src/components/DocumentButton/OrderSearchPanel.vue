<template>
  <div class="search-section">
    <!-- 響應式標題區域 -->
    <div class="section-header">
      <h2 class="section-title">單據查詢</h2>
    </div>

    <!-- 改回使用Element UI標籤頁以解決流暢性問題 -->
    <el-tabs v-model="searchType" type="card" class="custom-tabs">
      <el-tab-pane name="order">
        <span slot="label">
          <i class="el-icon-document"></i>
          <span>依單號查詢</span>
        </span>
      </el-tab-pane>
      <el-tab-pane name="product">
        <span slot="label">
          <i class="el-icon-goods"></i>
          <span>依產品/批號查詢</span>
        </span>
      </el-tab-pane>
    </el-tabs>

    <!-- 搜尋表單 -->
    <div class="search-form-container">
      <!-- 單號查詢表單 -->
      <div v-show="searchType === 'order'" class="search-form-wrapper">
        <el-form :inline="!isMobile" class="search-form">
          <div class="form-left">
            <el-form-item label="單據類型">
              <el-select
                v-model="searchForm.orderType"
                placeholder="請選擇單據類型"
                class="full-width-input"
                popper-class="custom-select-dropdown"
              >
                <el-option label="入庫單" value="in">
                  <div class="custom-option">
                    <span class="option-icon success"
                      ><i class="el-icon-download"></i
                    ></span>
                    <span>入庫單</span>
                  </div>
                </el-option>
                <el-option label="出庫單" value="out">
                  <div class="custom-option">
                    <span class="option-icon danger"
                      ><i class="el-icon-upload2"></i
                    ></span>
                    <span>出庫單</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="單號">
              <el-input
                v-model="searchForm.orderNumber"
                placeholder="請輸入單號"
                class="full-width-input"
                prefix-icon="el-icon-document"
                clearable
              ></el-input>
            </el-form-item>
          </div>
          <div class="form-right">
            <el-form-item class="search-button-container">
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="searchByOrderNumber"
                :loading="searchLoading"
                class="search-button"
              >
                查詢
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 產品/批號查詢表單 -->
      <div v-show="searchType === 'product'" class="search-form-wrapper">
        <el-form :inline="!isMobile" class="search-form">
          <div class="form-left">
            <el-form-item label="產品">
              <el-select
                v-model="searchForm.productId"
                placeholder="請選擇產品"
                filterable
                class="full-width-input"
                popper-class="custom-select-dropdown"
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="custom-option">
                    <span>{{ item.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="批號">
              <el-input
                v-model="searchForm.batchNumber"
                placeholder="請輸入批號"
                class="full-width-input"
                prefix-icon="el-icon-price-tag"
                clearable
              ></el-input>
            </el-form-item>
          </div>
          <div class="form-right">
            <el-form-item class="search-button-container">
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="searchByProductBatch"
                :loading="searchLoading"
                class="search-button"
              >
                查詢
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 搜尋中狀態顯示 -->
    <div v-if="searchLoading && !searchResults.length" class="search-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 搜尋結果表格 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <div class="section-title">
          <i class="el-icon-s-data"></i>
          搜尋結果
        </div>
        <div class="result-count">找到 {{ searchResults.length }} 筆紀錄</div>
      </div>

      <!-- 桌面版表格 -->
      <div v-if="!isMobile" class="desktop-table">
        <el-table
          :data="searchResults"
          style="width: 100%"
          border
          @row-click="selectOrder"
          highlight-current-row
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            prop="number"
            label="單號"
            width="180"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="單據類型" width="100">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.type === 'in' ? 'success' : 'danger'"
                size="medium"
                effect="plain"
              >
                <i
                  :class="
                    scope.row.type === 'in'
                      ? 'el-icon-download'
                      : 'el-icon-upload2'
                  "
                ></i>
                {{ scope.row.type === "in" ? "入庫單" : "出庫單" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="date"
            label="日期"
            width="180"
          ></el-table-column>
          <el-table-column prop="operator" label="操作人員"></el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="primary"
                plain
                size="mini"
                round
                @click.stop="selectOrder(scope.row)"
              >
                選擇
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 手機版卡片式顯示 -->
      <div v-else class="mobile-cards">
        <div
          v-for="(item, index) in searchResults"
          :key="index"
          class="result-card"
          @click="selectOrder(item)"
        >
          <div class="card-header">
            <div class="card-title">{{ item.number }}</div>
            <el-tag
              :type="item.type === 'in' ? 'success' : 'danger'"
              size="mini"
              effect="plain"
            >
              <i
                :class="
                  item.type === 'in' ? 'el-icon-download' : 'el-icon-upload2'
                "
              ></i>
              {{ item.type === "in" ? "入庫單" : "出庫單" }}
            </el-tag>
          </div>
          <div class="card-content">
            <div class="card-item">
              <span class="item-label"><i class="el-icon-date"></i> 日期:</span>
              <span class="item-value">{{ item.date }}</span>
            </div>
            <div class="card-item">
              <span class="item-label"
                ><i class="el-icon-user"></i> 操作人員:</span
              >
              <span class="item-value">{{ item.operator }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              type="primary"
              plain
              size="mini"
              round
              class="select-button"
            >
              選擇此單
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 無搜尋結果顯示 -->
    <div
      v-if="hasSearched && !searchResults.length && !searchLoading"
      class="no-results"
    >
      <el-empty description="未找到相關單據" :image-size="isMobile ? 120 : 200">
        <template #description>
          <p>未找到相關單據，請嘗試其他搜尋條件</p>
        </template>
        <el-button type="info" plain round size="small" @click="resetSearch">
          <i class="el-icon-refresh-left"></i> 重設搜尋
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
//import api from "@/api";

export default {
  name: "OrderSearchPanel",

  props: {
    productOptions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchType: "order", // 'order' 或 'product'
      searchForm: {
        orderType: "in",
        orderNumber: "",
        productId: "",
        batchNumber: ""
      },
      searchResults: [],
      hasSearched: false,
      searchLoading: false,
      windowWidth: window.innerWidth
    };
  },

  computed: {
    isMobile() {
      return this.windowWidth < 768;
    }
  },

  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    // 按單號搜尋
    async searchByOrderNumber() {
      if (!this.searchForm.orderNumber) {
        // 使用 Element UI 的 Message 方法
        this.$notify({
          title: "提示",
          message: "請輸入單號",
          type: "warning",
          duration: 2000
        });
        return;
      }

      try {
        this.searchLoading = true;
        this.hasSearched = true;

        // 使用API搜尋單據
        const response = await api.searchOrderByNumber(
          this.searchForm.orderNumber,
          this.searchForm.orderType
        );

        if (response.data && response.data.length > 0) {
          this.searchResults = response.data;
        } else {
          this.searchResults = [];
        }
      } catch (error) {
        console.error("搜尋單據失敗:", error);
        this.$notify.error({
          title: "錯誤",
          message: "搜尋單據失敗: " + (error.message || error),
          duration: 3000
        });

        // 測試數據，實際開發時應該刪除
        if (this.searchForm.orderType === "in") {
          this.searchResults = [
            {
              number: "IN202503170001",
              type: "in",
              date: "2025-03-17 10:00:00",
              operator: "王小明",
              products: [
                {
                  productId: "1",
                  batches: [
                    {
                      batchNumber: "B20250317001",
                      quantity: 100,
                      expiryDate: "2026-03-17"
                    }
                  ]
                }
              ]
            }
          ];
        } else {
          this.searchResults = [
            {
              number: "OUT202503170001",
              type: "out",
              date: "2025-03-17 11:00:00",
              operator: "李小華",
              reason: "sale",
              products: [
                {
                  productId: "1",
                  batches: [
                    {
                      batchNumber: "B20250317001",
                      quantity: 50,
                      expiryDate: "2026-03-17"
                    }
                  ]
                }
              ]
            }
          ];
        }
      } finally {
        setTimeout(() => {
          this.searchLoading = false;
        }, 300);
      }
    },

    // 按產品/批號搜尋
    async searchByProductBatch() {
      if (!this.searchForm.productId && !this.searchForm.batchNumber) {
        this.$notify({
          title: "提示",
          message: "請至少輸入產品或批號",
          type: "warning",
          duration: 2000
        });
        return;
      }

      try {
        this.searchLoading = true;
        this.hasSearched = true;

        // 使用API搜尋單據
        const response = await api.searchOrderByProductBatch(
          this.searchForm.productId,
          this.searchForm.batchNumber
        );

        if (response.data && response.data.length > 0) {
          this.searchResults = response.data;
        } else {
          this.searchResults = [];
        }
      } catch (error) {
        console.error("搜尋單據失敗:", error);
        this.$notify.error({
          title: "錯誤",
          message: "搜尋單據失敗: " + (error.message || error),
          duration: 3000
        });

        // 測試數據，實際開發時應該刪除
        this.searchResults = [
          {
            number: "IN202503170001",
            type: "in",
            date: "2025-03-17 10:00:00",
            operator: "王小明",
            products: [
              {
                productId: "1",
                batches: [
                  {
                    batchNumber: "B20250317001",
                    quantity: 100,
                    expiryDate: "2026-03-17"
                  }
                ]
              }
            ]
          },
          {
            number: "OUT202503170001",
            type: "out",
            date: "2025-03-17 11:00:00",
            operator: "李小華",
            reason: "sale",
            products: [
              {
                productId: "1",
                batches: [
                  {
                    batchNumber: "B20250317001",
                    quantity: 50,
                    expiryDate: "2026-03-17"
                  }
                ]
              }
            ]
          }
        ];
      } finally {
        setTimeout(() => {
          this.searchLoading = false;
        }, 300);
      }
    },

    // 選擇單據
    selectOrder(order) {
      this.$emit("select-order", order);
    },

    // 重設搜尋
    resetSearch() {
      this.searchForm = {
        orderType: "in",
        orderNumber: "",
        productId: "",
        batchNumber: ""
      };
      this.searchResults = [];
      this.hasSearched = false;
    },

    // 表格行樣式
    tableRowClassName({ row, rowIndex }) {
      return "table-row-hover";
    }
  }
};
</script>

<style lang="scss" scoped>
.search-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;
  overflow: hidden;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  position: relative;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  i {
    margin-right: 8px;
    color: #409eff;
  }
}

.custom-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    font-weight: 500;

    &.is-active {
      color: #409eff;
    }

    i {
      margin-right: 6px;
      vertical-align: middle;
    }
  }

  :deep(.el-tabs__nav) {
    border-radius: 8px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  /* 取消所有切換動畫 */
  :deep(.el-tabs__content) {
    transition: none !important;
  }
}

.search-form-container {
  min-height: 80px;
}

.search-form-wrapper {
  padding: 8px;
  background-color: #f9fafc;
  border-radius: 8px;
  margin-bottom: 24px;
}

.search-form {
  display: flex;
  justify-content: space-between;
  width: 100%;

  .form-left {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 15px;
  }

  .form-right {
    display: flex;
    align-items: flex-end;
    margin-left: 15px;
  }
}

.full-width-input {
  width: 100%;
  min-width: 200px;
}

.search-button-container {
  margin-left: auto;
  margin-right: 0;
}

.search-button {
  min-width: 100px;
}

.search-loading {
  padding: 20px;
  background: #f9fafc;
  border-radius: 8px;
  margin-top: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-count {
  background-color: #f0f5ff;
  color: #409eff;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
}

.search-results {
  margin-top: 20px;
}

/* 如需自定義下拉選單樣式，可以在此添加 */

.custom-option {
  display: flex;
  align-items: center;
}

.option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;

  &.success {
    background-color: #f0f9eb;
    color: #67c23a;
  }

  &.danger {
    background-color: #fef0f0;
    color: #f56c6c;
  }
}

.table-row-hover {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f0f5ff !important;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
  border-left: 3px solid #409eff;

  &:hover,
  &:active {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.card-content {
  margin-bottom: 16px;
}

.card-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.item-label {
  color: #909399;
  margin-right: 8px;
  min-width: 80px;

  i {
    margin-right: 4px;
  }
}

.item-value {
  color: #606266;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.select-button {
  width: 100%;
}

.no-results {
  margin-top: 40px;
  margin-bottom: 40px;
  animation: fadeIn 0.5s;
}

// 動畫效果相關的樣式移除，因為不需要過渡動畫
// 移除下面相關CSS代碼

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 移動裝置樣式調整
@media (max-width: 768px) {
  .search-section {
    padding: 16px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 16px;
  }

  .custom-tabs {
    :deep(.el-tabs__item) {
      padding: 0 16px;
      font-size: 14px;
    }
  }

  .search-form {
    flex-direction: column;

    .form-left {
      flex-direction: column;
      width: 100%;
    }

    .form-right {
      margin-left: 0;
      margin-top: 10px;
      width: 100%;
    }
  }

  .el-form-item {
    margin-bottom: 12px;
    width: 100%;
  }

  .search-button {
    width: 100%;
  }

  .search-button-container {
    width: 100%;
  }
}
</style>
