<template>
  <el-dialog
    title="欄位顯示設定"
    :visible.sync="showColumnSelector"
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
          v-model="columnSearchKey"
          prefix-icon="el-icon-search"
          placeholder="搜尋欄位..."
          clearable
          size="small"
        />
      </div>

      <!-- 分類標籤 -->
      <div class="dialog-tabs">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="基本資料" name="basic">
            <div :class="['column-container', columnLayout]">
              <template v-for="col in filteredBasicColumns">
                <div :key="col.prop" class="column-item">
                  <el-checkbox
                    v-model="visibleColumns"
                    :label="col.prop"
                    :disabled="isRequired(col.prop)"
                  >
                    <div class="checkbox-content">
                      <span class="column-label">{{ col.label }}</span>
                      <el-tag
                        v-if="isRequired(col.prop)"
                        size="mini"
                        type="danger"
                        >必要</el-tag
                      >
                    </div>
                  </el-checkbox>
                </div>
              </template>
            </div>
          </el-tab-pane>
          <el-tab-pane label="詳細資訊" name="detail">
            <div :class="['column-container', columnLayout]">
              <template v-for="col in filteredDetailColumns">
                <div :key="col.prop" class="column-item">
                  <el-checkbox v-model="visibleColumns" :label="col.prop">
                    <div class="checkbox-content">
                      <span class="column-label">{{ col.label }}</span>
                    </div>
                  </el-checkbox>
                </div>
              </template>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 已選擇欄位預覽 -->
      <div class="selected-preview">
        <div class="preview-header">
          <span class="preview-title">
            <i class="el-icon-view"></i>
            已選擇欄位預覽
          </span>
          <span class="preview-count">
            已選擇 {{ visibleColumns.length }} / {{ columns.length }} 個欄位
          </span>
        </div>
        <div class="preview-content">
          <el-tag
            v-for="col in selectedColumns"
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
        <span class="confirm-count">({{ visibleColumns.length }})</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ColumnSelectorDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      required: true
    },
    visibleColumns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showColumnSelector: false,
      columnLayout: "grid",
      columnSearchKey: "",
      activeTab: "basic",
      // 臨時存儲修改，確認時才更新
      tempVisibleColumns: [],
      requiredColumns: ["username", "name"] // 必要欄位
    };
  },
  computed: {
    // 基本欄位
    basicColumns() {
      return this.columns.filter(col =>
        [
          "username",
          "name",
          "company",
          "dept_name",
          "position",
          "email",
          "phone"
        ].includes(col.prop)
      );
    },
    // 詳細資訊欄位
    detailColumns() {
      return this.columns.filter(
        col =>
          ![
            "username",
            "name",
            "company",
            "dept_name",
            "position",
            "email",
            "phone"
          ].includes(col.prop)
      );
    },
    // 搜尋過濾後的基本欄位
    filteredBasicColumns() {
      if (!this.columnSearchKey) return this.basicColumns;
      return this.basicColumns.filter(col =>
        col.label.toLowerCase().includes(this.columnSearchKey.toLowerCase())
      );
    },
    // 搜尋過濾後的詳細資訊欄位
    filteredDetailColumns() {
      if (!this.columnSearchKey) return this.detailColumns;
      return this.detailColumns.filter(col =>
        col.label.toLowerCase().includes(this.columnSearchKey.toLowerCase())
      );
    },
    // 已選擇的欄位資訊
    selectedColumns() {
      return this.columns.filter(col => this.visibleColumns.includes(col.prop));
    }
  },
  watch: {
    value(val) {
      this.showColumnSelector = val;
      if (val) {
        this.tempVisibleColumns = [...this.visibleColumns];
      }
    },
    showColumnSelector(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    isRequired(prop) {
      return this.requiredColumns.includes(prop);
    },
    handleRemoveColumn(prop) {
      if (this.isRequired(prop)) return;
      const index = this.visibleColumns.indexOf(prop);
      if (index > -1) {
        this.visibleColumns.splice(index, 1);
      }
    },
    selectAllColumns() {
      this.visibleColumns = this.columns.map(col => col.prop);
    },
    resetColumns() {
      this.$confirm("確定要恢復預設欄位設定嗎？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.visibleColumns = [...this.requiredColumns];
          this.$message.success("已恢復預設設定");
        })
        .catch(() => {});
    },
    handleCancel() {
      this.showColumnSelector = false;
      // 還原修改
      this.visibleColumns = [...this.tempVisibleColumns];
    },
    handleConfirm() {
      this.showColumnSelector = false;
      this.$emit("update:visibleColumns", this.visibleColumns);
      this.$message.success("欄位設定已更新");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
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
