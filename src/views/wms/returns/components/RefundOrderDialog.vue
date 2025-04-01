<template>
  <el-dialog
    title="編輯退貨單"
    :visible.sync="dialogVisible"
    width="80%"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="refund-order-dialog"
  >
    <div v-loading="loading" class="refund-form-container">
      <!-- 表單 -->
      <el-form
        ref="refundForm"
        :model="formData"
        :rules="rules"
        label-position="top"
        size="medium"
      >
        <!-- 基本資訊區塊 -->
        <div class="form-section">
          <div class="section-header">
            <h3>基本資訊</h3>
          </div>
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <label-input
                  label="退貨單號"
                  name="id"
                  v-model="formData.id"
                  :disabled="true"
                ></label-input>
              </el-col>
              <el-col :span="12">
                <label-input
                  label="原始銷貨單"
                  name="originalSalesId"
                  v-model="formData.originalSalesId"
                  :disabled="true"
                ></label-input>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <label-date-picker
                  label="退貨日期"
                  name="refundDate"
                  v-model="formData.refundDate"
                  :required="true"
                  requiredMessage="請選擇退貨日期"
                ></label-date-picker>
              </el-col>
              <el-col :span="12">
                <el-form-item label="狀態" prop="status">
                  <el-select v-model="formData.status" style="width: 100%">
                    <el-option
                      v-for="option in statusOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <label-input
                  label="客戶名稱"
                  name="customerName"
                  v-model="formData.customerName"
                  :disabled="true"
                ></label-input>
              </el-col>
              <el-col :span="12">
                <label-input
                  label="聯絡人"
                  name="contactName"
                  v-model="formData.contactName"
                  :disabled="true"
                ></label-input>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <label-input
                  label="聯絡電話"
                  name="contactPhone"
                  v-model="formData.contactPhone"
                  :disabled="true"
                ></label-input>
              </el-col>
              <el-col :span="12">
                <label-input
                  label="付款方式"
                  name="paymentMethod"
                  v-model="formData.paymentMethod"
                  :disabled="true"
                ></label-input>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="處理方式" prop="processMethod">
                  <el-select
                    v-model="formData.processMethod"
                    style="width: 100%"
                    @change="handleProcessMethodChange"
                  >
                    <el-option
                      v-for="method in processMethods"
                      :key="method.value"
                      :label="method.label"
                      :value="method.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="總金額" prop="totalAmount">
                  <el-input
                    v-model="formData.totalAmount"
                    readonly
                    type="number"
                  >
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="退款金額"
                  prop="refundAmount"
                  v-if="showRefundAmountField"
                >
                  <el-input-number
                    v-model="formData.refundAmount"
                    :min="0"
                    :max="formData.totalAmount"
                    style="width: 100%"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="換貨數量"
                  prop="exchangeQuantity"
                  v-if="showExchangeQuantityField"
                >
                  <el-input-number
                    v-model="formData.exchangeQuantity"
                    :min="0"
                    style="width: 100%"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="出貨地址" prop="shippingAddress">
                  <el-input
                    v-model="formData.shippingAddress"
                    readonly
                    type="textarea"
                    :rows="2"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 退貨明細區塊 - 改為卡片設計，添加獨立捲軸 -->
        <div class="form-section">
          <div class="section-header">
            <h3>退貨明細</h3>
          </div>
          <div class="section-body">
            <div class="detail-cards-container">
              <div
                v-for="(item, index) in formData.details"
                :key="index"
                class="detail-card"
              >
                <div class="detail-card-header">
                  <span class="detail-index">{{ index + 1 }}</span>
                  <div class="detail-header-info">
                    <h4>{{ item.productName }}</h4>
                    <span class="product-code">品號: {{ item.productCode }}</span>
                  </div>
                </div>
                <div class="detail-card-body">
                  <div class="detail-item">
                    <label>規格</label>
                    <span>{{ item.specification }}</span>
                  </div>
                  <div class="detail-item">
                    <label>批號</label>
                    <span>{{ item.batchNumber }}</span>
                  </div>
                  <div class="detail-item">
                    <label>單價</label>
                    <span>{{ item.price }}元</span>
                  </div>
                  <div class="detail-item">
                    <label>數量</label>
                    <span>{{ item.quantity }}</span>
                  </div>
                  <div class="detail-item">
                    <label>小計</label>
                    <span>{{ item.subtotal }}元</span>
                  </div>
                  <div class="detail-item">
                    <label>報損數量</label>
                    <el-input-number
                      v-model="item.damageQuantity"
                      :min="0"
                      :max="item.quantity"
                      size="mini"
                    ></el-input-number>
                  </div>
                  <div class="detail-item">
                    <label>問題類型</label>
                    <el-select
                      v-model="item.issueType"
                      placeholder="選擇問題類型"
                      size="mini"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in issueTypes"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      ></el-option>
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 備註區塊 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <h3>備註</h3>
            </div>
          </div>
          <div class="section-body">
            <el-form-item prop="remarks">
              <el-input
                type="textarea"
                :rows="3"
                placeholder="請輸入備註信息"
                v-model="formData.remarks"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>

            <div class="upload-preview-wrapper">
              <div class="upload-header">
                <span>上傳圖片</span>
                <span class="upload-tip">可上傳 JPG/PNG 圖片檔，單檔不超過 5MB</span>
              </div>

              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :file-list="fileList"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :on-preview="handleFilePreview"
                :before-upload="beforeFileUpload"
                multiple
                class="mobile-upload"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </div>

            <div class="remark-options">
              <el-checkbox v-model="remarkOptions.isPinned">
                <i class="el-icon-top"></i> 固定此備註
              </el-checkbox>
              <el-checkbox v-model="remarkOptions.isImportant">
                <i class="el-icon-star-on"></i> 標記為重要
              </el-checkbox>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">
        儲存
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import LabelInput from "@/components/BaseForm/LabelInput.vue";
import LabelDatePicker from "@/components/BaseForm/LabelDatePicker.vue";

export default {
  name: "RefundOrderDialog",

  components: {
    LabelInput,
    LabelDatePicker
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => null
    },
    processMethods: {
      type: Array,
      default: () => []
    },
    issueTypes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitting: false,
      fileList: [],
      remarkOptions: {
        isImportant: false,
        isPinned: false
      },
      formData: {
        id: "",
        originalSalesId: "",
        customerName: "",
        contactName: "",
        contactPhone: "",
        paymentMethod: "",
        shippingAddress: "",
        refundDate: "",
        status: "pending",
        processMethod: "",
        totalAmount: 0,
        refundAmount: 0,
        exchangeQuantity: 0,
        remarks: "",
        details: []
      },
      rules: {
        refundDate: [
          { required: true, message: "請選擇退貨日期", trigger: "change" }
        ],
        status: [{ required: true, message: "請選擇狀態", trigger: "change" }],
        processMethod: [
          { required: true, message: "請選擇處理方式", trigger: "change" }
        ],
        refundAmount: [
          {
            validator: this.validateRefundAmount,
            trigger: "change"
          }
        ],
        exchangeQuantity: [
          {
            validator: this.validateExchangeQuantity,
            trigger: "change"
          }
        ]
      },
      statusOptions: [
        { value: "pending", label: "待處理" },
        { value: "processing", label: "處理中" },
        { value: "completed", label: "已完成" },
        { value: "rejected", label: "已拒絕" }
      ]
    };
  },

  computed: {
    // 根據處理方式判斷是否顯示退款金額欄位
    showRefundAmountField() {
      return [
        "returnRefundFull",
        "returnRefundPartial",
        "returnExchangeRefundPartial",
        "noReturnRefundFull",
        "noReturnRefundPartial",
        "noReturnExchangeRefundPartial",
        "cancelBeforeShip",
        "cancelAfterShip"
      ].includes(this.formData.processMethod);
    },

    // 根據處理方式判斷是否顯示換貨數量欄位
    showExchangeQuantityField() {
      return [
        "returnExchange",
        "returnExchangeRefundPartial",
        "noReturnExchange",
        "noReturnExchangeRefundPartial"
      ].includes(this.formData.processMethod);
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val && this.data) {
        this.initFormData();
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit("update:visible", false);
      }
    }
  },

  methods: {
    // 初始化表單數據
    initFormData() {
      this.loading = true;

      if (this.data) {
        // 深拷貝數據，避免直接修改原始對象
        this.formData = JSON.parse(JSON.stringify(this.data));

        // 確保details數組存在
        if (!this.formData.details) {
          this.formData.details = [];
        }

        // 確保refundAmount和exchangeQuantity存在
        if (this.formData.refundAmount === undefined) {
          this.formData.refundAmount = 0;
        }

        if (this.formData.exchangeQuantity === undefined) {
          this.formData.exchangeQuantity = 0;
        }

        // 對每一個明細項設置報損數量
        this.formData.details.forEach(item => {
          // 設置最大可退數量，默認為當前數量
          if (!item.maxQuantity) {
            item.maxQuantity = item.quantity;
          }

          // 確保報損數量欄位存在
          if (item.damageQuantity === undefined) {
            item.damageQuantity = 0;
          }
        });
        
        // 如果有備註選項，初始化備註選項
        if (this.data.remarkOptions) {
          this.remarkOptions = {
            isImportant: this.data.remarkOptions.isImportant || false,
            isPinned: this.data.remarkOptions.isPinned || false
          };
        }
        
        // 如果有檔案，初始化檔案列表
        if (this.data.remarkFiles && this.data.remarkFiles.length > 0) {
          this.fileList = this.data.remarkFiles.map((file, index) => ({
            name: file.name || `圖片${index + 1}`,
            url: file.url || URL.createObjectURL(file)
          }));
        } else {
          this.fileList = [];
        }
      } else {
        // 重置表單
        this.$refs.refundForm && this.$refs.refundForm.resetFields();
        this.formData = {
          id: "",
          originalSalesId: "",
          customerName: "",
          contactName: "",
          contactPhone: "",
          paymentMethod: "",
          shippingAddress: "",
          refundDate: new Date().toISOString().split("T")[0],
          status: "pending",
          processMethod: "",
          totalAmount: 0,
          refundAmount: 0,
          exchangeQuantity: 0,
          remarks: "",
          details: []
        };
        this.fileList = [];
        this.remarkOptions = {
          isImportant: false,
          isPinned: false
        };
      }

      this.loading = false;
    },

    // 處理方式變更時的處理
    handleProcessMethodChange(value) {
      // 根據處理方式自動設置退款金額和換貨數量的初始值
      if (
        value === "returnRefundFull" ||
        value === "noReturnRefundFull" ||
        value === "cancelBeforeShip" ||
        value === "cancelAfterShip"
      ) {
        // 全額退款時，退款金額等於總金額
        this.formData.refundAmount = this.formData.totalAmount;
      } else if (value === "returnExchange" || value === "noReturnExchange") {
        // 純換貨時，退款金額為0
        this.formData.refundAmount = 0;
      }

      // 換貨數量初始值設置
      if (
        value === "returnExchange" ||
        value === "returnExchangeRefundPartial" ||
        value === "noReturnExchange" ||
        value === "noReturnExchangeRefundPartial"
      ) {
        // 計算商品總數量作為換貨數量的初始值
        const totalItems = this.formData.details.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        this.formData.exchangeQuantity = totalItems;
      } else {
        this.formData.exchangeQuantity = 0;
      }
    },

    // 驗證退款金額
    validateRefundAmount(rule, value, callback) {
      if (this.showRefundAmountField) {
        if (value === undefined || value === null) {
          callback(new Error("請輸入退款金額"));
        } else if (value < 0) {
          callback(new Error("退款金額不能小於0"));
        } else if (
          (this.formData.processMethod === "returnRefundFull" ||
            this.formData.processMethod === "noReturnRefundFull" ||
            this.formData.processMethod === "cancelBeforeShip" ||
            this.formData.processMethod === "cancelAfterShip") &&
          value !== this.formData.totalAmount
        ) {
          callback(new Error("全額退款時，退款金額必須等於總金額"));
        } else if (value > this.formData.totalAmount) {
          callback(new Error("退款金額不能大於總金額"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },

    // 驗證換貨數量
    validateExchangeQuantity(rule, value, callback) {
      if (this.showExchangeQuantityField) {
        if (value === undefined || value === null) {
          callback(new Error("請輸入換貨數量"));
        } else if (value < 0) {
          callback(new Error("換貨數量不能小於0"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },

    // 計算總金額
    calculateTotalAmount() {
      if (this.formData.details && this.formData.details.length > 0) {
        this.formData.totalAmount = this.formData.details.reduce(
          (sum, item) => sum + (item.subtotal || 0),
          0
        );
      } else {
        this.formData.totalAmount = 0;
      }

      // 如果是全額退款，更新退款金額
      if (
        this.formData.processMethod === "returnRefundFull" ||
        this.formData.processMethod === "noReturnRefundFull" ||
        this.formData.processMethod === "cancelBeforeShip" ||
        this.formData.processMethod === "cancelAfterShip"
      ) {
        this.formData.refundAmount = this.formData.totalAmount;
      }
    },

    // 提交表單
    submitForm() {
      this.$refs.refundForm.validate(valid => {
        if (valid) {
          this.submitting = true;

          // 檢查明細項
          const detailsValidation = this.validateDetails();
          if (!detailsValidation.valid) {
            this.$msgbox({
              title: "驗證失敗",
              message: detailsValidation.message,
              type: "error"
            });
            this.submitting = false;
            return;
          }

          // 提交數據
          const submitData = JSON.parse(JSON.stringify(this.formData));
          
          // 添加備註選項和文件
          submitData.remarkOptions = {
            isImportant: this.remarkOptions.isImportant,
            isPinned: this.remarkOptions.isPinned
          };
          
          // 如果有文件，也包含進去
          if (this.fileList.length > 0) {
            submitData.remarkFiles = this.fileList.map(file => file.raw);
          }

          // 發送儲存事件
          this.$emit("save", submitData);

          // 注意：實際儲存操作應在父組件中處理，這裡僅發送事件
          // 父組件處理完成後應關閉對話框並重置表單
        } else {
          return false;
        }
      });
    },

    // 驗證明細項
    validateDetails() {
      if (!this.formData.details || this.formData.details.length === 0) {
        return {
          valid: false,
          message: "退貨明細不能為空"
        };
      }

      // 檢查每個明細項必填字段
      for (let i = 0; i < this.formData.details.length; i++) {
        const item = this.formData.details[i];

        if (!item.issueType) {
          return {
            valid: false,
            message: `第 ${i + 1} 項明細的問題類型不能為空`
          };
        }

        if (item.quantity <= 0) {
          return {
            valid: false,
            message: `第 ${i + 1} 項明細的數量必須大於0`
          };
        }

        if (item.damageQuantity > item.quantity) {
          return {
            valid: false,
            message: `第 ${i + 1} 項明細的報損數量不能大於退貨數量`
          };
        }
      }

      return {
        valid: true
      };
    },

    // 關閉對話框
    handleClose() {
      // 如果有未儲存的修改，彈出確認框
      if (this.isFormDataChanged()) {
        this.$msgbox({
          title: "確認關閉",
          message: "有未儲存的修改，確定要關閉嗎？",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.dialogVisible = false;
          })
          .catch(() => {});
      } else {
        this.dialogVisible = false;
      }
    },

    // 檢查表單數據是否改變
    isFormDataChanged() {
      if (!this.data) return false;

      // 對比關鍵字段
      const original = this.data;
      const current = this.formData;

      // 檢查簡單字段
      if (
        current.status !== original.status ||
        current.processMethod !== original.processMethod ||
        current.remarks !== original.remarks ||
        current.refundDate !== original.refundDate ||
        current.refundAmount !== original.refundAmount ||
        current.exchangeQuantity !== original.exchangeQuantity
      ) {
        return true;
      }

      // 檢查明細項
      if (!original.details || !current.details) return true;
      if (original.details.length !== current.details.length) return true;

      for (let i = 0; i < current.details.length; i++) {
        const origItem = original.details[i];
        const currItem = current.details[i];

        if (
          currItem.issueType !== origItem.issueType ||
          currItem.damageQuantity !== origItem.damageQuantity
        ) {
          return true;
        }
      }

      // 檢查備註選項
      const origOptions = original.remarkOptions || {
        isImportant: false,
        isPinned: false
      };
      if (
        this.remarkOptions.isImportant !== origOptions.isImportant ||
        this.remarkOptions.isPinned !== origOptions.isPinned
      ) {
        return true;
      }

      // 檢查檔案列表
      const origFiles = original.remarkFiles || [];
      if (this.fileList.length !== origFiles.length) {
        return true;
      }

      return false;
    },

    // 檔案上傳前檢查
    beforeFileUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        this.$message.error("只能上傳圖片檔!");
      }
      if (!isLt5M) {
        this.$message.error("圖片大小不能超過 5MB!");
      }

      return isImage && isLt5M;
    },

    // 處理文件變更
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },

    // 處理文件移除
    handleFileRemove(file, fileList) {
      this.fileList = fileList;
    },

    // 處理文件預覽
    handleFilePreview(file) {
      const previewUrl = file.url || URL.createObjectURL(file.raw);
      // 可以使用瀏覽器預覽或者自定義預覽
      if (window.open) {
        window.open(previewUrl);
      } else {
        // 如果不支持window.open，可以添加自定義預覽邏輯
        this.$alert("無法預覽圖片", "提示", {
          confirmButtonText: "確定"
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.refund-order-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px 20px 0;
  }

  .refund-form-container {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #e0e0e0;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f5f5;
    }
  }

  .form-section {
    margin-bottom: 24px;
    background: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .section-header {
      background: #f0f2f5;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }

      .section-title-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
    }

    .section-body {
      padding: 16px;
      background: white;
    }
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
    color: #666;
  }

  // 退貨明細卡片樣式
  .detail-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    max-height: 400px; /* 設定最大高度，超過會出現捲軸 */
    overflow-y: auto;
    padding-right: 8px; /* 預留捲軸空間 */

    /* 捲軸樣式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #d0d0d0;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f0f0f0;
    }

    .detail-card {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .detail-card-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e8e8e8;

        .detail-index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #409eff;
          color: white;
          border-radius: 50%;
          margin-right: 12px;
          font-weight: bold;
          font-size: 12px;
        }

        .detail-header-info {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            line-height: 1.2;
          }

          .product-code {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .detail-card-body {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        .detail-item {
          display: flex;
          flex-direction: column;

          &:last-child,
          &:nth-last-child(2) {
            grid-column: span 2;
          }

          label {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
            font-weight: 500;
          }

          span {
            font-size: 14px;
            color: #333;
          }

          .el-select,
          .el-input-number {
            width: 100%;
          }
        }
      }
    }
  }

  // 備註相關樣式
  .upload-preview-wrapper {
    margin-bottom: 20px;

    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;

      .upload-tip {
        font-size: 12px;
        color: #909399;
      }
    }

    .mobile-upload {
      ::v-deep .el-upload--picture-card {
        width: 88px;
        height: 88px;
        line-height: 88px;
      }

      ::v-deep .el-upload-list--picture-card .el-upload-list__item {
        width: 88px;
        height: 88px;
      }
    }
  }

  .remark-options {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;

    .el-checkbox {
      margin-right: 0;
      display: flex;
      align-items: center;

      ::v-deep .el-checkbox__label {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
  
  // 移動端適配
  @media (max-width: 768px) {
    .detail-cards-container {
      grid-template-columns: 1fr;
    }
    
    .remark-options {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>