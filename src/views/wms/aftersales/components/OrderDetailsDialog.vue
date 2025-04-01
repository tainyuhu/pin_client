<!-- src/views/after-sales/components/OrderDetailsDialog.vue -->
<template>
  <el-dialog
    title="訂單詳情"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    custom-class="order-details-dialog"
  >
    <div v-loading="loading" class="order-details-container">
      <!-- 訂單基本信息區塊 -->
      <div class="order-info-section">
        <div class="section-header">
          <h3>基本信息</h3>
          <el-tag
            v-if="orderData.status"
            :type="getStatusTagType(orderData.status)"
            size="medium"
            >{{ orderData.status }}</el-tag
          >
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">訂單編號：</span>
            <span class="value">{{
              orderData.orderNumber || orderData.id || "-"
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">客戶名稱：</span>
            <span class="value">{{ orderData.customerName || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="label">聯絡人：</span>
            <span class="value">{{ orderData.contactPerson || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="label">聯絡電話：</span>
            <span class="value">{{ orderData.contactPhone || "-" }}</span>
            <span v-if="orderData.extension" class="extension"
              >分機：{{ orderData.extension }}</span
            >
          </div>
          <div class="info-item">
            <span class="label">出貨日期：</span>
            <span class="value">{{ orderData.shipmentDate || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="label">付款方式：</span>
            <span class="value">{{ orderData.paymentMethod || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="label">配送地址：</span>
            <span class="value">{{ orderData.shippingAddress || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="label">訂單總額：</span>
            <span class="value highlight-amount">{{
              formatCurrency(orderData.totalAmount)
            }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">備註：</span>
            <span class="value">{{ orderData.remarks || "無" }}</span>
          </div>
        </div>
      </div>

      <!-- 訂單明細區塊 -->
      <div class="order-details-section">
        <div class="section-header">
          <h3>訂單明細</h3>
          <div v-if="orderData.details && orderData.details.length">
            <span class="detail-count"
              >共 {{ orderData.details.length }} 個項目</span
            >
          </div>
        </div>

        <el-table
          :data="orderData.details || []"
          style="width: 100%"
          border
          size="small"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          :empty-text="loading ? '正在加載...' : '暫無明細數據'"
        >
          <el-table-column
            type="index"
            label="序號"
            width="60"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="productCode"
            label="商品編號"
            width="130"
          ></el-table-column>
          <el-table-column
            prop="productName"
            label="商品名稱"
            min-width="150"
          ></el-table-column>
          <el-table-column
            prop="specification"
            label="規格"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="unit"
            label="單位"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="quantity"
            label="數量"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="單價" width="100" align="right">
            <template slot-scope="scope">
              {{ formatCurrency(scope.row.unitPrice) }}
            </template>
          </el-table-column>
          <el-table-column label="折扣" width="80" align="center">
            <template slot-scope="scope">
              {{ scope.row.discount ? scope.row.discount + "%" : "無" }}
            </template>
          </el-table-column>
          <el-table-column label="金額" width="120" align="right">
            <template slot-scope="scope">
              <span class="amount">{{ formatCurrency(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="備註" min-width="120">
            <template slot-scope="scope">
              {{ scope.row.remarks || "-" }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 訂單追蹤信息區塊 -->
      <div v-if="orderData.status" class="order-tracking-section">
        <div class="section-header">
          <h3>訂單追蹤</h3>
        </div>

        <el-steps :active="getOrderStatusStep()" align-center>
          <el-step title="下單" description="訂單已建立"></el-step>
          <el-step title="處理中" description="訂單處理中"></el-step>
          <el-step title="出貨" description="商品已出貨"></el-step>
          <el-step title="完成" description="訂單已完成"></el-step>
        </el-steps>

        <div class="tracking-info" v-if="orderData.createdAt">
          <div class="tracking-item">
            <span class="time">{{ formatDateTime(orderData.createdAt) }}</span>
            <span class="event">訂單建立</span>
            <span class="operator">{{ orderData.createdBy || "系統" }}</span>
          </div>
          <div
            class="tracking-item"
            v-if="
              orderData.updatedAt && orderData.updatedAt !== orderData.createdAt
            "
          >
            <span class="time">{{ formatDateTime(orderData.updatedAt) }}</span>
            <span class="event">訂單更新</span>
            <span class="operator">{{ orderData.updatedBy || "系統" }}</span>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">關閉</el-button>
    </div>
  </el-dialog>
</template>

<script>
import SalesService from "@/views/wms/sales/services/SalesService";

export default {
  name: "OrderDetailsDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      loading: false,
      orderData: {}
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    }
  },

  watch: {
    orderId(newVal) {
      if (newVal) {
        this.fetchOrderDetails(newVal);
      }
    },
    visible(newVal) {
      if (newVal && this.orderId) {
        this.fetchOrderDetails(this.orderId);
      }
    }
  },

  methods: {
    async fetchOrderDetails(orderId) {
      if (!orderId) return;

      this.loading = true;
      try {
        const response = await SalesService.getSalesDetail(orderId);
        this.orderData = response.data || {};
      } catch (error) {
        console.error("獲取訂單詳情失敗:", error);
        this.$message.error(
          "獲取訂單詳情失敗: " + (error.message || "未知錯誤")
        );
        this.orderData = {};
      } finally {
        this.loading = false;
      }
    },

    closeDialog() {
      this.dialogVisible = false;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "NT$ 0";
      return `NT$ ${Number(value).toLocaleString("zh-TW", {
        minimumFractionDigits: 0
      })}`;
    },

    formatDateTime(dateTime) {
      if (!dateTime) return "";

      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    getStatusTagType(status) {
      const statusMap = {
        pending: "warning",
        completed: "success",
        cancelled: "info",
        待處理: "warning",
        處理中: "primary",
        已完成: "success",
        已取消: "info"
      };

      return statusMap[status] || "info";
    },

    getOrderStatusStep() {
      const statusSteps = {
        pending: 1,
        待處理: 1,
        處理中: 2,
        已出貨: 3,
        運送中: 3,
        已完成: 4,
        completed: 4
      };

      return statusSteps[this.orderData.status] || 1;
    }
  }
};
</script>

<style lang="scss" scoped>
.order-details-container {
  padding: 0 10px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .detail-count {
      color: #606266;
      font-size: 14px;
    }
  }

  .order-info-section,
  .order-details-section,
  .order-tracking-section {
    margin-bottom: 24px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .info-item {
      display: flex;

      &.full-width {
        grid-column: span 2;
      }

      .label {
        width: 85px;
        color: #606266;
        font-weight: 500;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        word-break: break-all;
      }

      .extension {
        color: #909399;
        margin-left: 10px;
        font-size: 13px;
      }

      .highlight-amount {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }

  .tracking-info {
    margin-top: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .tracking-item {
      display: flex;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #dcdfe6;

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .time {
        width: 160px;
        color: #606266;
      }

      .event {
        flex: 1;
        color: #303133;
        font-weight: 500;
      }

      .operator {
        width: 100px;
        color: #909399;
        text-align: right;
      }
    }
  }
}

.order-details-dialog {
  ::v-deep .el-dialog__header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #409eff, #67c23a);

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.amount {
  font-weight: 500;
  color: #303133;
}

/* 適配打印樣式 */
@media print {
  .el-dialog__wrapper {
    position: static !important;
    transform: none !important;
  }

  .el-dialog {
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    position: static !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .dialog-footer,
  .el-dialog__header,
  .el-dialog__headerbtn {
    display: none !important;
  }

  .el-dialog__body {
    padding: 0 !important;
  }

  .order-details-container {
    padding: 0 !important;
  }
}
</style>
