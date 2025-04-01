<!-- components/BatchUpdateDialog.vue -->
<template>
  <el-dialog
    title="批量更新訂單"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    custom-class="batch-update-dialog"
  >
    <div class="batch-info">
      <el-alert title="批量更新提醒" type="warning" :closable="false" show-icon>
        <template #default>
          已選擇 <strong>{{ selectedOrders.length }}</strong> 筆訂單
        </template>
      </el-alert>
    </div>

    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 更新類型選擇 -->
      <el-form-item label="更新項目" prop="updateType">
        <el-select v-model="formData.updateType" style="width: 100%">
          <el-option
            v-for="(item, key) in updateTypes"
            :key="key"
            :label="item.label"
            :value="key"
          />
        </el-select>
      </el-form-item>

      <!-- 付款狀態更新 -->
      <template v-if="formData.updateType === 'paymentStatus'">
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
      </template>

      <!-- 取貨方式更新 -->
      <template v-if="formData.updateType === 'pickupMethod'">
        <el-form-item label="取貨方式" prop="pickupMethod">
          <el-radio-group v-model="formData.pickupMethod">
            <el-radio label="company">公司取貨</el-radio>
            <el-radio label="address">地址取貨</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <!-- 管理備註更新 -->
      <template v-if="formData.updateType === 'adminNotes'">
        <el-form-item label="管理備註" prop="adminNotes">
          <el-input
            v-model="formData.adminNotes"
            type="textarea"
            :rows="3"
            placeholder="此備註將添加到所有選中的訂單"
          />
        </el-form-item>
      </template>

      <!-- 更新說明 -->
      <el-form-item label="更新說明" prop="updateReason" required>
        <el-input
          v-model="formData.updateReason"
          type="textarea"
          :rows="2"
          placeholder="請簡短說明此次批量更新的原因"
        />
      </el-form-item>
    </el-form>

    <!-- 訂單列表預覽 -->
    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">待更新訂單</span>
        <el-button type="text" @click="showPreview = !showPreview">
          {{ showPreview ? "收起" : "展開" }}
          <i :class="showPreview ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </el-button>
      </div>

      <el-collapse-transition>
        <div v-show="showPreview" class="preview-content">
          <el-table :data="selectedOrders" size="small" style="width: 100%">
            <el-table-column prop="orderId" label="訂單編號" width="120" />
            <el-table-column prop="customerName" label="訂購人" width="100" />
            <el-table-column label="當前狀態" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.paymentStatus)" size="small">
                  {{ getStatusLabel(row.paymentStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-transition>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確認更新
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "BatchUpdateDialog",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    selectedOrders: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      submitting: false,
      showPreview: true,
      formData: {
        updateType: "",
        paymentStatus: "",
        pickupMethod: "",
        adminNotes: "",
        updateReason: ""
      },
      updateTypes: {
        paymentStatus: { label: "付款狀態" },
        pickupMethod: { label: "取貨方式" },
        adminNotes: { label: "管理備註" }
      },
      editablePaymentStatus: {
        completed: { label: "付款完成", type: "success" },
        refunding: { label: "退款中", type: "warning" },
        refunded: { label: "已退款", type: "info" },
        cancelled: { label: "已取消", type: "danger" }
      },
      rules: {
        updateType: [
          { required: true, message: "請選擇要更新的項目", trigger: "change" }
        ],
        paymentStatus: [
          { required: true, message: "請選擇付款狀態", trigger: "change" }
        ],
        pickupMethod: [
          { required: true, message: "請選擇取貨方式", trigger: "change" }
        ],
        adminNotes: [
          { required: true, message: "請輸入管理備註", trigger: "blur" }
        ],
        updateReason: [
          { required: true, message: "請輸入更新說明", trigger: "blur" }
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
    }
  },

  watch: {
    value(val) {
      if (val) {
        this.resetForm();
      }
    },
    "formData.updateType": function() {
      if (this.$refs.form) {
        this.$refs.form.clearValidate();
      }
    }
  },

  methods: {
    getStatusType(status) {
      const statusConfig = this.editablePaymentStatus[status];
      return statusConfig ? statusConfig.type : "info";
    },

    getStatusLabel(status) {
      const statusConfig = this.editablePaymentStatus[status];
      return statusConfig ? statusConfig.label : status;
    },

    resetForm() {
      this.formData = {
        updateType: "",
        paymentStatus: "",
        pickupMethod: "",
        adminNotes: "",
        updateReason: ""
      };
    },

    async handleSubmit() {
      try {
        await this.$refs.form.validate();
        this.submitting = true;

        // 構建更新資料
        const updateData = {
          orderIds: this.selectedOrders.map(order => order.id),
          updateType: this.formData.updateType,
          updateReason: this.formData.updateReason
        };

        // 根據更新類型添加對應的資料
        switch (this.formData.updateType) {
          case "paymentStatus":
            updateData.paymentStatus = this.formData.paymentStatus;
            break;
          case "pickupMethod":
            updateData.pickupMethod = this.formData.pickupMethod;
            break;
          case "adminNotes":
            updateData.adminNotes = this.formData.adminNotes;
            break;
        }

        // TODO: 調用批量更新 API
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.$message.success("批量更新成功");
        this.$emit("success");
        this.dialogVisible = false;
      } catch (error) {
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
.batch-update-dialog {
  .el-dialog__body {
    padding: 20px;
  }

  .batch-info {
    margin-bottom: 20px;
  }

  .preview-section {
    margin-top: 24px;
    border-top: 1px solid #ebeef5;
    padding-top: 16px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .preview-title {
        font-weight: 500;
        color: #606266;
      }
    }

    .preview-content {
      max-height: 200px;
      overflow-y: auto;
      margin: 0 -20px;
      padding: 0 20px;
    }
  }
}
</style>
