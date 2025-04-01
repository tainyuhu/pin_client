<template>
  <div class="match-result-step">
    <div class="result-header">
      <div class="result-summary">
        <el-tag type="success">完全匹配: {{ exactMatchCount }}</el-tag>
        <el-tag type="primary">高度可能: {{ highProbabilityCount }}</el-tag>
        <el-tag type="warning">低度可能: {{ lowProbabilityCount }}</el-tag>
        <el-tag type="danger">無法匹配: {{ noMatchCount }}</el-tag>
      </div>
      <div class="result-filters">
        <el-select
          :value="matchFilter"
          @input="value => $emit('update:matchFilter', value)"
          placeholder="篩選匹配結果"
          size="small"
        >
          <el-option label="全部顯示" value="all" />
          <el-option label="只顯示完全匹配" value="exact" />
          <el-option label="只顯示高度可能" value="high" />
          <el-option label="只顯示低度可能" value="low" />
          <el-option label="只顯示無法匹配" value="none" />
        </el-select>
      </div>
    </div>

    <el-table
      ref="matchResultTable"
      :data="filteredMatchResults"
      border
      stripe
      height="400"
      class="match-result-table"
      row-key="bankTransactionId"
      @selection-change="handleSelectionChange"
    >
      <!-- 擴展列 -->
      <el-table-column type="expand">
        <template #default="props">
          <div class="matched-orders-container">
            <template
              v-if="
                props.row.matchedOrders && props.row.matchedOrders.length > 0
              "
            >
              <h4>匹配訂單詳情</h4>
              <el-table
                :data="props.row.matchedOrders"
                border
                size="small"
                class="matched-orders-table"
              >
                <el-table-column
                  prop="orderNumber"
                  label="訂單編號"
                  width="120"
                />
                <el-table-column
                  prop="orderDate"
                  label="訂單日期"
                  width="120"
                />
                <el-table-column
                  prop="customerName"
                  label="客戶名稱"
                  width="120"
                />
                <el-table-column
                  prop="totalAmount"
                  label="訂單金額"
                  width="120"
                  :formatter="row => formatCurrency(row.totalAmount)"
                />
                <el-table-column
                  prop="bankLastFive"
                  label="末五碼"
                  width="100"
                />
                <el-table-column
                  prop="paymentStatus"
                  label="付款狀態"
                  width="120"
                >
                  <template #default="scope">
                    <el-tag
                      :type="paymentStatusType(scope.row.paymentStatus)"
                      size="small"
                    >
                      {{ paymentStatusLabel(scope.row.paymentStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-radio
                      v-model="props.row.selectedOrderId"
                      :label="scope.row.id"
                      :disabled="scope.row.paymentStatus === 'paid'"
                    >
                      確認匹配
                    </el-radio>
                  </template>
                </el-table-column>
              </el-table>
            </template>
            <template v-else>
              <div class="no-matched-orders">
                <i class="el-icon-warning-outline" />
                <span>未找到匹配訂單</span>
              </div>
            </template>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        type="selection"
        width="55"
        :selectable="isRowSelectable"
      />

      <el-table-column prop="matchType" label="匹配狀態" width="120">
        <template #default="scope">
          <el-tag
            :type="matchTypeTagType(scope.row.matchType)"
            effect="dark"
            size="small"
          >
            {{ matchTypeLabel(scope.row.matchType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="transactionDate" label="交易日期" width="120" />

      <el-table-column
        prop="amount"
        label="交易金額"
        width="120"
        :formatter="row => formatCurrency(row.amount)"
      />

      <el-table-column prop="accountInfo" label="帳戶資訊" width="120" />

      <el-table-column prop="transactionParty" label="交易方名稱" width="150" />

      <el-table-column prop="remark" label="備註" min-width="180" />

      <el-table-column prop="matchedOrderNumber" label="匹配訂單號" width="150">
        <template #default="scope">
          <span v-if="scope.row.selectedOrderId">
            {{ getOrderNumberById(scope.row) }}
          </span>
          <span
            v-else-if="
              scope.row.matchedOrders && scope.row.matchedOrders.length === 1
            "
          >
            {{ scope.row.matchedOrders[0].orderNumber }}
          </span>
          <el-button
            v-else-if="
              scope.row.matchedOrders && scope.row.matchedOrders.length > 1
            "
            type="text"
            @click="expandRow(scope.row, $event)"
          >
            {{ scope.row.matchedOrders.length }} 個可能訂單
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="selection-tip">
      <i class="el-icon-info"></i>
      <span>勾選您要確認的匹配項，並點擊「下一步」進行確認</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "MatchResultStep",

  props: {
    matchResults: {
      type: Array,
      required: true
    },
    matchFilter: {
      type: String,
      default: "all"
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    matchTypeTagType: {
      type: Function,
      required: true
    },
    matchTypeLabel: {
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
    },
    formatCurrency: {
      type: Function,
      required: true
    },
    exactMatchCount: {
      type: Number,
      required: true
    },
    highProbabilityCount: {
      type: Number,
      required: true
    },
    lowProbabilityCount: {
      type: Number,
      required: true
    },
    noMatchCount: {
      type: Number,
      required: true
    }
  },

  computed: {
    filteredMatchResults() {
      if (this.matchFilter === "all") {
        return this.matchResults;
      }
      return this.matchResults.filter(r => r.matchType === this.matchFilter);
    }
  },

  methods: {
    handleSelectionChange(selection) {
      this.$emit("update:selectedRows", selection);
      this.$emit("row-select-change", selection);
    },

    isRowSelectable(row) {
      // 只有有匹配訂單的行才能被選中
      return row.matchedOrders && row.matchedOrders.length > 0;
    },

    getOrderNumberById(row) {
      if (!row.selectedOrderId || !row.matchedOrders) return "-";

      const order = row.matchedOrders.find(o => o.id === row.selectedOrderId);
      return order ? order.orderNumber : "-";
    },

    expandRow(row) {
      this.$refs.matchResultTable.toggleRowExpansion(row);
    }
  },

  mounted() {
    // 預設選中完全匹配和高度可能匹配且只有一個匹配項的行
    this.$nextTick(() => {
      const autoSelectRows = this.matchResults.filter(
        row =>
          (row.matchType === "exact" || row.matchType === "high") &&
          row.matchedOrders &&
          row.matchedOrders.length === 1
      );

      autoSelectRows.forEach(row => {
        this.$refs.matchResultTable.toggleRowSelection(row, true);
      });
    });
  }
};
</script>

<style lang="scss" scoped>
.match-result-step {
  .result-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .result-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .el-tag {
        padding: 4px 8px;
      }
    }
  }

  .match-result-table {
    margin-bottom: 15px;

    ::v-deep .el-table__expand-icon {
      color: #409eff;
    }

    ::v-deep .el-radio {
      margin-right: 0;
    }

    ::v-deep .el-radio__input.is-checked .el-radio__inner {
      border-color: #67c23a;
      background: #67c23a;
    }

    ::v-deep .el-radio__input.is-checked + .el-radio__label {
      color: #67c23a;
    }
  }

  .matched-orders-container {
    padding: 10px 20px;
    background-color: #f8f9fa;

    h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #303133;
    }

    .matched-orders-table {
      margin-bottom: 0;

      ::v-deep .el-table__body {
        td {
          padding: 8px 0;
        }
      }
    }
  }

  .no-matched-orders {
    padding: 20px;
    text-align: center;
    color: #909399;

    i {
      font-size: 24px;
      margin-right: 10px;
      vertical-align: middle;
    }
  }

  .selection-tip {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #ecf5ff;
    border-radius: 4px;
    color: #409eff;

    i {
      margin-right: 10px;
    }
  }
}

@media screen and (max-width: 768px) {
  .match-result-step {
    .result-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;

      .result-summary {
        flex-wrap: wrap;
        gap: 10px;
      }
    }

    .matched-orders-container {
      padding: 10px;
    }
  }
}
</style>
