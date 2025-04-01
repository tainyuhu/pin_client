<!-- components/OrderDetailDialog.vue -->
<template>
  <el-dialog
    title="訂單詳情"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    custom-class="order-detail-dialog"
  >
    <div v-loading="loading" class="order-detail-content">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-document"></i>
          <span>基本資訊</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>訂單編號：</label>
              <span>{{ orderData.orderId }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>訂單狀態：</label>
              <el-tag
                :type="paymentStatusOptions[orderData.paymentStatus].type"
              >
                {{ paymentStatusOptions[orderData.paymentStatus].label }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>建立時間：</label>
              <span>{{ orderData.createTime }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>付款時間：</label>
              <span>{{ orderData.paymentTime || "-" }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 訂購商品 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-shopping-cart-full"></i>
          <span>訂購商品</span>
        </div>
        <el-table
          :data="orderData.orderDetail.products"
          border
          style="width: 100%"
        >
          <el-table-column label="商品名稱" prop="name" min-width="180" />
          <el-table-column label="規格" prop="specification" width="120" />
          <el-table-column label="單價" width="120" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.price) }}
            </template>
          </el-table-column>
          <el-table-column
            label="數量"
            prop="quantity"
            width="100"
            align="center"
          />
          <el-table-column label="小計" width="120" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.price * row.quantity) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="order-summary">
          <div class="summary-item">
            <label>訂單總額：</label>
            <span class="amount">{{
              formatCurrency(orderData.totalAmount)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 取貨資訊 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-location"></i>
          <span>取貨資訊</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>取貨方式：</label>
              <el-tag size="small" type="info">
                {{
                  orderData.pickupMethod === "company" ? "公司取貨" : "地址取貨"
                }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="info-item">
              <label>取貨地址：</label>
              <span>{{ orderData.orderDetail.contactInfo.address }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 聯絡資訊 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-user"></i>
          <span>聯絡資訊</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>訂購人：</label>
              <span>{{ orderData.customerName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>聯絡電話：</label>
              <span>{{ orderData.orderDetail.contactInfo.phone }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <label>Email：</label>
              <span>{{ orderData.orderDetail.contactInfo.email }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 付款資訊 -->
      <div class="detail-section">
        <div class="section-header">
          <i class="el-icon-bank-card"></i>
          <span>付款資訊</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>付款方式：</label>
              <span>{{ orderData.orderDetail.paymentInfo.method }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>銀行代碼：</label>
              <span>{{ orderData.orderDetail.paymentInfo.bankCode }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>帳號：</label>
              <span>{{ orderData.orderDetail.paymentInfo.account }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 備註 -->
      <div class="detail-section" v-if="orderData.orderDetail.notes">
        <div class="section-header">
          <i class="el-icon-notebook-2"></i>
          <span>備註</span>
        </div>
        <div class="notes-content">
          {{ orderData.orderDetail.notes }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">關閉</el-button>
        <el-button type="primary" @click="handleEdit">編輯訂單</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { formatCurrency } from "@/utils/format";

export default {
  name: "OrderDetailDialog",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      paymentStatusOptions: {
        unpaid: { label: "待付款", type: "warning" },
        confirming: { label: "付款確認中", type: "info" },
        completed: { label: "付款完成", type: "success" },
        overdue: { label: "付款逾期", type: "danger" },
        refunding: { label: "退款中", type: "warning" },
        refunded: { label: "已退款", type: "info" },
        cancelled: { label: "已取消", type: "danger" }
      }
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },

  methods: {
    formatCurrency,

    handleClose() {
      this.dialogVisible = false;
    },

    handleEdit() {
      this.$emit("edit", this.orderData);
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.order-detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 20px;

  .detail-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      i {
        font-size: 20px;
        color: #409eff;
        margin-right: 8px;
      }

      span {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: center;

      label {
        width: 80px;
        color: #606266;
        flex-shrink: 0;
      }

      span {
        flex: 1;
        color: #303133;
      }
    }

    .order-summary {
      margin-top: 16px;
      text-align: right;
      padding-right: 20px;

      .summary-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        label {
          color: #606266;
        }

        .amount {
          font-size: 18px;
          font-weight: 600;
          color: #f56c6c;
        }
      }
    }

    .notes-content {
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 4px;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>

<style lang="scss">
.order-detail-dialog {
  .el-dialog__body {
    padding: 20px 0;
  }
}
</style>
