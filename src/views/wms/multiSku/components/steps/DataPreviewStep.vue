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
          v-model="showErrorOnlyLocal"
          active-text="只顯示錯誤資料"
          @change="toggleErrorOnly"
        />
      </div>
    </div>

    <el-table
      :data="filteredPreviewData"
      border
      stripe
      height="400"
      class="preview-table"
      row-key="productCode"
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
    validationErrors: {
      type: Map,
      required: true
    },
    totalRows: {
      type: Number,
      required: true
    },
    errorRowsCount: {
      type: Number,
      required: true
    },
    validRowsCount: {
      type: Number,
      required: true
    },
    showErrorOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showErrorOnlyLocal: this.showErrorOnly
    };
  },

  computed: {
    filteredPreviewData() {
      if (this.showErrorOnlyLocal) {
        return this.previewData.filter((row, index) =>
          this.validationErrors.has(this.previewData.indexOf(row))
        );
      }
      return this.previewData;
    }
  },

  watch: {
    showErrorOnly(newVal) {
      this.showErrorOnlyLocal = newVal;
    }
  },

  methods: {
    toggleErrorOnly(value) {
      this.$emit("toggle-error-only", value);
    },

    hasError(row, field) {
      const rowIndex = this.previewData.indexOf(row);
      const errors = this.validationErrors.get(rowIndex);
      if (!errors) return false;

      // 檢查該欄位是否有錯誤
      const fieldLabel = this.getFieldLabel(field);
      return errors.some(error => error.includes(fieldLabel));
    },

    getErrorMessage(row, field) {
      const rowIndex = this.previewData.indexOf(row);
      const errors = this.validationErrors.get(rowIndex);
      if (!errors) return "";

      const fieldLabel = this.getFieldLabel(field);
      return errors.filter(error => error.includes(fieldLabel)).join("\n");
    },

    getFieldLabel(field) {
      const column = this.previewColumns.find(col => col.prop === field);
      return column ? column.label : field;
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
</style>
