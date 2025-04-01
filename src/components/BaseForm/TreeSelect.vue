<!-- TreeSelect.vue -->
<template>
  <el-form-item :label="label" :prop="name">
    <el-cascader
      v-model="selectedValue"
      :options="options"
      :props="cascaderProps"
      :placeholder="placeholder"
      filterable
      clearable
      @change="handleChange"
    >
      <template slot-scope="{ data }">
        <span>{{ data.label }}</span>
        <span v-if="data.children && data.children.length === 0">
          ({{ data.count }})
        </span>
      </template>
    </el-cascader>
  </el-form-item>
</template>

<script>
export default {
  name: "TreeSelect",
  props: {
    value: {
      type: [String, Array],
      default: ""
    },
    label: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: "請選擇"
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      cascaderProps: {
        checkStrictly: true,
        multiple: false,
        emitPath: false,
        expandTrigger: "hover"
      }
    };
  },
  computed: {
    selectedValue: {
      get() {
        // 如果值存在於選項中，直接返回
        if (this.value && this.findValueInOptions(this.options, this.value)) {
          return this.value;
        }
        // 嘗試根據標籤文字找到對應的值
        const valueByLabel = this.findValueByLabel(this.options, this.value);
        if (valueByLabel) {
          return valueByLabel;
        }
        // 如果都找不到，返回原始值
        return this.value || "";
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    handleChange(value) {
      this.$emit("change", value);
    },

    // 根據值在選項中查找
    findValueInOptions(options, value) {
      for (const option of options) {
        if (option.value === value) return true;
        if (option.children) {
          if (this.findValueInOptions(option.children, value)) return true;
        }
      }
      return false;
    },

    // 根據標籤文字查找對應的值
    findValueByLabel(options, label) {
      for (const option of options) {
        if (option.label === label) return option.value;
        if (option.children) {
          const foundInChildren = this.findValueByLabel(option.children, label);
          if (foundInChildren) return foundInChildren;
        }
      }
      return null;
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .el-cascader {
  width: 100%;
}
::v-deep .el-cascader-panel {
  .el-cascader-node__postfix {
    position: absolute;
    right: 10px;
  }
}
</style>
