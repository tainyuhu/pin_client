<template>
  <div class="page-header">
    <el-row justify="end" class="button-group">
      <el-button
        plain
        class="btn-preview"
        @click="$emit('preview')"
        :disabled="saving || submitting"
        icon="el-icon-view"
      >
        預覽
      </el-button>
      <el-button
        plain
        class="btn-cancel"
        @click="$router.back()"
        :disabled="saving || submitting"
        icon="el-icon-back"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        plain
        class="btn-draft"
        @click="$emit('save-draft')"
        :loading="saving"
        :disabled="submitting"
        icon="el-icon-document-checked"
      >
        存成草稿
      </el-button>
      <el-button
        type="primary"
        class="btn-submit"
        @click="$emit('submit')"
        :loading="submitting"
        :disabled="saving"
        icon="el-icon-check"
      >
        確認送出
      </el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "PageHeader",
  props: {
    status: {
      type: String,
      required: true
    },
    saving: {
      type: Boolean,
      default: false
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  emits: ["save-draft", "submit", "preview"] // 加入 preview 事件
};
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .button-group {
    gap: 12px;
  }

  .el-button {
    min-width: 100px;
    padding: 12px 20px;
    transition: all 0.3s ease;

    [class^="el-icon-"] {
      margin-right: 6px;
      font-size: 16px;
    }

    &.btn-preview {
      &:hover:not(:disabled) {
        background-color: #f4f4f5;
        border-color: #909399;
        color: #606266;
      }
    }

    &.btn-cancel {
      &:hover:not(:disabled) {
        background-color: #f4f4f5;
        border-color: #909399;
        color: #606266;
      }
    }

    &.btn-draft {
      &:hover:not(:disabled) {
        background-color: #ecf5ff;
        border-color: #409eff;
      }
    }

    &.btn-submit {
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

@media screen and (max-width: 768px) {
  .page-header {
    padding: 12px;

    .button-group {
      display: flex;

      .el-button {
        flex: 1;
        min-width: auto;
        padding: 10px;
      }
    }
  }
}
</style>
