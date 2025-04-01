<!-- BatchImportDialog.vue -->
<template>
  <el-dialog
    title="入庫單批次匯入"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    width="800px"
    :before-close="handleClose"
    class="batch-import-dialog"
  >
    <div class="import-container">
      <!-- 步驟指示器 -->
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="上傳檔案" />
        <el-step title="資料預覽" />
        <el-step title="確認匯入" />
      </el-steps>

      <!-- 步驟內容 -->
      <div class="step-content">
        <!-- 步驟1: 檔案上傳 -->
        <div v-if="currentStep === 0" class="upload-step">
          <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
            <el-upload
              ref="upload"
              class="upload-component"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".csv"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">
                拖曳檔案至此處或 <em>點擊上傳</em>
              </div>
              <div class="el-upload__tip">只能上傳 CSV 檔案</div>
            </el-upload>
          </div>

          <div v-if="selectedFile" class="file-info">
            <span>已選擇檔案: {{ selectedFile.name }}</span>
            <el-button type="text" @click="clearFile">
              <i class="el-icon-delete" />
              移除
            </el-button>
          </div>

          <div class="template-download">
            <el-button type="text" @click="downloadTemplate">
              <i class="el-icon-download" />
              下載匯入範本
            </el-button>
          </div>
        </div>

        <!-- 步驟2: 資料預覽 -->
        <div v-if="currentStep === 1" class="preview-step">
          <div class="preview-header">
            <div class="preview-info">
              <span>總筆數: {{ totalRows }}</span>
              <span>有效筆數: {{ validRowsCount }}</span>
              <span>錯誤筆數: {{ errorRowsCount }}</span>
            </div>
            <div class="preview-actions">
              <el-switch v-model="showErrorOnly" active-text="只顯示錯誤資料" />
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

        <!-- 步驟3: 確認匯入 -->
        <div v-if="currentStep === 2" class="confirm-step">
          <div class="import-summary">
            <el-alert
              v-if="errorRowsCount > 0"
              title="注意：資料包含錯誤"
              type="warning"
              :description="
                `發現 ${errorRowsCount} 筆資料有誤，這些資料將被略過。`
              "
              show-icon
              :closable="false"
            />

            <el-card class="summary-card">
              <template #header>
                <span>匯入資料摘要</span>
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
                  <span class="label">將匯入筆數</span>
                  <span class="value">{{ validRowsCount }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">略過筆數</span>
                  <span class="value">{{ errorRowsCount }}</span>
                </div>
                <div class="summary-item" v-if="validRowsCount > 0">
                  <span class="label">總入庫數量</span>
                  <span class="value">{{ totalQuantity }}</span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 對話框底部按鈕 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="previousStep"
          >上一步</el-button
        >
        <el-button
          type="primary"
          :loading="processing"
          :disabled="!canProceed"
          @click="nextStep"
        >
          {{ stepButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import Papa from "papaparse";

export default {
  name: "BatchImportDialog",

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    // 預設倉庫選項
    warehouseOptions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      currentStep: 0,
      selectedFile: null,
      previewData: [],
      totalRows: 0,
      previewColumns: [
        { prop: "productCode", label: "品號", width: "120" },
        { prop: "batchNumber", label: "批號", width: "150" },
        { prop: "quantity", label: "數量", width: "100" },
        { prop: "warehouse", label: "倉別", width: "100" },
        { prop: "location", label: "儲位編號", width: "120" },
        { prop: "expiryDate", label: "效期", width: "120" },
        { prop: "remark", label: "備註", width: "200" }
      ],
      processing: false,
      showErrorOnly: false,
      validationErrors: new Map(),
      importErrors: []
    };
  },

  computed: {
    stepButtonText() {
      const texts = ["下一步", "下一步", "開始匯入"];
      return texts[this.currentStep];
    },

    canProceed() {
      switch (this.currentStep) {
        case 0:
          return !!this.selectedFile;
        case 1:
          return this.validRowsCount > 0;
        case 2:
          return true;
        default:
          return false;
      }
    },

    validRowsCount() {
      return this.totalRows - this.errorRowsCount;
    },

    errorRowsCount() {
      return this.validationErrors.size;
    },

    filteredPreviewData() {
      if (this.showErrorOnly) {
        return this.previewData.filter((row, index) =>
          this.validationErrors.has(index)
        );
      }
      return this.previewData;
    },

    // 計算總入庫數量
    totalQuantity() {
      return this.previewData
        .filter((row, index) => !this.validationErrors.has(index))
        .reduce((sum, row) => {
          const qty = parseInt(row.quantity, 10);
          return sum + (isNaN(qty) ? 0 : qty);
        }, 0);
    }
  },

  methods: {
    handleFileChange(uploadFile) {
      console.log("File change event:", uploadFile);

      // Element UI 的上傳元件回傳的是一個包含 raw 屬性的對象
      if (uploadFile && uploadFile.raw) {
        this.selectedFile = uploadFile.raw;
        console.log("File selected (from raw):", this.selectedFile.name);
      }

      // 強制更新視圖確保顯示選擇的文件
      this.$forceUpdate();
    },

    handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
          this.selectedFile = files[0];
          console.log("File dropped:", this.selectedFile.name);
        } else {
          this.$message.error("請上傳 CSV 檔案");
        }
      }
    },

    clearFile() {
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles();
      }
    },

    validateRow(row, index) {
      const errors = [];

      // 必填欄位驗證
      const requiredFields = ["productCode", "batchNumber", "quantity"];
      requiredFields.forEach(field => {
        if (!row[field] && row[field] !== 0) {
          errors.push(`${this.getFieldLabel(field)}不能為空`);
        }
      });

      // 數量欄位驗證
      if (!this.isValidNumber(row.quantity)) {
        errors.push("數量必須為正整數");
      }

      // 效期格式驗證
      if (row.expiryDate && !this.isValidDateFormat(row.expiryDate)) {
        errors.push("效期格式不正確，應為 YYYY-MM-DD");
      }

      // 倉別驗證
      if (row.warehouse && this.warehouseOptions.length > 0) {
        const isValidWarehouse = this.warehouseOptions.some(
          option =>
            option.value === row.warehouse || option.label === row.warehouse
        );
        if (!isValidWarehouse) {
          errors.push("無效的倉別");
        }
      }

      if (errors.length > 0) {
        this.validationErrors.set(index, errors);
        return false;
      }

      return true;
    },

    isValidNumber(value) {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && /^\d+$/.test(value.toString());
    },

    isValidDateFormat(dateStr) {
      // 簡單的日期格式檢查 (YYYY-MM-DD)
      return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    },

    getFieldLabel(field) {
      const column = this.previewColumns.find(col => col.prop === field);
      return column ? column.label : field;
    },

    hasError(row, field) {
      const rowIndex = this.previewData.indexOf(row);
      const errors = this.validationErrors.get(rowIndex);
      return (
        errors &&
        errors.some(error => error.includes(this.getFieldLabel(field)))
      );
    },

    getErrorMessage(row, field) {
      const rowIndex = this.previewData.indexOf(row);
      const errors = this.validationErrors.get(rowIndex);
      if (!errors) return "";

      return errors
        .filter(error => error.includes(this.getFieldLabel(field)))
        .join("\n");
    },

    async nextStep() {
      if (this.currentStep === 0 && this.selectedFile) {
        await this.parseFile();
      } else if (this.currentStep === 2) {
        await this.handleImport();
        return;
      }

      if (this.canProceed) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },

    async parseFile() {
      this.processing = true;
      try {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
          reader.onload = () => {
            Papa.parse(reader.result, {
              header: true,
              dynamicTyping: false, // 保持字符串格式以便後續驗證
              skipEmptyLines: true,
              encoding: "UTF-8",
              complete: resolve,
              error: reject
            });
          };
          reader.onerror = reject;
          reader.readAsText(this.selectedFile, "UTF-8");
        });

        if (result.data && Array.isArray(result.data)) {
          // 處理頭欄位與預期欄位匹配的問題
          const headerMap = {
            品號: "productCode",
            批號: "batchNumber",
            數量: "quantity",
            倉別: "warehouse",
            儲位編號: "location",
            效期: "expiryDate",
            備註: "remark"
          };

          // 根據頭欄位映射轉換數據
          this.previewData = result.data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = headerMap[key] || key;
              newRow[normalizedKey] = row[key];
            });
            return newRow;
          });

          this.totalRows = this.previewData.length;
          this.validationErrors.clear();

          // 清理空行或全空資料
          this.previewData = this.previewData.filter(row => {
            return Object.values(row).some(
              value => value && value.trim && value.trim() !== ""
            );
          });
          this.totalRows = this.previewData.length;

          // 驗證每一行資料
          this.previewData.forEach((row, index) => {
            this.validateRow(row, index);
          });

          console.log("Total rows:", this.totalRows);
          console.log("Error rows:", this.errorRowsCount);
          console.log("Valid rows:", this.validRowsCount);
        }
      } catch (error) {
        this.$message.error("檔案解析失敗");
        console.error("File parsing error:", error);
      } finally {
        this.processing = false;
      }
    },

    async handleImport() {
      this.processing = true;
      try {
        const validData = this.previewData.filter(
          (row, index) => !this.validationErrors.has(index)
        );

        // 轉換數據格式以符合後台要求，例如將數量轉為數字類型
        const processedData = validData.map(row => ({
          ...row,
          quantity: parseInt(row.quantity, 10) || 0
        }));

        await this.$emit("submit", processedData);
        this.$message.success("入庫單匯入成功");
        this.handleClose();
      } catch (error) {
        this.$message.error("匯入失敗");
        console.error("Import error:", error);
      } finally {
        this.processing = false;
      }
    },

    downloadTemplate() {
      const BOM = "\uFEFF";
      const headers = this.previewColumns.map(col => col.label);
      const csvContent = BOM + headers.join(",");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8"
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "入庫單匯入範本.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    },

    handleClose() {
      this.currentStep = 0;
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
      this.processing = false;
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.batch-import-dialog {
  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #155bd4, #4fb1db);
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

  .import-container {
    padding: 20px 0;
  }

  .step-content {
    margin-top: 30px;
    min-height: 300px;
  }

  // 上傳步驟樣式
  .upload-step {
    text-align: center;

    .upload-area {
      border: 2px dashed #dcdfe6;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;

      &:hover {
        border-color: #409eff;
      }
    }

    .file-info {
      margin: 20px 0;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .el-button {
        margin-left: 10px;
        color: #f56c6c;
      }
    }

    .template-download {
      margin-top: 20px;

      .el-button {
        font-size: 14px;
      }
    }

    .el-upload {
      width: 100%;
    }

    .el-upload-dragger {
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .el-icon-upload {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 10px;
      }

      .el-upload__text {
        font-size: 16px;
        color: #606266;

        em {
          color: #409eff;
          font-style: normal;
        }
      }
    }
  }

  // 預覽步驟樣式
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

  // 確認步驟樣式
  .confirm-step {
    .import-summary {
      .el-alert {
        margin-bottom: 20px;
      }

      .summary-card {
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
    }
  }

  // 按鈕樣式
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .batch-import-dialog {
    .el-dialog {
      width: 90% !important;
      margin: 5vh auto !important;
    }

    .preview-step {
      .preview-header {
        flex-direction: column;
        gap: 10px;

        .preview-info {
          flex-wrap: wrap;
          gap: 10px;
        }
      }
    }
  }
}
</style>
