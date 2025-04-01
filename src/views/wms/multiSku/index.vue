<template>
  <div class="multi-sku">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>品號管理</h2>
      <div class="action-buttons">
        <el-button type="success" @click="handleAdd">
          <i class="el-icon-plus"></i>
          <span class="button-text">新增品號</span>
        </el-button>
        <el-button type="warning" @click="handleAddCategory">
          <i class="el-icon-plus"></i>
          <span class="button-text">新增品號類別</span>
        </el-button>
        <el-button type="primary" @click="handleBatchImport">
          <i class="el-icon-upload2"></i>
          <span class="button-text">批次匯入</span>
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="product-tabs">
        <!-- 品號列表 -->
        <el-tab-pane label="品號列表" name="products">
          <div class="table-operations">
            <div class="operation-wrapper">
              <CombinedSearch
                ref="productSearch"
                :search-placeholder="'搜尋品號列表...'"
                :show-time-search="false"
                @search="handleProductSearch"
              />
            </div>
          </div>

          <!-- 子標籤：總覽和分類 -->
          <el-tabs v-model="categorysTab" type="card" class="categorys-tabs">
            <!-- 總覽標籤 -->
            <el-tab-pane label="總覽" name="overview">
              <BaseTable
                ref="productTable"
                :data="filteredProductData"
                :columns="productColumns"
                :loading="loading"
                :filename="'products-export'"
                :show-action-column="true"
                border
                row-key="id"
              >
                <template #column-categorys="{ row }">
                  <el-tag size="small" effect="plain">{{
                    row.categorys
                  }}</el-tag>
                </template>

                <template #column-createdAt="{ row }">
                  {{ formatDateDisplay(row.createdAt) }}
                </template>
                <template #column-updatedAt="{ row }">
                  {{ formatDateDisplay(row.updatedAt) }}
                </template>
                <template #column-status="{ row }">
                  <el-tag
                    :type="row.status ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status ? "啟用" : "停用" }}
                  </el-tag>
                </template>
                <template #action="{ row }">
                  <el-tooltip content="編輯品號" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看品號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProductHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </BaseTable>
            </el-tab-pane>

            <!-- 分類標籤 -->
            <el-tab-pane
              v-for="categorys in productCategories"
              :key="categorys.value"
              :label="categorys.label"
              :name="categorys.value"
            >
              <BaseTable
                :data="getCategoryProducts(categorys.value)"
                :columns="productColumns"
                :loading="loading"
                :filename="'products-' + categorys.value + '-export'"
                :show-action-column="true"
                border
                row-key="id"
              >
                <template #column-categorys="{ row }">
                  <el-tag size="small" effect="plain">{{
                    row.categorys
                  }}</el-tag>
                </template>
                <template #column-status="{ row }">
                  <el-tag
                    :type="row.status ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status ? "啟用" : "停用" }}
                  </el-tag>
                </template>
                <template #action="{ row }">
                  <el-tooltip content="編輯品號" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看品號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProductHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </BaseTable>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 品號異動記錄 -->
        <el-tab-pane label="品號異動記錄" name="product-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToProducts"
                  >返回品號列表</el-button
                >
                <CombinedSearch
                  ref="historySearch"
                  :search-placeholder="'搜尋品號異動...'"
                  :show-time-search="true"
                  @search="handleHistorySearch"
                />
              </div>
            </div>
          </div>
          <BaseTable
            ref="historyTable"
            :data="filteredProductHistoryData"
            :columns="productHistoryColumns"
            :loading="loading"
            :filename="'product-history-export'"
            :show-action-column="false"
            border
            row-key="id"
          >
            <!-- 使用自定義模板格式化日期時間 -->
            <template #column-datetime="{ row }">
              {{ formatDateDisplay(row.datetime) }}
            </template>
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small" effect="dark">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
            <template #column-beforeValue="{ row }">
              <span class="text-danger">{{
                formatHistoryValue(row.beforeValue)
              }}</span>
            </template>
            <template #column-afterValue="{ row }">
              <span class="text-success">{{
                formatHistoryValue(row.afterValue)
              }}</span>
            </template>
          </BaseTable>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 編輯對話框 -->
    <ProductCodeDialog
      :visible.sync="productDialogVisible"
      :data="currentEditRow"
      @save="handleSaveProduct"
    />

    <!-- 批次匯入對話框 -->
    <BatchImportDialog
      :visible.sync="batchImportDialogVisible"
      @submit="handleBatchImportSubmit"
    />

    <!-- 批次匯入對話框 -->
    <AddCategoryDialog
      :visible.sync="addCategoryDialogVisible"
      @submit="handleAddCategorySubmit"
    />
  </div>
</template>

<script>
import BaseTable from "@/components/BaseTable/index.vue";
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import ProductCodeDialog from "./components/ProductCodeDialog.vue";
import BatchImportDialog from "./components/BatchImportDialog.vue";
import AddCategoryDialog from "./components/AddCategoryDialog.vue";
import { formatDate } from "@/utils/date";
import MultiSkuService from "./services/MultiSkuService";
import { productsColumns } from "@/constants/tableColumns";

export default {
  name: "MultiSku",

  components: {
    CombinedSearch,
    BaseTable,
    ProductCodeDialog,
    BatchImportDialog,
    AddCategoryDialog
  },

  data() {
    return {
      // 基本設置
      activeTab: "products",
      categorysTab: "overview",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 產品類別定義
      productCategories: [],

      // 表格欄位定義
      productColumns: productsColumns.list,

      productHistoryColumns: productsColumns.history,

      // 對話框顯示控制
      productDialogVisible: false,
      batchImportDialogVisible: false,
      addCategoryDialogVisible: false,
      currentEditRow: null,

      // 搜索參數
      productSearchParams: {
        keyword: "",
        field: "",
        dateRange: []
      },

      historySearchParams: {
        keyword: "",
        field: "",
        dateRange: []
      },

      // 資料
      productData: [],
      productHistoryData: []
    };
  },

  computed: {
    // 過濾後的品號資料
    filteredProductData() {
      let data = this.productData;
      const { keyword, field } = this.productSearchParams;

      if (keyword) {
        data = this.filterData(data, keyword, field);
      }

      return data;
    },

    // 過濾後的品號異動記錄
    filteredProductHistoryData() {
      let data = this.productHistoryData;
      const { keyword, field, dateRange } = this.historySearchParams;

      if (dateRange && dateRange.length === 2) {
        data = this.filterByDateRange(data, dateRange);
      }

      if (keyword) {
        data = this.filterData(data, keyword, field);
      }

      return data;
    }
  },

  created() {
    this.initData();
  },

  methods: {
    // 初始化數據
    async initData() {
      try {
        this.loading = true;
        await Promise.all([
          this.loadProductData(),
          this.loadProductHistoryData(),
          this.loadProductCategories()
        ]);
      } catch (error) {
        console.error("加載數據失敗:", error);
        this.$message.error("加載數據失敗");
      } finally {
        this.loading = false;
      }
    },

    // 加載品號資料
    async loadProductData() {
      try {
        this.productData = await MultiSkuService.getProductList();
      } catch (error) {
        console.error("加載品號資料失敗:", error);
        this.$message.error("加載品號資料失敗");
      }
    },

    // 加載品號異動記錄
    async loadProductHistoryData() {
      try {
        this.productHistoryData = await MultiSkuService.getProductHistoryList();

        // 標準化日期格式
        this.productHistoryData = this.productHistoryData.map(item => {
          if (item.datetime) {
            try {
              const date = new Date(item.datetime);
              if (!isNaN(date.getTime())) {
                // 確保所有日期使用一致的 ISO 格式
                item.datetime = date.toISOString();
              }
            } catch (e) {
              console.error("日期標準化錯誤:", e);
            }
          }
          return item;
        });

        console.log(`已載入 ${this.productHistoryData.length} 筆品號異動記錄`);

        // 顯示幾筆日期樣本，以確認格式
        if (this.productHistoryData.length > 0) {
          const samples = this.productHistoryData
            .slice(0, 3)
            .map(item => item.datetime);
          console.log("日期樣本:", samples);
        }
      } catch (error) {
        console.error("加載品號異動記錄失敗:", error);
        this.$message.error("加載品號異動記錄失敗");
      }
    },

    // 加載產品類別
    async loadProductCategories() {
      try {
        this.productCategories = await MultiSkuService.getProductCategories();
      } catch (error) {
        console.error("加載產品類別失敗:", error);
        this.$message.error("加載產品類別失敗");
      }
    },

    // 處理品號搜尋
    handleProductSearch(params) {
      this.productSearchParams = { ...params };
    },

    // 處理歷史記錄搜尋
    handleHistorySearch(params) {
      console.log("品號異動搜尋參數:", {
        keyword: params.keyword,
        field: params.field,
        dateRange: params.dateRange
          ? [
              params.dateRange[0]
                ? formatDate(params.dateRange[0], "YYYY-MM-DD")
                : null,
              params.dateRange[1]
                ? formatDate(params.dateRange[1], "YYYY-MM-DD")
                : null
            ]
          : null
      });

      this.historySearchParams = { ...params };
    },

    // 取得特定類別的產品
    getCategoryProducts(categorys) {
      return this.filteredProductData.filter(
        product => product.categorys === categorys
      );
    },

    // 處理新增
    handleAdd() {
      this.currentEditRow = null;
      this.productDialogVisible = true;
    },

    // 處理編輯
    handleEdit(row) {
      this.currentEditRow = { ...row };
      this.productDialogVisible = true;
    },

    // 新增品號類別
    handleAddCategory() {
      this.addCategoryDialogVisible = true;
    },

    // 批次匯入
    handleBatchImport() {
      this.batchImportDialogVisible = true;
    },

    // 處理保存品號
    async handleSaveProduct(data) {
      try {
        this.loading = true;
        const result = await MultiSkuService.saveProduct(data);

        if (result.success) {
          const savedData = result.data;

          // 檢查是新增還是更新
          const index = this.productData.findIndex(
            item => item.productCode === savedData.productCode
          );

          if (index !== -1) {
            // 更新現有品號
            const oldData = { ...this.productData[index] };
            this.productData[index] = { ...savedData };

            // 記錄修改到品號異動記錄
            const newHistoryRecord = {
              datetime: new Date().toISOString(),
              type: "update",
              productCode: savedData.productCode,
              field: "all",
              beforeValue: JSON.stringify(oldData),
              afterValue: JSON.stringify(savedData),
              operator: "admin", // 這裡可替換為實際登入用戶
              remark: "修改品號資料"
            };

            this.productHistoryData.unshift(newHistoryRecord);
          } else {
            // 新增品號
            this.productData.push({ ...savedData });

            // 記錄新增到品號異動記錄
            const newHistoryRecord = {
              datetime: new Date().toISOString(),
              type: "create",
              productCode: savedData.productCode,
              field: "all",
              beforeValue: "",
              afterValue: JSON.stringify(savedData),
              operator: "admin", // 這裡可替換為實際登入用戶
              remark: "新增品號"
            };

            this.productHistoryData.unshift(newHistoryRecord);
          }

          this.$message.success(result.message || "保存成功");
          this.productDialogVisible = false;
        } else {
          this.$message.error(result.message || "保存失敗");
        }
      } catch (error) {
        console.error("保存品號失敗:", error);
        this.$message.error("保存品號失敗");
      } finally {
        this.loading = false;
      }
    },

    // 處理批次匯入提交
    async handleBatchImportSubmit(data) {
      try {
        this.loading = true;
        const result = await MultiSkuService.batchImportProducts(data);

        if (result.success) {
          this.$message.success(result.message || "批次匯入成功");
          this.batchImportDialogVisible = false;
          // 重新載入數據
          await this.loadProductData();
          await this.loadProductHistoryData();
        } else {
          this.$message.error(result.message || "批次匯入失敗");
        }
      } catch (error) {
        console.error("批次匯入失敗:", error);
        this.$message.error("批次匯入失敗");
      } finally {
        this.loading = false;
      }
    },

    // 處理新增產品類別提交
    async handleAddCategorySubmit(data) {
      try {
        this.loading = true;
        const result = await MultiSkuService.addProductCategory(data);

        if (result.success) {
          this.$message.success(result.message || "新增類別成功");
          this.addCategoryDialogVisible = false;
          // 重新載入類別數據
          await this.loadProductCategories();
        } else {
          this.$message.error(result.message || "新增類別失敗");
        }
      } catch (error) {
        console.error("新增類別失敗:", error);
        this.$message.error("新增類別失敗");
      } finally {
        this.loading = false;
      }
    },

    // 查看品號異動紀錄
    viewProductHistory(row) {
      this.lastViewedRow = row;
      this.activeTab = "product-history";
      this.showBackButton = true;

      // 計算默認的日期範圍 (例如：最近30天)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 最近30天

      console.log(
        `查看品號 ${row.productCode} 的異動記錄，日期範圍：${formatDate(
          startDate,
          "YYYY-MM-DD"
        )} 至 ${formatDate(endDate, "YYYY-MM-DD")}`
      );

      // 設定搜尋條件
      this.$nextTick(() => {
        if (this.$refs.historySearch) {
          this.$refs.historySearch.setDefaults({
            keyword: row.productCode,
            field: "productCode",
            dateRange: [startDate, endDate], // 添加默認日期範圍
            search: true
          });
        }
      });
    },

    // 格式化日期時間顯示
    formatDateDisplay(dateString, format = "YYYY-MM-DD HH:mm:ss") {
      if (!dateString) return "-";

      try {
        return formatDate(dateString, format);
      } catch (error) {
        console.error("日期顯示格式化錯誤:", error);
        return dateString;
      }
    },

    // 格式化 ISO 日期
    formatISODate(dateString) {
      if (!dateString) return null;

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      } catch (error) {
        console.error("日期格式化錯誤:", error);
        return null;
      }
    },

    // 返回品號列表
    backToProducts() {
      this.activeTab = "products";
      this.categorysTab = "overview";
      this.showBackButton = false;

      // 清除歷史記錄的搜尋
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.productTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[1].textContent.trim() === this.lastViewedRow.productCode
              ) {
                // 滾動到目標行
                rows[i].scrollIntoView({ behavior: "smooth", block: "center" });

                // 添加高亮效果
                rows[i].classList.add("highlight-row");
                setTimeout(() => {
                  rows[i].classList.remove("highlight-row");
                }, 2000);

                break;
              }
            }
          }
        }
      });
    },

    // 數據過濾方法
    filterData(data, keyword, field) {
      if (!keyword) return data;

      return data.filter(item => {
        if (!field) {
          // 全欄位搜索
          return Object.values(item).some(
            val =>
              val !== null &&
              val !== undefined &&
              String(val)
                .toLowerCase()
                .includes(keyword.toLowerCase())
          );
        }

        // 特定欄位搜索
        const value = item[field];
        return (
          value !== null &&
          value !== undefined &&
          String(value)
            .toLowerCase()
            .includes(keyword.toLowerCase())
        );
      });
    },

    // 日期範圍過濾
    filterByDateRange(data, dateRange) {
      if (!dateRange || dateRange.length !== 2) return data;

      const [startDate, endDate] = dateRange;
      if (!startDate || !endDate) return data;

      // 確保開始日期從當天的 00:00:00 開始
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      // 確保結束日期到當天的 23:59:59 結束
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // 添加調試信息
      console.log("過濾日期範圍:", {
        start: start.toISOString(),
        end: end.toISOString()
      });

      // 使用強化的日期過濾邏輯
      return data.filter(record => {
        // 安全檢查
        if (!record.datetime) {
          console.warn("記錄缺少 datetime 欄位:", record);
          return false;
        }

        try {
          // 將記錄的日期轉換為 Date 對象
          const recordDate = new Date(record.datetime);

          // 檢查日期是否有效
          if (isNaN(recordDate.getTime())) {
            console.warn("無效的日期格式:", record.datetime);
            return false;
          }

          // 完整的日期時間比較
          const result = recordDate >= start && recordDate <= end;

          return result;
        } catch (error) {
          console.error("日期比較錯誤:", error);
          return false;
        }
      });
    },

    // 格式化顯示方法
    formatHistoryValue(value) {
      if (!value) return "-";
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object") {
          return "[物件資料]";
        }
        return value;
      } catch {
        return value;
      }
    },

    // 取得異動類型標籤樣式
    getTypeTag(type) {
      const tags = {
        create: "success",
        update: "warning",
        delete: "danger"
      };
      return tags[type] || "info";
    },

    // 取得異動類型顯示文字
    getTypeLabel(type) {
      const labels = {
        create: "新增",
        update: "修改",
        delete: "刪除"
      };
      return labels[type] || type;
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-base: 18px;
$font-size-lg: 20px;
$font-size-xl: 24px;

.multi-sku {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  // 頁面標題區域
  .page-header {
    background: white;
    padding: 24px;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: $font-size-xl;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 3px;
        background: $primary-color;
        border-radius: 2px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  // 內容區域
  .page-content {
    background: white;
    border-radius: $border-radius;
    box-shadow: $box-shadow;

    .product-tabs {
      ::v-deep .el-tabs__header {
        margin: 0;
        padding: 0 20px;
        background: #f8f9fa;
      }

      ::v-deep .el-tabs__nav {
        border: none;
      }

      ::v-deep .el-tabs__item {
        height: 40px;
        line-height: 40px;
        font-size: $font-size-base;
        border: none;
        margin: 0;
        padding: 0 20px;

        &:hover {
          color: $primary-color;
        }

        &.is-active {
          background: white;
          border-bottom: 2px solid $primary-color;
          font-weight: 500;
        }
      }

      .el-tab-pane {
        padding: 20px;
      }
    }

    // 分類標籤樣式
    .categorys-tabs {
      margin: 0 -20px 20px;

      ::v-deep .el-tabs__header {
        margin: 0;
        padding: 0 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #e4e7ed;
      }

      ::v-deep .el-tabs__nav {
        border: none;
      }

      ::v-deep .el-tabs__item {
        height: 40px;
        line-height: 40px;
        font-size: $font-size-base;
        border: none;
        margin: 0;
        padding: 0 20px;

        &:hover {
          color: $primary-color;
        }

        &.is-active {
          background: white;
          border-bottom: 2px solid $primary-color;
          font-weight: 500;
        }
      }

      .el-tab-pane {
        padding: 20px;
      }
    }
  }

  // 表格操作區域
  .table-operations {
    margin-bottom: 20px;

    .operation-wrapper {
      padding: 16px;
      background: #f8f9fa;
      border-radius: $border-radius;

      .search-filters {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }

  // 標籤樣式
  .el-tag {
    border-radius: 4px;
    padding: 0 8px;
    height: 24px;
    line-height: 22px;

    &--small {
      height: 20px;
      padding: 0 6px;
      line-height: 18px;
    }
  }

  // 狀態文字樣式
  .text-success {
    color: $success-color;
  }
  .text-danger {
    color: $danger-color;
  }
  .text-warning {
    color: $warning-color;
  }

  // 高亮效果
  .highlight-row {
    background-color: rgba($primary-color, 0.1);
    transition: background-color 0.5s ease;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .multi-sku {
    padding: 16px;

    .page-header {
      padding: 16px;
      flex-direction: column;
      gap: 16px;

      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
    }

    .table-operations {
      .operation-wrapper {
        .search-filters {
          flex-direction: column;
          gap: 12px;

          > * {
            width: 100%;
          }
        }
      }
    }
  }
}

// 動畫效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
