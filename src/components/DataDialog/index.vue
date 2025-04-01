# DataDialog.vue
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    custom-class="modern-dialog"
    @closed="handleClose"
    :top="dialogTop"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <div class="dialog-toolbar" v-if="showToolbar">
      <div class="search-section">
        <search-box
          v-model="searchQuery"
          :placeholder="fieldPlaceholder"
          :fields="searchableFields"
          :show-fields="showFields"
          @field-change="handleFieldChange"
          @clear="handleSearch"
          @search="handleSearch"
        />
        <el-dropdown
          v-if="showFilters"
          trigger="click"
          @command="handleFilterChange"
        >
          <el-button type="text">
            <i class="el-icon-filter"></i>
            篩選
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <slot name="filter-options"></slot>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="toolbar-actions">
        <slot name="toolbar-actions"></slot>
      </div>
    </div>

    <base-table
      ref="table"
      :data="filteredData"
      :columns="dialogColumns"
      :loading="loading"
      :border="border"
      :stripe="stripe"
      :height="tableHeight"
      :show-toolbar="false"
      :show-selection="showSelection"
      :show-index="showIndex"
      :empty-text="searchQuery ? emptyText : noDataText"
      :show-pagination="showPagination"
      :page-sizes="pageSizes"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 傳遞所有插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </base-table>

    <div class="dialog-footer">
      <div class="action-buttons">
        <slot name="footer">
          <template v-if="showBatchDelete && selectedRows.length > 0">
            <el-popconfirm
              title="確定要刪除選中的項目嗎？"
              @confirm="handleBatchDelete"
            >
              <el-button slot="reference" type="danger" plain>
                <i class="el-icon-delete"></i>
                批量刪除
              </el-button>
            </el-popconfirm>
          </template>
          <el-button @click="handleClose" plain>{{ cancelText }}</el-button>
          <el-button
            v-if="showConfirm"
            type="primary"
            @click="handleConfirm"
            :loading="confirmLoading"
          >
            <i class="el-icon-check" v-if="!confirmLoading"></i>
            {{ confirmText }}
          </el-button>
        </slot>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { debounce } from "lodash";
import SearchBox from "@/components/SearchBox/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";

export default {
  name: "DataDialog",

  components: {
    SearchBox,
    BaseTable
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "詳細資料"
    },
    width: {
      type: String,
      default: "90%"
    },
    data: {
      type: Array,
      required: true
    },
    dialogColumns: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
    },
    stripe: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showFields: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    showConfirm: {
      type: Boolean,
      default: false
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    showIndex: {
      type: Boolean,
      default: false
    },
    showBatchDelete: {
      type: Boolean,
      default: false
    },
    confirmText: {
      type: String,
      default: "確認"
    },
    cancelText: {
      type: String,
      default: "關閉"
    },
    noDataText: {
      type: String,
      default: "暫無數據"
    },
    emptyText: {
      type: String,
      default: "沒有符合的關鍵字"
    },
    fieldPlaceholder: {
      type: String,
      default: "搜尋..."
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      searchQuery: "",
      selectedField: "",
      selectedRows: [],
      confirmLoading: false,
      tableHeight: this.calculateTableHeight(),
      dialogTop: window.innerWidth <= 768 ? "10vh" : "15vh",
      debouncedSearch: null,
      resizeTimeout: null
    };
  },

  computed: {
    searchableFields() {
      return this.dialogColumns
        .filter(col => col.searchable !== false && col.prop)
        .map(col => ({
          label: col.label,
          prop: col.prop
        }));
    },

    filteredData() {
      let result = [...this.data];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(item => {
          if (this.selectedField) {
            const value = item[this.selectedField];
            return (
              value &&
              String(value)
                .toLowerCase()
                .includes(query)
            );
          }
          return Object.values(item).some(
            val =>
              val &&
              String(val)
                .toLowerCase()
                .includes(query)
          );
        });
      }

      return result;
    }
  },

  created() {
    this.debouncedSearch = debounce(this.handleSearch, 300);
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.debouncedSearch) {
      this.debouncedSearch.cancel();
    }
  },

  methods: {
    calculateTableHeight() {
      const offset = this.showToolbar ? 180 : 120;
      return window.innerWidth <= 768
        ? `calc(80vh - ${offset}px)`
        : `calc(70vh - ${offset}px)`;
    },

    handleResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.tableHeight = this.calculateTableHeight();
        this.dialogTop = window.innerWidth <= 768 ? "10vh" : "15vh";
      }, 200);
    },

    handleSearch() {
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
      }
      this.$emit("search", {
        query: this.searchQuery,
        field: this.selectedField
      });
    },

    handleFieldChange(field) {
      this.selectedField = field;
      this.handleSearch();
    },

    handleSortChange(data) {
      this.$emit("sort-change", data);
    },

    handleFilterChange(command) {
      this.$emit("filter-change", command);
    },

    handleSizeChange(val) {
      this.$emit("size-change", val);
    },

    handleCurrentChange(val) {
      this.$emit("current-change", val);
    },

    handleSelectionChange(rows) {
      this.selectedRows = rows;
      this.$emit("selection-change", rows);
    },

    async handleBatchDelete() {
      try {
        await this.$emit("batch-delete", this.selectedRows);
        this.$message.success("批量刪除成功");
        if (this.$refs.table) {
          this.$refs.table.clearSelection();
        }
      } catch (error) {
        this.$message.error("批量刪除失敗");
        console.error("Batch delete error:", error);
      }
    },

    handleClose() {
      this.$emit("close");
      this.dialogVisible = false;
    },

    async handleConfirm() {
      try {
        this.confirmLoading = true;
        await this.$emit("confirm", this.selectedRows);
        this.dialogVisible = false;
      } catch (error) {
        console.error("Confirm error:", error);
      } finally {
        this.confirmLoading = false;
      }
    },

    resetState() {
      this.searchQuery = "";
      this.selectedField = "";
      this.selectedRows = [];
      this.confirmLoading = false;
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
      }
    },

    // 公開方法
    getSelectedRows() {
      return this.selectedRows;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
      this.handleSearch();
    },

    clearSelection() {
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
      }
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
      if (!val) {
        this.resetState();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.modern-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  :deep(.el-dialog__header) {
    padding: 20px;
    border-bottom: 1px solid #edf2f7;
    margin: 0;

    .el-dialog__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  .dialog-toolbar {
    padding: 16px 20px;
    background-color: #fff;
    border-bottom: 1px solid #edf2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .search-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      position: relative;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }

  .dialog-footer {
    padding: 16px 20px;
    background-color: #fff;
    border-top: 1px solid #edf2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .modern-pagination {
      :deep(.el-pagination__sizes) {
        margin-right: 16px;
      }

      :deep(.el-pager li) {
        border-radius: 6px;

        &.active {
          background-color: #409eff;
          color: #fff;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;

      .el-button {
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 500;

        i {
          margin-right: 4px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .modern-dialog {
    margin: 0 !important;

    :deep(.el-dialog__header) {
      padding: 16px;

      .el-dialog__title {
        font-size: 1.125rem;
      }
    }

    .dialog-toolbar {
      flex-direction: column;
      padding: 12px 16px;
      gap: 12px;

      .search-section {
        width: 100%;
      }

      .toolbar-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .dialog-footer {
      flex-direction: column-reverse;
      gap: 16px;
      padding: 12px 16px;

      .pagination-wrapper {
        width: 100%;
      }

      .action-buttons {
        width: 100%;
        justify-content: flex-end;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
