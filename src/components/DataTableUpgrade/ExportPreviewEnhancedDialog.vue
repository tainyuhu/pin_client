<!-- components/DataTable/ExportPreviewDialog.vue -->
<template>
  <el-dialog
    title="匯出資料預覽"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    custom-class="list-dialog"
  >
    <div class="export-preview-container">
      <div class="preview-info">
        <div class="info-row">
          <span class="label">主項目：</span>
          <span class="value">共 {{ selectedRows.length }} 筆</span>
        </div>
        <div class="info-row" v-if="hasChildItems">
          <span class="label">子項目：</span>
          <span class="value">共 {{ totalAllSubItems }} 筆</span>
        </div>
        <div class="info-row">
          <span class="label">匯出欄位：</span>
          <span class="value"> 共 {{ totalSelectedColumns }} 列 </span>
          <el-button
            type="text"
            size="small"
            class="field-config-btn"
            @click="showColumnSelection = !showColumnSelection"
          >
            {{ showColumnSelection ? "收起" : "設定匯出欄位" }}
            <i
              :class="
                showColumnSelection ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
              "
            ></i>
          </el-button>
        </div>
      </div>

      <!-- 主項目與子項目欄位配置 -->
      <div v-if="showColumnSelection" class="tabs-container">
        <el-tabs v-model="activeConfigTab" type="card">
          <el-tab-pane label="主項目欄位" name="main">
            <div class="column-selection">
              <div class="selection-header">
                <el-checkbox
                  v-model="selectAllColumns"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllColumnsChange"
                >
                  全選
                </el-checkbox>
              </div>
              <div class="column-list">
                <div
                  v-for="column in exportableColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox v-model="selectedColumns" :label="column.prop">
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="hasChildItems" label="子項目欄位" name="sub">
            <!-- 子表格切換 -->
            <div class="sub-table-selector" v-if="subTableConfigs.length > 1">
              <span class="selector-label">選擇子表格：</span>
              <el-select
                v-model="activeSubTableIndex"
                size="small"
                @change="handleSubTableChange"
              >
                <el-option
                  v-for="(config, index) in subTableConfigs"
                  :key="index"
                  :label="config.title || `子表格 ${index + 1}`"
                  :value="index"
                ></el-option>
              </el-select>
            </div>

            <div class="column-selection">
              <div class="selection-header">
                <el-checkbox
                  v-model="currentSubTableSelectAll"
                  :indeterminate="currentSubTableIndeterminate"
                  @change="handleCheckAllSubColumnsChange"
                >
                  全選 ({{ getCurrentSubTableTitle() }})
                </el-checkbox>
              </div>
              <div class="column-list">
                <div
                  v-for="column in getCurrentExportableSubColumns()"
                  :key="`${activeSubTableIndex}-${column.prop}`"
                  class="column-item"
                >
                  <el-checkbox
                    v-model="allSubTablesSelectedColumns[activeSubTableIndex]"
                    :label="column.prop"
                  >
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 資料預覽區塊 -->
      <div class="preview-tabs">
        <el-tabs v-model="activePreviewTab" type="border-card">
          <el-tab-pane label="主項目預覽">
            <div class="preview-table-wrapper">
              <el-table
                :data="previewData"
                border
                size="small"
                height="250"
                class="preview-table"
              >
                <el-table-column
                  v-for="column in displayColumns"
                  :key="column.prop"
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth || 120"
                  :align="column.align || 'left'"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="scope">
                    {{ formatValue(scope.row, column) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane
            v-for="(config, index) in filteredSubTableConfigs"
            :key="`subtable-${index}`"
            :label="
              config.title || `子表格 ${config.originalIndex + 1}` + ' 預覽'
            "
          >
            <div class="preview-table-wrapper">
              <el-table
                :data="config.previewData"
                border
                size="small"
                height="250"
                class="preview-table"
              >
                <el-table-column
                  v-for="column in getDisplaySubColumns(config.originalIndex)"
                  :key="`${index}-${column.prop}`"
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth || 120"
                  :align="column.align || 'left'"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="scope">
                    {{ formatValue(scope.row, column) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 匯出選項 -->
      <div class="export-options">
        <div class="options-title">匯出選項</div>
        <div class="format-options">
          <div class="option-item">
            <div class="option-label">檔案名稱：</div>
            <el-input
              v-model="exportFilename"
              size="small"
              placeholder="請輸入檔案名稱"
              :maxlength="50"
              class="filename-input"
            >
              <template slot="append"
                >.{{ selectedFormat }}</template
              >
            </el-input>
          </div>
          <div class="option-item">
            <div class="option-label">檔案格式：</div>
            <el-radio-group v-model="selectedFormat" size="small">
              <el-radio-button label="xlsx">Excel(XLSX)</el-radio-button>
              <el-radio-button label="csv">CSV</el-radio-button>
            </el-radio-group>
          </div>
          <div class="option-item" v-if="hasChildItems">
            <div class="option-label">表單配置：</div>
            <el-radio-group v-model="sheetConfig" size="small">
              <el-radio-button label="separate">分開表單</el-radio-button>
              <el-radio-button label="combined">合併表單</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="exportLoading"
          @click="handleExport"
        >
          開始匯出
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/dataTable.js";

export default {
  name: "ExportPreviewDialog",

  props: {
    // 對話框可見性
    visible: {
      type: Boolean,
      default: false
    },
    // 選中的行資料
    selectedRows: {
      type: Array,
      default: () => []
    },
    // 主項目列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 子表格配置
    subTableConfigs: {
      type: Array,
      default: () => []
    },
    // 子項目資料取得方法
    getSubItems: {
      type: Function,
      default: (row, configIndex = 0) => {
        const dataKey = row.items
          ? "items"
          : configIndex === 0
          ? "problemDetails"
          : "returnExchangeDetails";
        return row[dataKey] || [];
      }
    },
    // 格式化列值的方法
    formatColumnValue: {
      type: Function,
      default: (row, column) => row[column.prop]
    },
    // 預設檔案名稱
    filename: {
      type: String,
      default: "data-export"
    },
    // 最大預覽行數
    maxPreviewRows: {
      type: Number,
      default: 5
    },
    // 判斷是否有子項目
    hasChildItems: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      showColumnSelection: false,
      activeConfigTab: "main",
      activePreviewTab: "0",
      activeSubTableIndex: 0,
      selectedColumns: [],
      allSubTablesSelectedColumns: [], // 每個子表格選中的列
      selectAllColumns: true,
      isIndeterminate: false,
      exportFilename: "",
      selectedFormat: "xlsx",
      exportLoading: false,
      sheetConfig: "separate", // 預設分開表單
      subTableColumnsCache: [] // 緩存每個子表格的列
    };
  },

  computed: {
    // 可匯出的主項目列
    exportableColumns() {
      return this.columns.filter(col => !col.noExport);
    },

    // 當前顯示的主項目列
    displayColumns() {
      return this.exportableColumns.filter(col =>
        this.selectedColumns.includes(col.prop)
      );
    },

    // 當前子表格全選狀態
    currentSubTableSelectAll: {
      get() {
        if (
          !this.hasChildItems ||
          !this.allSubTablesSelectedColumns[this.activeSubTableIndex]
        ) {
          return false;
        }
        const currentExportableColumns = this.getCurrentExportableSubColumns();
        return (
          currentExportableColumns.length > 0 &&
          this.allSubTablesSelectedColumns[this.activeSubTableIndex].length ===
            currentExportableColumns.length
        );
      },
      set(val) {
        if (!this.allSubTablesSelectedColumns[this.activeSubTableIndex]) {
          this.$set(
            this.allSubTablesSelectedColumns,
            this.activeSubTableIndex,
            []
          );
        }

        if (val) {
          this.allSubTablesSelectedColumns[
            this.activeSubTableIndex
          ] = this.getCurrentExportableSubColumns().map(col => col.prop);
        } else {
          this.allSubTablesSelectedColumns[this.activeSubTableIndex] = [];
        }
      }
    },

    // 當前子表格是否部分選中
    currentSubTableIndeterminate() {
      if (
        !this.hasChildItems ||
        !this.allSubTablesSelectedColumns[this.activeSubTableIndex]
      ) {
        return false;
      }

      const selectedCount = this.allSubTablesSelectedColumns[
        this.activeSubTableIndex
      ].length;
      const totalCount = this.getCurrentExportableSubColumns().length;

      return selectedCount > 0 && selectedCount < totalCount;
    },

    // 主項目預覽資料
    previewData() {
      return this.selectedRows.slice(0, this.maxPreviewRows);
    },

    // 過濾後的子表格配置（只包含有數據的子表格）
    filteredSubTableConfigs() {
      if (!this.hasChildItems) return [];

      return this.subTableConfigs
        .map((config, index) => ({
          ...config,
          originalIndex: index,
          previewData: this.getSubTablePreviewData(index)
        }))
        .filter(config => config.previewData.length > 0);
    },

    // 所有子表格項目總數
    totalAllSubItems() {
      if (!this.hasChildItems) return 0;

      let count = 0;
      for (let i = 0; i < this.subTableConfigs.length; i++) {
        count += this.getSubTableItemsCount(i);
      }

      return count;
    },

    // 所有選中的列總數
    totalSelectedColumns() {
      let count = this.selectedColumns.length;

      if (this.hasChildItems) {
        for (let i = 0; i < this.allSubTablesSelectedColumns.length; i++) {
          if (this.allSubTablesSelectedColumns[i]) {
            count += this.allSubTablesSelectedColumns[i].length;
          }
        }
      }

      return count;
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initializeDialog();
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    selectedColumns(val) {
      const checkedCount = val.length;
      const totalCount = this.exportableColumns.length;

      this.selectAllColumns = checkedCount === totalCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    }
  },

  created() {
    // 初始化子表格列選擇數組
    this.initializeSubTablesColumns();
  },

  methods: {
    // 初始化子表格列
    initializeSubTablesColumns() {
      this.allSubTablesSelectedColumns = [];
      this.subTableColumnsCache = [];

      for (let i = 0; i < this.subTableConfigs.length; i++) {
        const subColumns = this.subTableConfigs[i].columns || [];
        const exportableSubColumns = subColumns.filter(col => !col.noExport);
        this.$set(this.subTableColumnsCache, i, exportableSubColumns);
        this.$set(
          this.allSubTablesSelectedColumns,
          i,
          exportableSubColumns.map(col => col.prop)
        );
      }
    },

    // 初始化對話框
    initializeDialog() {
      // 設定預設選中所有主項目列
      this.selectedColumns = this.exportableColumns.map(col => col.prop);
      this.selectAllColumns = true;
      this.isIndeterminate = false;

      // 初始化所有子表格列選擇
      this.initializeSubTablesColumns();

      // 設定預設檔案名稱
      const timestamp = formatDate(new Date(), "YYYYMMDD_HHmmss");
      this.exportFilename = `${this.filename}_${timestamp}`;

      // 設定預設匯出範圍
      this.activeSubTableIndex = 0;
      this.activeConfigTab = "main";
      this.activePreviewTab = "0";
    },

    // 獲取當前子表格標題
    getCurrentSubTableTitle() {
      if (!this.subTableConfigs[this.activeSubTableIndex]) {
        return "子表格";
      }
      return (
        this.subTableConfigs[this.activeSubTableIndex].title ||
        `子表格 ${this.activeSubTableIndex + 1}`
      );
    },

    // 獲取當前子表格可匯出的列
    getCurrentExportableSubColumns() {
      return this.subTableColumnsCache[this.activeSubTableIndex] || [];
    },

    // 獲取指定子表格顯示的列
    getDisplaySubColumns(index) {
      if (!this.allSubTablesSelectedColumns[index]) return [];
      return this.subTableColumnsCache[index].filter(col =>
        this.allSubTablesSelectedColumns[index].includes(col.prop)
      );
    },

    // 獲取指定子表格的預覽數據
    getSubTablePreviewData(tableIndex) {
      if (!this.hasChildItems) return [];

      const config = this.subTableConfigs[tableIndex];
      if (!config) return [];

      const dataKey = config.dataKey;
      if (!dataKey) return [];

      const subItems = [];
      let count = 0;

      // 收集子項目直到達到最大預覽行數
      for (const row of this.selectedRows) {
        const items = row[dataKey] || [];
        if (items && items.length) {
          // 添加每個子項目的父項目參考
          const itemsWithParent = items.map(item => ({
            ...item,
            _parentId: row.id || row.caseId,
            _parentTitle: row.title || row.customerName || row.caseId
          }));

          subItems.push(...itemsWithParent);
          count += items.length;

          if (count >= this.maxPreviewRows) break;
        }
      }

      return subItems.slice(0, this.maxPreviewRows);
    },

    // 獲取指定子表格項目總數
    getSubTableItemsCount(tableIndex) {
      if (!this.hasChildItems) return 0;

      const config = this.subTableConfigs[tableIndex];
      if (!config || !config.dataKey) return 0;

      const dataKey = config.dataKey;
      let count = 0;

      for (const row of this.selectedRows) {
        const items = row[dataKey] || [];
        if (items && items.length) {
          count += items.length;
        }
      }

      return count;
    },

    // 處理子表格切換
    handleSubTableChange(index) {
      this.activeSubTableIndex = index;
    },

    // 格式化值
    formatValue(row, column) {
      return this.formatColumnValue(row, column);
    },

    // 處理全選主項目列變化
    handleCheckAllColumnsChange(val) {
      this.selectedColumns = val
        ? this.exportableColumns.map(col => col.prop)
        : [];
    },

    // 處理全選子項目列變化
    handleCheckAllSubColumnsChange(val) {
      if (!this.allSubTablesSelectedColumns[this.activeSubTableIndex]) {
        this.$set(
          this.allSubTablesSelectedColumns,
          this.activeSubTableIndex,
          []
        );
      }

      this.allSubTablesSelectedColumns[this.activeSubTableIndex] = val
        ? this.getCurrentExportableSubColumns().map(col => col.prop)
        : [];
    },

    // 獲取所有子表格的所有子項目
    getAllSubItems() {
      if (!this.hasChildItems) return [];

      const result = [];

      // 為每個子表格收集數據
      for (let i = 0; i < this.subTableConfigs.length; i++) {
        const config = this.subTableConfigs[i];
        if (!config || !config.dataKey) continue;

        const dataKey = config.dataKey;
        const subItems = [];

        // 收集此子表格的所有子項目
        for (const row of this.selectedRows) {
          const items = row[dataKey] || [];
          if (items && items.length) {
            // 添加子表格索引和每個子項目的父項目參考
            const itemsWithMeta = items.map(item => ({
              ...item,
              _subTableIndex: i,
              _subTableName: config.title || `子表格 ${i + 1}`,
              _parentId: row.id || row.caseId,
              _parentTitle: row.title || row.customerName || row.caseId
            }));

            subItems.push(...itemsWithMeta);
          }
        }

        result.push({
          subTableIndex: i,
          subTableName: config.title || `子表格 ${i + 1}`,
          dataKey: dataKey,
          items: subItems,
          columns: this.getDisplaySubColumns(i)
        });
      }

      return result;
    },

    // 處理匯出
    handleExport() {
      if (this.selectedColumns.length === 0) {
        this.$message.warning("請至少選擇一個主項目匯出欄位");
        return;
      }

      if (this.hasChildItems) {
        const hasSelectedSubColumns = this.allSubTablesSelectedColumns.some(
          (columns, index) =>
            columns &&
            columns.length > 0 &&
            this.getSubTableItemsCount(index) > 0
        );

        if (!hasSelectedSubColumns) {
          this.$message.warning("請至少為一個有數據的子表格選擇匯出欄位");
          return;
        }
      }

      if (!this.exportFilename) {
        this.$message.warning("請輸入匯出檔案名稱");
        return;
      }

      this.exportLoading = true;

      // 準備匯出資料
      const exportData = {
        format: this.selectedFormat,
        filename: this.exportFilename,
        sheetConfig: this.sheetConfig,
        mainColumns: this.displayColumns,
        selectedRows: this.selectedRows,
        allSubTables: this.hasChildItems ? this.getAllSubItems() : []
      };

      // 延遲模擬匯出過程
      setTimeout(() => {
        this.$emit("export", exportData);
        this.exportLoading = false;
        this.dialogVisible = false;
      }, 800);
    },

    // 處理關閉
    handleClose() {
      if (this.exportLoading) {
        return;
      }
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.export-preview-container {
  .preview-info {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 80px;
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #303133;
        font-weight: 600;
      }

      .field-config-btn {
        margin-left: 16px;
        font-size: 14px;

        i {
          margin-left: 4px;
        }
      }
    }
  }

  .tabs-container {
    margin-bottom: 16px;
  }

  .preview-tabs {
    margin-bottom: 20px;
  }

  .sub-table-selector {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .selector-label {
      margin-right: 12px;
      font-weight: 500;
      color: #606266;
    }
  }

  .column-selection {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 16px;

    .selection-header {
      padding: 10px 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #dcdfe6;
      font-weight: 500;
    }

    .column-list {
      display: flex;
      flex-wrap: wrap;
      padding: 16px;
      gap: 16px;
      max-height: 160px;
      overflow-y: auto;

      .column-item {
        width: calc(33.33% - 16px);
      }
    }
  }

  .preview-table-wrapper {
    margin-bottom: 24px;

    .preview-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #303133;
    }

    .preview-table {
      border-radius: 4px;
      overflow: hidden;
    }
  }

  .export-options {
    margin-bottom: 24px;

    .options-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
    }

    .format-options {
      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .option-label {
          width: 80px;
          color: #606266;
          font-weight: 500;
        }

        .filename-input {
          width: 300px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

::v-deep .list-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #1989fa, #5cadff);
    padding: 15px 20px;
    border-radius: 4px 4px 0 0;
    margin-right: 0;

    .el-dialog__title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .el-dialog__headerbtn {
      top: 15px;

      .el-dialog__close {
        color: #ffffff;
        font-weight: 600;

        &:hover {
          color: #f2f6fc;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .column-selection {
    .column-list {
      .column-item {
        width: calc(50% - 16px);
      }
    }
  }

  .export-options {
    .format-options {
      .option-item {
        flex-direction: column;
        align-items: flex-start;

        .option-label {
          margin-bottom: 8px;
        }

        .filename-input {
          width: 100%;
        }
      }
    }
  }
}
</style>
