<template>
  <div class="label-date-picker-component">
    <el-form :model="formData" :rules="computedRules" ref="form">
      <el-form-item
        :label="label"
        :prop="name"
        :label-width="labelWidth"
        :required="required"
        :error="errorMessage"
      >
        <el-date-picker
          v-model="innerValue"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :clearable="clearable"
          :format="format"
          :value-format="valueFormat"
          @input="handleInput"
          @change="handleChange"
          class="date-picker-input"
        ></el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "LabelDatePicker",
  props: {
    // 標籤文字
    label: {
      type: String,
      required: true
    },
    // 表單欄位名稱
    name: {
      type: String,
      required: true
    },
    // 標籤寬度
    labelWidth: {
      type: String,
      default: "100px"
    },
    // 日期選擇器類型
    type: {
      type: String,
      default: "date"
    },
    // 預設提示文字
    placeholder: {
      type: String,
      default: "請選擇日期"
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可清除
    clearable: {
      type: Boolean,
      default: true
    },
    // 顯示格式
    format: {
      type: String,
      default: "yyyy-MM-dd"
    },
    // 值格式
    valueFormat: {
      type: String,
      default: "yyyy-MM-dd"
    },
    // 值
    value: {
      type: [String, Number, Date],
      default: ""
    },
    // 驗證規則
    rules: {
      type: Array,
      default: () => []
    },
    // 是否必填
    required: {
      type: Boolean,
      default: false
    },
    // 必填錯誤提示文字
    requiredMessage: {
      type: String,
      default: "此欄位為必填"
    }
  },

  data() {
    return {
      innerValue: this.value,
      formData: {
        [this.name]: this.value
      },
      errorMessage: ""
    };
  },

  computed: {
    computedRules() {
      const rules = [...this.rules];
      if (this.required) {
        rules.unshift({
          required: true,
          message: this.requiredMessage,
          trigger: ["blur", "change"]
        });
      }
      return {
        [this.name]: rules
      };
    }
  },

  watch: {
    value(newVal) {
      this.innerValue = newVal;
      this.formData[this.name] = newVal;
      this.$nextTick(() => {
        this.validateField();
      });
    }
  },

  methods: {
    handleInput(value) {
      this.$emit("input", value);
      this.clearError();
    },

    handleChange(value) {
      this.$emit("change", value);
      this.validateField();
    },

    validateField() {
      this.$refs.form.validateField(this.name, errorMessage => {
        this.errorMessage = errorMessage || "";
      });
    },

    clearError() {
      this.errorMessage = "";
    },

    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (valid) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    },

    reset() {
      this.$refs.form.resetFields();
      this.clearError();
    }
  }
};
</script>

<style lang="scss" scoped>
.label-date-picker-component {
  width: 100%;
}

.date-picker-input {
  width: 100%;
}

/* 自定義必填標記的樣式 */
.label-date-picker-component
  :deep(.el-form-item.is-required:not(.is-no-asterisk))
  .el-form-item__label:before {
  content: "* ";
  color: #f56c6c;
  margin-right: 4px;
}
</style>
