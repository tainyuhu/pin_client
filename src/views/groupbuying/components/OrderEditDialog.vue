<!-- components/OrderEditDialog.vue -->
<template>
  <el-dialog
    title="編輯訂單"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="order-edit-dialog"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 訂單狀態 -->
      <el-form-item label="付款狀態" prop="paymentStatus">
        <el-select v-model="formData.paymentStatus" style="width: 100%">
          <el-option
            v-for="(status, key) in editablePaymentStatus"
            :key="key"
            :label="status.label"
            :value="key"
          >
            <el-tag :type="status.type" size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 付款資訊 -->
      <template v-if="showPaymentInfo">
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="formData.paymentMethod" style="width: 100%">
            <el-option label="銀行轉帳" value="bank" />
            <el-option label="現金" value="cash" />
          </el-select>
        </el-form-item>

        <el-form-item label="付款金額" prop="paidAmount">
          <el-input-number
            v-model="formData.paidAmount"
            :min="0"
            :max="orderData.totalAmount"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="付款時間" prop="paymentTime">
          <el-date-picker
            v-model="formData.paymentTime"
            type="datetime"
            placeholder="選擇付款時間"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 取貨資訊 -->
      <el-form-item label="取貨方式" prop="pickupMethod">
        <el-radio-group v-model="formData.pickupMethod">
          <el-radio label="company">公司取貨</el-radio>
          <el-radio label="address">地址取貨</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="取貨地址"
        prop="address"
        v-if="formData.pickupMethod === 'address'"
      >
        <el-input
          v-model="formData.address"
          type="textarea"
          :rows="2"
          placeholder="請輸入完整取貨地址"
        />
      </el-form-item>

      <!-- 聯絡資訊 -->
      <el-form-item label="聯絡電話" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input v-model="formData.email" />
      </el-form-item>

      <!-- 備註 -->
      <el-form-item label="管理備註">
        <el-input
          v-model="formData.adminNotes"
          type="textarea"
          :rows="3"
          placeholder="僅供管理者查看的備註"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確認
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "OrderEditDialog",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      submitting: false,
      formData: {
        paymentStatus: "",
        paymentMethod: "",
        paidAmount: 0,
        paymentTime: null,
        pickupMethod: "",
        address: "",
        phone: "",
        email: "",
        adminNotes: ""
      },
      // 可編輯的付款狀態（排除系統自動狀態）
      editablePaymentStatus: {
        completed: { label: "付款完成", type: "success" },
        refunding: { label: "退款中", type: "warning" },
        refunded: { label: "已退款", type: "info" },
        cancelled: { label: "已取消", type: "danger" }
      },
      rules: {
        paymentStatus: [
          { required: true, message: "請選擇付款狀態", trigger: "change" }
        ],
        paymentMethod: [
          { required: true, message: "請選擇付款方式", trigger: "change" }
        ],
        paidAmount: [
          { required: true, message: "請輸入付款金額", trigger: "blur" }
        ],
        paymentTime: [
          { required: true, message: "請選擇付款時間", trigger: "change" }
        ],
        pickupMethod: [
          { required: true, message: "請選擇取貨方式", trigger: "change" }
        ],
        address: [
          { required: true, message: "請輸入取貨地址", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "請輸入聯絡電話", trigger: "blur" },
          {
            pattern: /^09\d{8}$/,
            message: "請輸入正確的手機號碼格式",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "請輸入Email", trigger: "blur" },
          { type: "email", message: "請輸入正確的Email格式", trigger: "blur" }
        ]
      }
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    showPaymentInfo() {
      return ["completed", "refunded"].includes(this.formData.paymentStatus);
    }
  },

  watch: {
    value(val) {
      if (val) {
        this.initFormData();
      }
    }
  },

  methods: {
    initFormData() {
      const orderDetail = this.orderData.orderDetail || {};
      const paymentInfo = orderDetail.paymentInfo || {};
      const contactInfo = orderDetail.contactInfo || {};

      this.formData = {
        paymentStatus: this.orderData.paymentStatus,
        paymentMethod: paymentInfo.method || "",
        paidAmount: this.orderData.totalAmount,
        paymentTime: this.orderData.paymentTime
          ? new Date(this.orderData.paymentTime)
          : null,
        pickupMethod: this.orderData.pickupMethod,
        address: contactInfo.address || "",
        phone: contactInfo.phone || "",
        email: contactInfo.email || "",
        adminNotes: orderDetail.notes || ""
      };
    },

    async handleSubmit() {
      try {
        await this.$refs.form.validate();
        this.submitting = true;

        // TODO: 調用更新 API
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.$message.success("更新成功");
        this.$emit("success");
        this.dialogVisible = false;
      } catch (error) {
        // 表單驗證失敗
        if (error === false) return;
        this.$message.error("更新失敗");
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style lang="scss">
.order-edit-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
