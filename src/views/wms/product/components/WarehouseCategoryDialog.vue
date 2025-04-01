<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="類別名稱" prop="name">
        <el-input
          v-model="form.name"
          placeholder="請輸入類別名稱"
          maxlength="50"
          show-word-limit
        ></el-input>
      </el-form-item>

      <el-form-item label="類別描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="請輸入類別描述"
          maxlength="200"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "WarehouseCategoryDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: "add" // 'add' 或 'edit'
    },
    category: {
      type: Object,
      default: () => ({
        id: null,
        name: "",
        description: ""
      })
    }
  },

  data() {
    return {
      form: {
        id: null,
        name: "",
        description: ""
      },
      rules: {
        name: [
          { required: true, message: "請輸入類別名稱", trigger: "blur" },
          { min: 1, max: 50, message: "長度在 1 到 50 個字符", trigger: "blur" }
        ],
        description: [
          { max: 200, message: "長度不能超過 200 個字符", trigger: "blur" }
        ]
      },
      saving: false
    };
  },

  computed: {
    dialogTitle() {
      return this.type === "add" ? "新增類別" : "編輯類別";
    },

    isEdit() {
      return this.type === "edit";
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
    },
    category: {
      handler(val) {
        if (this.visible && val) {
          this.initForm();
        }
      },
      deep: true
    }
  },

  methods: {
    // 初始化表單
    initForm() {
      if (this.category) {
        this.form = { ...this.category };
      } else {
        this.resetForm();
      }
    },

    // 重置表單
    resetForm() {
      this.form = {
        id: null,
        name: "",
        description: ""
      };

      // 重置表單驗證
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    // 取消
    handleCancel() {
      this.$emit("cancel");
      this.resetForm();
    },

    // 關閉
    handleClose() {
      this.$emit("close");
      this.resetForm();
    },

    // 保存
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return;

        this.saving = true;

        // 構建保存數據
        const formData = { ...this.form };

        if (this.isEdit) {
          formData.id = this.category.id;
        }

        // 觸發保存事件
        this.$emit("save", formData);

        // 模擬網絡延遲
        setTimeout(() => {
          this.saving = false;
        }, 300);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
