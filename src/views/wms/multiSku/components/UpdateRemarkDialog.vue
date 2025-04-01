<template>
  <el-dialog
    title="填寫更新備註"
    :visible.sync="dialogVisible"
    width="500px"
    @closed="handleClosed"
  >
    <div class="remark-dialog-content">
      <div class="product-info">
        <div class="info-item">
          <span class="label">品號:</span>
          <span class="value">{{ item ? item.productCode : "" }}</span>
        </div>
        <div class="info-item">
          <span class="label">品名:</span>
          <span class="value">{{ item ? item.productName : "" }}</span>
        </div>
      </div>

      <div class="changes-list">
        <h4>變更內容:</h4>
        <div v-if="item && item.changes">
          <div
            v-for="(change, index) in item.changes"
            :key="index"
            class="change-item"
          >
            <span class="change-label">{{ change.label }}:</span>
            <span class="change-value">
              <span class="old-value">{{ change.oldValue }}</span>
              <i class="el-icon-arrow-right" />
              <span class="new-value">{{ change.newValue }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="remark-input">
        <el-form ref="remarkForm" :model="form" :rules="rules">
          <el-form-item label="更新備註" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="4"
              placeholder="請填寫更新備註，說明變更原因"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">確認</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "UpdateRemarkDialog",

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      dialogVisible: false,
      form: {
        remark: ""
      },
      rules: {
        remark: [
          { required: true, message: "請填寫更新備註", trigger: "blur" },
          {
            min: 2,
            max: 200,
            message: "長度應為 2 到 200 個字元",
            trigger: "blur"
          }
        ]
      }
    };
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val && this.item) {
        this.form.remark = this.item.remark || "";
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    }
  },

  methods: {
    handleSave() {
      this.$refs.remarkForm.validate(valid => {
        if (valid) {
          this.$emit("save", this.item, this.form.remark);
          this.dialogVisible = false;
        }
      });
    },

    handleClosed() {
      this.$refs.remarkForm.resetFields();
      this.form.remark = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.remark-dialog-content {
  .product-info {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .info-item {
      display: flex;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 60px;
        color: #606266;
        font-weight: bold;
      }

      .value {
        flex: 1;
        color: #303133;
      }
    }
  }

  .changes-list {
    margin-bottom: 20px;

    h4 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 14px;
      color: #606266;
    }

    .change-item {
      margin-bottom: 8px;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      .change-label {
        display: inline-block;
        width: 60px;
        color: #606266;
      }

      .change-value {
        display: inline-flex;
        align-items: center;
        gap: 5px;

        .old-value {
          color: #f56c6c;
          text-decoration: line-through;
        }

        .new-value {
          color: #67c23a;
        }

        .el-icon-arrow-right {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
