<!-- AddCategoryDialog.vue -->
<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="500px"
    @close="handleClose"
    :close-on-click-modal="false"
    custom-class="category-dialog"
  >
    <div class="dialog-content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
        <!-- 類別名稱 -->
        <LabelInput
          label="類別名稱"
          name="categoryName"
          v-model="formData.categoryName"
          :rules="rules.categoryName"
          placeholder="請輸入類別名稱"
        />
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="warning" @click="handleSubmit" :loading="loading">
        確定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import LabelInput from "@/components/BaseForm/LabelInput.vue";

export default {
  name: "AddCategoryDialog",

  components: {
    LabelInput
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
        categoryName: ""
      },
      rules: {
        categoryName: [
          { required: true, message: "請輸入類別名稱", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "長度需在 2 到 20 個字之間",
            trigger: "blur"
          }
        ]
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
      return "新增品號類別";
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
        categoryName: this.data.categoryName || ""
      };
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
          this.$message.success("類別新增成功");
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
::v-deep .category-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #ff7e00, #ffae42);
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
  }
}

.dialog-content {
  padding-right: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 0;

  &__error {
    padding-top: 4px;
  }
}

// 橘色主題元素
::v-deep {
  .el-button--warning {
    background-color: #ff7e00;
    border-color: #ff7e00;
    &:hover,
    &:focus {
      background-color: #ff9933;
      border-color: #ff9933;
    }
  }

  .el-input__inner:focus {
    border-color: #ff7e00;
  }
}
</style>
