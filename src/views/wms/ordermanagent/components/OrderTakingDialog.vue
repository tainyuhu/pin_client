<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="60%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleDialogClose"
  >
    <div v-loading="loading" class="order-dialog-content">
      <!-- 客戶資訊區域 -->
      <el-divider content-position="left">客戶資訊</el-divider>
      <el-form
        ref="orderForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="medium"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="訂單編號" prop="orderNumber">
              <el-input v-model="form.orderNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="客戶名稱" prop="customerName">
              <el-input v-model="form.customerName" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item
              label="聯絡電話"
              prop="contactPhone"
              class="phone-input-container"
            >
              <el-input v-model="form.contactPhone">
                <template slot="append">
                  <el-input
                    v-model="form.extension"
                    placeholder="分機"
                    style="width: 60px"
                  ></el-input>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 訂單基本資訊 -->
        <el-divider content-position="left">訂單基本資訊</el-divider>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="訂單金額" prop="totalAmount">
              <el-input
                v-model="formattedTotalAmount"
                disabled
                prefix-icon="el-icon-money"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="下單日期" prop="orderDate">
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                placeholder="選擇日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                disabled
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="處理人員" prop="processor">
              <el-select
                v-model="form.processor"
                placeholder="選擇處理人員"
                style="width: 100%"
              >
                <el-option
                  v-for="item in processorOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 付款資訊 -->
        <el-divider content-position="left">付款資訊</el-divider>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="付款狀態" prop="paymentStatus">
              <el-select
                v-model="form.paymentStatus"
                placeholder="選擇付款狀態"
                @change="handlePaymentStatusChange"
                style="width: 100%"
              >
                <el-option
                  v-for="item in paymentStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <span style="float: left">
                    <i :class="item.icon" style="margin-right: 8px"></i>
                    {{ item.label }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="已付金額" prop="paidAmount">
              <el-input
                v-model.number="form.paidAmount"
                type="number"
                prefix-icon="el-icon-money"
                placeholder="請輸入已付金額"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="付款日期" prop="paymentDate">
              <el-date-picker
                v-model="form.paymentDate"
                type="date"
                placeholder="選擇日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="付款方式" prop="paymentMethod">
              <el-select
                v-model="form.paymentMethod"
                placeholder="選擇付款方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in paymentMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item
              label="末五碼"
              prop="bankLastFive"
              v-if="showBankFields"
            >
              <el-input
                v-model="form.bankLastFive"
                maxlength="5"
                placeholder="請輸入末五碼"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item
              label="銀行截圖"
              prop="bankScreenshot"
              v-if="showBankFields"
            >
              <image-uploader
                v-model="form.bankScreenshot"
                placeholder="點擊上傳銀行轉帳截圖"
                @change="handleScreenshotChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 接單狀態 -->
        <el-divider content-position="left">接單狀態</el-divider>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="接單狀態" prop="orderStatus">
              <el-select
                v-model="form.orderStatus"
                placeholder="選擇接單狀態"
                @change="handleOrderStatusChange"
                style="width: 100%"
              >
                <el-option
                  v-for="item in orderStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <span style="float: left">
                    <i :class="item.icon" style="margin-right: 8px"></i>
                    {{ item.label }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 備註 -->
        <el-divider content-position="left">備註</el-divider>
        <el-row>
          <el-col :span="24">
            <el-form-item label="新增備註" prop="newRemark">
              <el-input
                v-model="form.newRemark"
                type="textarea"
                :rows="3"
                placeholder="請輸入備註"
              ></el-input>
              <div class="remark-actions">
                <el-checkbox v-model="form.isImportantRemark">
                  標記為重要
                </el-checkbox>
                <el-checkbox v-model="form.isPinnedRemark"
                  >置頂顯示</el-checkbox
                >
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 顯示所有相關備註 (使用可折疊面板) -->
        <!-- <el-row v-if="remarks.length > 0">
          <el-col :span="24">
            <el-collapse v-model="activeRemarkPanels" class="remarks-collapse">
              <el-collapse-item name="remarks">
                <template slot="title">
                  <div class="remarks-collapse-title">
                    <span>歷史備註</span>
                    <el-badge
                      :value="remarks.length"
                      :max="99"
                      class="remarks-count"
                    ></el-badge>
                  </div>
                </template>

                <div class="remarks-container">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(remark, index) in remarks"
                      :key="index"
                      :timestamp="remark.createTime"
                      :type="getRemarkType(remark)"
                    >
                      <el-card class="remark-card" shadow="hover">
                        <div class="remark-header">
                          <span
                            v-if="remark.isImportant"
                            class="remark-badge important"
                          >
                            <i class="el-icon-star-on"></i> 重要
                          </span>
                          <span
                            v-if="remark.isPinned"
                            class="remark-badge pinned"
                          >
                            <i class="el-icon-top"></i> 置頂
                          </span>
                          <span class="remark-author">{{
                            remark.createdBy
                          }}</span>
                        </div>
                        <div class="remark-content">{{ remark.content }}</div>
                        <div
                          v-if="remark.images && remark.images.length > 0"
                          class="remark-images"
                        >
                          <el-image
                            v-for="(img, imgIndex) in remark.images"
                            :key="imgIndex"
                            :src="img"
                            :preview-src-list="remark.images"
                            fit="cover"
                            class="remark-image"
                          ></el-image>
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row> -->
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        確認修改
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/date";
import ImageUploader from "@/components/BaseForm/ImageUploader.vue";
import OrderTakingService from "../services/OrderTakingService.js";

export default {
  name: "OrderTakingDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    },
    orderDetailData: {
      type: Array,
      default: () => []
    },
    paymentStatusOptions: {
      type: Array,
      default: () => []
    },
    orderStatusOptions: {
      type: Array,
      default: () => []
    }
  },
  components: {
    ImageUploader
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitting: false,
      activeRemarkPanels: [], // 備註摺疊面板狀態
      form: {
        id: "",
        orderNumber: "",
        customerName: "",
        contactPhone: "",
        extension: "",
        totalAmount: 0,
        paidAmount: 0,
        paymentMethod: "bankTransfer",
        bankLastFive: "",
        bankScreenshot: "",
        paymentStatus: "",
        orderStatus: "",
        orderDate: "",
        paymentDate: "",
        processor: "",
        newRemark: "",
        isImportantRemark: false,
        isPinnedRemark: false
      },
      // 備註列表
      remarks: [],
      // 處理人員選項
      processorOptions: [
        { value: "admin", label: "系統管理員" },
        { value: "sales1", label: "業務一" },
        { value: "sales2", label: "業務二" },
        { value: "sales3", label: "業務三" }
      ],
      // 付款方式選項
      paymentMethodOptions: [
        { value: "bankTransfer", label: "銀行轉帳" },
        { value: "creditCard", label: "信用卡" },
        { value: "cash", label: "現金" },
        { value: "linePay", label: "Line Pay" },
        { value: "other", label: "其他" }
      ],
      // 表單驗證規則
      rules: {
        contactPhone: [
          {
            pattern: /^\d{8,10}$/,
            message: "請輸入有效的電話號碼",
            trigger: "blur"
          }
        ],
        paidAmount: [
          { type: "number", message: "必須為數字", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value > this.form.totalAmount) {
                callback(new Error("已付金額不能超過訂單總金額"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        paymentStatus: [
          { required: true, message: "請選擇付款狀態", trigger: "change" }
        ],
        orderStatus: [
          { required: true, message: "請選擇接單狀態", trigger: "change" }
        ],
        bankLastFive: [
          {
            validator: (rule, value, callback) => {
              if (this.showBankFields && !value) {
                callback(new Error("請輸入銀行末五碼"));
              } else if (value && !/^\d{5}$/.test(value)) {
                callback(new Error("末五碼必須為5位數字"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    dialogTitle() {
      return `編輯接單 - ${this.form.orderNumber}`;
    },
    formattedTotalAmount() {
      return `$${this.form.totalAmount.toLocaleString()}`;
    },
    showBankFields() {
      // 只有選擇銀行轉帳時才顯示末五碼和截圖欄位
      return this.form.paymentMethod === "bankTransfer";
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.initFormData();
      }
    },
    orderData: {
      handler(newVal) {
        if (this.dialogVisible && newVal) {
          this.initFormData();
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化表單數據
    initFormData() {
      this.loading = true;
      try {
        // 複製訂單數據到表單
        this.form = {
          ...this.form,
          ...JSON.parse(JSON.stringify(this.orderData)),
          newRemark: "",
          isImportantRemark: false,
          isPinnedRemark: false
        };

        // 加載備註
        this.loadRemarks();
      } catch (error) {
        console.error("初始化表單數據失敗:", error);
        this.$message.error("初始化表單數據失敗");
      } finally {
        this.loading = false;
      }
    },

    // 加載備註
    async loadRemarks() {
      if (!this.form.id) return;

      try {
        this.loading = true;
        const response = await OrderTakingService.getOrderRemarks(this.form.id);

        if (response.success && response.data) {
          this.remarks = response.data;
        } else {
          this.remarks = [];
        }
      } catch (error) {
        console.error("獲取備註數據失敗:", error);
        this.$message.error("獲取備註數據失敗");
        this.remarks = [];
      } finally {
        this.loading = false;
      }
    },

    // 處理付款狀態變更
    handlePaymentStatusChange(value) {
      // 根據付款狀態自動調整接單狀態
      if (value === "paid") {
        if (this.form.orderStatus !== "cancelled") {
          this.form.orderStatus = "completed";
        }
      } else if (value === "cancelled" || value === "refunded") {
        this.form.orderStatus = "cancelled";
      }

      // 若為已付款狀態，設置付款日期為今天
      if (value === "paid" && !this.form.paymentDate) {
        this.form.paymentDate = formatDate(new Date(), "YYYY-MM-DD");
      }
    },

    // 處理接單狀態變更
    handleOrderStatusChange(value) {
      // 根據接單狀態自動調整付款狀態
      if (value === "completed") {
        if (this.form.paymentStatus !== "refunded") {
          this.form.paymentStatus = "paid";

          // 若付款日期為空，則設置為今天
          if (!this.form.paymentDate) {
            this.form.paymentDate = formatDate(new Date(), "YYYY-MM-DD");
          }
        }
      } else if (value === "cancelled") {
        if (
          this.form.paymentStatus !== "refunded" &&
          this.form.paymentStatus !== "paid"
        ) {
          this.form.paymentStatus = "cancelled";
        }
      }
    },

    // 處理上傳銀行截圖
    handleScreenshotChange(file) {
      if (file && typeof file !== "string") {
        this.uploadBankScreenshot(file);
      }
    },

    async uploadBankScreenshot(file) {
      try {
        // 創建 FormData 對象
        const formData = new FormData();
        formData.append("image", file);

        // 調用上傳服務
        const response = await OrderTakingService.uploadImage(formData);

        if (response.success && response.data) {
          this.form.bankScreenshot = response.data.url;
          this.$message.success("上傳成功");
        } else {
          this.$message.error(response.message || "上傳失敗");
        }
      } catch (error) {
        console.error("上傳截圖失敗:", error);
        this.$message.error("上傳截圖失敗");
      }
    },

    // 獲取備註類型樣式
    getRemarkType(remark) {
      if (remark.isImportant) {
        return "warning";
      } else if (remark.isPinned) {
        return "primary";
      }
      return "info";
    },

    // 提交表單
    async handleSubmit() {
      // 表單驗證
      this.$refs.orderForm.validate(async valid => {
        if (!valid) {
          this.$message.error("請檢查表單內容，確保填寫正確");
          return;
        }

        this.submitting = true;
        try {
          // 準備要提交的數據
          const formData = {
            ...this.form
          };

          // 剔除不需要的欄位
          delete formData.newRemark;
          delete formData.isImportantRemark;
          delete formData.isPinnedRemark;

          // 發送更新請求
          const response = await OrderTakingService.updateOrder(formData);

          if (response.success) {
            // 如果有新備註，則添加備註
            if (this.form.newRemark) {
              await this.addRemark();
            }

            this.$message.success("訂單更新成功");

            // 通知父組件更新成功
            this.$emit("update-success", formData);

            // 關閉對話框
            this.handleDialogClose();
          } else {
            this.$message.error(response.message || "更新失敗");
          }
        } catch (error) {
          console.error("更新訂單失敗:", error);
          this.$message.error("更新訂單失敗: " + error.message);
        } finally {
          this.submitting = false;
        }
      });
    },

    // 添加備註
    async addRemark() {
      if (!this.form.newRemark) return;

      try {
        const remarkData = {
          orderId: this.form.id,
          content: this.form.newRemark,
          isPinned: this.form.isPinnedRemark,
          isImportant: this.form.isImportantRemark
        };

        const response = await OrderTakingService.addOrderRemark(remarkData);

        if (response.success) {
          // 清空備註輸入
          this.form.newRemark = "";
          this.form.isImportantRemark = false;
          this.form.isPinnedRemark = false;

          // 刷新備註列表
          await this.loadRemarks();
        } else {
          this.$message.error(response.message || "備註添加失敗");
        }
      } catch (error) {
        console.error("添加備註失敗:", error);
      }
    },

    // 關閉對話框
    handleDialogClose() {
      // 重置表單
      if (this.$refs.orderForm) {
        this.$refs.orderForm.resetFields();
      }
      this.form = {
        id: "",
        orderNumber: "",
        customerName: "",
        contactPhone: "",
        extension: "",
        totalAmount: 0,
        paidAmount: 0,
        paymentMethod: "",
        bankLastFive: "",
        bankScreenshot: "",
        paymentStatus: "",
        orderStatus: "",
        orderDate: "",
        paymentDate: "",
        processor: "",
        newRemark: "",
        isImportantRemark: false,
        isPinnedRemark: false
      };
      this.remarks = [];

      // 通知父組件關閉對話框
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.order-dialog-content {
  padding: 0 20px;

  .el-divider {
    margin: 24px 0 16px;

    ::v-deep .el-divider__text {
      font-size: 16px;
      font-weight: 500;
      color: #606266;
      background-color: #fff;
    }
  }
}

.phone-input-container {
  ::v-deep .el-input-group__append {
    padding: 0;
  }
}

.remark-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.remarks-collapse {
  margin-top: 16px;

  ::v-deep .el-collapse-item__header {
    background-color: #f9f9f9;
    color: #606266;
    font-weight: 500;
    padding: 0 16px;
    border-radius: 8px 8px 0 0;
  }

  ::v-deep .el-collapse-item__wrap {
    background-color: #f9f9f9;
    border-radius: 0 0 8px 8px;
  }

  .remarks-collapse-title {
    display: flex;
    align-items: center;

    span {
      margin-right: 8px;
    }

    .remarks-count {
      transform: scale(0.8);
    }
  }
}

.remarks-container {
  padding: 0 16px 16px;

  .el-timeline {
    padding-left: 0;
  }

  .remark-card {
    margin-bottom: 8px;

    .remark-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 8px;

      .remark-badge {
        display: inline-flex;
        align-items: center;
        padding: 0 8px;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        border-radius: 10px;
        margin-right: 8px;
        margin-bottom: 4px;

        &.important {
          background-color: #fdf6ec;
          color: #e6a23c;
        }

        &.pinned {
          background-color: #ecf5ff;
          color: #409eff;
        }

        i {
          margin-right: 3px;
        }
      }

      .remark-author {
        font-size: 13px;
        color: #909399;
      }
    }

    .remark-content {
      font-size: 14px;
      line-height: 1.6;
      word-break: break-all;
      white-space: pre-wrap;
    }

    .remark-images {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .remark-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        cursor: pointer;
      }
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .el-dialog {
    width: 95% !important;
    margin-top: 5vh !important;
  }

  .order-dialog-content {
    padding: 0 10px;
  }

  .el-form {
    ::v-deep .el-form-item__label {
      float: none;
      display: block;
      text-align: left;
      padding: 0 0 8px;
      line-height: 1.5;
      white-space: normal;
    }

    ::v-deep .el-form-item__content {
      margin-left: 0 !important;
    }
  }

  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
