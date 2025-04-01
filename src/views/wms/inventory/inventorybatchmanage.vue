<template>
  <div class="inventory-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>庫存批號管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="inventory-tabs">
        <!-- 批號列表 -->
        <el-tab-pane label="庫存批號列表" name="batch-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="batchSearch"
                  :search-value="batchSearchQuery"
                  :time-value="batchDateRange"
                  :search-placeholder="'搜尋批號、品號...'"
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
                ref="batchTable"
                :data="filteredBatchData"
                :columns="batchColumns"
                :sub-table-columns="batchDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="id"
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
                <template #column-expiryDate="{ row }">
                  {{ formatDate(row.expiryDate) }}
                </template>

                <template #column-daysToExpiry="{ row }">
                  <span :class="getExpiryClass(row.daysToExpiry)">
                    {{ row.daysToExpiry }} 天
                  </span>
                </template>

                <template #column-state="{ row }">
                  <el-tag
                    :type="getStatusType(row.state)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.state) }}
                  </el-tag>
                </template>

                <!-- 子表格插槽 - 顯示過濾後的詳情 -->
                <template #expanded="{ row }">
                  <div
                    v-if="
                      !row.loadingDetails &&
                        row.filteredDetails &&
                        row.filteredDetails.length > 0
                    "
                  >
                    <h4 class="expanded-title">數量相關異動記錄</h4>
                    <el-table
                      :data="row.filteredDetails"
                      border
                      style="width: 100%"
                      size="small"
                    >
                      <el-table-column
                        v-for="column in batchDetailColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                      >
                        <template slot-scope="scope">
                          <template v-if="column.prop === 'type'">
                            <el-tag
                              :type="
                                scope.row.recordType === 'field'
                                  ? 'info'
                                  : getTypeTag(scope.row.type)
                              "
                              size="mini"
                              effect="dark"
                            >
                              {{
                                scope.row.recordType === "field"
                                  ? scope.row.type === "create"
                                    ? "創建"
                                    : scope.row.type === "update"
                                    ? "更新"
                                    : "刪除"
                                  : getTypeLabel(scope.row.type)
                              }}
                            </el-tag>
                          </template>
                          <template v-else-if="column.prop === 'quantity'">
                            <span
                              v-if="scope.row.recordType === 'inventory'"
                              :class="
                                scope.row.quantity > 0
                                  ? 'text-success'
                                  : 'text-danger'
                              "
                            >
                              {{ scope.row.quantity > 0 ? "+" : ""
                              }}{{ scope.row.quantity }}
                            </span>
                            <span v-else class="text-info">
                              {{ scope.row.field }}變更
                            </span>
                          </template>
                          <template v-else-if="column.prop === 'beforeQty'">
                            <span v-if="scope.row.recordType === 'inventory'">
                              {{ scope.row.beforeQty }}
                            </span>
                            <span v-else class="text-danger">
                              {{ scope.row.beforeValue || "-" }}
                            </span>
                          </template>
                          <template v-else-if="column.prop === 'afterQty'">
                            <span v-if="scope.row.recordType === 'inventory'">
                              {{ scope.row.afterQty }}
                            </span>
                            <span v-else class="text-success">
                              {{ scope.row.afterValue || "-" }}
                            </span>
                          </template>
                          <template v-else>
                            {{ scope.row[column.prop] }}
                          </template>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div v-else-if="row.loadingDetails" class="expanded-loading">
                    <el-skeleton :rows="3" animated />
                  </div>
                  <div v-else class="expanded-empty">
                    <el-empty
                      description="暫無數量相關異動記錄"
                      :image-size="80"
                    ></el-empty>
                  </div>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯批號資料" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看批號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewBatchHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>

            <!-- 按狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in statusOptions"
              :key="status.value"
              :name="status.value"
              :label="status.label"
            >
              <data-table
                :data="getStatusFilteredData(status.value)"
                :columns="batchColumns"
                :sub-table-columns="batchDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="id"
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
                <template #column-expiryDate="{ row }">
                  {{ formatDate(row.expiryDate) }}
                </template>

                <template #column-daysToExpiry="{ row }">
                  <span :class="getExpiryClass(row.daysToExpiry)">
                    {{ row.daysToExpiry }} 天
                  </span>
                </template>

                <template #column-state="{ row }">
                  <el-tag
                    :type="getStatusType(row.state)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.state) }}
                  </el-tag>
                </template>

                <!-- 子表格插槽 - 顯示過濾後的詳情 -->
                <template #expanded="{ row }">
                  <div
                    v-if="
                      !row.loadingDetails &&
                        row.filteredDetails &&
                        row.filteredDetails.length > 0
                    "
                  >
                    <h4 class="expanded-title">數量相關異動記錄</h4>
                    <el-table
                      :data="row.filteredDetails"
                      border
                      style="width: 100%"
                      size="small"
                    >
                      <el-table-column
                        v-for="column in batchDetailColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                      >
                        <template slot-scope="scope">
                          <template v-if="column.prop === 'type'">
                            <el-tag
                              :type="
                                scope.row.recordType === 'field'
                                  ? 'info'
                                  : getTypeTag(scope.row.type)
                              "
                              size="mini"
                              effect="dark"
                            >
                              {{
                                scope.row.recordType === "field"
                                  ? scope.row.type === "create"
                                    ? "創建"
                                    : scope.row.type === "update"
                                    ? "更新"
                                    : "刪除"
                                  : getTypeLabel(scope.row.type)
                              }}
                            </el-tag>
                          </template>
                          <template v-else-if="column.prop === 'quantity'">
                            <span
                              v-if="scope.row.recordType === 'inventory'"
                              :class="
                                scope.row.quantity > 0
                                  ? 'text-success'
                                  : 'text-danger'
                              "
                            >
                              {{ scope.row.quantity > 0 ? "+" : ""
                              }}{{ scope.row.quantity }}
                            </span>
                            <span v-else class="text-info">
                              {{ scope.row.field }}變更
                            </span>
                          </template>
                          <template v-else-if="column.prop === 'beforeQty'">
                            <span v-if="scope.row.recordType === 'inventory'">
                              {{ scope.row.beforeQty }}
                            </span>
                            <span v-else class="text-danger">
                              {{ scope.row.beforeValue || "-" }}
                            </span>
                          </template>
                          <template v-else-if="column.prop === 'afterQty'">
                            <span v-if="scope.row.recordType === 'inventory'">
                              {{ scope.row.afterQty }}
                            </span>
                            <span v-else class="text-success">
                              {{ scope.row.afterValue || "-" }}
                            </span>
                          </template>
                          <template v-else>
                            {{ scope.row[column.prop] }}
                          </template>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div v-else-if="row.loadingDetails" class="expanded-loading">
                    <el-skeleton :rows="3" animated />
                  </div>
                  <div v-else class="expanded-empty">
                    <el-empty
                      description="暫無數量相關異動記錄"
                      :image-size="80"
                    ></el-empty>
                  </div>
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯批號資料" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看批號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewBatchHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 批號異動紀錄 -->
        <el-tab-pane label="庫存批號異動紀錄" name="batch-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToBatchList"
                  >返回批號列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="batchHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋批號異動...'"
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
            :data="filteredBatchHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'batch-history-export'"
            border
            row-key="id"
          >
            <!-- 自訂列格式插槽 -->
            <template #column-type="{ row }">
              <el-tag
                :type="
                  row.recordType === 'field' ? 'info' : getTypeTag(row.type)
                "
                size="small"
                effect="dark"
              >
                {{
                  row.recordType === "field"
                    ? row.type === "create"
                      ? "創建"
                      : row.type === "update"
                      ? "更新"
                      : "刪除"
                    : getTypeLabel(row.type)
                }}
              </el-tag>
            </template>

            <template #column-quantity="{ row }">
              <span
                v-if="row.recordType === 'inventory'"
                :class="row.quantity > 0 ? 'text-success' : 'text-danger'"
              >
                {{ row.quantity > 0 ? "+" : "" }}{{ row.quantity }}
              </span>
              <span v-else class="text-info"> {{ row.field }}變更 </span>
            </template>

            <template #column-beforeQty="{ row }">
              <span v-if="row.recordType === 'inventory'">
                {{ row.beforeQty }}
              </span>
              <span v-else class="text-danger">
                {{ row.beforeValue || "-" }}
              </span>
            </template>

            <template #column-afterQty="{ row }">
              <span v-if="row.recordType === 'inventory'">
                {{ row.afterQty }}
              </span>
              <span v-else class="text-success">
                {{ row.afterValue || "-" }}
              </span>
            </template>
          </base-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 對話框組件 -->
    <!-- <BatchDialog
      :visible.sync="batchDialogVisible"
      :data="currentEditRow"
      @save="handleSaveBatch"
    /> -->
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
// import BatchDialog from "./components/BatchDialog.vue";
import { formatDate } from "@/utils/date";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import InventoryService from "./services/InventoryService";
import { inventorysColumns } from "@/constants/tableColumns";

export default {
  name: "InventoryBatchManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable
    // BatchDialog
  },
  data() {
    return {
      activeTab: "batch-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 批號列表相關數據
      batchData: [],
      allBatchData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      batchSearchQuery: "",
      batchDateRange: [],
      isFiltering: false,

      // 異動記錄相關數據
      batchHistoryData: [],
      allBatchHistoryData: [], // 儲存所有原始數據，用於重置篩選
      batchHistorySearchQuery: "",
      historyDateRange: [],
      currentBatchId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      batchDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,

      // 狀態選項
      statusOptions: [
        { value: "normal", label: "正常", type: "success" },
        { value: "low", label: "低於安全存量", type: "warning" },
        { value: "expired", label: "已過期", type: "danger" },
        { value: "near_expiry", label: "即將過期", type: "warning" },
        { value: "empty", label: "無庫存", type: "info" }
      ],

      // 表格列配置
      batchColumns: inventorysColumns.batch,
      batchDetailColumns: inventorysColumns.fieldHistory,
      historyColumns: inventorysColumns.history,

      // 詳細信息加載狀態和緩存
      detailsLoadedMap: {}, // 追蹤哪些批號已經加載過詳細信息
      detailsCache: {}, // 緩存每個批號的詳細信息
      expandedRows: new Set(), // 跟蹤當前已展開的行

      // 批次處理配置
      batchSize: 5, // 每批處理的記錄數
      preloadCount: 10 // 預加載的記錄數
    };
  },

  computed: {
    // 過濾後的批號數據
    filteredBatchData() {
      return this.batchData;
    },

    // 過濾後的批號異動記錄
    filteredBatchHistoryData() {
      return this.batchHistoryData;
    }
  },

  created() {
    this.fetchBatchData();
  },

  methods: {
    // 格式化方法
    formatDate,
    getTypeTag,
    getTypeLabel,

    // 獲取特定狀態的批號資料
    getStatusFilteredData(status) {
      return this.filteredBatchData.filter(batch => batch.state === status);
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

    // 獲取效期天數的樣式
    getExpiryClass(days) {
      if (days <= 0) return "text-danger";
      if (days <= 30) return "text-warning";
      if (days <= 90) return "text-warning";
      return "text-success";
    },

    // 批號列表相關方法
    async fetchBatchData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();

        // 使用新的 getAllBatchList 方法獲取批號數據
        const response = await InventoryService.getAllBatchList(queryParams);
        let batchData = response.data || [];

        // 初始化每條記錄的詳細信息狀態
        batchData.forEach(item => {
          // 為每條記錄添加初始詳細信息狀態
          this.$set(item, "loadingDetails", false); // 詳細信息加載狀態
          this.$set(item, "filteredDetails", []); // 過濾後的詳細信息（只顯示數量相關）

          // 如果緩存中已有該批號的詳細信息，則直接使用
          if (this.detailsCache[item.id]) {
            this.$set(item, "details", this.detailsCache[item.id].allDetails);
            this.$set(
              item,
              "filteredDetails",
              this.detailsCache[item.id].filteredDetails
            );
          } else {
            this.$set(item, "details", []); // 初始化為空數組
          }
        });

        this.batchData = batchData;

        // 若是初次加載或重置篩選，則更新 allBatchData
        if (!params || !Object.keys(params).length) {
          this.allBatchData = JSON.parse(JSON.stringify(this.batchData));
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }

        // 預加載前N條記錄的詳細信息，提前準備好展開數據
        this.preloadBatchDetails();
      } catch (error) {
        this.$message.error("獲取批號數據失敗: " + error.message);
        this.batchData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 預加載部分批號詳細信息
    preloadBatchDetails() {
      // 只預加載當前頁的前幾條記錄，減少初始負擔
      const preloadLimit = Math.min(this.preloadCount, this.batchData.length);

      // 創建限流的加載隊列，避免同時發起太多請求
      const loadQueue = this.batchData.slice(0, preloadLimit);

      // 分批處理預加載請求
      const processBatch = async startIndex => {
        if (startIndex >= loadQueue.length) return;

        const endIndex = Math.min(
          startIndex + this.batchSize,
          loadQueue.length
        );
        const currentBatch = loadQueue.slice(startIndex, endIndex);

        // 同時處理當前批次的記錄
        await Promise.all(
          currentBatch.map(item => this.loadRowDetails(item, true))
        );

        // 處理下一批
        setTimeout(() => {
          processBatch(endIndex);
        }, 100); // 每批之間稍微延遲，避免阻塞UI
      };

      // 開始處理第一批
      processBatch(0);
    },

    // 加載行詳細信息
    async loadRowDetails(row, isPreload = false) {
      // 已經加載過或正在加載中，則跳過
      if (this.detailsLoadedMap[row.id] || row.loadingDetails) {
        return;
      }

      // 設置加載狀態
      this.$set(row, "loadingDetails", true);

      try {
        // 獲取詳細字段異動記錄
        const fieldHistory = await InventoryService.generateMockFieldHistory({
          productCode: row.productCode,
          batchNumber: row.batchNumber
        });

        // 過濾出數量相關的記錄
        const filteredDetails = this.filterQuantityRelatedRecords(fieldHistory);

        // 更新記錄和緩存
        this.$set(row, "details", fieldHistory);
        this.$set(row, "filteredDetails", filteredDetails);
        this.detailsLoadedMap[row.id] = true;

        // 存入緩存
        this.detailsCache[row.id] = {
          allDetails: fieldHistory,
          filteredDetails: filteredDetails
        };
      } catch (error) {
        console.error(`加載 ${row.batchNumber} 的詳細資料失敗:`, error);
        this.$set(row, "details", []);
        this.$set(row, "filteredDetails", []);
      } finally {
        this.$set(row, "loadingDetails", false);
      }
    },

    // 過濾只與總數量相關的記錄
    filterQuantityRelatedRecords(records) {
      return records.filter(item => {
        // 保留所有庫存異動記錄類型（如入庫、出庫等）
        if (item.recordType === "inventory") {
          return true; // 庫存進出本身就是數量變更
        }

        // 對於欄位異動記錄，只保留總數量(quantity)欄位的變更
        if (item.recordType === "field") {
          return item.field === "quantity"; // 只顯示總數量欄位的變更
        }

        return false;
      });
    },

    getQueryParams() {
      const params = {};

      if (this.batchDateRange && this.batchDateRange.length === 2) {
        params.startDate = formatDate(this.batchDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.batchDateRange[1], "YYYY-MM-DD");
      }

      if (this.batchSearchQuery) {
        params.search = this.batchSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.batchSearchQuery = searchParams.keyword || "";
      this.batchDateRange = searchParams.dateRange || [];

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
      this.fetchBatchData(params);
    },

    resetFilters() {
      this.batchSearchQuery = "";
      this.batchDateRange = [];
      if (this.$refs.batchSearch) {
        this.$refs.batchSearch.clear();
      }
      this.batchData = [...this.allBatchData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchBatchHistoryData(batchId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (batchId) {
          console.log(`獲取批號ID ${batchId} 的異動記錄`);
          queryParams.batchId = batchId;
          this.showBackButton = true;
          this.currentBatchId = batchId;
          this.lastViewedRow = this.batchData.find(item => item.id === batchId);

          // 確保 lastViewedRow 有值
          if (this.lastViewedRow) {
            console.log(`找到批號: ${this.lastViewedRow.batchNumber}`);
          } else {
            console.warn(`未在當前數據中找到批號ID: ${batchId}`);
          }
        } else {
          this.showBackButton = false;
          this.currentBatchId = null;

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

          if (this.batchHistorySearchQuery) {
            queryParams.search = this.batchHistorySearchQuery;
          }
        }

        console.log("查詢批號異動記錄參數:", queryParams);
        const response = await InventoryService.getBatchHistory(queryParams);

        if (response.success) {
          console.log(`獲取到 ${response.data.length} 條批號異動記錄`);
          this.batchHistoryData = response.data || [];
        } else {
          console.error("獲取批號異動記錄失敗:", response.message);
          this.batchHistoryData = [];
        }

        // 若是初次加載或特定批號的記錄，則更新 allBatchHistoryData
        if (batchId || !Object.keys(params || {}).length) {
          this.allBatchHistoryData = [...this.batchHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        console.error("獲取批號異動記錄失敗:", error);
        this.$message.error("獲取批號異動記錄失敗: " + error.message);
        this.batchHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.batchHistorySearchQuery = searchParams.keyword || "";
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

      if (this.batchHistorySearchQuery) {
        params.search = this.batchHistorySearchQuery;
      }

      if (this.currentBatchId) {
        params.batchId = this.currentBatchId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchBatchHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.batchHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.batchHistoryData = [...this.allBatchHistoryData];
      this.isHistoryFiltering = false;
      this.lastHistorySearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置異動記錄篩選條件");
    },

    handleEdit(row) {
      this.currentEditRow = JSON.parse(JSON.stringify(row));
      this.batchDialogVisible = true;
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

      // 更新展開狀態並載入詳細資料
      if (expanded) {
        this.expandedRows.add(row.id);
        // 如果尚未加載詳細信息，則進行加載
        if (!this.detailsLoadedMap[row.id]) {
          this.loadRowDetails(row);
        }
      } else {
        this.expandedRows.delete(row.id);
      }
    },

    handleSubRowClick(subRow, parentRow) {
      // 子表格行點擊處理
      console.log("子表格行點擊:", subRow, parentRow);
    },

    async handleSaveBatch(batchData) {
      try {
        this.loading = true;
        if (batchData.id) {
          // 更新
          await InventoryService.updateBatch(batchData);
          this.$message.success("批號資料更新成功");
        } else {
          // 新增
          await InventoryService.createBatch(batchData);
          this.$message.success("批號資料創建成功");
        }

        this.batchDialogVisible = false;
        this.fetchBatchData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewBatchHistory(row) {
      console.log("查看批號異動記錄:", row);
      this.activeTab = "batch-history";
      this.currentBatchId = row.id;
      this.lastViewedRow = row;
      this.fetchBatchHistoryData(row.id);
    },

    backToBatchList() {
      this.activeTab = "batch-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.batchHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.batchTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.batchNumber
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
  .text-info {
    color: #909399;
  }

  // 高亮效果
  .highlight-row {
    background-color: rgba($primary-color, 0.1);
    transition: background-color 0.5s ease;
  }

  // 展開區域樣式
  .expanded-title {
    padding: 12px 16px;
    font-size: 16px;
    margin: 0;
    border-bottom: 1px solid #ebeef5;
    background-color: #f8f9fb;
  }

  .expanded-loading {
    padding: 20px;
  }

  .expanded-empty {
    padding: 30px 0;
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
