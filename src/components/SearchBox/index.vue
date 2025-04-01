<!-- SearchBox.vue -->
<template>
  <div class="search-section">
    <el-input
      ref="searchInput"
      v-model="innerValue"
      v-bind="$attrs"
      :placeholder="fieldPlaceholder"
      clearable
      @input="handleInput"
      @clear="handleClear"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.native.enter="handleEnterKey"
    >
      <template #prefix>
        <i class="el-icon-search search-icon" />
      </template>
      <template v-if="showFields" #append>
        <el-select
          v-model="selectedField"
          :placeholder="fieldSelectPlaceholder"
          :size="size"
        >
          <el-option :label="allFieldsLabel" :value="allFieldsValue" />
          <el-option
            v-for="field in fieldOptions"
            :key="field.value"
            :label="field.label"
            :value="field.value"
          />
        </el-select>
      </template>
    </el-input>
  </div>
</template>

<script>
import { debounce } from "lodash";

export default {
  name: "SearchBox",

  inheritAttrs: false,

  props: {
    value: {
      type: String,
      default: ""
    },
    fields: {
      type: Array,
      default: () => []
    },
    showFields: {
      type: Boolean,
      default: false
    },
    allFieldsLabel: {
      type: String,
      default: "全部欄位"
    },
    allFieldsValue: {
      type: String,
      default: ""
    },
    fieldSelectPlaceholder: {
      type: String,
      default: "選擇欄位"
    },
    debounce: {
      type: Number,
      default: 300
    },
    size: {
      type: String,
      default: "small"
    }
  },

  data() {
    return {
      innerValue: this.value,
      selectedField: this.allFieldsValue,
      isFocused: false
    };
  },

  computed: {
    fieldPlaceholder() {
      if (!this.showFields) return this.$attrs.placeholder || "搜尋...";
      const field = this.fieldOptions.find(f => f.value === this.selectedField);
      return field ? `搜尋 ${field.label}...` : "搜尋...";
    },

    fieldOptions() {
      return this.fields.map(field => ({
        label: field.label,
        value: field.prop
      }));
    }
  },

  watch: {
    value(val) {
      this.innerValue = val;
    },

    selectedField() {
      this.$emit("field-change", this.selectedField);
    }
  },

  created() {
    this.debouncedEmit = debounce(this.emitInput, this.debounce);
  },

  methods: {
    focus() {
      this.$refs.searchInput.focus();
    },

    clear() {
      this.innerValue = "";
      this.handleClear();
    },

    handleInput(value) {
      this.debouncedEmit(value);
    },

    handleClear() {
      this.$emit("input", "");
      this.$emit("clear");
    },

    handleFocus() {
      this.isFocused = true;
      this.$emit("focus");
    },

    handleBlur() {
      this.isFocused = false;
      this.$emit("blur");
    },

    emitInput(value) {
      this.$emit("input", value);
    },

    // 新增方法：處理 Enter 鍵
    handleEnterKey() {w
      this.$emit("enter-press", this.innerValue);
    }
  }
};
</script>

<style lang="scss" scoped>
.search-section {
  position: relative;

  .el-input {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }

    :deep(.el-input__inner) {
      border-radius: 8px;
      border: 2px solid transparent;
      background: #f8fafc;
      transition: all 0.3s ease;
      padding-left: 40px;
      font-size: 1rem;

      &:focus {
        background: #fff;
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
      }

      &::placeholder {
        color: #94a3b8;
        transition: color 0.3s ease;
      }

      &:focus::placeholder {
        color: #cbd5e0;
      }
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 2;
    }

    &:focus-within .search-icon {
      color: #409eff;
      transform: translateY(-50%) scale(1.1);
    }
  }
}

/* Size variants */
.el-input--small {
  :deep(.el-input__inner) {
    height: 32px;
    line-height: 32px;
  }
}

.el-input--mini {
  :deep(.el-input__inner) {
    height: 28px;
    line-height: 28px;
  }
}
</style>
