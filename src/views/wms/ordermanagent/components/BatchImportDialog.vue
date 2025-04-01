<template>
  <el-dialog
    title="對帳單批次驗證"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    width="900px"
    :before-close="handleClose"
    class="batch-verification-dialog"
    :close-on-click-modal="false"
    :append-to-body="true"
  >
    <div class="verification-container">
      <!-- 步驟指示器 -->
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="上傳檔案" />
        <el-step title="資料預覽" />
        <el-step title="資料確認" />
        <el-step title="匹配結果" />
        <el-step title="確認付款" />
      </el-steps>

      <!-- 步驟內容 -->
      <div class="step-content">
        <!-- 步驟1: 檔案上傳 -->
        <file-upload-step
          v-if="currentStep === 0"
          :selected-file="selectedFile"
          @file-change="handleFileChange"
          @file-clear="clearFile"
          @download-template="downloadTemplate"
        />

        <!-- 步驟2: 資料預覽 -->
        <data-preview-step
          v-if="currentStep === 1"
          :preview-data="previewData"
          :preview-columns="previewColumns"
          :total-rows="totalRows"
          :validation-errors="validationErrors"
          :show-error-only.sync="showErrorOnly"
          :has-error="hasError"
          :get-error-message="getErrorMessage"
        />

        <!-- 步驟3: 資料確認 -->
        <data-confirm-step
          v-if="currentStep === 2"
          :total-rows="totalRows"
          :valid-rows-count="validRowsCount"
          :error-rows-count="errorRowsCount"
          :total-amount="totalAmount"
          :selected-file="selectedFile"
          :format-currency="formatCurrency"
        />

        <!-- 步驟4: 匹配結果 -->
        <match-result-step
          v-if="currentStep === 3"
          :match-results="matchResults"
          :match-filter.sync="matchFilter"
          :selected-rows.sync="selectedMatchRows"
          :match-type-tag-type="getMatchTypeTagType"
          :match-type-label="getMatchTypeLabel"
          :payment-status-type="getPaymentStatusType"
          :payment-status-label="getPaymentStatusLabel"
          :format-currency="formatCurrency"
          :exact-match-count="exactMatchCount"
          :high-probability-count="highProbabilityCount"
          :low-probability-count="lowProbabilityCount"
          :no-match-count="noMatchCount"
          @row-select-change="handleRowSelectChange"
        />

        <!-- 步驟5: 確認付款 -->
        <payment-confirm-step
          ref="paymentConfirmStep"
          v-if="currentStep === 4"
          :confirmed-orders-list="confirmedOrdersList"
          :total-confirmed-amount="totalConfirmedAmount"
          :format-currency="formatCurrency"
          :payment-status-type="getPaymentStatusType"
          :payment-status-label="getPaymentStatusLabel"
        />
      </div>

      <!-- 對話框底部按鈕 -->
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="processing">取消</el-button>
        <el-button
          v-if="currentStep > 0"
          @click="previousStep"
          :disabled="processing"
          >上一步</el-button
        >
        <el-button
          type="primary"
          :loading="processing"
          :disabled="!canProceed || processing"
          @click="nextStep"
        >
          <span v-if="processing">處理中...</span>
          <span v-else>{{ stepButtonText }}</span>
        </el-button>
      </div>

      <!-- 全局載入遮罩 -->
      <div v-if="processing" class="global-loading-mask">
        <div class="loading-content">
          <i class="el-icon-loading"></i>
          <p>{{ getLoadingText() }}</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Papa from "papaparse";
import FileUploadStep from "./steps/FileUploadStep.vue";
import DataPreviewStep from "./steps/DataPreviewStep.vue";
import DataConfirmStep from "./steps/DataConfirmStep.vue";
import MatchResultStep from "./steps/MatchResultStep.vue";
import PaymentConfirmStep from "./steps/PaymentConfirmStep.vue";

export default {
  name: "BatchVerificationDialog",

  components: {
    FileUploadStep,
    DataPreviewStep,
    DataConfirmStep,
    MatchResultStep,
    PaymentConfirmStep
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    paymentStatusOptions: {
      type: Array,
      default: () => [
        { value: "unpaid", label: "未付款", type: "warning" },
        { value: "paid", label: "已付款", type: "success" },
        { value: "confirming", label: "付款確認中", type: "info" },
        { value: "refunded", label: "已退款", type: "danger" },
        { value: "cancelled", label: "已取消", type: "info" }
      ]
    }
  },

  data() {
    return {
      currentStep: 0,
      selectedFile: null,
      previewData: [],
      totalRows: 0,
      processing: false,
      showErrorOnly: false,
      validationErrors: new Map(),

      // 匹配結果
      matchResults: [],
      matchFilter: "all",
      selectedMatchRows: [], // 使用表格選擇列來追蹤選中的行
      confirmedMatches: [],

      // 預覽表格列定義
      previewColumns: [
        { prop: "transactionDate", label: "交易日期", width: "120" },
        { prop: "amount", label: "交易金額", width: "120" },
        { prop: "bankTransactionId", label: "交易流水號", width: "150" },
        { prop: "accountInfo", label: "帳戶資訊", width: "120" },
        { prop: "paymentMethod", label: "交易方式", width: "120" },
        { prop: "transactionParty", label: "交易方名稱", width: "150" },
        { prop: "remark", label: "備註", width: "200" }
      ]
    };
  },

  computed: {
    stepButtonText() {
      const texts = [
        "下一步",
        "下一步",
        "開始匹配",
        "下一步",
        "確認更新付款狀態"
      ];
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
        case 3:
          return this.selectedMatchRows.length > 0;
        case 4:
          return this.confirmedMatches.length > 0;
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

    // 計算總交易金額
    totalAmount() {
      return this.previewData
        .filter((row, index) => !this.validationErrors.has(index))
        .reduce((sum, row) => {
          const amount = parseFloat(row.amount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    },

    // 匹配結果相關計算
    exactMatchCount() {
      return this.matchResults.filter(r => r.matchType === "exact").length;
    },

    highProbabilityCount() {
      return this.matchResults.filter(r => r.matchType === "high").length;
    },

    lowProbabilityCount() {
      return this.matchResults.filter(r => r.matchType === "low").length;
    },

    noMatchCount() {
      return this.matchResults.filter(r => r.matchType === "none").length;
    },

    filteredMatchResults() {
      if (this.matchFilter === "all") {
        return this.matchResults;
      }
      return this.matchResults.filter(r => r.matchType === this.matchFilter);
    },

    // 已確認的訂單列表
    confirmedOrdersList() {
      if (!this.confirmedMatches || this.confirmedMatches.length === 0) {
        console.log("確認的匹配為空");
        return [];
      }

      console.log(
        "計算確認的訂單列表，confirmedMatches:",
        this.confirmedMatches
      );

      const result = this.confirmedMatches
        .map(match => {
          if (!match.orderId) {
            console.warn("確認的匹配缺少 orderId:", match);
            return null;
          }

          const order = this.getOrderById(match.orderId);

          if (!order) {
            console.warn(`無法找到ID為 ${match.orderId} 的訂單`);
            return null;
          }

          return {
            ...order,
            transactionDate: match.transactionDate || "未知日期",
            accountInfo: match.accountInfo || "未知帳戶"
          };
        })
        .filter(Boolean); // 過濾掉 null 值

      console.log("最終確認的訂單列表:", result);
      return result;
    },

    // 計算已確認訂單的總金額
    totalConfirmedAmount() {
      return this.confirmedOrdersList.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);
    }
  },

  methods: {
    // 檔案處理方法
    handleFileChange(file) {
      this.selectedFile = file;
    },

    clearFile() {
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
    },

    // 步驟控制方法
    async nextStep() {
      console.log("當前步驟 (before nextStep):", this.currentStep);

      if (this.currentStep === 0 && this.selectedFile) {
        await this.parseFile();
        if (this.canProceed) {
          this.currentStep++;
        }
        return;
      } else if (this.currentStep === 2) {
        this.processing = true;
        try {
          await this.performMatching();
          this.currentStep++;
        } finally {
          this.processing = false;
        }
        return;
      } else if (this.currentStep === 3) {
        // 處理選中的行並準備進入確認步驟
        const success = await this.processSelectedRows();
        if (success) {
          // 只有當處理成功時，才進入下一步
          this.currentStep++;

          // 確保 PaymentConfirmStep 組件能夠接收到數據
          this.$nextTick(() => {
            if (this.$refs.paymentConfirmStep) {
              this.$refs.paymentConfirmStep.refresh();
            }
          });
        }
        return;
      } else if (this.currentStep === 4) {
        await this.updatePaymentStatus();
        return;
      }

      if (this.canProceed) {
        this.currentStep++;
      }

      console.log("當前步驟 (after nextStep):", this.currentStep);
    },

    previousStep() {
      console.log("當前步驟 (before previousStep):", this.currentStep);

      // 特殊處理從步驟5返回步驟4的情況
      if (this.currentStep === 4) {
        // 先檢查是否已經顯示確認付款內容
        const hasContent =
          this.confirmedOrdersList && this.confirmedOrdersList.length > 0;

        if (hasContent) {
          // 如果內容已顯示但按了上一步，則確實返回步驟4
          this.currentStep = 3;
        } else {
          // 如果內容尚未顯示但已在步驟5，在這種情況下不改變步驟，刷新組件
          if (this.$refs.paymentConfirmStep) {
            this.$refs.paymentConfirmStep.refresh();
          }
        }
      } else if (this.currentStep > 0) {
        this.currentStep--;
      }

      console.log("當前步驟 (after previousStep):", this.currentStep);
    },

    getLoadingText() {
      const texts = [
        "檔案解析中...",
        "資料處理中...",
        "資料匹配中...",
        "處理選中的匹配項...",
        "更新付款狀態中..."
      ];
      return texts[this.currentStep] || "處理中...";
    },

    async parseFile() {
      this.processing = true;
      try {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
          reader.onload = () => {
            Papa.parse(reader.result, {
              header: true,
              dynamicTyping: false,
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
            交易日期: "transactionDate",
            交易金額: "amount",
            交易流水號: "bankTransactionId",
            帳戶資訊: "accountInfo",
            交易方式: "paymentMethod",
            交易方名稱: "transactionParty",
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
        }
      } catch (error) {
        this.$message.error("檔案解析失敗");
        console.error("File parsing error:", error);
      } finally {
        this.processing = false;
      }
    },

    validateRow(row, index) {
      const errors = [];

      // 必填欄位驗證
      const requiredFields = ["transactionDate", "amount", "bankTransactionId"];
      requiredFields.forEach(field => {
        if (!row[field] && row[field] !== 0) {
          errors.push(`${this.getFieldLabel(field)}不能為空`);
        }
      });

      // 交易日期格式驗證
      if (row.transactionDate && !this.isValidDateFormat(row.transactionDate)) {
        errors.push("交易日期格式不正確，應為 YYYY-MM-DD");
      }

      // 金額欄位驗證
      if (!this.isValidAmount(row.amount)) {
        errors.push("交易金額必須為有效數字");
      }

      if (errors.length > 0) {
        this.validationErrors.set(index, errors);
        return false;
      }

      return true;
    },

    isValidAmount(value) {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      const amount = parseFloat(value);
      return !isNaN(amount) && amount > 0;
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

    downloadTemplate() {
      const BOM = "\uFEFF";
      const headers = this.previewColumns.map(col => col.label);
      const csvContent = BOM + headers.join(",");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8"
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "對帳單範本.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    },

    // 資料匹配相關方法
    async performMatching() {
      try {
        // 獲取有效資料
        const validData = this.previewData.filter(
          (_, index) => !this.validationErrors.has(index)
        );

        // 假設這裡會調用API進行匹配
        // 實際項目中應該調用後端服務
        const matchedResults = await this.simulateMatchingProcess(validData);
        this.matchResults = matchedResults;

        // 重置選擇和確認
        this.selectedMatchRows = [];
        this.confirmedMatches = [];

        this.$message.success("對帳資料匹配完成");
        return true;
      } catch (error) {
        console.error("匹配處理錯誤:", error);
        this.$message.error("對帳資料匹配失敗");
        return false;
      }
    },

    // 模擬匹配過程 (實際項目中應該調用API)
    async simulateMatchingProcess(validData) {
      // 模擬API調用的延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模擬訂單資料
      const mockOrders = [
        {
          id: "order1",
          orderNumber: "ORD-20230001",
          orderDate: "2023-01-15",
          customerName: "張小明",
          totalAmount: 3500,
          paymentStatus: "unpaid",
          bankLastFive: "12345",
          paymentMethod: "銀行轉帳"
        },
        {
          id: "order2",
          orderNumber: "ORD-20230002",
          orderDate: "2023-01-20",
          customerName: "王大寶",
          totalAmount: 2800,
          paymentStatus: "unpaid",
          bankLastFive: "67890",
          paymentMethod: "銀行轉帳"
        },
        {
          id: "order3",
          orderNumber: "ORD-20230003",
          orderDate: "2023-01-25",
          customerName: "李小芳",
          totalAmount: 4200,
          paymentStatus: "unpaid",
          bankLastFive: "54321",
          paymentMethod: "銀行轉帳"
        },
        {
          id: "order4",
          orderNumber: "ORD-20230004",
          orderDate: "2023-01-30",
          customerName: "陳大明",
          totalAmount: 3500,
          paymentStatus: "confirming",
          bankLastFive: "13579",
          paymentMethod: "銀行轉帳"
        }
      ];

      return validData.map(transaction => {
        const amount = parseFloat(transaction.amount);
        const accountInfo = transaction.accountInfo;
        const remark = transaction.remark || "";

        // 尋找可能匹配的訂單
        let matchedOrders = [];
        let matchType = "none";

        // 查找備註中是否包含訂單號
        const orderNumberMatch = remark.match(/ORD-\d+/);
        const orderNumberInRemark = orderNumberMatch
          ? orderNumberMatch[0]
          : null;

        if (orderNumberInRemark) {
          // 如果備註中有訂單號，先嘗試精確匹配
          const exactOrder = mockOrders.find(
            order =>
              order.orderNumber === orderNumberInRemark &&
              order.totalAmount === amount &&
              (accountInfo.includes(order.bankLastFive) ||
                order.bankLastFive.includes(accountInfo))
          );

          if (exactOrder) {
            matchedOrders = [exactOrder];
            matchType = "exact";
          }
        }

        // 如果沒有精確匹配，嘗試金額匹配
        if (matchType === "none") {
          const amountMatchedOrders = mockOrders.filter(
            order => order.totalAmount === amount
          );

          if (amountMatchedOrders.length > 0) {
            matchedOrders = amountMatchedOrders;

            // 嘗試通過帳號末五碼提高匹配置信度
            const accountMatchedOrders = amountMatchedOrders.filter(
              order =>
                accountInfo &&
                order.bankLastFive &&
                (accountInfo.includes(order.bankLastFive) ||
                  order.bankLastFive.includes(accountInfo))
            );

            if (accountMatchedOrders.length > 0) {
              matchedOrders = accountMatchedOrders;
              matchType = "high";
            } else {
              matchType = "low";
            }
          }
        }

        // 自動為完全匹配和只有一個匹配項的高度可能標記選中的訂單ID
        let selectedOrderId = null;
        if (matchType === "exact" && matchedOrders.length === 1) {
          selectedOrderId = matchedOrders[0].id;
        } else if (matchType === "high" && matchedOrders.length === 1) {
          selectedOrderId = matchedOrders[0].id;
        }

        // 返回匹配結果
        return {
          ...transaction,
          matchType,
          matchedOrders,
          selectedOrderId
        };
      });
    },

    // 處理選中的行
    async processSelectedRows() {
      if (this.selectedMatchRows.length === 0) {
        this.$message.warning("請選擇要確認的匹配項");
        return false;
      }

      this.processing = true;

      try {
        console.log("處理選中行開始，當前步驟:", this.currentStep);

        // 清空之前的確認匹配數據
        this.confirmedMatches = [];

        // 處理每個選中的行
        for (const row of this.selectedMatchRows) {
          // 如果是高度或完全匹配且只有一個匹配項，且沒有手動選擇，自動選擇訂單
          if (
            !row.selectedOrderId &&
            row.matchedOrders &&
            row.matchedOrders.length === 1 &&
            (row.matchType === "exact" || row.matchType === "high")
          ) {
            row.selectedOrderId = row.matchedOrders[0].id;
          }

          // 只有有選擇訂單ID的行才進行確認
          if (row.selectedOrderId) {
            // 預先檢查訂單是否存在
            const order = this.getOrderById(row.selectedOrderId);
            if (order) {
              this.confirmedMatches.push({
                transactionId: row.bankTransactionId,
                orderId: row.selectedOrderId,
                transactionDate: row.transactionDate,
                accountInfo: row.accountInfo
              });
            }
          }
        }

        // 檢查是否有確認的匹配
        if (this.confirmedMatches.length === 0) {
          this.$message.warning("沒有可確認的匹配，請選擇有效的匹配項");
          this.processing = false;
          return false;
        }

        console.log("確認的匹配項:", this.confirmedMatches);

        // 強制計算屬性更新
        await this.$nextTick();

        // 預先檢查確認訂單列表是否成功生成
        const orderList = [...this.confirmedOrdersList]; // 觸發計算屬性並複製結果

        if (orderList.length === 0) {
          console.error("生成確認訂單列表失敗，列表為空");
          this.$message.warning("處理訂單數據失敗，請重試");
          this.processing = false;
          return false;
        }

        console.log("生成的訂單列表:", orderList);

        // 添加適當的延遲，讓用戶看到處理中的狀態
        await new Promise(resolve => setTimeout(resolve, 500));

        this.$message.success(`已確認 ${this.confirmedMatches.length} 筆匹配`);

        // 延遲取消載入狀態，確保步驟轉換動畫完成
        setTimeout(() => {
          this.processing = false;
        }, 300);

        return true; // 處理成功，可以進入下一步
      } catch (error) {
        console.error("處理選中行錯誤:", error);
        this.$message.error("處理選中行失敗");
        this.processing = false;
        return false;
      }
    },

    // 處理行選擇變更
    handleRowSelectChange(rows) {
      this.selectedMatchRows = rows;
    },

    // 匹配相關方法
    getMatchTypeTagType(matchType) {
      const types = {
        exact: "success",
        high: "primary",
        low: "warning",
        none: "danger"
      };
      return types[matchType] || "info";
    },

    getMatchTypeLabel(matchType) {
      const labels = {
        exact: "完全匹配",
        high: "高度可能",
        low: "低度可能",
        none: "無匹配"
      };
      return labels[matchType] || matchType;
    },

    getPaymentStatusType(status) {
      const option = this.paymentStatusOptions.find(
        opt => opt.value === status
      );
      return option ? option.type : "info";
    },

    getPaymentStatusLabel(status) {
      const option = this.paymentStatusOptions.find(
        opt => opt.value === status
      );
      return option ? option.label : status;
    },

    // 通過ID獲取訂單號
    getOrderNumberById(orderId) {
      for (const result of this.matchResults) {
        if (result.matchedOrders) {
          const order = result.matchedOrders.find(o => o.id === orderId);
          if (order) {
            return order.orderNumber;
          }
        }
      }
      return "";
    },

    // 通過ID獲取訂單
    getOrderById(orderId) {
      if (!orderId) {
        console.warn("嘗試獲取訂單時 orderId 為空");
        return null;
      }

      let foundOrder = null;

      // 在所有匹配結果中查找訂單
      for (const result of this.matchResults) {
        if (result.matchedOrders && Array.isArray(result.matchedOrders)) {
          const order = result.matchedOrders.find(o => o.id === orderId);
          if (order) {
            foundOrder = order;
            break;
          }
        }
      }

      if (!foundOrder) {
        console.warn(`未找到ID為 ${orderId} 的訂單`);
      } else {
        console.log(`找到ID為 ${orderId} 的訂單:`, foundOrder);
      }

      return foundOrder;
    },

    // 更新付款狀態
    async updatePaymentStatus() {
      // 清晰地顯示正在處理中
      this.processing = true;

      try {
        // 再次檢查確認的訂單列表
        if (this.confirmedOrdersList.length === 0) {
          this.$message.warning("沒有可更新的訂單，請返回上一步重新選擇");
          this.processing = false;
          return;
        }

        // 在實際項目中應調用API
        // 這裡模擬API調用，增加時間讓用戶能看到載入狀態
        this.$message.info("正在處理訂單付款狀態更新...");
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 發送更新請求
        const updateData = {
          confirmedOrders: this.confirmedOrdersList.map(order => ({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentDate: order.transactionDate,
            accountInfo: order.accountInfo
          }))
        };

        // 模擬API調用
        console.log("訂單付款狀態更新資料:", updateData);

        // 模擬伺服器處理時間
        await new Promise(resolve => setTimeout(resolve, 800));

        // 發送提交事件給父組件處理
        this.$emit("submit", updateData);

        // 發出更新成功事件
        this.$emit("update-success", this.confirmedOrdersList);

        // 顯示成功消息
        this.$message.success(
          `成功更新 ${this.confirmedOrdersList.length} 筆訂單的付款狀態`
        );

        // 稍微延遲關閉對話框，讓用戶能看到成功消息
        setTimeout(() => {
          this.handleClose();
        }, 1000);
      } catch (error) {
        console.error("更新付款狀態錯誤:", error);
        this.$message.error(
          "更新付款狀態失敗: " + (error.message || "未知錯誤")
        );
      } finally {
        // 確保始終取消載入狀態
        setTimeout(() => {
          this.processing = false;
        }, 500);
      }
    },

    // 格式化貨幣
    formatCurrency(value) {
      if (!value && value !== 0) return "";
      return `${parseFloat(value).toLocaleString()}`;
    },

    handleClose() {
      this.currentStep = 0;
      this.selectedFile = null;
      this.previewData = [];
      this.totalRows = 0;
      this.validationErrors.clear();
      this.processing = false;
      this.matchResults = [];
      this.confirmedMatches = [];
      this.selectedMatchRows = [];
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.batch-verification-dialog {
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
    /* 添加全局載入遮罩樣式 */
    .global-loading-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;

      .loading-content {
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 8px;
        padding: 20px 30px;
        text-align: center;

        i {
          font-size: 32px;
          color: white;
          margin-bottom: 10px;
        }

        p {
          color: white;
          margin: 0;
          font-size: 16px;
        }
      }
    }
  }

  .verification-container {
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
    margin-top: 20px;

    .el-button--primary {
      background-color: #409eff;
      border-color: #409eff;
      &:hover,
      &:focus {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
      &:active {
        background-color: #3a8ee6;
        border-color: #3a8ee6;
      }
      &.is-disabled {
        background-color: #a0cfff;
        border-color: #a0cfff;
      }
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .batch-verification-dialog {
    ::v-deep .el-dialog {
      width: 95% !important;
      margin: 5vh auto !important;
    }

    .dialog-footer {
      flex-wrap: wrap;
      justify-content: center;

      .el-button {
        flex: 1 0 auto;
      }
    }
  }
}
</style>
