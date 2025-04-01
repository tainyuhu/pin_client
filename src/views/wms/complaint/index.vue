<template>
  <div class="complaint-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>客訴管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="complaint-tabs">
        <!-- 客訴列表 -->
        <el-tab-pane label="客訴列表" name="complaint-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="complaintSearch"
                  :search-value="complaintSearchQuery"
                  :time-value="complaintDateRange"
                  :search-placeholder="'搜尋客訴單...'"
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
                ref="complaintTable"
                :data="filteredComplaintData"
                :columns="complaintColumns"
                :sub-table-columns="complaintDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="productId"
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
                <template #column-createdDate="{ row }">
                  {{ formatDate(row.createdDate) }}
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

                <!-- 優先級別插槽 -->
                <template #column-priority="{ row }">
                  <el-tag
                    :type="getPriorityType(row.priority)"
                    size="small"
                    effect="dark"
                  >
                    {{ getPriorityLabel(row.priority) }}
                  </el-tag>
                </template>

                <!-- 客訴類型插槽 -->
                <template #column-complaintType="{ row }">
                  {{ getComplaintTypeLabel(row.complaintType) }}
                </template>

                <!-- 問題作業單狀態插槽 -->
                <template #column-issueTicketStatus="{ row }">
                  <span v-if="row.hasIssueTicket">
                    <el-tag
                      :type="getIssueTicketStatusType(row.issueTicketStatus)"
                      size="small"
                    >
                      {{ getIssueTicketStatusLabel(row.issueTicketStatus) }}
                    </el-tag>
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 照片數量插槽 -->
                <template #column-photoCount="{ row }">
                  <el-button
                    v-if="row.photoCount > 0"
                    type="text"
                    @click="viewPhotos(row)"
                  >
                    {{ row.photoCount }} 張照片
                  </el-button>
                  <span v-else>無照片</span>
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
                <template #sub-column-problemType="{ row }">
                  {{ getProblemTypeLabel(row.problemType) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯客訴單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看客訴單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewComplaintHistory(row)"
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
                :columns="complaintColumns"
                :sub-table-columns="complaintDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="productId"
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
                <template #column-createdDate="{ row }">
                  {{ formatDate(row.createdDate) }}
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

                <!-- 優先級別插槽 -->
                <template #column-priority="{ row }">
                  <el-tag
                    :type="getPriorityType(row.priority)"
                    size="small"
                    effect="dark"
                  >
                    {{ getPriorityLabel(row.priority) }}
                  </el-tag>
                </template>

                <!-- 客訴類型插槽 -->
                <template #column-complaintType="{ row }">
                  {{ getComplaintTypeLabel(row.complaintType) }}
                </template>

                <!-- 問題作業單狀態插槽 -->
                <template #column-issueTicketStatus="{ row }">
                  <span v-if="row.hasIssueTicket">
                    <el-tag
                      :type="getIssueTicketStatusType(row.issueTicketStatus)"
                      size="small"
                    >
                      {{ getIssueTicketStatusLabel(row.issueTicketStatus) }}
                    </el-tag>
                  </span>
                  <span v-else>-</span>
                </template>

                <!-- 照片數量插槽 -->
                <template #column-photoCount="{ row }">
                  <el-button
                    v-if="row.photoCount > 0"
                    type="text"
                    @click="viewPhotos(row)"
                  >
                    {{ row.photoCount }} 張照片
                  </el-button>
                  <span v-else>無照片</span>
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
                <template #sub-column-problemType="{ row }">
                  {{ getProblemTypeLabel(row.problemType) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯客訴單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看客訴單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewComplaintHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 客訴單異動紀錄 -->
        <el-tab-pane label="客訴單異動紀錄" name="complaint-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToComplaintList"
                  >返回客訴列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="complaintHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋客訴單異動...'"
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
            :data="filteredComplaintHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'complaint-history-export'"
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

    <!-- 照片查看對話框 -->
    <photo-viewer-dialog
      :visible.sync="photoDialogVisible"
      :photos="currentPhotos"
      :complaint-id="currentComplaintId"
      @add-photo="addPhoto"
      @delete-photo="deletePhoto"
    />

    <!-- 客訴單詳情對話框 -->
    <complaint-order-dialog
      :visible.sync="complaintDialogVisible"
      :data="currentEditRow"
      :complaint-types="complaintTypeOptions"
      :priority-options="priorityOptions"
      :problem-types="problemTypeOptions"
      @save="handleSaveComplaint"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import LatestRemarkPreview from "@/components/Remark/LatestRemarkPreview.vue";
import RemarkTimelineDialog from "@/components/Remark/RemarkTimelineDialog.vue";
import PhotoViewerDialog from "./components/PhotoViewerDialog.vue";
import ComplaintOrderDialog from "./components/ComplaintOrderDialog.vue";
import { formatDate } from "@/utils/date";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import ComplaintService from "./services/ComplaintService.js";

export default {
  name: "ComplaintManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    LatestRemarkPreview,
    RemarkTimelineDialog,
    PhotoViewerDialog,
    ComplaintOrderDialog
  },
  data() {
    return {
      activeTab: "complaint-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 客訴列表相關數據
      complaintData: [],
      allComplaintData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      complaintSearchQuery: "",
      complaintDateRange: [],
      isFiltering: false,

      // 異動記錄相關數據
      complaintHistoryData: [],
      allComplaintHistoryData: [], // 儲存所有原始數據，用於重置篩選
      complaintHistorySearchQuery: "",
      historyDateRange: [],
      currentComplaintId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      complaintDialogVisible: false,
      photoDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,
      currentPhotos: [],

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
        { value: "new", label: "新建立", type: "info" },
        { value: "processing", label: "處理中", type: "warning" },
        { value: "resolved", label: "已解決", type: "success" },
        { value: "closed", label: "已關閉", type: "primary" },
        { value: "escalated", label: "已升級", type: "danger" }
      ],

      // 優先級別選項
      priorityOptions: [
        { value: "high", label: "高", type: "danger" },
        { value: "medium", label: "中", type: "warning" },
        { value: "low", label: "低", type: "info" }
      ],

      // 客訴類型選項
      complaintTypeOptions: [
        { value: "productQuality", label: "商品品質問題" },
        { value: "productDamage", label: "商品損壞" },
        { value: "productShortage", label: "商品短缺" },
        { value: "wrongProduct", label: "錯誤商品" },
        { value: "deliveryDelay", label: "配送延遲" },
        { value: "deliveryDamage", label: "配送過程損壞" },
        { value: "customerService", label: "客戶服務問題" },
        { value: "billing", label: "帳單問題" },
        { value: "returnRefund", label: "退貨退款問題" },
        { value: "others", label: "其他" }
      ],

      // 問題類型選項
      problemTypeOptions: [
        { value: "defective", label: "產品瑕疵" },
        { value: "damaged", label: "產品損壞" },
        { value: "incomplete", label: "產品不完整" },
        { value: "wrongSpecs", label: "規格不符" },
        { value: "expired", label: "過期產品" },
        { value: "allergicReaction", label: "過敏反應" },
        { value: "functionalIssue", label: "功能問題" },
        { value: "others", label: "其他" }
      ],

      // 問題作業單狀態選項
      issueTicketStatusOptions: [
        { value: "new", label: "新建立", type: "info" },
        { value: "inProgress", label: "進行中", type: "warning" },
        { value: "resolved", label: "已解決", type: "success" },
        { value: "closed", label: "已關閉", type: "primary" }
      ],

      // 表格列配置
      complaintColumns: [
        { prop: "id", label: "客訴單號", width: 120, sortable: true },
        { prop: "relatedOrderId", label: "相關訂單編號", width: 150 },
        { prop: "customerName", label: "客戶名稱", width: 120 },
        { prop: "contactName", label: "聯絡人", width: 120 },
        { prop: "contactPhone", label: "聯絡電話", width: 120 },
        { prop: "createdDate", label: "建立日期", width: 120, sortable: true },
        { prop: "status", label: "處理狀態", width: 100 },
        { prop: "priority", label: "優先級別", width: 90 },
        { prop: "complaintType", label: "客訴類型", width: 150 },
        { prop: "assignedTo", label: "處理人員", width: 100 },
        {
          prop: "hasIssueTicket",
          label: "問題作業單",
          width: 100,
          formatter: row => (row.hasIssueTicket ? "是" : "否")
        },
        { prop: "issueTicketId", label: "作業單編號", width: 120 },
        { prop: "issueTicketStatus", label: "作業單狀態", width: 120 },
        { prop: "photoCount", label: "照片", width: 80 },
        { prop: "remarks", label: "備註", minWidth: 300 }
      ],
      complaintDetailColumns: [
        { prop: "productId", label: "產品ID/品號", width: 120 },
        { prop: "productName", label: "產品名稱", width: 150 },
        { prop: "specification", label: "產品規格", width: 150 },
        { prop: "productType", label: "產品類型", width: 120 },
        { prop: "problemType", label: "問題類型", width: 120 },
        { prop: "problemQuantity", label: "問題數量", width: 100 },
        { prop: "problemDescription", label: "詳細問題描述", minWidth: 250 }
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
    // 過濾後的客訴數據
    filteredComplaintData() {
      return this.complaintData;
    },

    // 過濾後的客訴異動記錄
    filteredComplaintHistoryData() {
      return this.complaintHistoryData;
    }
  },

  created() {
    this.fetchComplaintData();
    this.fetchAllRemarks();
  },

  methods: {
    // 格式化方法
    formatDate,
    getTypeTag,
    getTypeLabel,

    // 優先級別相關方法
    getPriorityType(priority) {
      const priorityInfo = this.priorityOptions.find(
        option => option.value === priority
      );
      return priorityInfo ? priorityInfo.type : "info";
    },

    getPriorityLabel(priority) {
      const priorityInfo = this.priorityOptions.find(
        option => option.value === priority
      );
      return priorityInfo ? priorityInfo.label : priority;
    },

    // 狀態相關方法
    getStatusType(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    getStatusLabel(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 客訴類型相關方法
    getComplaintTypeLabel(type) {
      const typeInfo = this.complaintTypeOptions.find(
        option => option.value === type
      );
      return typeInfo ? typeInfo.label : type;
    },

    // 問題類型相關方法
    getProblemTypeLabel(type) {
      const typeInfo = this.problemTypeOptions.find(
        option => option.value === type
      );
      return typeInfo ? typeInfo.label : type;
    },

    // 問題作業單狀態相關方法
    getIssueTicketStatusType(status) {
      const statusInfo = this.issueTicketStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    getIssueTicketStatusLabel(status) {
      const statusInfo = this.issueTicketStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 獲取特定狀態的客訴單
    getStatusFilteredData(status) {
      return this.filteredComplaintData.filter(
        complaint => complaint.status === status
      );
    },

    // 備註相關方法
    getLatestRemark(complaintId) {
      if (
        !this.allRemarks[complaintId] ||
        this.allRemarks[complaintId].length === 0
      ) {
        return null;
      }
      return this.allRemarks[complaintId][0]; // 假設已按時間排序，第一個是最新的
    },

    getRemarkCount(complaintId) {
      if (!this.allRemarks[complaintId]) {
        return 0;
      }
      return this.allRemarks[complaintId].length;
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

    // 照片查看相關方法
    viewPhotos(row) {
      this.currentComplaintId = row.id;
      this.loadPhotos(row.id);
      this.photoDialogVisible = true;
    },

    async loadPhotos(complaintId) {
      try {
        const response = await ComplaintService.getPhotos(complaintId);
        this.currentPhotos = response.data || [];
      } catch (error) {
        console.error("獲取照片失敗:", error);
        this.$message.error("獲取照片失敗: " + error.message);
        this.currentPhotos = [];
      }
    },

    addPhoto(photoData) {
      ComplaintService.addPhoto(photoData)
        .then(response => {
          const newPhoto = response.data;
          this.currentPhotos.push(newPhoto);
          this.$message.success("照片添加成功");

          // 更新照片數量
          const index = this.complaintData.findIndex(
            item => item.id === this.currentComplaintId
          );
          if (index !== -1) {
            this.complaintData[index].photoCount += 1;
          }
        })
        .catch(error => {
          console.error("添加照片失敗:", error);
          this.$message.error("添加照片失敗: " + error.message);
        });
    },

    deletePhoto(photoId) {
      ComplaintService.deletePhoto(photoId)
        .then(() => {
          const index = this.currentPhotos.findIndex(
            photo => photo.id === photoId
          );
          if (index !== -1) {
            this.currentPhotos.splice(index, 1);
          }
          this.$message.success("照片刪除成功");

          // 更新照片數量
          const complaintIndex = this.complaintData.findIndex(
            item => item.id === this.currentComplaintId
          );
          if (
            complaintIndex !== -1 &&
            this.complaintData[complaintIndex].photoCount > 0
          ) {
            this.complaintData[complaintIndex].photoCount -= 1;
          }
        })
        .catch(error => {
          console.error("刪除照片失敗:", error);
          this.$message.error("刪除照片失敗: " + error.message);
        });
    },

    async fetchAllRemarks() {
      try {
        const response = await ComplaintService.getAllRemarkPreviews();
        this.allRemarks = response.data || {};
      } catch (error) {
        console.error("獲取備註預覽失敗:", error);
        this.$message.error("獲取備註預覽失敗: " + error.message);
      }
    },

    async loadRemarks(complaintId) {
      this.loadingRemarks = true;
      try {
        const response = await ComplaintService.getRemarks(complaintId);
        this.currentRemarks = response.data || [];
        this.allRemarks[complaintId] = [...this.currentRemarks];
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
      ComplaintService.getMoreRemarks(
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
      ComplaintService.addRemark(remarkData)
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
      ComplaintService.updateRemark(remarkData)
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
      ComplaintService.deleteRemark(remarkData.id)
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

    // 客訴列表相關方法
    async fetchComplaintData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await ComplaintService.getComplaintList(queryParams);
        this.complaintData = response.data || [];

        // 若是初次加載或重置篩選，則更新 allComplaintData
        if (!params || !Object.keys(params).length) {
          this.allComplaintData = [...this.complaintData];
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取客訴數據失敗: " + error.message);
        this.complaintData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    getQueryParams() {
      const params = {};

      if (this.complaintDateRange && this.complaintDateRange.length === 2) {
        params.startDate = formatDate(this.complaintDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.complaintDateRange[1], "YYYY-MM-DD");
      }

      if (this.complaintSearchQuery) {
        params.search = this.complaintSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.complaintSearchQuery = searchParams.keyword || "";
      this.complaintDateRange = searchParams.dateRange || [];

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
      this.fetchComplaintData(params);
    },

    resetFilters() {
      this.complaintSearchQuery = "";
      this.complaintDateRange = [];
      if (this.$refs.complaintSearch) {
        this.$refs.complaintSearch.clear();
      }
      this.complaintData = [...this.allComplaintData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchComplaintHistoryData(complaintId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (complaintId) {
          queryParams.complaintId = complaintId;
          this.showBackButton = true;
          this.currentComplaintId = complaintId;
          this.lastViewedRow = this.complaintData.find(
            item => item.id === complaintId
          );
        } else {
          this.showBackButton = false;
          this.currentComplaintId = null;

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

          if (this.complaintHistorySearchQuery) {
            queryParams.search = this.complaintHistorySearchQuery;
          }
        }

        const response = await ComplaintService.getComplaintHistory(
          queryParams
        );
        this.complaintHistoryData = response.data || [];

        // 若是初次加載或特定客訴單的記錄，則更新 allComplaintHistoryData
        if (complaintId || !Object.keys(params || {}).length) {
          this.allComplaintHistoryData = [...this.complaintHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取客訴異動記錄失敗: " + error.message);
        this.complaintHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.complaintHistorySearchQuery = searchParams.keyword || "";
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

      if (this.complaintHistorySearchQuery) {
        params.search = this.complaintHistorySearchQuery;
      }

      if (this.currentComplaintId) {
        params.complaintId = this.currentComplaintId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchComplaintHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.complaintHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.complaintHistoryData = [...this.allComplaintHistoryData];
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
      this.complaintDialogVisible = true;
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

    async handleSaveComplaint(complaintData) {
      try {
        this.loading = true;
        const response = await ComplaintService.updateComplaint(complaintData);
        this.$message.success(response.message || "客訴單更新成功");
        this.complaintDialogVisible = false;
        this.fetchComplaintData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewComplaintHistory(row) {
      this.activeTab = "complaint-history";
      this.fetchComplaintHistoryData(row.id);
    },

    backToComplaintList() {
      this.activeTab = "complaint-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.complaintHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.complaintTable;
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

.complaint-management {
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

    .complaint-tabs {
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

  // 照片查看器樣式
  .photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-top: 16px;

    .photo-item {
      position: relative;
      border-radius: $border-radius;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: $transition;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        .photo-actions {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
      }

      .photo-info {
        padding: 8px;
        background: white;
        font-size: 14px;
      }

      .photo-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: $transition;
        display: flex;
        gap: 8px;

        .el-button {
          padding: 6px;
          height: auto;
          width: auto;
          min-width: auto;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  // 客訴詳情樣式
  .complaint-details {
    .detail-section {
      margin-bottom: 24px;

      .section-title {
        font-size: $font-size-lg;
        margin-bottom: 16px;
        position: relative;
        padding-left: 12px;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          background: $primary-color;
          border-radius: 2px;
        }
      }

      .detail-form {
        background: #f9f9f9;
        padding: 16px;
        border-radius: $border-radius;
      }

      .upload-area {
        border: 2px dashed #d9d9d9;
        border-radius: $border-radius;
        padding: 20px;
        text-align: center;
        background: #fafafa;
        transition: $transition;

        &:hover {
          border-color: $primary-color;
        }

        .upload-icon {
          font-size: 48px;
          color: #d9d9d9;
          margin-bottom: 8px;
        }

        .upload-text {
          color: #606266;
          margin-bottom: 8px;
        }
      }
    }
  }

  // 備註時間線樣式
  .remark-timeline {
    .timeline-item {
      padding: 16px;
      border-radius: $border-radius;
      background: #f9f9f9;
      margin-bottom: 16px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        left: -16px;
        top: 24px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $primary-color;
      }

      .timeline-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .user-info {
          font-weight: 500;
        }

        .timeline-time {
          color: #909399;
          font-size: 14px;
        }
      }

      .timeline-content {
        line-height: 1.6;
      }

      .timeline-actions {
        margin-top: 8px;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .complaint-management {
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

    .photo-gallery {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));

      .photo-item {
        img {
          height: 140px;
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

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
