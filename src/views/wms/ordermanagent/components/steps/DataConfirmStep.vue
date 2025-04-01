<template>
  <div class="confirm-step">
    <div class="import-summary">
      <el-alert
        v-if="errorRowsCount > 0"
        title="注意：對帳單資料包含錯誤"
        type="warning"
        :description="`發現 ${errorRowsCount} 筆資料有誤，這些資料將被略過。`"
        show-icon
        :closable="false"
      />

      <el-card class="summary-card">
        <template #header>
          <div class="card-header">
            <span>對帳單資料摘要</span>
          </div>
        </template>
        <div class="summary-content">
          <div class="summary-item">
            <span class="label">檔案名稱</span>
            <span class="value">{{
              selectedFile ? selectedFile.name : ""
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">總筆數</span>
            <span class="value">{{ totalRows }}</span>
          </div>
          <div class="summary-item">
            <span class="label">有效筆數</span>
            <span class="value">{{ validRowsCount }}</span>
          </div>
          <div class="summary-item">
            <span class="label">略過筆數</span>
            <span class="value">{{ errorRowsCount }}</span>
          </div>
          <div class="summary-item" v-if="validRowsCount > 0">
            <span class="label">總交易金額</span>
            <span class="value">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="match-info-card">
        <template #header>
          <div class="card-header">
            <span>匹配說明</span>
          </div>
        </template>
        <div class="match-info-content">
          <p>系統將根據以下條件嘗試匹配訂單：</p>
          <ol>
            <li>
              <strong>精確匹配</strong
              >：交易金額和帳戶資訊完全匹配，且備註中包含訂單號
            </li>
            <li>
              <strong>高度可能</strong
              >：交易金額匹配且交易日期在訂單建立後的合理範圍內
            </li>
            <li><strong>低度可能</strong>：僅交易金額匹配</li>
          </ol>
          <p>
            匹配完成後，您可以檢查結果並勾選需要確認的匹配項，再點擊「下一步」進行確認。
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataConfirmStep",

  props: {
    totalRows: {
      type: Number,
      required: true
    },
    validRowsCount: {
      type: Number,
      required: true
    },
    errorRowsCount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    // 修改 selectedFile 的類型定義，允許 File 類型或 null
    selectedFile: {
      type: [Object, File, null],
      default: null
    },
    formatCurrency: {
      type: Function,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.confirm-step {
  .import-summary {
    .el-alert {
      margin-bottom: 20px;
    }

    .summary-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .summary-content {
        padding: 10px;

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
          }

          .value {
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }

    .match-info-card {
      .match-info-content {
        padding: 10px;
        font-size: 14px;

        p {
          margin-bottom: 10px;
        }

        ol {
          padding-left: 20px;

          li {
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .confirm-step {
    .match-info-card {
      .match-info-content {
        ol {
          padding-left: 16px;
        }
      }
    }
  }
}
</style>
