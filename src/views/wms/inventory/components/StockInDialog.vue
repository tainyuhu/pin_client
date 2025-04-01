<template>
  <el-dialog
    title="新增入庫單"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    :fullscreen="isMobile"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-in-dialog"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      :label-width="isMobile ? '90px' : '120px'"
      size="small"
    >
      <!-- 基本信息 -->
      <el-card class="mb-4">
        <div slot="header" class="card-header">
          <div class="header-content">
            <i class="el-icon-info"></i>
            <span class="font-bold">基本信息</span>
          </div>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <LabelInput
              label="異動單號"
              name="number"
              v-model="formData.number"
              :disabled="true"
              placeholder="系統自動生成"
              :label-width="isMobile ? '90px' : '120px'"
            />
          </el-col>
          <el-col :xs="24" :sm="12">
            <LabelDatePicker
              label="異動日期"
              name="date"
              v-model="formData.date"
              type="datetime"
              :disabled="true"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :label-width="isMobile ? '90px' : '120px'"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- 商品列表 -->
      <el-card class="mb-4">
        <div slot="header" class="card-header">
          <div class="header-content product">
            <i class="el-icon-goods"></i>
            <span class="font-bold">商品列表</span>
          </div>
        </div>
        <stock-in-product-item
          v-for="(product, index) in formData.products"
          :key="product.id"
          :product-data="product"
          :product-options="productData"
          :product-index="index"
          :show-remove="formData.products.length > 1"
          @remove="removeProduct(index)"
        />
      </el-card>

      <!-- 備註 -->
      <el-card>
        <div slot="header" class="card-header">
          <div class="header-content note">
            <i class="el-icon-document"></i>
            <span class="font-bold">其他信息</span>
          </div>
        </div>
        <LabelInput
          label="備註"
          name="remark"
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="請輸入備註"
          :label-width="isMobile ? '90px' : '120px'"
        />
      </el-card>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        確認
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import StockInProductItem from "./StockInProductItem.vue";
import LabelInput from "@/components/BaseForm/LabelInput.vue";
import LabelDatePicker from "@/components/BaseForm/LabelDatePicker.vue";

export default {
  name: "StockInDialog",

  components: {
    StockInProductItem,
    LabelInput,
    LabelDatePicker
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    productData: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      loading: false,
      formData: {
        number: "",
        date: "",
        products: [],
        remark: ""
      },
      rules: {
        number: [
          { required: true, message: "請輸入異動單號", trigger: "blur" }
        ],
        date: [
          { required: true, message: "請選擇異動日期", trigger: "change" }
        ],
        remark: [{ max: 500, message: "備註最多500字", trigger: "blur" }]
      },
      windowWidth: window.innerWidth
    };
  },

  computed: {
    dialogVisible: {
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
    dialogWidth() {
      return this.isMobile ? "100%" : "900px";
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
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

    initForm() {
      this.formData = {
        number: this.generateNumber(),
        date: this.getCurrentDateTime(),
        products: [this.createEmptyProduct()],
        remark: ""
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },

    createEmptyProduct() {
      return {
        id: Date.now(), // 添加唯一ID
        productCode: "",
        productName: "",
        boxSize: null,
        batches: [
          {
            id: Date.now(),
            batchNumber: "",
            boxCount: 0,
            quantity: 0,
            expiryDate: ""
          }
        ]
      };
    },

    generateNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const sequence = "00001"; // 實際應該從後端獲取序號
      return `IN${year}${month}${day}${sequence}`;
    },

    getCurrentDateTime() {
      const date = new Date();
      return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    },

    removeProduct(index) {
      this.formData.products.splice(index, 1);
    },

    handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.loading = true;
            const submitData = {
              ...this.formData,
              type: "in",
              operator: "admin" // 實際應從登入用戶獲取
            };

            await this.$emit("submit", submitData);
            this.handleClose(true);
          } catch (error) {
            console.error("提交失敗:", error);
            this.$message.error("提交失敗");
          } finally {
            this.loading = false;
          }
        }
      });
    },

    handleCancel() {
      this.handleClose();
    },

    handleClose(submitted = false) {
      if (submitted) {
        this.dialogVisible = false;
        return;
      }

      const hasData =
        this.formData.products.some(
          product =>
            product.productCode ||
            product.batches.some(
              batch =>
                batch.batchNumber ||
                batch.boxCount > 0 ||
                batch.quantity > 0 ||
                batch.expiryDate
            )
        ) || this.formData.remark;

      if (hasData) {
        this.$confirm("確認關閉？未保存的數據將丟失", "提示", {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-in-dialog {
  :deep(.el-dialog__body) {
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    padding: 20px;
  }

  .card-header {
    padding: 0;

    .header-content {
      display: flex;
      align-items: center;
      color: #409eff;

      &.product {
        color: #409eff;
      }

      &.note {
        color: #409eff;
      }

      i {
        font-size: 16px;
        margin-right: 8px;
      }

      .font-bold {
        font-weight: 500;
        font-size: 15px;
      }
    }
  }
}

.mb-4 {
  margin-bottom: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 10px 20px;
}

@media (max-width: 768px) {
  .stock-in-dialog {
    :deep(.el-dialog__body) {
      max-height: calc(100vh - 120px);
      padding: 15px;
    }
  }

  .dialog-footer {
    padding: 10px 15px;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.el-card__body) {
    padding: 15px;
  }
}
</style>
