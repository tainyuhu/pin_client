<template>
  <el-dialog
    title="單據撤銷"
    :visible.sync="visibleSync"
    :width="isMobile ? '100%' : '800px'"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-revocation-dialog"
  >
    <!-- 搜尋組件 -->
    <order-search-panel
      v-if="!selectedOrder.number"
      :product-options="productOptions"
      @select-order="handleOrderSelect"
    />

    <!-- 撤銷確認組件 -->
    <revocation-confirm-panel
      v-else
      :selected-order="selectedOrder"
      :form="form"
      @submit="handleSubmit"
      @return-to-search="resetSearch"
      @cancel="handleCancel"
    />

    <div slot="footer" v-if="!selectedOrder.number">
      <el-button @click="handleClose">關閉</el-button>
    </div>
  </el-dialog>
</template>

<script>
import OrderSearchPanel from "./OrderSearchPanel.vue";
import RevocationConfirmPanel from "./RevocationConfirmPanel.vue";
//import api from "@/api";

export default {
  name: "StockRevocationDialog",

  components: {
    OrderSearchPanel,
    RevocationConfirmPanel
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
      selectedOrder: {
        number: "",
        type: "",
        date: "",
        operator: "",
        reason: "",
        remark: "",
        products: []
      },
      productOptions: [],
      form: {
        number: "",
        date: "",
        revocationType: "",
        originalNumber: "",
        originalType: "",
        products: [],
        remark: ""
      },
      windowWidth: window.innerWidth,
      loading: false
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
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initDialog();
        this.loadProductData();
      }
    },
    productData: {
      handler(val) {
        if (val && val.length > 0) {
          this.productOptions = val.map(item => ({
            id: item.id,
            name: item.name || item.productName
          }));
        }
      },
      immediate: true
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    initDialog() {
      // 初始化選中的單據
      this.selectedOrder = {
        number: "",
        type: "",
        date: "",
        operator: "",
        reason: "",
        remark: "",
        products: []
      };

      // 初始化表單
      this.initForm();
    },

    initForm() {
      // 初始化表單
      this.form = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        revocationType: "",
        originalNumber: "",
        originalType: "",
        products: [],
        remark: ""
      };
    },

    generateNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const sequence = "00001"; // 實際應該從後端獲取序號
      return `REV${year}${month}${day}${sequence}`;
    },

    getCurrentDateTime() {
      const date = new Date();
      return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    },

    // 載入產品資料
    async loadProductData() {
      if (this.productData && this.productData.length > 0) {
        return; // 如果已經有產品數據，則不需要重新加載
      }

      try {
        this.loading = true;
        // 使用API加載產品資料，如果已通過props傳入則不需要
        const response = await api.getProductList();
        this.productOptions = response.data || [];
      } catch (error) {
        this.$message.error("獲取產品資料失敗: " + error.message);

        // 測試數據，實際開發時應該刪除
        this.productOptions = [
          { id: "1", name: "口罩" },
          { id: "2", name: "酒精" },
          { id: "3", name: "體溫計" },
          { id: "4", name: "感冒藥" },
          { id: "5", name: "膠布" }
        ];
      } finally {
        this.loading = false;
      }
    },

    // 處理選擇單據
    handleOrderSelect(order) {
      this.selectedOrder = { ...order };

      // 初始化表單
      this.form = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        revocationType: "full", // 默認完全撤銷
        originalNumber: order.number,
        originalType: order.type,
        products: [],
        remark: ""
      };

      // 從選中的單據中加載產品和批次信息
      if (
        this.selectedOrder.products &&
        this.selectedOrder.products.length > 0
      ) {
        this.selectedOrder.products.forEach(originalProduct => {
          const product = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            productId: originalProduct.productId,
            productName: this.getProductName(originalProduct.productId),
            batches: []
          };

          // 加載批次信息
          if (originalProduct.batches && originalProduct.batches.length > 0) {
            originalProduct.batches.forEach(originalBatch => {
              const batch = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                batchNumber: originalBatch.batchNumber,
                quantity: originalBatch.quantity,
                expiryDate: originalBatch.expiryDate
                // 移除 selected 屬性，因為所有批次都會被撤銷
              };
              product.batches.push(batch);
            });
          }

          this.form.products.push(product);
        });
      }
    },

    // 根據ID獲取產品名稱
    getProductName(productId) {
      const product = this.productOptions.find(item => item.id === productId);
      return product ? product.name : productId;
    },

    // 重置搜尋
    resetSearch() {
      this.selectedOrder = {
        number: "",
        type: "",
        date: "",
        operator: "",
        reason: "",
        remark: "",
        products: []
      };
      this.initForm();
    },

    // 提交表單
    async handleSubmit(formData) {
      try {
        this.loading = true;
        // 呼叫API創建撤銷單
        const response = await api.createStockRevocation(formData);
        this.$message.success("單據撤銷成功");
        this.visibleSync = false;

        // 向父組件發送成功事件
        this.$emit("success", response.data);
      } catch (error) {
        this.$message.error("單據撤銷失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    handleCancel() {
      this.handleClose();
    },

    handleClose() {
      // 檢查表單是否有數據
      const hasData = this.selectedOrder.number;

      if (hasData) {
        // 使用 MessageBox 顯示確認對話框
        this.$msgbox({
          title: "提示",
          message: "確認關閉？未完成的撤銷操作將取消",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            // 用户点击确定，关闭对话框
            this.visibleSync = false;
          })
          .catch(() => {
            // 用户点击取消，什么都不做
          });
      } else {
        // 如果没有数据，直接关闭
        this.visibleSync = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-revocation-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    border-bottom: 1px solid #f56c6c;
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

@media (max-width: 768px) {
  .stock-revocation-dialog {
    :deep(.el-dialog__body) {
      max-height: calc(100vh - 120px);
      padding: 16px;
    }

    :deep(.el-dialog__header) {
      padding: 12px 16px;
    }

    :deep(.el-dialog__footer) {
      padding: 12px 16px;
    }
  }
}
</style>
