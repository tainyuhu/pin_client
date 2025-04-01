<template>
  <div class="preview-step">
    <div class="preview-header">
      <div class="preview-info">
        <span>總筆數: {{ totalRows }}</span>
        <span>有效筆數: {{ validRowsCount }}</span>
        <span>錯誤筆數: {{ errorRowsCount }}</span>
      </div>
      <div class="preview-actions">
        <el-switch
          :value="showErrorOnly"
          @input="value => $emit('update:showErrorOnly', value)"
          active-text="只顯示錯誤資料"
        />
      </div>
    </div>

    <el-table
      :data="filteredPreviewData"
      border
      stripe
      height="400"
      class="preview-table"
      row-key="bankTransactionId"
    >
      <el-table-column
        v-for="(col, index) in previewColumns"
        :key="index"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template #default="scope">
          <div :class="{ 'error-cell': hasError(scope.row, col.prop) }">
            {{ scope.row[col.prop] }}
            <el-tooltip
              v-if="hasError(scope.row, col.prop)"
              :content="getErrorMessage(scope.row, col.prop)"
              placement="top"
            >
              <i class="el-icon-warning-outline error-icon" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "DataPreviewStep",

  props: {
    previewData: {
      type: Array,
      required: true
    },
    previewColumns: {
      type: Array,
      required: true
    },
    totalRows: {
      type: Number,
      required: true
    },
    validationErrors: {
      type: Map,
      required: true
    },
    showErrorOnly: {
      type: Boolean,
      default: false
    },
    hasError: {
      type: Function,
      required: true
    },
    getErrorMessage: {
      type: Function,
      required: true
    }
  },

  computed: {
    validRowsCount() {
      return this.totalRows - this.errorRowsCount;
    },

    errorRowsCount() {
      return this.validationErrors.size;
    },

    filteredPreviewData() {
      if (this.showErrorOnly) {
        return this.previewData.filter((row, index) => {
          for (let i = 0; i < this.previewData.length; i++) {
            if (this.previewData[i] === row && this.validationErrors.has(i)) {
              return true;
            }
          }
          return false;
        });
      }
      return this.previewData;
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-step {
  .preview-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .preview-info {
      display: flex;
      gap: 20px;

      span {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .preview-table {
    width: 100%;
    overflow-x: auto;

    /* 確保表格內容可以橫向滾動 */
    ::v-deep .el-table__body-wrapper {
      overflow-x: auto !important;
    }

    /* 確保表格容器允許滾動 */
    ::v-deep .el-table {
      overflow-x: auto !important;
      white-space: nowrap;
    }

    .error-cell {
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 5px;

      .error-icon {
        color: #e6a23c;
        font-size: 16px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .preview-step {
    .preview-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;

      .preview-info {
        flex-wrap: wrap;
        gap: 10px;
      }
    }
  }
}
</style>
