<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    :label-width="isMobile ? '90px' : '100px'"
    size="small"
  >
    <!-- 基本信息區塊 -->
    <div class="form-section">
      <div class="section-title">基本信息</div>
      <el-row :gutter="15">
        <el-col :xs="24" :sm="12">
          <el-form-item label="撤銷單號">
            <el-input
              v-model="formData.number"
              disabled
              placeholder="系統自動生成"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="撤銷日期">
            <el-date-picker
              v-model="formData.date"
              type="datetime"
              disabled
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 原始單據信息顯示 -->
    <div class="form-section original-order-section">
      <div class="section-header">
        <div class="section-title">原始單據信息</div>
        <div>
          <el-tag :type="selectedOrder.type === 'in' ? 'success' : 'danger'">
            {{ selectedOrder.type === "in" ? "入庫單" : "出庫單" }}
          </el-tag>
          <el-button
            type="text"
            icon="el-icon-back"
            @click="returnToSearch"
            style="margin-left: 10px"
          >
            重新查詢
          </el-button>
        </div>
      </div>
      <el-descriptions :column="isMobile ? 1 : 2" border size="small">
        <el-descriptions-item label="單號">{{
          selectedOrder.number
        }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{
          selectedOrder.date
        }}</el-descriptions-item>
        <el-descriptions-item label="操作人員">{{
          selectedOrder.operator
        }}</el-descriptions-item>
        <el-descriptions-item
          v-if="selectedOrder.type === 'out'"
          label="出庫原因"
        >
          {{ getReasonText(selectedOrder.reason) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="selectedOrder.remark"
          label="備註"
          :span="2"
        >
          {{ selectedOrder.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 撤銷提示 -->
    <div class="form-section revocation-notice">
      <div class="notice-icon">
        <i class="el-icon-warning"></i>
      </div>
      <div class="notice-content">
        <div class="notice-title">撤銷操作提示</div>
        <div class="notice-text">
          您正在撤銷一張
          <strong>{{
            selectedOrder.type === "in" ? "入庫單" : "出庫單"
          }}</strong
          >，此操作將
          <strong class="highlight">{{
            selectedOrder.type === "in" ? "減少庫存" : "增加庫存"
          }}</strong
          >，請確認以下信息無誤。
        </div>
      </div>
    </div>

    <!-- 商品信息區塊 -->
    <div
      v-for="(product, productIndex) in formData.products"
      :key="product.id"
      class="form-section"
    >
      <div class="section-header">
        <div class="section-title">
          <span class="product-name">{{ product.productName }}</span>
          <span class="product-index">#{{ productIndex + 1 }}</span>
        </div>
      </div>

      <!-- 批次信息表格 -->
      <div class="batch-section">
        <!-- 批次撤銷表格 (僅顯示，不能選擇部分批次) -->
        <el-table
          :data="product.batches"
          style="width: 100%"
          size="small"
          border
          class="batch-table"
        >
          <el-table-column label="批次號碼" min-width="150">
            <template slot-scope="scope">
              {{ scope.row.batchNumber }}
            </template>
          </el-table-column>
          <el-table-column
            :label="selectedOrder.type === 'in' ? '入庫數量' : '出庫數量'"
            width="120"
          >
            <template slot-scope="scope">
              {{ scope.row.quantity }}
            </template>
          </el-table-column>
          <el-table-column label="有效期限" width="120">
            <template slot-scope="scope">
              {{ scope.row.expiryDate }}
            </template>
          </el-table-column>
          <el-table-column label="庫存變動" width="120">
            <template slot-scope="scope">
              <el-tag
                :type="selectedOrder.type === 'in' ? 'danger' : 'success'"
                size="mini"
              >
                {{ selectedOrder.type === "in" ? "-" : "+"
                }}{{ scope.row.quantity }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批次統計 -->
        <div class="batch-summary">
          <el-tag :type="selectedOrder.type === 'in' ? 'danger' : 'success'">
            庫存{{ selectedOrder.type === "in" ? "減少" : "增加" }}:
            {{ calculateTotalChange(product) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 備註 -->
    <div class="form-section">
      <div class="section-title">撤銷原因</div>
      <el-form-item label="撤銷類型" prop="revocationType">
        <el-select
          v-model="formData.revocationType"
          placeholder="請選擇撤銷類型"
          style="width: 100%"
        >
          <el-option label="單據錯誤" value="document_error"></el-option>
          <el-option label="重複創建" value="duplicate_creation"></el-option>
          <el-option label="數量錯誤" value="quantity_error"></el-option>
          <el-option label="庫存調整" value="inventory_adjustment"></el-option>
          <el-option label="其他原因" value="other"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="詳細說明" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="請輸入詳細說明"
        ></el-input>
      </el-form-item>
    </div>

    <!-- 操作按鈕區域 - 修正：確保按鈕始終顯示在底部 -->
    <div class="fixed-bottom-buttons">
      <el-button @click="handleCancel" plain>取消</el-button>
      <el-button type="danger" @click="confirmRevocation" :loading="loading">
        確認撤銷
      </el-button>
    </div>
  </el-form>
</template>

<script>
export default {
  name: "RevocationConfirmPanel",

  props: {
    selectedOrder: {
      type: Object,
      required: true
    },
    form: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      formData: { ...this.form },
      productSelectAll: [], // 產品批次全選狀態
      rules: {
        revocationType: [
          { required: true, message: "請選擇撤銷類型", trigger: "change" }
        ],
        remark: [
          { required: true, message: "請輸入詳細說明", trigger: "blur" },
          { max: 500, message: "詳細說明最多500字", trigger: "blur" }
        ]
      },
      loading: false,
      windowWidth: window.innerWidth
    };
  },

  computed: {
    isMobile() {
      return this.windowWidth < 768;
    }
  },

  watch: {
    form: {
      handler(val) {
        this.formData = JSON.parse(JSON.stringify(val));
        this.initBatchQuantities();
        this.initProductSelectAll();
      },
      deep: true,
      immediate: true
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.initBatchQuantities();
    this.initProductSelectAll();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    // 簡化的初始化方法 (不需要選擇部分批次，所有批次都會被撤銷)
    initBatchQuantities() {
      // 在全部撤銷模式中，不需要特別處理撤銷數量
    },

    // 簡化的初始化方法 (不需要全選狀態)
    initProductSelectAll() {
      // 在全部撤銷模式中，不需要全選狀態
    },

    // 返回搜尋畫面
    returnToSearch() {
      this.$emit("return-to-search");
    },

    // 獲取出庫原因文字
    getReasonText(reason) {
      const reasonMap = {
        sale: "正常銷售",
        scrap: "產品報廢",
        expired: "產品過期",
        other: "其他"
      };
      return reasonMap[reason] || reason;
    },

    // 計算總變動數量
    calculateTotalChange(product) {
      return product.batches.reduce((total, batch) => {
        return total + batch.quantity;
      }, 0);
    },

    // 收集撤銷數據
    collectRevocationData() {
      const revocationProducts = [];

      this.formData.products.forEach(product => {
        revocationProducts.push({
          productId: product.productId,
          productName: product.productName,
          batches: product.batches.map(batch => ({
            batchNumber: batch.batchNumber,
            quantity: batch.quantity,
            // 在全部撤銷模式中，撤銷數量始終等於原始數量
            revocationQuantity: batch.quantity,
            expiryDate: batch.expiryDate
          }))
        });
      });

      return revocationProducts;
    },

    // 驗證撤銷數據
    validateRevocationData() {
      // 在全部撤銷模式中，總是有批次要撤銷
      return true;
    },

    // 確認撤銷 - 使用 msgbox
    confirmRevocation() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.validateRevocationData()) {
            // 獲取更詳細的撤銷信息
            const revocationType =
              this.selectedOrder.type === "in" ? "入庫單" : "出庫單";
            const stockEffect =
              this.selectedOrder.type === "in" ? "減少" : "增加";

            // 計算總撤銷數量
            let totalQuantity = 0;
            this.formData.products.forEach(product => {
              product.batches.forEach(batch => {
                totalQuantity += batch.quantity;
              });
            });

            // 獲取撤銷類型的文字描述
            const revocationTypeText =
              {
                document_error: "單據錯誤",
                duplicate_creation: "重複創建",
                quantity_error: "數量錯誤",
                inventory_adjustment: "庫存調整",
                other: "其他原因"
              }[this.formData.revocationType] || this.formData.revocationType;

            // 創建詳細的撤銷訊息
            const message = `
                <div style="text-align: left;">
                  <p><strong>您確定要撤銷此${revocationType}嗎？</strong></p>
                  <p>撤銷原因: <span style="color: #E6A23C">${revocationTypeText}</span></p>
                  <p>撤銷單號: <span style="color: #409EFF">${
                    this.formData.number
                  }</span></p>
                  <p>原始單號: <span style="color: #409EFF">${
                    this.selectedOrder.number
                  }</span></p>
                  <p>將${stockEffect}庫存: <span style="color: #F56C6C">${totalQuantity}</span> 件商品</p>
                  <p style="color: #F56C6C;"><i class="el-icon-warning"></i> 此操作無法恢復！</p>
                </div>
              `;

            // 使用 this.$msgbox
            this.$msgbox({
              title: "撤銷確認",
              message: message,
              showCancelButton: true,
              confirmButtonText: "確定撤銷",
              cancelButtonText: "取消",
              type: "warning",
              dangerouslyUseHTMLString: true,
              customClass: "custom-message-box",
              beforeClose: (action, instance, done) => {
                if (action === "confirm") {
                  instance.confirmButtonLoading = true;
                  instance.confirmButtonText = "處理中...";

                  // 在這裡可以添加延遲效果，模擬處理過程
                  setTimeout(() => {
                    instance.confirmButtonLoading = false;
                    done();
                    this.submitRevocation();
                  }, 300);
                } else {
                  done();
                }
              }
            }).catch(() => {
              // 用户取消操作或關閉彈窗
            });
          }
        }
      });
    },

    // 提交撤銷
    submitRevocation() {
      // 構建提交的數據
      const submitData = {
        number: this.formData.number,
        date: this.formData.date,
        originalNumber: this.selectedOrder.number,
        originalType: this.selectedOrder.type,
        revocationType: this.formData.revocationType,
        remark: this.formData.remark,
        products: this.collectRevocationData(),
        operator: "admin" // 實際應從登入用戶獲取
      };

      // 發送提交事件給父組件
      this.$emit("submit", submitData);
    },

    // 取消
    handleCancel() {
      this.$emit("cancel");
    }
  }
};
</script>

<style lang="scss" scoped>
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

  &:last-child {
    margin-bottom: 0;
  }

  &.original-order-section {
    background: #fff9eb;
    border-left: 3px solid #e6a23c;
  }

  &.revocation-notice {
    background: #fef0f0;
    border-left: 3px solid #f56c6c;
    display: flex;
    align-items: center;
    padding: 12px 16px;
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
      background-color: #f56c6c;
      margin-right: 8px;
      border-radius: 2px;
    }
  }

  :deep(.el-form-item:last-child) {
    margin-bottom: 0;
  }
}

.notice-icon {
  font-size: 30px;
  color: #f56c6c;
  margin-right: 16px;
  display: flex;
  align-items: center;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  color: #f56c6c;
}

.notice-text {
  font-size: 14px;
  color: #606266;

  .highlight {
    color: #f56c6c;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.product-name {
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.product-index {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
}

.batch-section {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.batch-table {
  margin-bottom: 12px;
}

.batch-summary {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 添加底部固定按鈕樣式 */
.fixed-bottom-buttons {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  margin-top: 20px;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #ebeef5;
}

.fixed-bottom-buttons .el-button {
  border-radius: 20px;
  padding: 9px 24px;
  transition: all 0.3s;
}

.fixed-bottom-buttons .el-button:hover {
  transform: translateY(-2px);
}

.fixed-bottom-buttons .el-button--danger {
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

.fixed-bottom-buttons .el-button--danger:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

@media (max-width: 768px) {
  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .batch-section {
    padding: 10px;
  }

  .revocation-notice {
    flex-direction: column;
    align-items: flex-start;

    .notice-icon {
      margin-bottom: 10px;
    }
  }

  /* 調整手機版底部按鈕 */
  .fixed-bottom-buttons {
    padding: 12px;
  }

  .fixed-bottom-buttons .el-button {
    flex: 1;
    font-size: 14px;
    padding: 8px 15px;
  }
}
</style>
