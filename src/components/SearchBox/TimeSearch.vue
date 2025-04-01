<!-- TimeSearch.vue -->
<template>
  <div class="time-search-section">
    <el-date-picker
      ref="timePicker"
      v-model="dateRange"
      type="daterange"
      :size="size"
      range-separator="至"
      start-placeholder="開始日期"
      end-placeholder="結束日期"
      :clearable="clearable"
      :disabled="disabled"
      :picker-options="pickerOptions"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script>
export default {
  name: "TimeSearch",

  props: {
    value: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: "small"
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    shortcuts: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      dateRange: this.value,
      isFocused: false,
      pickerOptions: {
        shortcuts: this.getShortcuts()
      }
    };
  },

  watch: {
    value(val) {
      this.dateRange = val;
    }
  },

  methods: {
    getShortcuts() {
      if (!this.shortcuts) return [];

      return [
        {
          text: "今天",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "昨天",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24);
            end.setTime(end.getTime() - 3600 * 1000 * 24);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本週",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(
              start.getTime() - 3600 * 1000 * 24 * (start.getDay() || 7)
            );
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "上週",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            end.setTime(end.getTime() - 3600 * 1000 * 24);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本月",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setDate(1);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "上個月",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0);
            picker.$emit("pick", [start, end]);
          }
        }
      ];
    },

    focus() {
      this.$refs.timePicker.focus();
    },

    clear() {
      this.dateRange = null;
      this.$emit("input", null);
      this.$emit("clear");
    },

    handleChange(value) {
      this.$emit("input", value);
      this.$emit("change", value);
    },

    handleFocus() {
      this.isFocused = true;
      this.$emit("focus");
    },

    handleBlur() {
      this.isFocused = false;
      this.$emit("blur");
    }
  }
};
</script>

<style lang="scss" scoped>
.time-search-section {
  position: relative;

  .el-date-editor {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }

    :deep(.el-range-input) {
      background: #f8fafc;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    &:focus-within {
      :deep(.el-range-input) {
        background: #fff;
      }
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
    }
  }
}
</style>
