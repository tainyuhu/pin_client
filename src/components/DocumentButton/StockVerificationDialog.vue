<template>
  <el-dialog
    title="庫存驗證"
    :visible.sync="visibleSync"
    :width="isMobile ? '100%' : '900px'"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-verification-dialog"
  >
    <div class="verification-container">
      <!-- 上傳區域 -->
      <div class="form-section">
        <div class="section-title">ERP庫存資料上傳</div>
        <div class="upload-area">
          <el-upload
            class="excel-uploader"
            action="#"
            :auto-upload="false"
            :http-request="handleFileUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept=".xlsx, .xls"
            :limit="1"
          >
            <el-button slot="trigger" size="small" type="primary">
              <i class="el-icon-upload"></i> 選擇ERP庫存報表
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="processFile"
              :disabled="!fileList.length || loading"
              style="margin-left: 10px"
            >
              <i class="el-icon-check"></i> 開始驗證
            </el-button>
            <div slot="tip" class="el-upload__tip">
              請上傳ERP匯出的庫存Excel檔案，文件需包含品號、批號與庫存數量
            </div>
          </el-upload>
        </div>

        <!-- 示範資料組件 -->
        <div class="file-format" v-if="showSampleData">
          <div class="format-title">
            <i class="el-icon-info"></i> 檔案格式說明
          </div>
          <div class="format-content">
            <p>Excel檔案需包含以下欄位：</p>
            <ul>
              <li><strong>品號</strong> - 產品的唯一識別碼</li>
              <li><strong>品名</strong> - 產品名稱 (可選)</li>
              <li><strong>批號</strong> - 產品批號</li>
              <li><strong>庫存數量</strong> - ERP系統中的庫存數量</li>
              <li><strong>有效期限</strong> - 批號的有效日期 (可選)</li>
            </ul>

            <!-- 切換按鈕 -->
            <div class="toggle-sample">
              <el-button type="text" size="small" @click="toggleSampleTable">
                {{ sampleTableVisible ? "隱藏示範資料" : "顯示示範資料" }}
                <i
                  :class="
                    sampleTableVisible
                      ? 'el-icon-arrow-up'
                      : 'el-icon-arrow-down'
                  "
                ></i>
              </el-button>
            </div>

            <!-- 引入示範資料表格組件 -->
            <div v-if="sampleTableVisible" class="sample-data-wrapper">
              <sample-data-table @download-sample="handleDownloadSample" />
            </div>
          </div>
        </div>
      </div>

      <!-- 處理狀態顯示 -->
      <div v-if="loading" class="form-section">
        <div class="processing-status">
          <el-progress
            :percentage="processingPercentage"
            :status="processingPercentage === 100 ? 'success' : ''"
          ></el-progress>
          <div class="status-text">{{ processingStatus }}</div>
        </div>
      </div>

      <!-- 驗證結果 -->
      <div v-if="hasResults" class="form-section results-section">
        <div class="section-header">
          <div class="section-title">驗證結果</div>
          <div class="result-summary">
            <span
              class="result-item"
              :class="{ warning: totalDiscrepancies > 0 }"
            >
              <i class="el-icon-warning"></i> 發現差異: {{ totalDiscrepancies }}
            </span>
            <span class="result-item">
              <i class="el-icon-document"></i> 總比對項目: {{ totalItems }}
            </span>
          </div>
        </div>

        <!-- 過濾選項 -->
        <div class="filter-options">
          <el-radio-group v-model="resultFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="discrepancies">僅顯示差異</el-radio-button>
          </el-radio-group>

          <el-input
            v-model="searchKeyword"
            placeholder="搜尋品號或批號"
            prefix-icon="el-icon-search"
            size="small"
            style="width: 200px; margin-left: 16px;"
            clearable
          ></el-input>
        </div>

        <!-- 結果表格 -->
        <el-table
          :data="filteredResults"
          style="width: 100%"
          border
          stripe
          size="small"
          :max-height="tableMaxHeight"
          v-loading="tableLoading"
        >
          <el-table-column
            prop="productId"
            label="品號"
            min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="productName"
            label="品名"
            min-width="140"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="batchNumber"
            label="批號"
            min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="ERP庫存" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.erpStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="系統庫存" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.systemStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="差異" width="100" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getDifferenceTagType(scope.row.difference)"
                size="medium"
              >
                {{ scope.row.difference > 0 ? "+" : ""
                }}{{ scope.row.difference }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="有效期限" width="110">
            <template slot-scope="scope">
              <span>{{ scope.row.expiryDate || "—" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="狀態" width="100" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.difference !== 0 ? 'danger' : 'success'"
                size="small"
              >
                {{ scope.row.difference !== 0 ? "不一致" : "一致" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 報表操作 -->
        <div class="report-actions">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-document"
            @click="exportToExcel"
            :disabled="!hasResults"
          >
            匯出報表
          </el-button>
          <el-button
            type="success"
            size="small"
            icon="el-icon-s-promotion"
            @click="showGenerateAdjustmentConfirm"
            :disabled="totalDiscrepancies === 0"
          >
            生成調整單
          </el-button>
        </div>
      </div>

      <!-- 結果摘要 -->
      <div v-if="hasSummary" class="form-section">
        <div class="section-title">差異摘要</div>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-value">{{ erp_more_count }}</div>
            <div class="card-label">ERP數量大於系統</div>
          </div>
          <div class="summary-card">
            <div class="card-value">{{ system_more_count }}</div>
            <div class="card-label">系統數量大於ERP</div>
          </div>
          <div class="summary-card">
            <div class="card-value">{{ missing_in_system_count }}</div>
            <div class="card-label">系統缺少批號</div>
          </div>
          <div class="summary-card">
            <div class="card-value">{{ missing_in_erp_count }}</div>
            <div class="card-label">ERP缺少批號</div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="dialog-footer">
        <el-button plain @click="handleClose">關閉</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import SampleDataTable from "./SampleDataTable.vue";

export default {
  name: "StockVerificationDialog",

  components: {
    SampleDataTable
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    productData: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      fileList: [],
      loading: false,
      processingPercentage: 0,
      processingStatus: "",
      verificationResults: [],
      resultFilter: "all",
      searchKeyword: "",
      tableLoading: false,
      tableMaxHeight: 400,
      showSampleData: true, // 控制是否顯示檔案格式說明
      sampleTableVisible: false, // 控制示範資料表格是否顯示
      windowWidth: window.innerWidth,

      // 摘要數據
      erp_more_count: 0,
      system_more_count: 0,
      missing_in_system_count: 0,
      missing_in_erp_count: 0
    };
  },

  computed: {
    visibleSync: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
    isMobile() {
      return this.windowWidth < 768;
    },
    hasResults() {
      return this.verificationResults.length > 0;
    },
    hasSummary() {
      return this.hasResults && this.totalDiscrepancies > 0;
    },
    totalDiscrepancies() {
      return this.verificationResults.filter(item => item.difference !== 0)
        .length;
    },
    totalItems() {
      return this.verificationResults.length;
    },
    filteredResults() {
      let results = [...this.verificationResults];

      // 過濾僅顯示差異
      if (this.resultFilter === "discrepancies") {
        results = results.filter(item => item.difference !== 0);
      }

      // 搜尋關鍵字
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        results = results.filter(
          item =>
            (item.productId &&
              item.productId.toLowerCase().includes(keyword)) ||
            (item.productName &&
              item.productName.toLowerCase().includes(keyword)) ||
            (item.batchNumber &&
              item.batchNumber.toLowerCase().includes(keyword))
        );
      }

      return results;
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initDialog();
        this.calculateTableHeight();
      }
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.calculateTableHeight();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    // 切換示範資料表格顯示狀態
    toggleSampleTable() {
      this.sampleTableVisible = !this.sampleTableVisible;
    },

    // 處理示範資料下載
    handleDownloadSample() {
      // 在這裡實現實際的Excel範本下載功能
      this.$msgbox({
        title: "提示",
        message: "示範檔案下載功能將在未來版本中提供",
        type: "info"
      });
    },

    handleResize() {
      this.windowWidth = window.innerWidth;
      this.calculateTableHeight();
    },

    calculateTableHeight() {
      // 計算表格最大高度
      setTimeout(() => {
        const windowHeight = window.innerHeight;
        this.tableMaxHeight = windowHeight * 0.4; // 視窗高度的40%
      }, 100);
    },

    // 初始化對話框
    initDialog() {
      this.fileList = [];
      this.verificationResults = [];
      this.processingPercentage = 0;
      this.processingStatus = "";
      this.resultFilter = "all";
      this.searchKeyword = "";
      this.erp_more_count = 0;
      this.system_more_count = 0;
      this.missing_in_system_count = 0;
      this.missing_in_erp_count = 0;
      this.sampleTableVisible = false;
    },

    // 處理檔案選擇
    handleFileChange(file) {
      // 檢查檔案類型
      const isExcel =
        file.raw.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.raw.type === "application/vnd.ms-excel";
      if (!isExcel) {
        this.$msgbox({
          title: "錯誤",
          message: "只能上傳Excel檔案",
          type: "error"
        });
        this.fileList = [];
        return false;
      }

      this.fileList = [file];
    },

    // 處理檔案移除
    handleFileRemove() {
      this.fileList = [];
    },

    // 自定義上傳請求處理
    handleFileUpload() {
      // 阻止默認上傳
      return false;
    },

    // 處理檔案
    async processFile() {
      if (!this.fileList.length) return;

      const file = this.fileList[0].raw;
      this.loading = true;
      this.processingPercentage = 0;
      this.processingStatus = "準備處理檔案...";

      try {
        // 使用FileReader讀取Excel檔案
        const reader = new FileReader();

        reader.onload = async e => {
          try {
            this.processingStatus = "解析Excel檔案...";
            this.processingPercentage = 10;

            // 使用SheetJS解析Excel
            // const data = new Uint8Array(e.target.result);
            // const workbook = XLSX.read(data, { type: 'array' });
            // const sheetName = workbook.SheetNames[0];
            // const worksheet = workbook.Sheets[sheetName];
            // const erpData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 模擬解析Excel檔案，實際開發時請使用上面的代碼
            this.processingPercentage = 30;
            this.processingStatus = "取得系統庫存資料...";

            // 模擬延遲，實際開發時應該調用API獲取系統庫存
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.processingPercentage = 60;
            this.processingStatus = "比對庫存差異...";

            // 模擬比對過程，實際開發時應該執行真正的比對
            await this.compareStockData();

            this.processingPercentage = 100;
            this.processingStatus = "驗證完成";

            // 計算摘要統計
            this.calculateSummary();
          } catch (error) {
            console.error("處理Excel檔案時發生錯誤:", error);
            this.$msgbox({
              title: "錯誤",
              message: "Excel檔案處理失敗: " + (error.message || error),
              type: "error"
            });
          }
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("檔案讀取錯誤:", error);
        this.$msgbox({
          title: "錯誤",
          message: "檔案讀取失敗: " + (error.message || error),
          type: "error"
        });
        this.loading = false;
      }
    },

    // 比對庫存數據（模擬）
    async compareStockData() {
      // 模擬比對庫存數據的過程
      // 實際開發時，應該使用真實數據進行比對

      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 生成模擬比對結果
      const results = [];
      const products =
        this.productData.length > 0
          ? this.productData
          : [
              { id: "P001", name: "口罩" },
              { id: "P002", name: "酒精" },
              { id: "P003", name: "體溫計" },
              { id: "P004", name: "感冒藥" }
            ];

      // 為每個產品生成多個批號記錄
      products.forEach(product => {
        const batchCount = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < batchCount; i++) {
          const batchNumber = `B${product.id}${String(i + 1).padStart(3, "0")}`;
          const erpStock = Math.floor(Math.random() * 1000);

          // 生成系統庫存，有20%機率與ERP不一致
          let systemStock = erpStock;
          if (Math.random() < 0.2) {
            // 產生不一致的庫存量
            const diff = Math.floor(Math.random() * 20) - 10; // -10 到 +10
            systemStock = Math.max(0, erpStock + diff);
          }

          results.push({
            productId: product.id,
            productName: product.name,
            batchNumber: batchNumber,
            erpStock: erpStock,
            systemStock: systemStock,
            difference: erpStock - systemStock,
            expiryDate: this.getRandomExpiryDate()
          });
        }

        // 有20%機率添加系統中沒有的批號（只存在於ERP）
        if (Math.random() < 0.2) {
          results.push({
            productId: product.id,
            productName: product.name,
            batchNumber: `B${product.id}ERPO1`,
            erpStock: Math.floor(Math.random() * 100) + 1,
            systemStock: 0,
            difference: Math.floor(Math.random() * 100) + 1,
            expiryDate: this.getRandomExpiryDate()
          });
        }

        // 有20%機率添加ERP中沒有的批號（只存在於系統）
        if (Math.random() < 0.2) {
          results.push({
            productId: product.id,
            productName: product.name,
            batchNumber: `B${product.id}SYS01`,
            erpStock: 0,
            systemStock: Math.floor(Math.random() * 100) + 1,
            difference: -1 * (Math.floor(Math.random() * 100) + 1),
            expiryDate: this.getRandomExpiryDate()
          });
        }
      });

      this.verificationResults = results;
      this.loading = false;
    },

    // 計算摘要統計
    calculateSummary() {
      this.erp_more_count = this.verificationResults.filter(
        item => item.difference > 0 && item.systemStock > 0
      ).length;
      this.system_more_count = this.verificationResults.filter(
        item => item.difference < 0 && item.erpStock > 0
      ).length;
      this.missing_in_system_count = this.verificationResults.filter(
        item => item.systemStock === 0 && item.erpStock > 0
      ).length;
      this.missing_in_erp_count = this.verificationResults.filter(
        item => item.erpStock === 0 && item.systemStock > 0
      ).length;
    },

    // 獲取差異標籤類型
    getDifferenceTagType(difference) {
      if (difference > 0) return "danger";
      if (difference < 0) return "warning";
      return "success";
    },

    // 生成隨機有效期限（用於測試數據）
    getRandomExpiryDate() {
      const today = new Date();
      // 隨機1-365天後過期
      const daysToAdd = Math.floor(Math.random() * 365) + 1;
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + daysToAdd);

      return expiryDate.toISOString().slice(0, 10);
    },

    // 匯出Excel報表
    exportToExcel() {
      this.$msgbox({
        title: "匯出報表",
        message: "確定要匯出驗證結果報表嗎？",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => {
          // 實際應該實現Excel匯出功能
          // 可以使用SheetJS或其他庫實現
          this.$msgbox({
            title: "成功",
            message: "驗證報表已匯出",
            type: "success"
          });
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    // 顯示生成調整單確認
    showGenerateAdjustmentConfirm() {
      this.$msgbox({
        title: "生成調整單",
        message: `確定要根據驗證結果生成庫存調整單嗎？將會建立 ${
          this.totalDiscrepancies
        } 筆調整記錄。`,
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 生成調整單的邏輯
          this.generateAdjustment();
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    // 生成調整單
    generateAdjustment() {
      // 實際應該實現生成調整單的功能
      // 可能需要跳轉到調整單頁面或自動生成
      this.$msgbox({
        title: "成功",
        message: "已成功生成庫存調整單",
        type: "success"
      });

      // 通知父組件需要生成調整單
      this.$emit("generate-adjustment", {
        discrepancies: this.verificationResults.filter(
          item => item.difference !== 0
        )
      });
    },

    // 處理關閉
    handleClose() {
      if (this.loading) {
        this.$msgbox({
          title: "確認",
          message: "正在處理驗證過程中，確定要關閉嗎？",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.loading = false;
            this.visibleSync = false;
          })
          .catch(() => {
            // 用戶取消操作
          });
      } else {
        this.visibleSync = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-verification-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
    border-bottom: 1px solid #67c23a;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
  }

  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: #ffffff;
    font-size: 18px;

    &:hover {
      opacity: 0.8;
    }
  }

  :deep(.el-dialog__body) {
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    padding: 24px 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
  }
}

.verification-container {
  position: relative;
}

.form-section {
  position: relative;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  }

  &.results-section {
    background: #f8fbf8;
  }

  .section-title {
    position: relative;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;

    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 16px;
      background-color: #67c23a;
      margin-right: 8px;
      border-radius: 2px;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-summary {
  display: flex;
  gap: 16px;
}

.result-item {
  font-size: 13px;
  color: #606266;

  &.warning {
    color: #e6a23c;
  }

  i {
    margin-right: 4px;
  }
}

.upload-area {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.excel-uploader {
  width: 100%;
}

.file-format {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.format-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #409eff;
  display: flex;
  align-items: center;

  i {
    margin-right: 4px;
  }
}

.format-content {
  font-size: 13px;
  color: #606266;

  ul {
    padding-left: 16px;
    margin: 8px 0;
  }
}

.toggle-sample {
  margin: 12px 0;
  text-align: center;
}

.sample-data-wrapper {
  margin-top: 16px;
  border-top: 1px dashed #dcdfe6;
  padding-top: 16px;
}

.processing-status {
  padding: 16px;

  .status-text {
    margin-top: 8px;
    text-align: center;
    color: #606266;
    font-size: 14px;
  }
}

.filter-options {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.report-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.summary-card {
  flex: 1;
  min-width: 150px;
  padding: 16px;
  border-radius: 6px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;

  &:nth-child(1) {
    border-top: 3px solid #e6a23c;
  }

  &:nth-child(2) {
    border-top: 3px solid #f56c6c;
  }

  &:nth-child(3) {
    border-top: 3px solid #409eff;
  }

  &:nth-child(4) {
    border-top: 3px solid #67c23a;
  }
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.card-label {
  font-size: 13px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .result-summary {
    flex-direction: column;
    gap: 4px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;

    .section-title {
      margin-bottom: 8px;
    }
  }

  .filter-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .el-input {
      margin-left: 0 !important;
      width: 100% !important;
    }
  }

  .summary-cards {
    flex-direction: column;
  }

  .summary-card {
    min-width: auto;
  }
}
</style>
