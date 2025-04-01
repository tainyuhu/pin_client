<template>
  <el-dialog
    :title="title || '欄位顯示設定'"
    :visible.sync="showSelector"
    width="700px"
    custom-class="column-selector-dialog"
    :close-on-click-modal="false"
    :append-to-body="true"
  >
    <div class="dialog-container">
      <!-- 頂部工具列 -->
      <div class="dialog-toolbar">
        <div class="toolbar-left">
          <el-radio-group v-model="columnLayout" size="small">
            <el-radio-button label="grid">網格檢視</el-radio-button>
            <el-radio-button label="list">列表檢視</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-button
            type="primary"
            plain
            size="small"
            icon="el-icon-check"
            @click="selectAllColumns"
          >
            全選
          </el-button>
          <el-button
            type="info"
            plain
            size="small"
            icon="el-icon-refresh-left"
            @click="resetColumns"
          >
            重置預設
          </el-button>
        </div>
      </div>

      <!-- 搜尋框 -->
      <div class="dialog-search">
        <el-input
          v-model="searchKey"
          prefix-icon="el-icon-search"
          placeholder="搜尋欄位..."
          clearable
          size="small"
        />
      </div>

      <!-- 欄位列表 -->
      <div :class="['column-container', columnLayout]">
        <template v-for="col in filteredColumns">
          <div :key="col.prop" class="column-item">
            <el-checkbox
              v-model="tempSelectedColumns"
              :label="col.prop"
              :disabled="isRequired(col.prop)"
            >
              <div class="checkbox-content">
                <span class="column-label">{{ col.label }}</span>
                <el-tag v-if="isRequired(col.prop)" size="mini" type="danger"
                  >必要</el-tag
                >
              </div>
            </el-checkbox>
          </div>
        </template>
      </div>

      <!-- 已選擇欄位預覽 -->
      <div class="selected-preview">
        <div class="preview-header">
          <span class="preview-title">
            <i class="el-icon-view"></i>
            已選擇欄位預覽
          </span>
          <span class="preview-count">
            已選擇 {{ tempSelectedColumns.length }} /
            {{ allColumns.length }} 個欄位
          </span>
        </div>
        <div class="preview-content">
          <el-tag
            v-for="col in selectedColumnInfo"
            :key="col.prop"
            class="preview-tag"
            closable
            :disable-transitions="false"
            @close="handleRemoveColumn(col.prop)"
          >
            {{ col.label }}
          </el-tag>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        確認
        <span class="confirm-count">({{ tempSelectedColumns.length }})</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ColumnSelector",
  props: {
    // 是否顯示選擇器
    visible: {
      type: Boolean,
      default: false
    },
    // 對話框標題
    title: {
      type: String,
      default: ""
    },
    // 所有可用的欄位
    columns: {
      type: Array,
      required: true
    },
    // 當前選中的欄位
    value: {
      type: Array,
      required: true
    },
    // 必要欄位（不可取消選擇）
    requiredColumns: {
      type: Array,
      default: () => []
    },
    // 默認欄位（重置時使用）
    defaultColumns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showSelector: false,
      columnLayout: "grid",
      searchKey: "",
      tempSelectedColumns: []
    };
  },
  computed: {
    allColumns() {
      return this.columns;
    },
    // 過濾後的欄位
    filteredColumns() {
      if (!this.searchKey) return this.allColumns;
      return this.allColumns.filter(col =>
        col.label.toLowerCase().includes(this.searchKey.toLowerCase())
      );
    },
    // 已選擇的欄位資訊
    selectedColumnInfo() {
      return this.allColumns.filter(col =>
        this.tempSelectedColumns.includes(col.prop)
      );
    }
  },
  watch: {
    visible(val) {
      this.showSelector = val;
      if (val) {
        this.tempSelectedColumns = [...this.value];
      }
    },
    showSelector(val) {
      this.$emit("update:visible", val);
    }
  },
  methods: {
    isRequired(prop) {
      return this.requiredColumns.includes(prop);
    },
    handleRemoveColumn(prop) {
      if (this.isRequired(prop)) return;
      const index = this.tempSelectedColumns.indexOf(prop);
      if (index > -1) {
        this.tempSelectedColumns.splice(index, 1);
      }
    },
    selectAllColumns() {
      this.tempSelectedColumns = this.allColumns.map(col => col.prop);
    },
    resetColumns() {
      this.$confirm("確定要恢復預設欄位設定嗎？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.tempSelectedColumns = [...this.defaultColumns];
          this.$message.success("已恢復預設設定");
        })
        .catch(() => {});
    },
    handleCancel() {
      this.showSelector = false;
      this.tempSelectedColumns = [...this.value];
    },
    handleConfirm() {
      this.showSelector = false;
      this.$emit("input", this.tempSelectedColumns);
      this.$emit("change", this.tempSelectedColumns);
      this.$message.success("欄位設定已更新");
    }
  }
};
</script>

<style lang="scss" scoped>
.column-selector-dialog {
  .dialog-container {
    padding: 0 20px;
  }

  .dialog-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .dialog-search {
    margin-bottom: 16px;
  }

  .column-container {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
    min-height: 200px;

    &.grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    &.list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .column-item {
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #ecf5ff;
    }
  }

  .checkbox-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .column-label {
    flex: 1;
  }

  .selected-preview {
    margin-top: 20px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .preview-title {
    font-size: 14px;
    color: #606266;

    i {
      margin-right: 4px;
    }
  }

  .preview-count {
    font-size: 12px;
    color: #909399;
  }

  .preview-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 32px;
  }

  .preview-tag {
    display: flex;
    align-items: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }

  .confirm-count {
    font-size: 12px;
    color: #e4e7ed;
    margin-left: 4px;
  }
}
</style>
