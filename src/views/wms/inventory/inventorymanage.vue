<template>
  <div class="inventory-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>庫存管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="handleBatchImport">
          <i class="el-icon-upload2"></i>
          <span class="button-text">批次匯入</span>
        </el-button>

        <document-button
          buttonText="庫存操作"
          buttonType="success"
          :productData="ProductDataArray"
          @success="handleDocumentSuccess"
        />
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="inventory-tabs">
        <!-- 庫存列表 -->
        <el-tab-pane label="庫存列表" name="inventory-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="inventorySearch"
                  :search-value="inventorySearchQuery"
                  :time-value="inventoryDateRange"
                  :search-placeholder="'搜尋庫存品號...'"
                  :search-button-text="'搜尋'"
                  :show-search-button="true"
                  :search-button-icon="'el-icon-search'"
                  :immediate-search="false"
                  :time-shortcuts="true"
                  @search="handleCombinedSearch"
                />
                <el-button
                  v-if="isFiltering"
                  type="warning"
                  icon="el-icon-refresh-right"
                  @click="resetFilters"
                  >重置篩選</el-button
                >
              </div>
            </div>
          </div>

          <!-- 子標籤：狀態分類 -->
          <el-tabs v-model="statusTab" type="card" class="status-tabs">
            <!-- 總覽標籤 -->
            <el-tab-pane label="總覽" name="all">
              <data-table
                ref="inventoryTable"
                :data="filteredInventoryData"
                :columns="inventorysColumns"
                :sub-table-columns="batchColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="batchNumber"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-lastTransferDate="{ row }">
                  {{ formatDate(row.lastTransferDate) }}
                </template>

                <template #column-expiryDate="{ row }">
                  {{ formatDate(row.expiryDate) }}
                </template>

                <template #column-stockStatus="{ row }">
                  <el-tag
                    :type="getStatusType(row.stockStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.stockStatus) }}
                  </el-tag>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯庫存" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看庫存異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewInventoryHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>

            <!-- 按狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :name="status.value"
            >
              <data-table
                :data="getStatusFilteredData(status.value)"
                :columns="inventorysColumns"
                :sub-table-columns="batchColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="batchNumber"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-lastTransferDate="{ row }">
                  {{ formatDate(row.lastTransferDate) }}
                </template>

                <template #column-expiryDate="{ row }">
                  {{ formatDate(row.expiryDate) }}
                </template>

                <template #column-stockStatus="{ row }">
                  <el-tag
                    :type="getStatusType(row.stockStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.stockStatus) }}
                  </el-tag>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯庫存" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看庫存異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewInventoryHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 庫存異動紀錄 -->
        <el-tab-pane label="庫存異動紀錄" name="inventory-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToInventoryList"
                  >返回庫存列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="inventoryHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋庫存異動...'"
                  :search-button-text="'搜尋'"
                  :show-search-button="true"
                  :search-button-icon="'el-icon-search'"
                  :immediate-search="false"
                  :time-shortcuts="true"
                  @search="handleCombinedHistorySearch"
                />
                <el-button
                  v-if="isHistoryFiltering"
                  type="warning"
                  icon="el-icon-refresh-right"
                  @click="resetHistoryFilters"
                  >重置篩選</el-button
                >
              </div>
            </div>
          </div>

          <!-- 使用 BaseTable 組件顯示異動記錄 -->
          <base-table
            ref="historyTable"
            :data="filteredInventoryHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'inventory-history-export'"
            border
          >
            <!-- 自訂列格式插槽 -->
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small" effect="dark">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>

            <template #column-beforeValue="{ row }">
              <span class="text-danger">
                {{ formatHistoryValue(row.beforeValue) }}
              </span>
            </template>

            <template #column-afterValue="{ row }">
              <span class="text-success">
                {{ formatHistoryValue(row.afterValue) }}
              </span>
            </template>
          </base-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 對話框組件 -->
    <!-- <InventoryDialog
      :visible.sync="inventoryDialogVisible"
      :data="currentEditRow"
      @save="handleSaveInventory"
    /> -->

    <!-- 批次匯入對話框 -->
    <BatchImportDialog
      :visible.sync="batchImportDialogVisible"
      @submit="handleBatchImportSubmit"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
// import InventoryDialog from "./components/InventoryDialog.vue";
import DocumentButton from "@/components/DocumentButton/index.vue";
import BatchImportDialog from "./components/BatchImportDialog.vue";
import { formatDate } from "@/utils/date";
import { formatPhone } from "@/utils/dataTable";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import InventoryService from "./services/InventoryService";
import { statusOptions, inventorysColumns } from "@/constants/tableColumns";

export default {
  name: "InventoryManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    BatchImportDialog,
    DocumentButton
    // InventoryDialog
  },
  data() {
    return {
      activeTab: "inventory-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      ProductDataArray: [],

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 庫存列表相關數據
      inventoryData: [],
      allInventoryData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      inventorySearchQuery: "",
      inventoryDateRange: [],
      isFiltering: false,

      // 異動記錄相關數據
      inventoryHistoryData: [],
      allInventoryHistoryData: [], // 儲存所有原始數據，用於重置篩選
      inventoryHistorySearchQuery: "",
      historyDateRange: [],
      currentProductId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      inventoryDialogVisible: false,
      batchImportDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,

      // 狀態選項
      statusOptions: [
        { value: "normal", label: "正常", type: "success" },
        { value: "low", label: "低於安全庫存", type: "warning" },
        { value: "critical", label: "庫存緊張", type: "danger" },
        { value: "none", label: "無庫存", type: "info" },
        { value: "expired", label: "已過期", type: "danger" }
      ],

      // 表格列配置
      inventorysColumns: inventorysColumns.product,
      batchColumns: inventorysColumns.batch,
      historyColumns: inventorysColumns.history,
      fieldHistoryColumns: inventorysColumns.fieldHistory
    };
  },

  computed: {
    // 過濾後的庫存數據
    filteredInventoryData() {
      return this.inventoryData;
    },

    // 過濾後的庫存異動記錄
    filteredInventoryHistoryData() {
      return this.inventoryHistoryData;
    }
  },

  async created() {
    // 先獲取庫存資料
    await this.fetchInventoryData();

    // 獲取 ProductDataArray 用於 DocumentButton 組件
    try {
      const response = await InventoryService.getProductDataArray();
      if (response.success) {
        this.ProductDataArray = response.data;
      } else {
        this.$message.warning("獲取產品數據失敗：" + response.message);
      }
    } catch (error) {
      console.error("加載產品數據出錯：", error);
      this.$message.error("加載產品數據失敗");
    }
  },

  methods: {
    // 格式化方法
    formatDate,
    formatPhone,
    getTypeTag,
    getTypeLabel,

    // 批次匯入
    handleBatchImport() {
      this.batchImportDialogVisible = true;
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

    // 獲取特定狀態的庫存
    getStatusFilteredData(status) {
      return this.filteredInventoryData.filter(
        item => item.stockStatus === status
      );
    },

    handleDocumentSuccess(data) {
      console.log("Document created:", data);
    },

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

    // 庫存列表相關方法
    async fetchInventoryData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await InventoryService.getInventoryList(queryParams);
        let inventoryData = response.data || [];

        // 使用批次處理來優化效能
        if (inventoryData.length) {
          // 每批處理的項目數
          const batchSize = 5;

          // 將資料分成多個批次
          for (let i = 0; i < inventoryData.length; i += batchSize) {
            const batch = inventoryData.slice(i, i + batchSize);

            // 同時處理一批項目
            await Promise.all(
              batch.map(async item => {
                try {
                  const batchResponse = await InventoryService.loadBatchDataForRow(
                    item
                  );
                  if (batchResponse.success) {
                    // 使用 details 屬性
                    this.$set(item, "details", batchResponse.data);
                  } else {
                    // 確保即使加載失敗也有一個空數組
                    this.$set(item, "details", []);
                  }
                } catch (error) {
                  console.error(
                    `加載 ${item.productCode} 的批號資料失敗:`,
                    error
                  );
                  this.$set(item, "details", []);
                }
              })
            );

            // 如果不是最後一批，給一個很短的延遲，讓UI有機會更新
            if (i + batchSize < inventoryData.length) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
        }

        this.inventoryData = inventoryData;

        // 若是初次加載或重置篩選，則更新 allInventoryData
        if (!params || !Object.keys(params).length) {
          // 使用深拷貝避免引用問題
          this.allInventoryData = JSON.parse(
            JSON.stringify(this.inventoryData)
          );
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取庫存數據失敗: " + error.message);
        this.inventoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    getQueryParams() {
      const params = {};

      if (this.inventoryDateRange && this.inventoryDateRange.length === 2) {
        params.startDate = formatDate(this.inventoryDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.inventoryDateRange[1], "YYYY-MM-DD");
      }

      if (this.inventorySearchQuery) {
        params.search = this.inventorySearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.inventorySearchQuery = searchParams.keyword || "";
      this.inventoryDateRange = searchParams.dateRange || [];

      // 執行搜尋
      this.handleSearch();
    },

    // 搜尋功能
    handleSearch() {
      const params = this.getQueryParams();

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastSearchParams === paramsStr) {
        return;
      }

      this.lastSearchParams = paramsStr;
      this.fetchInventoryData(params);
    },

    resetFilters() {
      this.inventorySearchQuery = "";
      this.inventoryDateRange = [];
      if (this.$refs.inventorySearch) {
        this.$refs.inventorySearch.clear();
      }
      this.inventoryData = [...this.allInventoryData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchInventoryHistoryData(productId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (productId) {
          queryParams.productId = productId;
          this.showBackButton = true;
          this.currentProductId = productId;
          this.lastViewedRow = this.inventoryData.find(
            item => item.id === productId
          );
        } else {
          this.showBackButton = false;
          this.currentProductId = null;

          if (this.historyDateRange && this.historyDateRange.length === 2) {
            queryParams.startDate = formatDate(
              this.historyDateRange[0],
              "YYYY-MM-DD"
            );
            queryParams.endDate = formatDate(
              this.historyDateRange[1],
              "YYYY-MM-DD"
            );
          }

          if (this.inventoryHistorySearchQuery) {
            queryParams.search = this.inventoryHistorySearchQuery;
          }
        }

        const response = await InventoryService.getInventoryHistory(
          queryParams
        );
        this.inventoryHistoryData = response.data || [];

        // 若是初次加載或特定庫存的記錄，則更新 allInventoryHistoryData
        if (productId || !Object.keys(params || {}).length) {
          this.allInventoryHistoryData = [...this.inventoryHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取庫存異動記錄失敗: " + error.message);
        this.inventoryHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.inventoryHistorySearchQuery = searchParams.keyword || "";
      this.historyDateRange = searchParams.dateRange || [];

      // 執行搜尋
      this.handleHistorySearch();
    },

    handleHistorySearch() {
      const params = {};

      if (this.historyDateRange && this.historyDateRange.length === 2) {
        params.startDate = formatDate(this.historyDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.historyDateRange[1], "YYYY-MM-DD");
      }

      if (this.inventoryHistorySearchQuery) {
        params.search = this.inventoryHistorySearchQuery;
      }

      if (this.currentProductId) {
        params.productId = this.currentProductId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchInventoryHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.inventoryHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.inventoryHistoryData = [...this.allInventoryHistoryData];
      this.isHistoryFiltering = false;
      this.lastHistorySearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置異動記錄篩選條件");
    },

    formatHistoryValue(value) {
      if (value === null || value === undefined) {
        return "-";
      }

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

    handleEdit(row) {
      this.currentEditRow = JSON.parse(JSON.stringify(row));
      this.inventoryDialogVisible = true;
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleSortChange({ prop, order }) {
      // 排序變化處理
      console.log("排序變化:", prop, order);
    },

    handleExpandChange(row, expanded) {
      console.log("行展開狀態變化:", row, expanded);
      // 只有在詳細信息不存在或為空時才加載
      if (expanded && (!row.details || row.details.length === 0)) {
        this.loadBatchData(row);
      }
    },

    async loadBatchData(row) {
      try {
        // 不設置整個表格的loading狀態，避免影響用戶體驗
        // this.loading = true;

        // 設置行局部加載狀態 (可選)
        this.$set(row, "_loading", true);

        const response = await InventoryService.loadBatchDataForRow(row);
        if (response.success) {
          // 使用 details 屬性
          this.$set(row, "details", response.data);
        }
      } catch (error) {
        console.error("加載批號資料失敗:", error);
        // 使用小型通知而非全頁面錯誤消息，提升用戶體驗
        this.$message({
          message: `加載 ${row.productCode} 的批號資料失敗`,
          type: "warning",
          duration: 3000
        });
        // 確保即使加載失敗也有一個空數組
        this.$set(row, "details", []);
      } finally {
        // 清除行局部加載狀態
        this.$set(row, "_loading", false);
      }
    },

    handleSubRowClick(subRow, parentRow) {
      // 子表格行點擊處理
      console.log("子表格行點擊:", subRow, parentRow);
    },

    async handleSaveInventory(inventoryData) {
      try {
        this.loading = true;
        if (inventoryData.id) {
          // 更新
          await InventoryService.updateInventory(inventoryData);
          this.$message.success("庫存資料更新成功");
        } else {
          // 新增
          await InventoryService.createInventory(inventoryData);
          this.$message.success("庫存資料創建成功");
        }

        this.inventoryDialogVisible = false;
        this.fetchInventoryData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewInventoryHistory(row) {
      this.activeTab = "inventory-history";
      this.fetchInventoryHistoryData(row.id);
    },

    backToInventoryList() {
      this.activeTab = "inventory-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.inventoryHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.inventoryTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.productCode
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

    handleBatchUpdate(payload) {
      // 批量更新處理
      console.log("批量更新:", payload);
    },

    handleExport(options) {
      // 導出處理
      console.log("導出選項:", options);
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

.inventory-management {
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

    .inventory-tabs {
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

    // 狀態標籤樣式
    .status-tabs {
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
  .inventory-management {
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
