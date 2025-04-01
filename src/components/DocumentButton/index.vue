<template>
  <div class="document-button">
    <!-- 下拉式選單按鈕 -->
    <el-dropdown @command="handleCommand" trigger="click">
      <el-button :type="buttonType" :class="buttonClass">
        <i v-if="buttonIcon" :class="buttonIcon" class="button-icon"></i>
        {{ buttonText }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="option in documentOptions"
          :key="option.command"
          :command="option.command"
          :disabled="option.disabled"
        >
          <i :class="[option.icon, option.iconClass]"></i> {{ option.label }}
          <el-tooltip
            :content="getTooltipContent(option.command)"
            placement="right"
            effect="light"
          >
            <i class="el-icon-question tooltip-icon ml-2"></i>
          </el-tooltip>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <!-- 內嵌所有需要的對話框 -->
    <stock-in-dialog
      :visible.sync="stockInDialogVisible"
      :productData="availableProductData"
      @success="handleSuccess"
      @cancel="handleCancel"
    />

    <stock-out-dialog
      :visible.sync="stockOutDialogVisible"
      :productData="availableProductData"
      @success="handleSuccess"
      @cancel="handleCancel"
    />

    <stock-revocation-dialog
      :visible.sync="stockRevocationDialogVisible"
      :productData="availableProductData"
      @success="handleSuccess"
      @cancel="handleCancel"
    />

    <stock-adjustment-dialog
      :visible.sync="stockAdjustmentDialogVisible"
      :productData="availableProductData"
      @success="handleSuccess"
      @cancel="handleCancel"
    />

    <stock-verification-dialog
      :visible.sync="stockVerificationDialogVisible"
      :productData="availableProductData"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import StockInDialog from "./StockInDialog.vue";
import StockOutDialog from "./StockOutDialog.vue";
import StockRevocationDialog from "./StockRevocationDialog.vue";
import StockAdjustmentDialog from "./StockAdjustmentDialog.vue";
import StockVerificationDialog from "./StockVerificationDialog.vue";
import MultiSkuService from "@/views/wms/multiSku/services/MultiSkuService";

export default {
  name: "DocumentButton",

  components: {
    StockInDialog,
    StockOutDialog,
    StockRevocationDialog,
    StockAdjustmentDialog,
    StockVerificationDialog
  },

  props: {
    buttonText: {
      type: String,
      default: "庫存操作"
    },
    buttonIcon: {
      type: String,
      default: "el-icon-document"
    },
    buttonType: {
      type: String,
      default: "primary"
    },
    buttonClass: {
      type: String,
      default: ""
    },
    customOptions: {
      type: Array,
      default: () => []
    },
    useDefaultOptions: {
      type: Boolean,
      default: true
    },
    productData: {
      type: Array,
      default: () => []
    },
    // 是否禁用某些選項
    disabledOptions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      // 對話框顯示狀態
      stockInDialogVisible: false,
      stockOutDialogVisible: false,
      stockRevocationDialogVisible: false,
      stockAdjustmentDialogVisible: false,
      stockVerificationDialogVisible: false,

      // 內部產品資料儲存
      internalProductData: [],

      // 按鈕提示內容
      buttonTooltips: {
        in: {
          title: "入庫單",
          content:
            "用於記錄商品入庫流程，包括進貨、退貨入庫等操作。點擊後可選擇商品並填寫入庫數量。"
        },
        out: {
          title: "出庫單",
          content:
            "用於記錄商品出庫流程，包括銷售出貨、調撥等操作。點擊後可選擇商品並填寫出庫數量。"
        },
        revocation: {
          title: "撤銷單",
          content:
            "用於撤銷之前的入庫或出庫操作，可查詢歷史記錄並選擇需要撤銷的單據。"
        },
        adjustment: {
          title: "調整單",
          content:
            "用於調整庫存數量，可直接修改商品庫存，常用於盤點後的庫存修正。"
        },
        verification: {
          title: "庫存驗證",
          content:
            "用於核對系統庫存與實際庫存是否一致，可進行掃描或手動輸入進行庫存盤點。"
        }
      }
    };
  },

  async created() {
    // 如果沒有傳入產品資料，則嘗試自行獲取
    if (!this.productData || this.productData.length === 0) {
      await this.fetchProductData();
    }
  },

  computed: {
    documentOptions() {
      const defaultOptions = this.useDefaultOptions
        ? [
            {
              command: "in",
              label: "入庫單",
              icon: "el-icon-plus",
              iconClass: "text-success",
              disabled: this.disabledOptions.includes("in")
            },
            {
              command: "out",
              label: "出庫單",
              icon: "el-icon-minus",
              iconClass: "text-danger",
              disabled: this.disabledOptions.includes("out")
            },
            {
              command: "revocation",
              label: "撤銷單",
              icon: "el-icon-delete",
              iconClass: "text-warning",
              disabled: this.disabledOptions.includes("revocation")
            },
            {
              command: "adjustment",
              label: "調整單",
              icon: "el-icon-edit",
              iconClass: "text-info",
              disabled: this.disabledOptions.includes("adjustment")
            },
            {
              command: "verification",
              label: "庫存驗證",
              icon: "el-icon-check",
              iconClass: "text-primary",
              disabled: this.disabledOptions.includes("verification")
            }
          ]
        : [];

      // 合併自定義選項
      return [
        ...defaultOptions,
        ...this.customOptions.map(opt => ({
          ...opt,
          disabled: this.disabledOptions.includes(opt.command)
        }))
      ];
    },

    // 獲取產品資料，優先使用 props 傳入的，如果沒有則使用內部獲取的
    availableProductData() {
      return this.productData && this.productData.length > 0
        ? this.productData
        : this.internalProductData;
    }
  },

  methods: {
    // 處理下拉選單命令
    handleCommand(command) {
      // 先通知父組件關於選擇的命令
      this.$emit("command", command);

      switch (command) {
        case "in":
          this.stockInDialogVisible = true;
          break;
        case "out":
          this.stockOutDialogVisible = true;
          break;
        case "revocation":
          this.stockRevocationDialogVisible = true;
          break;
        case "adjustment":
          this.stockAdjustmentDialogVisible = true;
          break;
        case "verification":
          this.stockVerificationDialogVisible = true;
          break;
        default:
          // 處理自定義命令
          this.$emit("custom-command", command);
          break;
      }
    },

    // 處理對話框成功提交
    handleSuccess(data) {
      // 關閉所有對話框
      this.closeAllDialogs();

      // 向上傳遞成功事件和數據
      this.$emit("success", {
        ...data,
        timestamp: new Date().toISOString()
      });
    },

    // 處理對話框取消
    handleCancel() {
      // 確保所有對話框都被關閉
      this.closeAllDialogs();

      // 向上傳遞取消事件
      this.$emit("cancel");
    },

    // 關閉所有對話框
    closeAllDialogs() {
      this.stockInDialogVisible = false;
      this.stockOutDialogVisible = false;
      this.stockRevocationDialogVisible = false;
      this.stockAdjustmentDialogVisible = false;
      this.stockVerificationDialogVisible = false;
    },

    // 公開方法：手動開啟特定對話框
    openDialog(type) {
      switch (type) {
        case "in":
          this.stockInDialogVisible = true;
          break;
        case "out":
          this.stockOutDialogVisible = true;
          break;
        case "revocation":
          this.stockRevocationDialogVisible = true;
          break;
        case "adjustment":
          this.stockAdjustmentDialogVisible = true;
          break;
        case "verification":
          this.stockVerificationDialogVisible = true;
          break;
        default:
          console.warn(`Unknown dialog type: ${type}`);
      }
    },

    // 從 MultiSkuService 獲取產品資料
    async fetchProductData() {
      try {
        // 顯示 loading 或其他 UI 提示

        // 調用 MultiSkuService 獲取品號列表
        const response = await MultiSkuService.getProductList();
        if (Array.isArray(response)) {
          this.internalProductData = response;
        } else if (response && response.data) {
          this.internalProductData = response.data;
        }

        // 如果獲取失敗，顯示錯誤消息
        if (!this.internalProductData.length) {
          console.warn("無法獲取產品資料");
        }
      } catch (error) {
        console.error("獲取產品資料失敗:", error);
        this.$message.error("獲取產品資料失敗");
      }
    },

    // 獲取提示內容
    getTooltipContent(command) {
      return this.buttonTooltips[command]
        ? this.buttonTooltips[command].content
        : "";
    }
  }
};
</script>

<style lang="scss" scoped>
.document-button {
  display: inline-block;

  .button-icon {
    margin-right: 5px;
  }

  .tooltip-icon {
    margin-left: 5px;
    font-size: 14px;
    color: #909399;
    cursor: help;

    &:hover {
      color: #409eff;
    }
  }

  .ml-2 {
    margin-left: 8px;
  }

  .text-success {
    color: #52c41a;
  }

  .text-danger {
    color: #ff4d4f;
  }

  .text-info {
    color: #1890ff;
  }

  .text-warning {
    color: #faad14;
  }

  .text-primary {
    color: #409eff;
  }
}

// 響應式調整
@media screen and (max-width: 768px) {
  .document-button {
    .el-button {
      font-size: 14px;
      padding: 8px 15px;
    }
  }
}
</style>
