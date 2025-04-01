<template>
  <div class="refund-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>退貨管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="refund-tabs">
        <!-- 退貨列表 -->
        <el-tab-pane label="退貨列表" name="refund-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="refundSearch"
                  :search-value="refundSearchQuery"
                  :time-value="refundDateRange"
                  :search-placeholder="'搜尋退貨單...'"
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
                ref="refundTable"
                :data="filteredRefundData"
                :columns="refundColumns"
                :sub-table-columns="refundDetailColumns"
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
                <template #column-refundDate="{ row }">
                  {{ formatDate(row.refundDate) }}
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

                <!-- 處理方式插槽 -->
                <template #column-processMethod="{ row }">
                  {{ getProcessMethodLabel(row.processMethod) }}
                </template>

                <!-- 換貨數量插槽（根據狀態顯示） -->
                <template #column-exchangeQuantity="{ row }">
                  <span v-if="showExchangeField(row.status, row.processMethod)">
                    {{ row.exchangeQuantity || 0 }}
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 退款金額插槽（根據狀態顯示） -->
                <template #column-refundAmount="{ row }">
                  <span v-if="showRefundField(row.status, row.processMethod)">
                    {{ formatCurrency(row.refundAmount) }}
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 備註欄位插槽 -->
                <template #column-remarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 子表格問題類型插槽 -->
                <template #sub-column-issueType="{ row }">
                  {{ getIssueTypeLabel(row.issueType) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯退貨單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看退貨單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewRefundHistory(row)"
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
                :columns="refundColumns"
                :sub-table-columns="refundDetailColumns"
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
                <template #column-refundDate="{ row }">
                  {{ formatDate(row.refundDate) }}
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

                <!-- 處理方式插槽 -->
                <template #column-processMethod="{ row }">
                  {{ getProcessMethodLabel(row.processMethod) }}
                </template>

                <!-- 換貨數量插槽（根據狀態顯示） -->
                <template #column-exchangeQuantity="{ row }">
                  <span v-if="showExchangeField(row.status, row.processMethod)">
                    {{ row.exchangeQuantity || 0 }}
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 退款金額插槽（根據狀態顯示） -->
                <template #column-refundAmount="{ row }">
                  <span v-if="showRefundField(row.status, row.processMethod)">
                    {{ formatCurrency(row.refundAmount) }}
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 備註欄位插槽 -->
                <template #column-remarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 子表格問題類型插槽 -->
                <template #sub-column-issueType="{ row }">
                  {{ getIssueTypeLabel(row.issueType) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯退貨單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看退貨單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewRefundHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 退貨單異動紀錄 -->
        <el-tab-pane label="退貨單異動紀錄" name="refund-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToRefundList"
                  >返回退貨列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="refundHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋退貨單異動...'"
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
            :data="filteredRefundHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'refund-history-export'"
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

    <!-- 備註時間線對話框 -->
    <remark-timeline-dialog
      :visible.sync="remarkDialogVisible"
      :remarks="currentRemarks"
      :order-id="currentOrderId"
      :order-info="currentOrderInfo"
      :has-more="hasMoreRemarks"
      :is-loading="loadingRemarks"
      @load-more="loadMoreRemarks"
      @add-remark="addRemark"
      @update-remark="updateRemark"
      @delete-remark="deleteRemark"
    />

    <!-- 退貨單詳情對話框 -->
    <refund-order-dialog
      :visible.sync="refundDialogVisible"
      :data="currentEditRow"
      :process-methods="processMethodOptions"
      :issue-types="issueTypeOptions"
      @save="handleSaveRefund"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import LatestRemarkPreview from "@/components/Remark/LatestRemarkPreview.vue";
import RemarkTimelineDialog from "@/components/Remark/RemarkTimelineDialog.vue";
import RefundOrderDialog from "./components/RefundOrderDialog.vue";
import { formatDate } from "@/utils/date";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import RefundService from "./services/RefundService.js";
import { statusOptions } from "@/constants/tableColumns";

export default {
  name: "RefundManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    LatestRemarkPreview,
    RemarkTimelineDialog,
    RefundOrderDialog
  },
  data() {
    return {
      activeTab: "refund-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 退貨列表相關數據
      refundData: [],
      allRefundData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      refundSearchQuery: "",
      refundDateRange: [],
      isFiltering: false,

      // 異動記錄相關數據
      refundHistoryData: [],
      allRefundHistoryData: [], // 儲存所有原始數據，用於重置篩選
      refundHistorySearchQuery: "",
      historyDateRange: [],
      currentRefundId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      refundDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,

      // 備註相關
      remarkDialogVisible: false,
      currentRemarks: [],
      currentOrderId: null,
      currentOrderInfo: {},
      hasMoreRemarks: false,
      loadingRemarks: false,
      allRemarks: {}, // 依照訂單ID存儲所有備註

      // 狀態選項
      statusOptions: [
        { value: "pending", label: "待處理", type: "warning" },
        { value: "processing", label: "處理中", type: "primary" },
        { value: "completed", label: "已完成", type: "success" },
        { value: "rejected", label: "已拒絕", type: "danger" }
      ],

      // 處理方式選項（已更新）
      processMethodOptions: [
        { value: "returnRefundFull", label: "退貨＋全額退款" },
        { value: "returnRefundPartial", label: "退貨＋部分退款" },
        { value: "returnExchange", label: "退貨＋換貨（不退款）" },
        { value: "returnExchangeRefundPartial", label: "退貨＋換貨＋部分退款" },
        { value: "returnNoCompensation", label: "退貨但不補償" },
        { value: "noReturnRefundFull", label: "不退貨＋全額退款" },
        { value: "noReturnRefundPartial", label: "不退貨＋部分退款" },
        { value: "noReturnExchange", label: "不退貨＋補寄商品" },
        {
          value: "noReturnExchangeRefundPartial",
          label: "不退貨＋補寄＋部分退款"
        },
        { value: "cancelBeforeShip", label: "出貨前取消訂單（全額退款）" },
        { value: "cancelAfterShip", label: "出貨後退貨＋取消訂單（全額退款）" }
      ],

      // 問題類型選項（新增）
      issueTypeOptions: [
        { value: "spoiled", label: "變質腐敗" },
        { value: "damaged", label: "包裝破損" },
        { value: "incorrectItem", label: "品項錯誤" },
        { value: "missingItem", label: "短少" },
        { value: "qualityIssue", label: "品質不良" },
        { value: "expired", label: "效期過短／過期" },
        { value: "others", label: "其他" }
      ],

      // 表格列配置（已更新）
      refundColumns: [
        { prop: "id", label: "退貨單單號", width: 120, sortable: true },
        { prop: "originalSalesId", label: "原始銷貨單", width: 150 },
        { prop: "customerName", label: "客戶名稱", width: 120 },
        { prop: "contactName", label: "聯絡人", width: 120 },
        { prop: "contactPhone", label: "聯絡電話", width: 120 },
        { prop: "paymentMethod", label: "付款方式", width: 120 },
        { prop: "refundDate", label: "退貨日期", width: 120, sortable: true },
        { prop: "status", label: "狀態", width: 100 },
        { prop: "processMethod", label: "處理方式", width: 150 },
        { prop: "exchangeQuantity", label: "換貨數量", width: 100 },
        { prop: "refundAmount", label: "退款金額", width: 120 },
        { prop: "totalAmount", label: "總金額", width: 120 },
        { prop: "remarks", label: "備註", minWidth: 300 }
      ],
      refundDetailColumns: [
        { prop: "productCode", label: "品號", width: 120 },
        { prop: "productName", label: "品名", width: 150 },
        { prop: "specification", label: "規格", width: 150 },
        { prop: "batchNumber", label: "批號", width: 120 },
        { prop: "quantity", label: "數量", width: 100 },
        { prop: "damageQuantity", label: "報損數量", width: 100 }, // 新增報損數量欄位
        { prop: "price", label: "單價", width: 100 },
        { prop: "subtotal", label: "小計", width: 120 },
        { prop: "issueType", label: "問題類型", width: 120 }
        // 移除了報損金額欄位
      ],
      historyColumns: [
        { prop: "timestamp", label: "時間", width: 160, sortable: true },
        { prop: "user", label: "操作人員", width: 120 },
        { prop: "type", label: "操作類型", width: 100 },
        { prop: "field", label: "變更欄位", width: 120 },
        { prop: "beforeValue", label: "變更前", minWidth: 200 },
        { prop: "afterValue", label: "變更後", minWidth: 200 }
      ]
    };
  },

  computed: {
    // 過濾後的退貨數據
    filteredRefundData() {
      return this.refundData;
    },

    // 過濾後的退貨異動記錄
    filteredRefundHistoryData() {
      return this.refundHistoryData;
    }
  },

  created() {
    this.fetchRefundData();
    this.fetchAllRemarks();
  },

  methods: {
    // 格式化方法
    formatDate,
    getTypeTag,
    getTypeLabel,

    // 格式化貨幣
    formatCurrency(value) {
      if (value === null || value === undefined) return "0";
      return Number(value).toLocaleString("zh-TW", {
        style: "currency",
        currency: "TWD",
        minimumFractionDigits: 0
      });
    },

    // 根據狀態和處理方式判斷是否顯示換貨數量欄位
    showExchangeField(status, processMethod) {
      // 在處理中或已完成狀態，且處理方式包含換貨的顯示換貨數量
      return (
        (status === "processing" || status === "completed") &&
        (processMethod === "returnExchange" ||
          processMethod === "returnExchangeRefundPartial" ||
          processMethod === "noReturnExchange" ||
          processMethod === "noReturnExchangeRefundPartial")
      );
    },

    // 根據狀態和處理方式判斷是否顯示退款金額欄位
    showRefundField(status, processMethod) {
      // 在處理中或已完成狀態，且處理方式包含退款的顯示退款金額
      return (
        (status === "processing" || status === "completed") &&
        (processMethod === "returnRefundFull" ||
          processMethod === "returnRefundPartial" ||
          processMethod === "returnExchangeRefundPartial" ||
          processMethod === "noReturnRefundFull" ||
          processMethod === "noReturnRefundPartial" ||
          processMethod === "noReturnExchangeRefundPartial" ||
          processMethod === "cancelBeforeShip" ||
          processMethod === "cancelAfterShip")
      );
    },

    // 獲取特定狀態的退貨單
    getStatusFilteredData(status) {
      return this.filteredRefundData.filter(refund => refund.status === status);
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

    // 獲取處理方式顯示文字
    getProcessMethodLabel(method) {
      const methodInfo = this.processMethodOptions.find(
        option => option.value === method
      );
      return methodInfo ? methodInfo.label : method;
    },

    // 獲取問題類型顯示文字
    getIssueTypeLabel(type) {
      const typeInfo = this.issueTypeOptions.find(
        option => option.value === type
      );
      return typeInfo ? typeInfo.label : type;
    },

    // 備註相關方法
    getLatestRemark(refundId) {
      if (
        !this.allRemarks[refundId] ||
        this.allRemarks[refundId].length === 0
      ) {
        return null;
      }
      return this.allRemarks[refundId][0]; // 假設已按時間排序，第一個是最新的
    },

    getRemarkCount(refundId) {
      if (!this.allRemarks[refundId]) {
        return 0;
      }
      return this.allRemarks[refundId].length;
    },

    openRemarkTimeline(row) {
      this.currentOrderId = row.id;
      this.currentOrderInfo = {
        orderNumber: row.id,
        customerName: row.customerName,
        contactPhone: row.contactPhone,
        extension: ""
      };

      // 如果已經有備註數據，則直接顯示
      if (this.allRemarks[row.id]) {
        this.currentRemarks = [...this.allRemarks[row.id]];
      } else {
        this.currentRemarks = [];
      }

      this.remarkDialogVisible = true;

      // 如果沒有備註數據，則加載
      if (!this.allRemarks[row.id] || this.allRemarks[row.id].length === 0) {
        this.loadRemarks(row.id);
      }
    },

    async fetchAllRemarks() {
      try {
        const response = await RefundService.getAllRemarkPreviews();
        this.allRemarks = response.data || {};
      } catch (error) {
        console.error("獲取備註預覽失敗:", error);
        this.$message.error("獲取備註預覽失敗: " + error.message);
      }
    },

    async loadRemarks(refundId) {
      this.loadingRemarks = true;
      try {
        const response = await RefundService.getRemarks(refundId);
        this.currentRemarks = response.data || [];
        this.allRemarks[refundId] = [...this.currentRemarks];
        this.hasMoreRemarks = response.hasMore || false;
      } catch (error) {
        console.error("獲取備註失敗:", error);
        this.$message.error("獲取備註失敗: " + error.message);
      } finally {
        this.loadingRemarks = false;
      }
    },

    loadMoreRemarks() {
      if (!this.currentOrderId || this.loadingRemarks) return;

      this.loadingRemarks = true;
      RefundService.getMoreRemarks(
        this.currentOrderId,
        this.currentRemarks.length
      )
        .then(response => {
          const newRemarks = response.data || [];
          this.currentRemarks = [...this.currentRemarks, ...newRemarks];
          this.hasMoreRemarks = response.hasMore || false;

          // 更新全局備註緩存
          this.allRemarks[this.currentOrderId] = [...this.currentRemarks];
        })
        .catch(error => {
          console.error("加載更多備註失敗:", error);
          this.$message.error("加載更多備註失敗: " + error.message);
        })
        .finally(() => {
          this.loadingRemarks = false;
        });
    },

    addRemark(remarkData) {
      RefundService.addRemark(remarkData)
        .then(response => {
          const newRemark = response.data;

          // 更新當前顯示的備註
          this.currentRemarks = [newRemark, ...this.currentRemarks];

          // 更新全局備註緩存
          if (!this.allRemarks[remarkData.orderId]) {
            this.allRemarks[remarkData.orderId] = [];
          }
          this.allRemarks[remarkData.orderId] = [
            newRemark,
            ...this.allRemarks[remarkData.orderId]
          ];

          this.$message.success("備註添加成功");
        })
        .catch(error => {
          console.error("添加備註失敗:", error);
          this.$message.error("添加備註失敗: " + error.message);
        });
    },

    updateRemark(remarkData) {
      RefundService.updateRemark(remarkData)
        .then(response => {
          const updatedRemark = response.data;

          // 更新當前顯示的備註
          const index = this.currentRemarks.findIndex(
            r => r.id === updatedRemark.id
          );
          if (index !== -1) {
            this.currentRemarks[index] = updatedRemark;
            this.currentRemarks = [...this.currentRemarks];
          }

          // 更新全局備註緩存
          if (this.allRemarks[this.currentOrderId]) {
            const cacheIndex = this.allRemarks[this.currentOrderId].findIndex(
              r => r.id === updatedRemark.id
            );
            if (cacheIndex !== -1) {
              this.allRemarks[this.currentOrderId][cacheIndex] = updatedRemark;
              this.allRemarks[this.currentOrderId] = [
                ...this.allRemarks[this.currentOrderId]
              ];
            }
          }

          this.$message.success("備註更新成功");
        })
        .catch(error => {
          console.error("更新備註失敗:", error);
          this.$message.error("更新備註失敗: " + error.message);
        });
    },

    deleteRemark(remarkData) {
      RefundService.deleteRemark(remarkData.id)
        .then(() => {
          // 更新當前顯示的備註
          this.currentRemarks = this.currentRemarks.filter(
            r => r.id !== remarkData.id
          );

          // 更新全局備註緩存
          if (this.allRemarks[this.currentOrderId]) {
            this.allRemarks[this.currentOrderId] = this.allRemarks[
              this.currentOrderId
            ].filter(r => r.id !== remarkData.id);
          }

          this.$message.success("備註刪除成功");
        })
        .catch(error => {
          console.error("刪除備註失敗:", error);
          this.$message.error("刪除備註失敗: " + error.message);
        });
    },

    // 退貨列表相關方法
    async fetchRefundData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await RefundService.getRefundList(queryParams);
        this.refundData = response.data || [];

        // 若是初次加載或重置篩選，則更新 allRefundData
        if (!params || !Object.keys(params).length) {
          this.allRefundData = [...this.refundData];
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取退貨數據失敗: " + error.message);
        this.refundData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    getQueryParams() {
      const params = {};

      if (this.refundDateRange && this.refundDateRange.length === 2) {
        params.startDate = formatDate(this.refundDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.refundDateRange[1], "YYYY-MM-DD");
      }

      if (this.refundSearchQuery) {
        params.search = this.refundSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.refundSearchQuery = searchParams.keyword || "";
      this.refundDateRange = searchParams.dateRange || [];

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
      this.fetchRefundData(params);
    },

    resetFilters() {
      this.refundSearchQuery = "";
      this.refundDateRange = [];
      if (this.$refs.refundSearch) {
        this.$refs.refundSearch.clear();
      }
      this.refundData = [...this.allRefundData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchRefundHistoryData(refundId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (refundId) {
          queryParams.refundId = refundId;
          this.showBackButton = true;
          this.currentRefundId = refundId;
          this.lastViewedRow = this.refundData.find(
            item => item.id === refundId
          );
        } else {
          this.showBackButton = false;
          this.currentRefundId = null;

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

          if (this.refundHistorySearchQuery) {
            queryParams.search = this.refundHistorySearchQuery;
          }
        }

        const response = await RefundService.getRefundHistory(queryParams);
        this.refundHistoryData = response.data || [];

        // 若是初次加載或特定退貨單的記錄，則更新 allRefundHistoryData
        if (refundId || !Object.keys(params || {}).length) {
          this.allRefundHistoryData = [...this.refundHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取退貨異動記錄失敗: " + error.message);
        this.refundHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.refundHistorySearchQuery = searchParams.keyword || "";
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

      if (this.refundHistorySearchQuery) {
        params.search = this.refundHistorySearchQuery;
      }

      if (this.currentRefundId) {
        params.refundId = this.currentRefundId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchRefundHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.refundHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.refundHistoryData = [...this.allRefundHistoryData];
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
      this.refundDialogVisible = true;
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

    async handleSaveRefund(refundData) {
      try {
        this.loading = true;
        const response = await RefundService.updateRefund(refundData);
        this.$message.success(response.message || "退貨單更新成功");
        this.refundDialogVisible = false;
        this.fetchRefundData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewRefundHistory(row) {
      this.activeTab = "refund-history";
      this.fetchRefundHistoryData(row.id);
    },

    backToRefundList() {
      this.activeTab = "refund-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.refundHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.refundTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.id
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

.refund-management {
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

    .refund-tabs {
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
  .refund-management {
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
