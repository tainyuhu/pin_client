<template>
  <div class="comparison-step">
    <el-tabs type="border-card" class="comparison-tabs">
      <!-- 新增項目 -->
      <el-tab-pane :label="`新增項目 (${comparisonResult.newItems.length})`">
        <div class="tab-header">
          <div class="header-left">
            <el-checkbox
              v-model="selectAllNew"
              :indeterminate="isIndeterminateNew"
              @change="handleSelectAllNew"
            >
              全選
            </el-checkbox>
            <span class="item-count"
              >已選: {{ selectedItems.newItems.size }} /
              {{ comparisonResult.newItems.length }}</span
            >
          </div>
        </div>

        <el-table
          :data="comparisonResult.newItems"
          border
          stripe
          height="400"
          class="comparison-table"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="() => true"
            :reserve-selection="false"
          >
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.selected"
                @change="
                  val =>
                    handleSelectionChange('new', scope.row.productCode, val)
                "
              />
            </template>
          </el-table-column>

          <el-table-column
            v-for="(col, index) in columnsWithoutChangesAndRemark"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
          />
        </el-table>
      </el-tab-pane>

      <!-- 更新項目 -->
      <el-tab-pane :label="`更新項目 (${comparisonResult.updateItems.length})`">
        <div class="tab-header">
          <div class="header-left">
            <el-checkbox
              v-model="selectAllUpdate"
              :indeterminate="isIndeterminateUpdate"
              @change="handleSelectAllUpdate"
            >
              全選
            </el-checkbox>
            <span class="item-count"
              >已選: {{ selectedItems.updateItems.size }} /
              {{ comparisonResult.updateItems.length }}</span
            >
          </div>
        </div>

        <el-table
          :data="comparisonResult.updateItems"
          border
          stripe
          height="400"
          class="comparison-table"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="() => true"
            :reserve-selection="false"
          >
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.selected"
                @change="
                  val =>
                    handleSelectionChange('update', scope.row.productCode, val)
                "
              />
            </template>
          </el-table-column>

          <el-table-column
            v-for="(col, index) in baseColumns"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
          />

          <el-table-column label="變更內容" width="250">
            <template #default="scope">
              <div class="changes-list">
                <div
                  v-for="(change, idx) in scope.row.changes"
                  :key="idx"
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
            </template>
          </el-table-column>

          <el-table-column label="備註" width="200">
            <template #default="scope">
              <div class="remark-cell">
                <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
                <el-button
                  v-if="scope.row.selected"
                  type="text"
                  @click="openRemarkDialog(scope.row)"
                >
                  {{ scope.row.remark ? "編輯" : "填寫" }}備註
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 停用項目 -->
      <el-tab-pane :label="`停用項目 (${comparisonResult.deleteItems.length})`">
        <div class="tab-header">
          <div class="header-left">
            <el-checkbox
              v-model="selectAllDelete"
              :indeterminate="isIndeterminateDelete"
              @change="handleSelectAllDelete"
            >
              全選
            </el-checkbox>
            <span class="item-count"
              >已選: {{ selectedItems.deleteItems.size }} /
              {{ comparisonResult.deleteItems.length }}</span
            >
          </div>
        </div>

        <el-table
          :data="comparisonResult.deleteItems"
          border
          stripe
          height="400"
          class="comparison-table"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="() => true"
            :reserve-selection="false"
          >
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.selected"
                @change="
                  val =>
                    handleSelectionChange('delete', scope.row.productCode, val)
                "
              />
            </template>
          </el-table-column>

          <el-table-column
            v-for="(col, index) in columnsWithoutChangesAndRemark"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "DataComparisonStep",

  props: {
    comparisonResult: {
      type: Object,
      required: true
    },
    selectedItems: {
      type: Object,
      required: true
    },
    comparisonColumns: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      selectAllNew: false,
      selectAllUpdate: false,
      selectAllDelete: false
    };
  },

  computed: {
    baseColumns() {
      return this.comparisonColumns.filter(
        col => !["changes", "remark"].includes(col.prop)
      );
    },

    columnsWithoutChangesAndRemark() {
      return this.comparisonColumns.filter(
        col => !["changes", "remark"].includes(col.prop)
      );
    },

    isIndeterminateNew() {
      const selectedCount = this.selectedItems.newItems.size;
      const totalCount = this.comparisonResult.newItems.length;
      return selectedCount > 0 && selectedCount < totalCount;
    },

    isIndeterminateUpdate() {
      const selectedCount = this.selectedItems.updateItems.size;
      const totalCount = this.comparisonResult.updateItems.length;
      return selectedCount > 0 && selectedCount < totalCount;
    },

    isIndeterminateDelete() {
      const selectedCount = this.selectedItems.deleteItems.size;
      const totalCount = this.comparisonResult.deleteItems.length;
      return selectedCount > 0 && selectedCount < totalCount;
    }
  },

  watch: {
    // 監聽父組件傳來的選擇項目變化
    selectedItems: {
      handler(newVal) {
        this.updateSelectAllStatus();
      },
      deep: true
    },

    // 監聽比對結果變化
    comparisonResult: {
      handler() {
        this.updateSelectAllStatus();
      },
      deep: true
    }
  },

  methods: {
    updateSelectAllStatus() {
      // 更新全選狀態
      this.selectAllNew =
        this.comparisonResult.newItems.length > 0 &&
        this.selectedItems.newItems.size ===
          this.comparisonResult.newItems.length;

      this.selectAllUpdate =
        this.comparisonResult.updateItems.length > 0 &&
        this.selectedItems.updateItems.size ===
          this.comparisonResult.updateItems.length;

      this.selectAllDelete =
        this.comparisonResult.deleteItems.length > 0 &&
        this.selectedItems.deleteItems.size ===
          this.comparisonResult.deleteItems.length;
    },

    handleSelectAllNew(selected) {
      this.$emit("toggle-all", "new", selected);
    },

    handleSelectAllUpdate(selected) {
      this.$emit("toggle-all", "update", selected);
    },

    handleSelectAllDelete(selected) {
      this.$emit("toggle-all", "delete", selected);
    },

    handleSelectionChange(type, productCode, selected) {
      this.$emit("toggle-selection", type, productCode, selected);
    },

    openRemarkDialog(item) {
      this.$emit("update-remark", item);
    }
  }
};
</script>

<style lang="scss" scoped>
.comparison-step {
  .comparison-tabs {
    .tab-header {
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;

        .item-count {
          color: #606266;
          font-size: 14px;
        }
      }
    }

    .comparison-table {
      .changes-list {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .change-item {
          display: flex;
          flex-direction: column;
          font-size: 12px;

          .change-label {
            color: #606266;
            margin-bottom: 2px;
          }

          .change-value {
            display: flex;
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
              font-size: 10px;
              color: #909399;
            }
          }
        }
      }

      .remark-cell {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .el-button {
          font-size: 12px;
          padding: 0;
          margin: 0;
        }
      }
    }
  }
}
</style>
