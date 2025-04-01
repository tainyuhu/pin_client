<template>
  <div class="preorder-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>訂單預購管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="preorder-tabs">
        <!-- 訂單列表 -->
        <el-tab-pane label="訂單預購列表" name="preorder-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="preorderSearch"
                  :search-value="preorderSearchQuery"
                  :time-value="preorderDateRange"
                  :search-placeholder="'搜尋訂單預購單...'"
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
                ref="preorderTable"
                :data="filteredPreOrderData"
                :columns="preorderColumns"
                :sub-table-columns="preorderDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="serialNumber"
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
                <template #column-shipmentDate="{ row }">
                  {{ formatDate(row.shipmentDate) }}
                </template>

                <template #column-contactPhone="{ row }">
                  {{ formatPhone(row.contactPhone, row.extension) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯訂單預購單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看訂單預購單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewPreOrderHistory(row)"
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
                :columns="preorderColumns"
                :sub-table-columns="preorderDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="serialNumber"
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
                <template #column-shipmentDate="{ row }">
                  {{ formatDate(row.shipmentDate) }}
                </template>

                <template #column-contactPhone="{ row }">
                  {{ formatPhone(row.contactPhone, row.extension) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯訂單預購單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看訂單預購單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewPreOrderHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 訂單預購單異動紀錄 -->
        <el-tab-pane label="訂單預購單異動紀錄" name="preorder-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToPreOrderList"
                  >返回訂單預購列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="preorderHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋訂單預購單異動...'"
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
            :data="filteredPreOrderHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'preorder-history-export'"
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
    <PreOrderDialog
      :visible.sync="preorderDialogVisible"
      :data="currentEditRow"
      @save="handleSavePreOrder"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import PreOrderDialog from "./components/PreOrderDialog.vue";
import { formatDate } from "@/utils/date";
import { formatPhone } from "@/utils/dataTable";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import PreOrderService from "./services/PreOrderService";
import { statusOptions, preorderColumns } from "@/constants/tableColumns";

export default {
  name: "PreOrderManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    PreOrderDialog
  },
  data() {
    return {
      activeTab: "preorder-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 訂單列表相關數據
      preorderData: [],
      allPreOrderData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      preorderSearchQuery: "",
      preorderDateRange: [],
      isFiltering: false,

      // 異動記錄相關數據
      preorderHistoryData: [],
      allPreOrderHistoryData: [], // 儲存所有原始數據，用於重置篩選
      preorderHistorySearchQuery: "",
      historyDateRange: [],
      currentPreOrderId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      preorderDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,

      // 狀態選項
      statusOptions: statusOptions.preorderStatusOptions,

      // 表格列配置
      preorderColumns: preorderColumns.list,
      preorderDetailColumns: preorderColumns.preorderDetail,
      historyColumns: preorderColumns.history
    };
  },

  computed: {
    // 過濾後的訂單數據
    filteredPreOrderData() {
      return this.preorderData;
    },

    // 過濾後的訂單異動記錄
    filteredPreOrderHistoryData() {
      return this.preorderHistoryData;
    }
  },

  created() {
    this.fetchPreOrderData();
  },

  methods: {
    // 格式化方法
    formatDate,
    formatPhone,
    getTypeTag,
    getTypeLabel,

    // 獲取特定狀態的訂單預購單
    getStatusFilteredData(status) {
      return this.filteredPreOrderData.filter(
        preorder => preorder.status === status
      );
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

    // 訂單列表相關方法
    async fetchPreOrderData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await PreOrderService.getPreOrderList(queryParams);
        this.preorderData = response.data || [];

        // 若是初次加載或重置篩選，則更新 allPreOrderData
        if (!params || !Object.keys(params).length) {
          this.allPreOrderData = [...this.preorderData];
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取訂單數據失敗: " + error.message);
        this.preorderData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    getQueryParams() {
      const params = {};

      if (this.preorderDateRange && this.preorderDateRange.length === 2) {
        params.startDate = formatDate(this.preorderDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.preorderDateRange[1], "YYYY-MM-DD");
      }

      if (this.preorderSearchQuery) {
        params.search = this.preorderSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.preorderSearchQuery = searchParams.keyword || "";
      this.preorderDateRange = searchParams.dateRange || [];

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
      this.fetchPreOrderData(params);
    },

    resetFilters() {
      this.preorderSearchQuery = "";
      this.preorderDateRange = [];
      if (this.$refs.preorderSearch) {
        this.$refs.preorderSearch.clear();
      }
      this.preorderData = [...this.allPreOrderData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchPreOrderHistoryData(preorderId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (preorderId) {
          queryParams.preorderId = preorderId;
          this.showBackButton = true;
          this.currentPreOrderId = preorderId;
          this.lastViewedRow = this.preorderData.find(
            item => item.id === preorderId
          );
        } else {
          this.showBackButton = false;
          this.currentPreOrderId = null;

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

          if (this.preorderHistorySearchQuery) {
            queryParams.search = this.preorderHistorySearchQuery;
          }
        }

        const response = await PreOrderService.getPreOrderHistory(queryParams);
        this.preorderHistoryData = response.data || [];

        // 若是初次加載或特定訂單預購單的記錄，則更新 allPreOrderHistoryData
        if (preorderId || !Object.keys(params || {}).length) {
          this.allPreOrderHistoryData = [...this.preorderHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取訂單異動記錄失敗: " + error.message);
        this.preorderHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.preorderHistorySearchQuery = searchParams.keyword || "";
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

      if (this.preorderHistorySearchQuery) {
        params.search = this.preorderHistorySearchQuery;
      }

      if (this.currentPreOrderId) {
        params.preorderId = this.currentPreOrderId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchPreOrderHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.preorderHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.preorderHistoryData = [...this.allPreOrderHistoryData];
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
      this.preorderDialogVisible = true;
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleSortChange({ prop, order }) {
      // 排序變化處理
      console.log("排序變化:", prop, order);
    },

    handleExpandChange(row, expanded) {
      // 展開/折疊處理
      console.log("行展開狀態變化:", row, expanded);
    },

    handleSubRowClick(subRow, parentRow) {
      // 子表格行點擊處理
      console.log("子表格行點擊:", subRow, parentRow);
    },

    async handleSavePreOrder(preorderData) {
      try {
        this.loading = true;
        if (preorderData.id) {
          // 更新
          await PreOrderService.updatePreOrder(preorderData);
          this.$message.success("訂單預購單更新成功");
        } else {
          // 新增
          await PreOrderService.createPreOrder(preorderData);
          this.$message.success("訂單預購單創建成功");
        }

        this.preorderDialogVisible = false;
        this.fetchPreOrderData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewPreOrderHistory(row) {
      this.activeTab = "preorder-history";
      this.fetchPreOrderHistoryData(row.id);
    },

    backToPreOrderList() {
      this.activeTab = "preorder-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.preorderHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.preorderTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.orderNumber
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

.preorder-management {
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

    .preorder-tabs {
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
  .preorder-management {
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
