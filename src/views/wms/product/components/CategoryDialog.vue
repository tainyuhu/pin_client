<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <!-- 父類別顯示 (僅在編輯子類別時顯示) -->
      <el-form-item v-if="parentCategory" label="父類別">
        <el-input v-model="parentCategory.name" disabled />
      </el-form-item>

      <!-- 類別名稱 -->
      <el-form-item label="類別名稱" prop="name">
        <el-input v-model="form.name" placeholder="請輸入類別名稱" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">確定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "CategoryDialog",

  props: {
    // 對話框可見性
    visible: {
      type: Boolean,
      required: true
    },
    // 對話框類型: 'add' 或 'edit'
    type: {
      type: String,
      required: true,
      validator: value => ["add", "edit"].includes(value)
    },
    // 父類別 (當新增/編輯子類別時)
    parentCategory: {
      type: Object,
      default: null
    },
    // 當前編輯的類別 (編輯模式時)
    category: {
      type: Object,
      default: () => ({ id: null, name: "" })
    }
  },

  data() {
    return {
      form: {
        id: null,
        name: ""
      },
      rules: {
        name: [
          { required: true, message: "請輸入類別名稱", trigger: "blur" },
          { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" }
        ]
      }
    };
  },

  computed: {
    // 動態計算對話框標題
    title() {
      const actionType = this.type === "add" ? "新增" : "編輯";
      const categoryType = this.parentCategory ? "子類別" : "根類別";
      return `${actionType}${categoryType}`;
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.initForm();
      }
    }
  },

  methods: {
    // 初始化表單
    initForm() {
      if (this.type === "edit" && this.category) {
        this.form = { ...this.category };
      } else {
        this.form = { id: null, name: "" };
      }
    },

    // 表單驗證
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (valid) {
            resolve(true);
          } else {
            reject(new Error("表單驗證失敗"));
          }
        });
      });
    },

    // 保存
    async handleSave() {
      try {
        await this.validate();

        const result = {
          ...this.form,
          parentId: this.parentCategory ? this.parentCategory.id : null
        };

        this.$emit("save", result);
      } catch (error) {
        console.error("表單驗證失敗", error);
      }
    },

    // 取消
    handleCancel() {
      this.$emit("cancel");
    },

    // 關閉對話框
    handleClose() {
      this.$refs.form.resetFields();
      this.$emit("close");
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
</style>
