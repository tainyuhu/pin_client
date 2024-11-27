<template>
  <el-dialog
    title="編輯群組"
    :visible="visible"
    width="500px"
    :close-on-click-modal="false"
    @update:visible="val => $emit('update:visible', val)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      size="small"
    >
      <el-form-item label="群組名稱" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入群組名稱"
          clearable
        />
      </el-form-item>

      <el-form-item label="上層群組" prop="parent">
        <treeselect
          v-model="formData.parent"
          :options="treeOptions"
          :normalizer="normalizer"
          :default-expand-level="1"
          placeholder="請選擇上層群組"
          :clearable="false"
          class="org-select"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">確 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "EditOrg",

  components: {
    Treeselect
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    org: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      formData: {
        id: null,
        name: "",
        parent: null
      },
      formRules: {
        name: [
          { required: true, message: "請輸入群組名稱", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "長度必須在2到20個字元之間",
            trigger: "blur"
          }
        ],
        parent: [
          { required: true, message: "請選擇上層群組", trigger: "change" }
        ]
      }
    };
  },

  computed: {
    treeOptions() {
      // 移除當前編輯的組織及其子組織，避免自己選擇自己作為父組織
      return this.filterTreeOptions(this.options, this.formData.id);
    }
  },

  watch: {
    org: {
      handler(newVal) {
        if (newVal) {
          this.formData = { ...newVal };
        }
      },
      immediate: true
    }
  },

  methods: {
    // 過濾樹形選項
    filterTreeOptions(options, currentId) {
      return options
        .filter(item => item.id !== currentId)
        .map(item => ({
          ...item,
          label: item.name,
          children: item.children
            ? this.filterTreeOptions(item.children, currentId)
            : []
        }));
    },

    // 樹形選擇器數據轉換
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },

    // 重置表單
    resetForm() {
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },

    // 取消操作
    handleCancel() {
      this.$emit("update:visible", false);
      this.resetForm();
    },

    // 關閉對話框
    handleClose() {
      this.resetForm();
      this.$emit("close");
    },

    // 提交表單
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.$emit("submit", { ...this.formData });
          this.handleCancel();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

.org-select {
  width: 100%;
}

:deep(.vue-treeselect__control) {
  line-height: 32px;
  height: 32px;
}

:deep(.vue-treeselect__placeholder) {
  line-height: 32px;
}

:deep(.vue-treeselect__single-value) {
  line-height: 32px;
}
</style>
