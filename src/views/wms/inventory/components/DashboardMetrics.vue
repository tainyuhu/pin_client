<template>
  <div class="dashboard-container">
    <!-- 儀表板標題區塊 -->
    <div class="dashboard-header">
      <div class="title">
        <i class="el-icon-data-analysis"></i>
        儀表板
      </div>
      <div class="controls">
        <el-button type="text" @click="toggleCollapse">
          <i
            :class="isCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
          ></i>
        </el-button>
      </div>
    </div>

    <!-- 儀表板內容區塊 -->
    <div class="dashboard-content" v-show="!isCollapsed">
      <el-row :gutter="20" class="metrics-cards">
        <!-- 總庫存商品數 -->
        <el-col :xs="12" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="metric-card primary"
            @click.native="handleCardClick('primary')"
          >
            <div class="metric-header">
              <div class="metric-icon">
                <div class="icon-wrapper primary">
                  <i class="el-icon-goods"></i>
                </div>
              </div>
              <div class="tooltip-wrapper">
                <el-tooltip content="顯示所有在庫商品的總數量" placement="top">
                  <i class="el-icon-info info-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value primary-text">
                {{ inventoryData.length }}
              </div>
              <div class="metric-label">總庫存商品數</div>
              <div class="metric-footer">目前在庫商品種類</div>
            </div>
          </el-card>
        </el-col>

        <!-- 低庫存警告 -->
        <el-col :xs="12" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="metric-card warning"
            @click.native="handleCardClick('warning')"
          >
            <div class="metric-header">
              <div class="metric-icon">
                <div class="icon-wrapper warning">
                  <i class="el-icon-warning"></i>
                </div>
              </div>
              <div class="tooltip-wrapper">
                <el-tooltip
                  content="庫存低於安全庫存量的商品數量"
                  placement="top"
                >
                  <i class="el-icon-info info-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value warning-text">
                {{ lowStockItems.length }}
              </div>
              <div class="metric-label">低庫存警告</div>
              <div class="metric-footer">需要補貨商品數</div>
            </div>
          </el-card>
        </el-col>

        <!-- 即將到期商品 -->
        <el-col :xs="12" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="metric-card danger"
            @click.native="handleCardClick('danger')"
          >
            <div class="metric-header">
              <div class="metric-icon">
                <div class="icon-wrapper danger">
                  <i class="el-icon-time"></i>
                </div>
              </div>
              <div class="tooltip-wrapper">
                <el-tooltip content="30天內即將到期的商品數量" placement="top">
                  <i class="el-icon-info info-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value danger-text">
                {{ expiryAlertItems.length }}
              </div>
              <div class="metric-label">即將到期商品</div>
              <div class="metric-footer">30天內到期商品數</div>
            </div>
          </el-card>
        </el-col>

        <!-- 熱銷商品 -->
        <el-col :xs="12" :sm="12" :md="6">
          <el-card
            shadow="hover"
            class="metric-card success"
            @click.native="handleCardClick('success')"
          >
            <div class="metric-header">
              <div class="metric-icon">
                <div class="icon-wrapper success">
                  <i class="el-icon-shopping-cart-full"></i>
                </div>
              </div>
              <div class="tooltip-wrapper">
                <el-tooltip
                  content="根據歷史銷售數據統計的最暢銷商品"
                  placement="top"
                >
                  <i class="el-icon-info info-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value success-text">{{ topSellingItem }}</div>
              <div class="metric-label">熱銷商品</div>
              <div class="metric-footer">銷量最高商品</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 詳細數據對話框 -->
    <data-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :data="dialogData"
      :dialog-columns="dialogColumns"
      :show-toolbar="true"
      :show-pagination="true"
      :show-confirm="!!dialogActionText"
      :confirm-text="dialogActionText"
      :show-selection="true"
      :border="true"
      :show-index="true"
      :loading="isLoading"
      :show-filters="showFilters"
      @confirm="handleDialogAction"
      @close="handleDialogClose"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @search="handleSearch"
      @filter-change="handleFilterChange"
    >
      <!-- 工具欄按鈕 -->
      <template #toolbar-actions>
        <div class="dialog-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleExport"
            v-if="showExportButton"
          >
            <i class="el-icon-download"></i> 匯出清單
          </el-button>
          <slot name="extra-actions"></slot>
        </div>
      </template>

      <!-- 篩選選項 -->
      <template #filter-options>
        <slot name="filter-options">
          <el-dropdown-item command="all">全部</el-dropdown-item>
          <el-dropdown-item command="critical">庫存緊急</el-dropdown-item>
          <el-dropdown-item command="warning">庫存警告</el-dropdown-item>
        </slot>
      </template>

      <!-- 自定義列插槽 -->
      <template v-for="slotName in columnSlotNames" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </data-dialog>
  </div>
</template>

<script>
import DataDialog from "@/components/DataDialog/index.vue";
import { formatDate } from "@/utils/date";

export default {
  name: "DashboardMetrics",

  components: {
    DataDialog
  },

  props: {
    // 庫存數據
    inventoryData: {
      type: Array,
      required: true
    },
    // 歷史數據
    historyData: {
      type: Array,
      required: true
    },
    // 低庫存警告閾值 (百分比)
    warningThreshold: {
      type: Number,
      default: 30
    },
    // 危險庫存閾值 (百分比)
    criticalThreshold: {
      type: Number,
      default: 10
    },
    // 到期警告天數
    expiryDays: {
      type: Number,
      default: 30
    }
  },

  data() {
    return {
      isCollapsed: false,
      dialogVisible: false,
      dialogTitle: "",
      dialogData: [],
      dialogColumns: [],
      dialogActionText: "",
      currentMetricType: null,
      selectedRows: [],
      sortBy: "",
      sortOrder: "",
      isLoading: false,
      showFilters: false,
      filterValue: "all"
    };
  },

  computed: {
    // 處理動態插槽名稱
    columnSlotNames() {
      return Object.keys(this.$slots).filter(name =>
        name.startsWith("column-")
      );
    },

    // 低庫存商品列表
    lowStockItems() {
      return this.inventoryData
        .filter(item => {
          const stockPercent = (item.quantity / item.safetyStock) * 100;
          return stockPercent <= this.warningThreshold;
        })
        .sort((a, b) => {
          const aPercent = (a.quantity / a.safetyStock) * 100;
          const bPercent = (b.quantity / b.safetyStock) * 100;
          return aPercent - bPercent;
        });
    },

    // 即將到期商品列表
    expiryAlertItems() {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.expiryDays);

      return this.inventoryData
        .filter(item => {
          if (!item.expiryDate) return false;
          const itemExpiryDate = new Date(item.expiryDate);
          return itemExpiryDate <= expiryDate;
        })
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    },

    // 熱銷商品
    topSellingItem() {
      const salesMap = new Map();

      // 統計銷售數量
      this.historyData
        .filter(record => record.type === "sales")
        .forEach(record => {
          const quantity = Math.abs(record.quantity);
          if (salesMap.has(record.productCode)) {
            salesMap.set(record.productCode, {
              ...salesMap.get(record.productCode),
              quantity: salesMap.get(record.productCode).quantity + quantity
            });
          } else {
            salesMap.set(record.productCode, {
              productCode: record.productCode,
              productName: record.productName,
              quantity: quantity
            });
          }
        });

      // 獲取銷量最高的商品
      const topProduct = Array.from(salesMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      )[0];

      return topProduct ? topProduct.productName : "無銷售紀錄";
    },

    // 是否顯示導出按鈕
    showExportButton() {
      return ["warning", "danger"].includes(this.currentMetricType);
    }
  },

  methods: {
    // 切換面板展開/收起
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },

    // 處理卡片點擊
    handleCardClick(type) {
      this.currentMetricType = type;
      switch (type) {
        case "warning":
          this.showLowStockDialog();
          break;
        case "danger":
          this.showExpiryDialog();
          break;
        case "success":
          this.showTopSellingDialog();
          break;
        default:
          this.showInventoryDialog();
      }
    },

    // 顯示低庫存對話框
    showLowStockDialog() {
      this.dialogTitle = "低庫存商品清單";
      this.dialogData = this.lowStockItems;
      this.dialogColumns = [
        {
          prop: "productCode",
          label: "商品編號",
          width: "120",
          sortable: true
        },
        { prop: "productName", label: "商品名稱", sortable: true },
        {
          prop: "quantity",
          label: "當前庫存",
          width: "120",
          sortable: true,
          formatter: row => `${row.quantity} / ${row.safetyStock}`
        },
        {
          prop: "stockStatus",
          label: "庫存狀態",
          width: "120",
          formatter: row => {
            const percent = (row.quantity / row.safetyStock) * 100;
            return `${percent.toFixed(1)}%`;
          }
        }
      ];
      this.dialogActionText = "建立補貨單";
      this.showFilters = true;
      this.dialogVisible = true;
    },

    // 顯示到期商品對話框
    showExpiryDialog() {
      this.dialogTitle = "即將到期商品清單";
      this.dialogData = this.expiryAlertItems;
      this.dialogColumns = [
        {
          prop: "productCode",
          label: "商品編號",
          width: "120",
          sortable: true
        },
        { prop: "productName", label: "商品名稱", sortable: true },
        { prop: "quantity", label: "數量", width: "100", sortable: true },
        {
          prop: "expiryDate",
          label: "到期日期",
          width: "120",
          sortable: true,
          formatter: row => formatDate(row.expiryDate)
        },
        {
          prop: "daysToExpiry",
          label: "剩餘天數",
          width: "120",
          formatter: row => {
            const days = Math.ceil(
              (new Date(row.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return `${days}天`;
          }
        }
      ];
      this.dialogActionText = "處理到期品";
      this.showFilters = false;
      this.dialogVisible = true;
    },

    // 顯示庫存清單對話框
    showInventoryDialog() {
      this.dialogTitle = "庫存商品清單";
      this.dialogData = this.inventoryData;
      this.dialogColumns = [
        {
          prop: "productCode",
          label: "商品編號",
          width: "120",
          sortable: true
        },
        { prop: "productName", label: "商品名稱", sortable: true },
        { prop: "quantity", label: "庫存數量", width: "120", sortable: true },
        { prop: "category", label: "類別", width: "120", sortable: true }
      ];
      this.dialogActionText = "";
      this.showFilters = true;
      this.dialogVisible = true;
    },

    // 顯示熱銷商品對話框
    showTopSellingDialog() {
      const salesData = this.historyData
        .filter(record => record.type === "sales")
        .map(record => ({
          ...record,
          quantity: Math.abs(record.quantity)
        }));

      this.dialogTitle = "熱銷商品清單";
      this.dialogData = salesData;
      this.dialogColumns = [
        {
          prop: "productCode",
          label: "商品編號",
          width: "120",
          sortable: true
        },
        { prop: "productName", label: "商品名稱", sortable: true },
        { prop: "quantity", label: "銷售數量", width: "120", sortable: true },
        {
          prop: "date",
          label: "銷售日期",
          width: "120",
          sortable: true,
          formatter: row => formatDate(row.date)
        }
      ];
      this.dialogActionText = "";
      this.showFilters = false;
      this.dialogVisible = true;
    },

    // 處理對話框關閉
    handleDialogClose() {
      this.dialogVisible = false;
      this.resetDialogState();
    },

    // 處理對話框確認操作
    async handleDialogAction() {
      try {
        this.isLoading = true;
        const selectedData = this.selectedRows.length
          ? this.selectedRows
          : this.dialogData;

        switch (this.currentMetricType) {
          case "warning":
            await this.$emit("create-purchase-order", selectedData);
            this.$message.success("已建立補貨單");
            break;
          case "danger":
            await this.$emit("handle-expiry", selectedData);
            this.$message.success("已處理到期品");
            break;
        }
        this.dialogVisible = false;
      } catch (error) {
        this.$message.error("操作失敗：" + error.message);
        console.error("Dialog action error:", error);
      } finally {
        this.isLoading = false;
        this.resetDialogState();
      }
    },

    // 處理選擇變更
    handleSelectionChange(rows) {
      this.selectedRows = rows;
      this.$emit("selection-change", {
        type: this.currentMetricType,
        rows
      });
    },

    // 處理排序變更
    handleSortChange({ prop, order }) {
      this.sortBy = prop;
      this.sortOrder = order;
      this.$emit("sort-change", {
        type: this.currentMetricType,
        prop,
        order
      });
    },

    // 處理搜索
    handleSearch(params) {
      this.$emit("search", {
        type: this.currentMetricType,
        ...params
      });
    },

    // 處理篩選變更
    handleFilterChange(value) {
      this.filterValue = value;
      this.$emit("filter-change", {
        type: this.currentMetricType,
        value
      });
    },

    // 處理資料導出
    async handleExport() {
      try {
        this.isLoading = true;
        const exportData = this.selectedRows.length
          ? this.selectedRows
          : this.dialogData;
        await this.$emit("export-data", {
          type: this.currentMetricType,
          data: exportData
        });
        this.$message.success("導出成功");
      } catch (error) {
        this.$message.error("導出失敗：" + error.message);
        console.error("Export error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // 重置對話框狀態
    resetDialogState() {
      this.dialogData = [];
      this.dialogColumns = [];
      this.dialogActionText = "";
      this.currentMetricType = null;
      this.selectedRows = [];
      this.sortBy = "";
      this.sortOrder = "";
      this.filterValue = "all";
      this.showFilters = false;
      if (this.$refs.dataDialog) {
        this.$refs.dataDialog.resetState();
      }
    },

    // 公開方法：獲取當前選中的行
    getSelectedRows() {
      return this.selectedRows;
    },

    // 公開方法：刷新數據
    refresh() {
      if (this.currentMetricType) {
        this.handleCardClick(this.currentMetricType);
      }
    }
  },

  // 元件銷燬時清理
  beforeDestroy() {
    this.resetDialogState();
  }
};
</script>

<style scoped>
.dashboard-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.dashboard-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header .title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-header .title i {
  font-size: 22px;
}

.dashboard-content {
  padding: 20px;
}

.metrics-cards {
  margin: 0 -10px;
}

.metric-card {
  margin: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card .el-card__body {
  padding: 24px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.info-icon {
  color: #909399;
  font-size: 16px;
  cursor: help;
}

.metric-icon {
  margin-bottom: 16px;
}

.icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.icon-wrapper i {
  font-size: 26px;
  color: white;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.icon-wrapper.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #d48c23 100%);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
}

.icon-wrapper.danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e64242 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
}

.icon-wrapper.success {
  background: linear-gradient(135deg, #67c23a 0%, #4eb218 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.metric-content {
  text-align: left;
  margin-top: 20px;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 12px;
  padding: 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
}

.metric-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 6px;
  font-weight: 500;
}

.metric-footer {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* Card Colors */
.metric-card.primary {
  background: linear-gradient(to right bottom, #ffffff, #f5f7fa);
}

.metric-card.warning {
  background: linear-gradient(to right bottom, #ffffff, #fdf6ec);
}

.metric-card.danger {
  background: linear-gradient(to right bottom, #ffffff, #fef0f0);
}

.metric-card.success {
  background: linear-gradient(to right bottom, #ffffff, #f0f9eb);
}

/* Text Colors */
.primary-text {
  color: #409eff;
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.warning-text {
  color: #e6a23c;
  background: linear-gradient(135deg, #e6a23c, #d48c23);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.danger-text {
  color: #f56c6c;
  background: linear-gradient(135deg, #f56c6c, #e64242);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.success-text {
  color: #67c23a;
  background: linear-gradient(135deg, #67c23a, #4eb218);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Dialog Styles */
.dialog-content {
  margin: -20px;
  padding: 20px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

.el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.el-dialog__header {
  padding: 20px 24px;
  background: #f5f7fa;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
}

.el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.el-dialog__headerbtn {
  top: 20px;
  right: 24px;
}

.el-dialog__body {
  padding: 24px;
}

.el-dialog__footer {
  padding: 16px 24px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

/* Table Styles */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  padding: 12px 0;
}

.el-table td {
  padding: 12px 0;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafafa;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f5f7fa;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
    margin-bottom: 20px;
  }

  .dashboard-header {
    padding: 16px;
  }

  .dashboard-header .title {
    font-size: 18px;
  }

  .dashboard-content {
    padding: 16px;
  }

  .metric-card {
    margin: 8px;
  }

  .metric-card .el-card__body {
    padding: 16px;
  }

  .icon-wrapper {
    width: 44px;
    height: 44px;
  }

  .icon-wrapper i {
    font-size: 22px;
  }

  .metric-value {
    font-size: 24px;
  }

  .metric-label {
    font-size: 14px;
  }

  .metric-footer {
    font-size: 12px;
  }

  .el-dialog {
    width: 90% !important;
    margin-top: 10vh !important;
  }
}
</style>
