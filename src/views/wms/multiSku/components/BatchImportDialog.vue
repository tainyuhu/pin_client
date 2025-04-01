<template>
  <el-dialog
    title="批次匯入"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    width="80%"
    :before-close="handleClose"
    class="batch-import-dialog"
  >
    <div class="import-container">
      <!-- 步驟指示器 -->
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="上傳檔案" />
        <el-step title="資料預覽" />
        <el-step title="資料比對" />
        <el-step title="確認匯入" />
      </el-steps>

      <!-- 步驟內容 -->
      <div class="step-content">
        <!-- 步驟1: 檔案上傳 -->
        <FileUploadStep
          v-if="currentStep === 0"
          :selected-file="selectedFile"
          @file-change="handleFileChange"
          @clear-file="clearFile"
          @download-template="downloadTemplate"
        />

        <!-- 步驟2: 資料預覽 -->
        <DataPreviewStep
          v-if="currentStep === 1"
          :preview-data="previewData"
          :preview-columns="previewColumns"
          :validation-errors="validationErrors"
          :total-rows="totalRows"
          :error-rows-count="errorRowsCount"
          :valid-rows-count="validRowsCount"
          :show-error-only="showErrorOnly"
          @toggle-error-only="showErrorOnly = $event"
        />

        <!-- 步驟3: 資料比對 -->
        <DataComparisonStep
          v-if="currentStep === 2"
          :comparison-result="comparisonResult"
          :selected-items="selectedItems"
          :comparison-columns="comparisonColumns"
          @update-remark="openUpdateRemarkDialog"
          @toggle-selection="toggleItemSelection"
          @toggle-all="toggleAllSelection"
        />

        <!-- 步驟4: 確認匯入 -->
        <ConfirmImportStep
          v-if="currentStep === 3"
          :selected-file="selectedFile"
          :import-summary="importSummary"
        />
      </div>
    </div>

    <!-- 更新備註對話框 -->
    <UpdateRemarkDialog
      :visible.sync="updateRemarkDialogVisible"
      :item="currentEditingItem"
      @save="saveUpdateRemark"
    />

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
import FileUploadStep from "./steps/FileUploadStep.vue";
import DataPreviewStep from "./steps/DataPreviewStep.vue";
import DataComparisonStep from "./steps/DataComparisonStep.vue";
import ConfirmImportStep from "./steps/ConfirmImportStep.vue";
import UpdateRemarkDialog from "./UpdateRemarkDialog.vue";
import MultiSkuService from "../services/MultiSkuService";

export default {
  name: "BatchImportDialog",

  components: {
    FileUploadStep,
    DataPreviewStep,
    DataComparisonStep,
    ConfirmImportStep,
    UpdateRemarkDialog
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      currentStep: 0,
      selectedFile: null,
      previewData: [],
      totalRows: 0,
      systemData: [], // 系統現有品號資料
      previewColumns: [
        { prop: "productCode", label: "品號", width: "120" },
        { prop: "productName", label: "品名", width: "200" },
        { prop: "specification", label: "規格", width: "150" },
        { prop: "unit", label: "單位", width: "80" },
        { prop: "boxSize", label: "箱入數", width: "100" }
      ],
      comparisonColumns: [
        { prop: "productCode", label: "品號", width: "120" },
        { prop: "productName", label: "品名", width: "200" },
        { prop: "specification", label: "規格", width: "150" },
        { prop: "unit", label: "單位", width: "80" },
        { prop: "boxSize", label: "箱入數", width: "100" },
        { prop: "changes", label: "變更內容", width: "200" },
        { prop: "remark", label: "備註", width: "200" }
      ],
      processing: false,
      showErrorOnly: false,
      validationErrors: new Map(),
      comparisonResult: {
        newItems: [], // 新增項目
        updateItems: [], // 更新項目
        deleteItems: [] // 停用項目
      },
      selectedItems: {
        newItems: new Set(),
        updateItems: new Set(),
        deleteItems: new Set()
      },
      updateRemarkDialogVisible: false,
      currentEditingItem: null,
      importSummary: {
        newCount: 0,
        updateCount: 0,
        deleteCount: 0,
        totalCount: 0
      }
    };
  },

  computed: {
    stepButtonText() {
      const texts = ["下一步", "下一步", "下一步", "開始匯入"];
      return texts[this.currentStep];
    },

    canProceed() {
      switch (this.currentStep) {
        case 0:
          return !!this.selectedFile;
        case 1:
          return this.validRowsCount > 0;
        case 2:
          return this.hasSelectedItems;
        case 3:
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

    hasSelectedItems() {
      return (
        this.selectedItems.newItems.size > 0 ||
        this.selectedItems.updateItems.size > 0 ||
        this.selectedItems.deleteItems.size > 0
      );
    }
  },

  created() {
    // 載入系統品號資料
    this.loadSystemData();
  },

  methods: {
    // 載入系統品號資料
    async loadSystemData() {
      try {
        // 呼叫 API 取得系統現有的品號資料
        this.systemData = await MultiSkuService.getProductList();
        console.log("已載入系統品號資料:", this.systemData.length);
      } catch (error) {
        console.error("載入系統品號資料失敗:", error);
        this.$message.error("載入系統品號資料失敗");
      }
    },

    // 處理檔案變更
    handleFileChange(file) {
      this.selectedFile = file;
    },

    // 清除檔案
    clearFile() {
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
      this.comparisonResult = {
        newItems: [],
        updateItems: [],
        deleteItems: []
      };
      this.selectedItems = {
        newItems: new Set(),
        updateItems: new Set(),
        deleteItems: new Set()
      };
    },

    // 下載匯入範本
    downloadTemplate() {
      const BOM = "\uFEFF";
      const headers = this.previewColumns.map(col => col.label);
      const csvContent = BOM + headers.join(",");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8"
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "批次匯入範本.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    },

    // 驗證資料行
    validateRow(row, index) {
      const errors = [];

      // 必填欄位驗證
      const requiredFields = ["productCode", "productName", "unit"];
      requiredFields.forEach(field => {
        if (!row[field] && row[field] !== 0) {
          errors.push(`${this.getFieldLabel(field)}不能為空`);
        }
      });

      // 數值欄位驗證
      if (
        row.boxSize !== undefined &&
        row.boxSize !== null &&
        row.boxSize !== "" &&
        !this.isValidNumber(row.boxSize)
      ) {
        errors.push("箱入數必須為正整數");
      }

      if (errors.length > 0) {
        this.validationErrors.set(index, errors);
        return false;
      }

      return true;
    },

    // 驗證是否為有效數字
    isValidNumber(value) {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && /^\d+$/.test(value.toString());
    },

    // 取得欄位標籤
    getFieldLabel(field) {
      const column = this.previewColumns.find(col => col.prop === field);
      return column ? column.label : field;
    },

    // 解析檔案
    async parseFile() {
      this.processing = true;
      try {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
          reader.onload = () => {
            Papa.parse(reader.result, {
              header: true,
              dynamicTyping: false, // 保持字串格式以便後續驗證
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
          console.log("解析到的數據:", result.data[0]); // 顯示第一行數據以便調試

          // 處理頭欄位與預期欄位匹配的問題
          const headerMap = {
            品號: "productCode",
            品名: "productName",
            規格: "specification",
            單位: "unit",
            箱入數: "boxSize"
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

          console.log("總行數:", this.totalRows);
          console.log("錯誤行數:", this.errorRowsCount);
          console.log("有效行數:", this.validRowsCount);
        }
      } catch (error) {
        this.$message.error("檔案解析失敗");
        console.error("解析錯誤:", error);
      } finally {
        this.processing = false;
      }
    },

    // 比對系統與匯入資料
    compareData() {
      const importData = this.previewData.filter(
        (row, index) => !this.validationErrors.has(index)
      );

      // 處理數值型欄位
      const processedImportData = importData.map(row => ({
        ...row,
        boxSize: row.boxSize ? parseInt(row.boxSize, 10) : null
      }));

      // 根據品號建立系統資料的查詢對象
      const systemDataMap = new Map();
      this.systemData.forEach(item => {
        systemDataMap.set(item.productCode, item);
      });

      // 根據品號建立匯入資料的查詢對象
      const importDataMap = new Map();
      processedImportData.forEach(item => {
        importDataMap.set(item.productCode, item);
      });

      // 找出新增項目 (匯入中有，系統中沒有)
      const newItems = processedImportData
        .filter(item => !systemDataMap.has(item.productCode))
        .map(item => ({
          ...item,
          type: "new",
          selected: true
        }));

      // 找出更新項目 (兩邊都有，但內容不同)
      const updateItems = [];
      for (const importItem of processedImportData) {
        const systemItem = systemDataMap.get(importItem.productCode);

        if (systemItem) {
          // 檢查是否有欄位值不同
          const changes = this.findChanges(systemItem, importItem);

          if (changes.length > 0) {
            updateItems.push({
              ...importItem,
              type: "update",
              systemData: systemItem,
              changes,
              remark: "",
              selected: true
            });
          }
        }
      }

      // 找出停用項目 (系統中有，匯入中沒有)
      const deleteItems = this.systemData
        .filter(item => !importDataMap.has(item.productCode) && item.status)
        .map(item => ({
          ...item,
          type: "delete",
          selected: true
        }));

      // 設置比對結果
      this.comparisonResult = {
        newItems,
        updateItems,
        deleteItems
      };

      // 初始化選擇的項目
      this.selectedItems = {
        newItems: new Set(newItems.map(item => item.productCode)),
        updateItems: new Set(updateItems.map(item => item.productCode)),
        deleteItems: new Set(deleteItems.map(item => item.productCode))
      };

      // 更新匯入摘要
      this.updateImportSummary();
    },

    // 更新匯入摘要
    updateImportSummary() {
      this.importSummary = {
        newCount: this.selectedItems.newItems.size,
        updateCount: this.selectedItems.updateItems.size,
        deleteCount: this.selectedItems.deleteItems.size,
        totalCount:
          this.selectedItems.newItems.size +
          this.selectedItems.updateItems.size +
          this.selectedItems.deleteItems.size
      };
    },

    // 尋找兩個對象之間的差異
    findChanges(systemItem, importItem) {
      const changes = [];
      const fieldsToCompare = [
        "productName",
        "specification",
        "unit",
        "boxSize"
      ];

      for (const field of fieldsToCompare) {
        if (systemItem[field] !== importItem[field]) {
          const fieldLabel = this.getFieldLabel(field);
          changes.push({
            field,
            label: fieldLabel,
            oldValue: systemItem[field],
            newValue: importItem[field]
          });
        }
      }

      return changes;
    },

    // 開啟更新備註對話框
    openUpdateRemarkDialog(item) {
      this.currentEditingItem = item;
      this.updateRemarkDialogVisible = true;
    },

    // 儲存更新備註
    saveUpdateRemark(item, remark) {
      // 找到對應的更新項目並更新備註
      const index = this.comparisonResult.updateItems.findIndex(
        updateItem => updateItem.productCode === item.productCode
      );

      if (index !== -1) {
        this.comparisonResult.updateItems[index].remark = remark;
      }

      this.updateRemarkDialogVisible = false;
    },

    // 切換項目選擇狀態
    toggleItemSelection(type, productCode, selected) {
      const typeMap = {
        new: "newItems",
        update: "updateItems",
        delete: "deleteItems"
      };

      const itemSet = this.selectedItems[typeMap[type]];

      if (selected) {
        itemSet.add(productCode);
      } else {
        itemSet.delete(productCode);
      }

      // 更新對應的比對結果項目的選擇狀態
      const resultType =
        type === "new"
          ? "newItems"
          : type === "update"
          ? "updateItems"
          : "deleteItems";

      const itemIndex = this.comparisonResult[resultType].findIndex(
        item => item.productCode === productCode
      );

      if (itemIndex !== -1) {
        this.comparisonResult[resultType][itemIndex].selected = selected;
      }

      // 更新匯入摘要
      this.updateImportSummary();
    },

    // 切換全部選擇狀態
    toggleAllSelection(type, selected) {
      const typeMap = {
        new: "newItems",
        update: "updateItems",
        delete: "deleteItems"
      };

      const resultType = typeMap[type];
      const items = this.comparisonResult[resultType];

      // 清空當前選擇集合
      this.selectedItems[resultType].clear();

      // 根據選擇狀態添加或更新項目
      items.forEach(item => {
        item.selected = selected;
        if (selected) {
          this.selectedItems[resultType].add(item.productCode);
        }
      });

      // 更新匯入摘要
      this.updateImportSummary();
    },

    // 下一步
    async nextStep() {
      if (this.currentStep === 0 && this.selectedFile) {
        await this.parseFile();
      } else if (this.currentStep === 1) {
        this.compareData();
      } else if (this.currentStep === 3) {
        await this.handleImport();
        return;
      }

      if (this.canProceed) {
        this.currentStep++;
      }
    },

    // 上一步
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },

    // 處理匯入
    async handleImport() {
      this.processing = true;
      try {
        // 準備匯入資料 (新增、更新、停用)
        const importData = {
          newItems: this.comparisonResult.newItems.filter(item =>
            this.selectedItems.newItems.has(item.productCode)
          ),

          updateItems: this.comparisonResult.updateItems
            .filter(item =>
              this.selectedItems.updateItems.has(item.productCode)
            )
            .map(item => ({
              ...item,
              changes: item.changes,
              remark: item.remark || "批次更新"
            })),

          deleteItems: this.comparisonResult.deleteItems
            .filter(item =>
              this.selectedItems.deleteItems.has(item.productCode)
            )
            .map(item => ({
              productCode: item.productCode,
              remark: "批次匯入時停用"
            }))
        };

        // 發送匯入請求
        await this.$emit("submit", importData);
        this.$message.success("匯入成功");
        this.handleClose();
      } catch (error) {
        this.$message.error("匯入失敗");
        console.error("匯入錯誤:", error);
      } finally {
        this.processing = false;
      }
    },

    // 返回要匯入的選定筆數
    getSelectedItemsCount() {
      return {
        new: this.selectedItems.newItems.size,
        update: this.selectedItems.updateItems.size,
        delete: this.selectedItems.deleteItems.size,
        total:
          this.selectedItems.newItems.size +
          this.selectedItems.updateItems.size +
          this.selectedItems.deleteItems.size
      };
    },

    // 關閉對話框
    handleClose() {
      this.currentStep = 0;
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
      this.processing = false;
      this.comparisonResult = {
        newItems: [],
        updateItems: [],
        deleteItems: []
      };
      this.selectedItems = {
        newItems: new Set(),
        updateItems: new Set(),
        deleteItems: new Set()
      };
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
  }
}
</style>
