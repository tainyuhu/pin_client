<template>
  <div class="payment-confirm-step">
    <!-- 載入中遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="el-icon-loading"></i>
        <p>數據載入中...</p>
      </div>
    </div>

    <el-alert
      v-if="confirmedOrdersList.length > 0"
      title="請確認以下訂單將更新為「已付款」狀態"
      type="success"
      :description="
        `共 ${confirmedOrdersList.length} 筆訂單，總金額 ${formatCurrency(
          totalConfirmedAmount
        )}`
      "
      show-icon
      :closable="false"
    />

    <el-alert
      v-else
      title="沒有已確認的匹配訂單"
      type="warning"
      description="請返回上一步驟選擇要確認的匹配項"
      show-icon
      :closable="false"
    />

    <!-- 添加空狀態顯示 -->
    <div
      v-if="confirmedOrdersList.length === 0 && !loading"
      class="empty-state"
    >
      <i class="el-icon-warning-outline"></i>
      <p>沒有找到可確認的訂單數據</p>
      <p class="sub-text">請返回上一步，確保選擇了有效的匹配項</p>
    </div>

    <el-table
      v-if="confirmedOrdersList.length > 0"
      :data="confirmedOrdersList"
      border
      stripe
      height="400"
      class="confirmed-orders-table"
      row-key="id"
      v-loading="tableLoading"
      element-loading-text="訂單數據載入中..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <el-table-column type="index" width="55" label="#" />
      <el-table-column prop="orderNumber" label="訂單編號" width="120" />
      <el-table-column prop="orderDate" label="訂單日期" width="120" />
      <el-table-column prop="customerName" label="客戶名稱" width="180" />
      <el-table-column
        prop="totalAmount"
        label="訂單金額"
        width="120"
        :formatter="row => formatCurrency(row.totalAmount)"
      />
      <el-table-column prop="paymentStatus" label="當前狀態" width="120">
        <template #default="scope">
          <el-tag
            :type="paymentStatusType(scope.row.paymentStatus)"
            size="small"
          >
            {{ paymentStatusLabel(scope.row.paymentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新後狀態" width="120">
        <template #default>
          <el-tag type="success" size="small">
            已付款
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="transactionDate" label="付款日期" width="120" />
      <el-table-column prop="accountInfo" label="帳戶資訊" width="120" />
    </el-table>

    <div v-if="confirmedOrdersList.length > 0" class="confirm-summary">
      <div class="summary-note">
        <i class="el-icon-info"></i>
        <span
          >點擊「確認更新付款狀態」後，系統將更新以上訂單狀態為「已付款」</span
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaymentConfirmStep",

  props: {
    confirmedOrdersList: {
      type: Array,
      required: true
    },
    totalConfirmedAmount: {
      type: Number,
      required: true
    },
    formatCurrency: {
      type: Function,
      required: true
    },
    paymentStatusType: {
      type: Function,
      required: true
    },
    paymentStatusLabel: {
      type: Function,
      required: true
    }
  },

  data() {
    return {
      loading: true,
      tableLoading: true,
      renderCount: 0, // 追蹤渲染次數
      retryCount: 0 // 追蹤重試次數
    };
  },

  // 改進 mounted 鉤子以確保組件正確初始化
  mounted() {
    console.log(
      "PaymentConfirmStep mounted - 訂單列表:",
      this.confirmedOrdersList,
      "渲染次數:",
      ++this.renderCount
    );
    console.log("訂單總金額:", this.totalConfirmedAmount);

    this.initializeComponent();
  },

  // 當組件被激活時重新檢查
  activated() {
    console.log("PaymentConfirmStep activated");
    this.initializeComponent();
  },

  // 添加更新鉤子，當父組件數據更新時也觸發更新
  updated() {
    console.log("PaymentConfirmStep updated");
    // 避免反覆更新導致的無限循環
    if (this.loading && this.retryCount < 3) {
      this.retryCount++;
      this.checkDataAvailability();
    }
  },

  watch: {
    // 監聽訂單列表變化
    confirmedOrdersList: {
      immediate: true, // 在組件創建時立即觸發
      handler(newValue) {
        console.log(
          "確認訂單列表變化:",
          newValue,
          "渲染次數:",
          ++this.renderCount
        );

        if (newValue && Array.isArray(newValue)) {
          this.retryCount = 0; // 重置重試計數

          // 確保資料有效且必須重新載入
          if (newValue.length > 0) {
            this.tableLoading = true;
            setTimeout(() => {
              this.tableLoading = false;
            }, 300);
          } else {
            this.tableLoading = false;
          }

          // 確保載入狀態結束
          if (this.loading) {
            setTimeout(() => {
              this.loading = false;
            }, 200);
          }
        }
      },
      deep: true
    }
  },

  methods: {
    // 初始化組件狀態
    initializeComponent() {
      // 檢查數據狀態
      const hasData =
        this.confirmedOrdersList && this.confirmedOrdersList.length > 0;
      console.log("初始化組件 - 是否有數據:", hasData);

      // 重置載入狀態
      this.loading = true;
      this.tableLoading = true;

      // 先檢查數據是否已可用
      this.checkDataAvailability();

      // 確保載入狀態在短時間內結束
      setTimeout(() => {
        this.loading = false;

        // 如果有數據，再延遲一下表格載入完成
        if (hasData) {
          setTimeout(() => {
            this.tableLoading = false;
          }, 300);
        } else {
          this.tableLoading = false;
        }
      }, 500);

      // 安全保障：最遲2秒後強制結束所有載入狀態
      setTimeout(() => {
        if (this.loading || this.tableLoading) {
          console.log("強制結束載入狀態");
          this.loading = false;
          this.tableLoading = false;
        }
      }, 2000);
    },

    // 檢查數據是否可用，如果可用則結束載入狀態
    checkDataAvailability() {
      const hasData =
        this.confirmedOrdersList && this.confirmedOrdersList.length > 0;
      console.log("檢查數據可用性:", hasData, "重試次數:", this.retryCount);

      if (hasData) {
        // 數據已可用，結束載入狀態
        this.loading = false;
        setTimeout(() => {
          this.tableLoading = false;
        }, 300);
      } else if (this.retryCount > 5) {
        // 多次重試後仍無數據，強制結束載入狀態
        this.loading = false;
        this.tableLoading = false;
      }
    },

    // 提供一個刷新方法供父組件調用
    refresh() {
      console.log("PaymentConfirmStep refresh 方法被調用");
      this.retryCount = 0; // 重置重試計數
      this.initializeComponent();

      // 強制重新渲染組件
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    }
  },

  // 添加錯誤處理的生命週期鉤子
  errorCaptured(err, vm, info) {
    console.error("PaymentConfirmStep 錯誤:", err, info);

    // 確保載入狀態結束，即使發生錯誤
    this.loading = false;
    this.tableLoading = false;

    // 顯示錯誤給用戶
    if (this.$message && typeof this.$message.error === "function") {
      this.$message.error("載入確認訂單時發生錯誤，請刷新頁面或聯絡技術支持");
    }

    return false; // 防止錯誤冒泡
  }
};
</script>

<style lang="scss" scoped>
.payment-confirm-step {
  position: relative;
  min-height: 300px;

  // 載入中遮罩
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;

    .loading-spinner {
      text-align: center;

      i {
        font-size: 32px;
        color: #409eff;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
        color: #606266;
        margin: 0;
      }
    }
  }

  .el-alert {
    margin-bottom: 20px;
  }

  .confirmed-orders-table {
    margin-top: 20px;
    margin-bottom: 20px;

    ::v-deep .el-table__row {
      &:hover {
        .el-tag--success {
          transform: scale(1.05);
        }
      }
    }

    ::v-deep .el-tag--success {
      transition: all 0.2s ease;
    }
  }

  .confirm-summary {
    margin-top: 20px;

    .summary-note {
      padding: 15px;
      background-color: #f0f9eb;
      border-radius: 4px;
      color: #67c23a;
      display: flex;
      align-items: center;

      i {
        font-size: 18px;
        margin-right: 10px;
      }
    }
  }

  /* 添加空狀態樣式 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 16px;

      &.sub-text {
        font-size: 14px;
        margin-top: 8px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .payment-confirm-step {
    .confirm-summary {
      .summary-note {
        padding: 10px;
        font-size: 14px;
      }
    }
  }
}
</style>
