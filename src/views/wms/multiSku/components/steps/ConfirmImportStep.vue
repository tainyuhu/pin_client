<template>
  <div class="confirm-step">
    <div class="import-summary">
      <el-alert
        v-if="!importSummary.totalCount"
        title="注意：未選擇任何資料"
        type="warning"
        description="未選擇任何資料進行匯入，請返回上一步選擇資料。"
        show-icon
        :closable="false"
        class="no-data-alert"
      />

      <el-card class="summary-card">
        <template #header>
          <span>匯入資料摘要</span>
        </template>
        <div class="summary-content">
          <div class="summary-item">
            <span class="label">檔案名稱</span>
            <span class="value">{{
              selectedFile ? selectedFile.name : "-"
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">新增品號</span>
            <span class="value new-count">{{
              importSummary.newCount || 0
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">更新品號</span>
            <span class="value update-count">{{
              importSummary.updateCount || 0
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">停用品號</span>
            <span class="value delete-count">{{
              importSummary.deleteCount || 0
            }}</span>
          </div>
          <div class="summary-item total">
            <span class="label">總計將處理</span>
            <span class="value total-count">{{
              importSummary.totalCount || 0
            }}</span>
          </div>
        </div>
      </el-card>

      <el-alert
        type="info"
        title="匯入提醒"
        description="請確認以上資料無誤後，點擊下方「開始匯入」按鈕執行匯入作業。匯入後的變更將記錄到品號異動紀錄中。"
        show-icon
        :closable="false"
        class="import-alert"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfirmImportStep",

  props: {
    selectedFile: {
      type: Object,
      default: null
    },
    importSummary: {
      type: Object,
      required: true,
      default: () => ({
        newCount: 0,
        updateCount: 0,
        deleteCount: 0,
        totalCount: 0
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.confirm-step {
  .import-summary {
    .no-data-alert {
      margin-bottom: 20px;
    }

    .summary-card {
      margin-bottom: 20px;

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

          &.total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ebeef5;
            font-weight: bold;
          }

          .label {
            color: #909399;
          }

          .value {
            color: #303133;
            font-weight: 500;

            &.new-count {
              color: #67c23a;
            }

            &.update-count {
              color: #e6a23c;
            }

            &.delete-count {
              color: #f56c6c;
            }

            &.total-count {
              color: #409eff;
              font-weight: bold;
            }
          }
        }
      }
    }

    .import-alert {
      margin-bottom: 20px;
    }
  }
}
</style>
