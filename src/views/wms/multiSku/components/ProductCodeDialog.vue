<!-- ProductCodeDialog.vue -->
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
        <!-- 類別 -->
        <el-form-item label="類別" prop="category">
          <el-select v-model="formData.category" placeholder="請選擇類別">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 品號 -->
        <LabelInput
          label="品號"
          name="productCode"
          v-model="formData.productCode"
          :rules="rules.productCode"
        />

        <!-- 品名 -->
        <LabelInput
          label="品名"
          name="productName"
          v-model="formData.productName"
          :rules="rules.productName"
        />

        <!-- 規格 -->
        <LabelInput
          label="規格"
          name="specification"
          v-model="formData.specification"
          :rules="rules.specification"
        />

        <!-- 單位 -->
        <LabelInput
          label="單位"
          name="unit"
          v-model="formData.unit"
          :rules="rules.unit"
        />

        <!-- 裝箱容量 -->
        <LabelInput
          label="裝箱容量"
          name="boxSize"
          v-model="formData.boxSize"
          :rules="rules.boxSize"
          type="number"
        />

        <!-- 狀態 -->
        <el-form-item label="狀態" prop="status">
          <el-select v-model="formData.status" placeholder="請選擇狀態">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 備註 -->
        <el-form-item label="備註" prop="remark">
          <el-input
            type="textarea"
            v-model="formData.remark"
            :rows="3"
            placeholder="請輸入備註(非必要)"
          />
        </el-form-item>
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

export default {
  name: "ProductCodeDialog",

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
        category: "",
        productCode: "",
        productName: "",
        specification: "",
        unit: "",
        boxSize: "",
        status: "",
        remark: ""
      },
      categoryOptions: [
        { value: "smartphone", label: "智能手機" },
        { value: "tablet", label: "平板電腦" },
        { value: "laptop", label: "筆記型電腦" },
        { value: "wearable", label: "智能穿戴" }
      ],
      statusOptions: [
        { value: true, label: "啟用" },
        { value: false, label: "停用" }
      ],
      rules: {
        category: [
          { required: true, message: "請選擇類別", trigger: "change" }
        ],
        productCode: [
          { required: true, message: "請輸入品號", trigger: "blur" }
        ],
        productName: [
          { required: true, message: "請輸入品名", trigger: "blur" }
        ],
        specification: [
          { required: true, message: "請輸入規格", trigger: "blur" }
        ],
        unit: [{ required: true, message: "請輸入單位", trigger: "blur" }],
        boxSize: [
          { required: true, message: "請輸入裝箱容量", trigger: "blur" },
          { type: "number", message: "裝箱容量必須為數字", trigger: "blur" }
        ],
        status: [{ required: true, message: "請選擇狀態", trigger: "change" }]
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
      return "品號資訊";
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
      // 確保狀態值為布林值
      const formattedData = {
        ...this.data,
        status: Boolean(this.data.status),
        boxSize: Number(this.data.boxSize) || ""
      };

      this.formData = {
        ...this.formData,
        ...formattedData
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
          // 確保數字型別
          const submitData = {
            ...this.formData,
            boxSize: Number(this.formData.boxSize)
          };

          await this.$emit("save", submitData);
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
    background: linear-gradient(135deg, #8db128, #beff6e);
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

::v-deep .el-select {
  width: 100%;
}
</style>
