<!-- ProductPriceDialog.vue -->
<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
    :close-on-click-modal="false"
    custom-class="stock-list-dialog"
  >
    <div class="dialog-content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
        <!-- 價格 -->
        <LabelInput
          label="價格"
          name="price"
          v-model="formData.price"
          :rules="rules.price"
          type="number"
        />

        <!-- 類別 -->
        <TreeSelect
          label="類別"
          name="category"
          v-model="formData.category"
          :options="categoryOptions"
          :rules="rules.category"
          placeholder="請選擇商品類別"
          @change="handleCategoryChange"
        />
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="success" @click="handleSubmit" :loading="loading">
        確定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import LabelInput from "@/components/BaseForm/LabelInput.vue";
import TreeSelect from "@/components/BaseForm/TreeSelect.vue";

export default {
  name: "ProductPriceDialog",

  components: {
    LabelInput,
    TreeSelect
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      loading: false,
      formData: {
        price: "",
        category: ""
      },
      categoryOptions: [
        {
          value: "electronics",
          label: "電子產品",
          children: [
            {
              value: "phones",
              label: "手機",
              children: [
                {
                  value: "smartphone",
                  label: "智能手機"
                },
                {
                  value: "feature-phone",
                  label: "功能型手機"
                }
              ]
            },
            {
              value: "computers",
              label: "電腦",
              children: [
                {
                  value: "laptop",
                  label: "筆記型電腦"
                },
                {
                  value: "desktop",
                  label: "桌上型電腦"
                }
              ]
            }
          ]
        },
        {
          value: "clothing",
          label: "服飾",
          children: [
            {
              value: "mens",
              label: "男裝",
              children: [
                {
                  value: "shirts",
                  label: "襯衫"
                },
                {
                  value: "pants",
                  label: "褲子"
                }
              ]
            },
            {
              value: "womens",
              label: "女裝",
              children: [
                {
                  value: "dresses",
                  label: "洋裝"
                },
                {
                  value: "skirts",
                  label: "裙子"
                }
              ]
            }
          ]
        }
      ],
      rules: {
        price: [
          { required: true, message: "請輸入價格", trigger: "blur" },
          { type: "number", message: "價格必須為數字", trigger: "blur" }
        ],
        category: [{ required: true, message: "請選擇類別", trigger: "change" }]
      }
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
    title() {
      return "編輯價格資訊";
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initFormData();
      }
    }
  },

  methods: {
    initFormData() {
      this.formData = {
        ...this.formData,
        ...this.data
      };
    },

    handleCategoryChange(value) {
      console.log("選擇的類別:", value);
    },

    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
      this.dialogVisible = false;
    },

    async handleSubmit() {
      if (!this.$refs.form) return;

      try {
        this.loading = true;
        const valid = await this.$refs.form.validate();

        if (valid) {
          await this.$emit("save", { ...this.formData });
          this.$message.success("保存成功");
          this.handleClose();
        } else {
          this.$message.warning("請檢查並填寫完整資訊");
        }
      } catch (error) {
        console.error("提交失敗:", error);
        this.$message.error("提交失敗，請稍後重試");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .stock-list-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #a1d415, #b1db4f);
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
  }

  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    min-height: 300px;
    overflow: hidden;
  }
}

.dialog-content {
  max-height: calc(70vh - 140px);
  min-height: 260px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 18px;

  &__error {
    padding-top: 4px;
  }
}
</style>
