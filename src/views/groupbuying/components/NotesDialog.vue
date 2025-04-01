<!-- components/NotesDialog.vue -->
<template>
  <el-dialog
    title="訂單備註"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="notes-dialog"
  >
    <!-- 備註輸入區 -->
    <el-form ref="form" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="請輸入備註內容"
        />
      </el-form-item>
    </el-form>

    <!-- 備註歷史記錄 -->
    <div class="notes-history">
      <div class="history-header">
        <span class="title">備註記錄</span>
        <el-tag size="small" type="info"
          >{{ notesHistory.length }} 筆記錄</el-tag
        >
      </div>

      <el-timeline v-if="notesHistory.length">
        <el-timeline-item
          v-for="(note, index) in notesHistory"
          :key="index"
          :timestamp="note.createTime"
          :type="getTimelineItemType(note.type)"
        >
          <div class="note-item">
            <div class="note-content">{{ note.content }}</div>
            <div class="note-info">
              <span class="author">{{ note.creator }}</span>
              <el-tag size="mini" :type="getNoteTypeTag(note.type)">
                {{ getNoteTypeLabel(note.type) }}
              </el-tag>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>

      <div v-else class="empty-history">
        <i class="el-icon-document" />
        <span>暫無備註記錄</span>
      </div>
    </div>

    <!-- 備註類型選擇 -->
    <div class="note-type-select">
      <el-radio-group v-model="formData.type">
        <el-radio label="general">一般備註</el-radio>
        <el-radio label="important">重要備註</el-radio>
        <el-radio label="warning">警告備註</el-radio>
      </el-radio-group>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          新增備註
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "NotesDialog",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      submitting: false,
      formData: {
        content: "",
        type: "general"
      },
      rules: {
        content: [
          { required: true, message: "請輸入備註內容", trigger: "blur" },
          { min: 2, message: "備註內容至少 2 個字", trigger: "blur" }
        ]
      },
      // 模擬備註歷史數據
      notesHistory: [
        {
          content: "客戶要求週五下午送達",
          type: "general",
          creator: "王小明",
          createTime: "2024-01-20 14:30:00"
        },
        {
          content: "需要特別確認付款金額",
          type: "important",
          creator: "李主管",
          createTime: "2024-01-19 16:45:00"
        },
        {
          content: "客戶多次更改取貨時間",
          type: "warning",
          creator: "張小華",
          createTime: "2024-01-18 09:15:00"
        }
      ]
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },

  methods: {
    getNoteTypeLabel(type) {
      const types = {
        general: "一般",
        important: "重要",
        warning: "警告"
      };
      return types[type] || type;
    },

    getNoteTypeTag(type) {
      const types = {
        general: "info",
        important: "success",
        warning: "warning"
      };
      return types[type] || "info";
    },

    getTimelineItemType(type) {
      const types = {
        general: "info",
        important: "success",
        warning: "warning"
      };
      return types[type] || "info";
    },

    resetForm() {
      this.formData = {
        content: "",
        type: "general"
      };
    },

    async handleSubmit() {
      try {
        await this.$refs.form.validate();
        this.submitting = true;

        // 構建備註數據
        const noteData = {
          orderId: this.orderData.id,
          content: this.formData.content,
          type: this.formData.type
        };

        // TODO: 調用添加備註 API
        await new Promise(resolve => setTimeout(resolve, 800));

        this.$message.success("備註新增成功");
        this.resetForm();
        this.$emit("success");
      } catch (error) {
        if (error === false) return;
        this.$message.error("新增失敗");
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style lang="scss">
.notes-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.notes-history {
  margin: 20px 0;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;

  .history-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .title {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }
  }

  .note-item {
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 4px;

    .note-content {
      color: #303133;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .note-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .author {
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .empty-history {
    text-align: center;
    color: #909399;
    padding: 32px 0;

    i {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }
  }
}

.note-type-select {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
