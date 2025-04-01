<!-- LabelInput.vue -->
<template>
  <div class="label-input-component">
    <el-form :model="formData" :rules="computedRules" ref="form">
      <el-form-item
        :label="label"
        :prop="name"
        :label-width="labelWidth"
        :required="required"
        :error="errorMessage"
      >
        <el-input
          v-model="innerValue"
          :placeholder="placeholder"
          :type="type"
          :disabled="disabled"
          :clearable="clearable"
          @input="handleInput"
          @change="handleChange"
          @blur="handleBlur"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "LabelInput",

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
    // 輸入框類型
    type: {
      type: String,
      default: "text"
    },
    // 預設提示文字
    placeholder: {
      type: String,
      default: "請輸入"
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
    // 值
    value: {
      type: [String, Number],
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
      errorMessage: "" // 錯誤提示文字
    };
  },

  computed: {
    // 合併必填和自定義驗證規則
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
      // 值改變時重新驗證
      this.$nextTick(() => {
        this.validateField();
      });
    }
  },

  methods: {
    // 輸入時觸發
    handleInput(value) {
      this.$emit("input", value);
      this.clearError();
    },

    // 值改變時觸發
    handleChange(value) {
      this.$emit("change", value);
      this.validateField();
    },

    // 失去焦點時觸發
    handleBlur() {
      this.validateField();
    },

    // 驗證單個欄位
    validateField() {
      this.$refs.form.validateField(this.name, errorMessage => {
        this.errorMessage = errorMessage || "";
      });
    },

    // 清除錯誤提示
    clearError() {
      this.errorMessage = "";
    },

    // 驗證表單
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

    // 重置表單
    reset() {
      this.$refs.form.resetFields();
      this.clearError();
    }
  }
};
</script>

<style scoped>
.label-input-component {
  width: 100%;
}

/* 可選：自定義必填標記的樣式 */
.label-input-component
  :deep(.el-form-item.is-required:not(.is-no-asterisk))
  .el-form-item__label:before {
  content: "* ";
  color: #f56c6c;
  margin-right: 4px;
}
</style>
