<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '編輯客訴單' : '新增客訴單'"
    width="80%"
    top="5vh"
    :before-close="handleClose"
    class="complaint-order-dialog"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="formRules"
      label-width="120px"
      label-position="right"
      class="complaint-form"
      v-loading="loading"
    >
      <!-- 基本資訊區塊 -->
      <div class="form-section">
        <div class="section-title">基本資訊</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客訴單號" prop="id">
              <el-input v-model="form.id" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="相關訂單編號" prop="relatedOrderId">
              <el-input
                v-model="form.relatedOrderId"
                placeholder="相關訂單編號（如有）"
                :disabled="isEdit"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="建立日期" prop="createdDate">
              <el-date-picker
                v-model="form.createdDate"
                type="date"
                placeholder="建立日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                :disabled="isEdit"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客戶名稱" prop="customerName">
              <el-input
                v-model="form.customerName"
                placeholder="請輸入客戶名稱"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="聯絡人" prop="contactName">
              <el-input
                v-model="form.contactName"
                placeholder="請輸入聯絡人姓名"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="聯絡電話" prop="contactPhone">
              <el-input
                v-model="form.contactPhone"
                placeholder="請輸入聯絡電話"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 客訴狀態與處理資訊 -->
      <div class="form-section">
        <div class="section-title">客訴狀態與處理資訊</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="處理狀態" prop="status">
              <el-select
                v-model="form.status"
                placeholder="請選擇處理狀態"
                style="width: 100%"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="優先級別" prop="priority">
              <el-select
                v-model="form.priority"
                placeholder="請選擇優先級別"
                style="width: 100%"
              >
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客訴類型" prop="complaintType">
              <el-select
                v-model="form.complaintType"
                placeholder="請選擇客訴類型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in complaintTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="處理人員" prop="assignedTo">
              <el-select
                v-model="form.assignedTo"
                placeholder="請選擇處理人員"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in staffOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="問題作業單" prop="hasIssueTicket">
              <el-switch
                v-model="form.hasIssueTicket"
                active-text="是"
                inactive-text="否"
                @change="handleIssueTicketChange"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="form.hasIssueTicket">
            <el-form-item label="作業單編號" prop="issueTicketId">
              <el-input
                v-model="form.issueTicketId"
                placeholder="請輸入問題作業單編號"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.hasIssueTicket">
          <el-col :span="8">
            <el-form-item label="作業單狀態" prop="issueTicketStatus">
              <el-select
                v-model="form.issueTicketStatus"
                placeholder="請選擇作業單狀態"
                style="width: 100%"
              >
                <el-option
                  v-for="item in issueTicketStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 問題說明 -->
      <div class="form-section">
        <div class="section-title">問題說明</div>
        <el-form-item label="問題說明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="請詳細描述客訴問題"
          ></el-input>
        </el-form-item>
      </div>

      <!-- 產品相關資訊 -->
      <div class="form-section">
        <div class="section-title">產品相關資訊</div>
        <div class="table-toolbar">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="addProductRow"
          >
            新增產品
          </el-button>
        </div>

        <el-table :data="form.products" border class="product-table">
          <el-table-column prop="productId" label="產品ID/品號" width="120">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.productId"
                placeholder="產品ID"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="productName" label="產品名稱" width="180">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.productName"
                placeholder="產品名稱"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="specification" label="產品規格" width="150">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.specification"
                placeholder="產品規格"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="productType" label="產品類型" width="150">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.productType"
                placeholder="產品類型"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="problemType" label="問題類型" width="180">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.problemType"
                placeholder="問題類型"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="item in problemTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column prop="problemQuantity" label="問題數量" width="100">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.problemQuantity"
                :min="1"
                size="small"
                controls-position="right"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column
            prop="problemDescription"
            label="詳細問題描述"
            min-width="200"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.problemDescription"
                type="textarea"
                :rows="2"
                placeholder="詳細描述問題"
                size="small"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="80">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="removeProductRow(scope.$index)"
                type="text"
                size="small"
                style="color: #f56c6c;"
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting"
        >確認</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ComplaintOrderDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => null
    },
    complaintTypes: {
      type: Array,
      default: () => []
    },
    priorityOptions: {
      type: Array,
      default: () => []
    },
    problemTypes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitting: false,
      form: {
        id: "",
        relatedOrderId: "",
        customerName: "",
        contactName: "",
        contactPhone: "",
        createdDate: "",
        status: "",
        priority: "",
        complaintType: "",
        assignedTo: "",
        hasIssueTicket: false,
        issueTicketId: "",
        issueTicketStatus: "",
        description: "",
        products: []
      },
      formRules: {
        customerName: [
          { required: true, message: "請輸入客戶名稱", trigger: "blur" }
        ],
        contactName: [
          { required: true, message: "請輸入聯絡人", trigger: "blur" }
        ],
        contactPhone: [
          { required: true, message: "請輸入聯絡電話", trigger: "blur" }
        ],
        status: [
          { required: true, message: "請選擇處理狀態", trigger: "change" }
        ],
        priority: [
          { required: true, message: "請選擇優先級別", trigger: "change" }
        ],
        complaintType: [
          { required: true, message: "請選擇客訴類型", trigger: "change" }
        ],
        assignedTo: [
          { required: true, message: "請選擇處理人員", trigger: "change" }
        ],
        issueTicketId: [
          {
            required: true,
            message: "請輸入問題作業單編號",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (this.form.hasIssueTicket && !value) {
                callback(new Error("請輸入問題作業單編號"));
              } else {
                callback();
              }
            }
          }
        ],
        issueTicketStatus: [
          {
            required: true,
            message: "請選擇作業單狀態",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.form.hasIssueTicket && !value) {
                callback(new Error("請選擇作業單狀態"));
              } else {
                callback();
              }
            }
          }
        ],
        description: [
          { required: true, message: "請輸入問題說明", trigger: "blur" }
        ]
      },
      statusOptions: [
        { value: "new", label: "新建立", type: "info" },
        { value: "processing", label: "處理中", type: "warning" },
        { value: "resolved", label: "已解決", type: "success" },
        { value: "closed", label: "已關閉", type: "primary" },
        { value: "escalated", label: "已升級", type: "danger" }
      ],
      issueTicketStatusOptions: [
        { value: "new", label: "新建立", type: "info" },
        { value: "inProgress", label: "進行中", type: "warning" },
        { value: "resolved", label: "已解決", type: "success" },
        { value: "closed", label: "已關閉", type: "primary" }
      ],
      staffOptions: [
        { value: "staff001", label: "王小明" },
        { value: "staff002", label: "陳大華" },
        { value: "staff003", label: "林美玲" },
        { value: "staff004", label: "張雅琪" },
        { value: "staff005", label: "許志豪" }
      ]
    };
  },
  computed: {
    isEdit() {
      return !!this.form.id;
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate();
        });
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    data: {
      handler(val) {
        if (val) {
          this.initFormData();
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    initFormData() {
      if (!this.data) return;

      this.loading = true;

      // 複製數據，避免直接修改 props
      this.form = JSON.parse(JSON.stringify(this.data));

      // 確保產品數組存在
      if (!this.form.products) {
        this.form.products = [];
      }

      this.loading = false;
    },
    resetForm() {
      this.form = {
        id: "",
        relatedOrderId: "",
        customerName: "",
        contactName: "",
        contactPhone: "",
        createdDate: new Date().toISOString().split("T")[0], // 今天日期
        status: "new",
        priority: "medium",
        complaintType: "",
        assignedTo: "",
        hasIssueTicket: false,
        issueTicketId: "",
        issueTicketStatus: "",
        description: "",
        products: []
      };

      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },
    handleIssueTicketChange(val) {
      if (!val) {
        this.form.issueTicketId = "";
        this.form.issueTicketStatus = "";
      }
    },
    addProductRow() {
      const newProduct = {
        productId: "",
        productName: "",
        specification: "",
        productType: "",
        problemType: "",
        problemQuantity: 1,
        problemDescription: ""
      };

      this.form.products.push(newProduct);
    },
    removeProductRow(index) {
      this.$confirm("確定要刪除此產品記錄嗎？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.form.products.splice(index, 1);
        })
        .catch(() => {});
    },
    validateProducts() {
      // 檢查產品資訊是否完整
      if (this.form.products.length === 0) {
        this.$message.warning("請至少新增一個產品資訊");
        return false;
      }

      for (let i = 0; i < this.form.products.length; i++) {
        const product = this.form.products[i];
        if (
          !product.productId ||
          !product.productName ||
          !product.problemType
        ) {
          this.$message.warning(`第 ${i + 1} 項產品的必填資訊不完整`);
          return false;
        }
      }

      return true;
    },
    async submitForm() {
      try {
        // 先驗證表單
        await this.$refs.form.validate();

        // 再驗證產品資訊
        if (!this.validateProducts()) {
          return;
        }

        this.submitting = true;

        // 準備提交的數據
        const formData = { ...this.form };

        // 發送請求
        this.$emit("save", formData);

        // 關閉對話框
        setTimeout(() => {
          this.submitting = false;
          this.dialogVisible = false;
        }, 500);
      } catch (error) {
        console.log("表單驗證失敗", error);
        this.submitting = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.complaint-order-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px 20px 0;
  }

  .complaint-form {
    max-height: 65vh;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
    }
  }

  .form-section {
    margin-bottom: 25px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .table-toolbar {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-end;
  }

  .product-table {
    margin-bottom: 20px;

    ::v-deep .el-textarea__inner {
      min-height: 60px !important;
    }
  }

  .dialog-footer {
    padding: 20px;
    text-align: right;
  }

  // 表單元素樣式調整
  ::v-deep .el-form-item__label {
    font-weight: 500;
  }

  ::v-deep .el-input.is-disabled .el-input__inner {
    color: #606266;
    background-color: #f5f7fa;
  }

  ::v-deep .el-select .el-input {
    width: 100%;
  }

  ::v-deep .el-table {
    td,
    th {
      padding: 8px 0;
    }
  }

  ::v-deep .el-switch__label {
    color: #606266;

    &.is-active {
      color: #409eff;
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .complaint-order-dialog {
    .complaint-form {
      max-height: 70vh;
    }

    .form-section {
      padding: 15px;
    }

    ::v-deep .el-dialog {
      width: 95% !important;
      margin-top: 10vh !important;
    }
  }
}
</style>
