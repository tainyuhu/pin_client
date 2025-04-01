<template>
  <div class="sub-table-wrapper">
    <div class="sub-table-header">
      <h3>明細列表</h3>
      <div class="sub-table-actions">
        <slot name="sub-table-actions"></slot>
      </div>
    </div>

    <el-table
      :data="data"
      border
      size="small"
      class="sub-table"
      :row-key="rowKey"
      @row-click="handleRowClick"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <!-- 序號列 -->
      <el-table-column type="index" width="50" label="序號" align="center" />

      <!-- 數據列 -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth || 80"
        :align="column.align || 'left'"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <!-- 狀態列特殊處理 -->
          <template v-if="column.type === 'status'">
            <el-tag
              :type="getStatusType(scope.row[column.prop])"
              size="small"
              effect="plain"
            >
              {{ getStatusText(scope.row[column.prop]) }}
            </el-tag>
          </template>
          <!-- 自定義插槽 -->
          <slot
            v-else-if="$scopedSlots[`sub-column-${column.prop}`]"
            :name="`sub-column-${column.prop}`"
            :row="scope.row"
            :index="scope.$index"
          ></slot>
          <!-- 預設顯示 -->
          <template v-else>
            {{ formatColumnValue(scope.row, column) }}
          </template>
        </template>
      </el-table-column>

      <!-- 操作列 - 始終顯示以保持與主表的結構一致 -->
      <el-table-column
        :label="actionLabel"
        :width="actionWidth"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <slot
            name="sub-actions"
            :row="scope.row"
            :index="scope.$index"
            :parent-row="parentRow"
          ></slot>
        </template>
      </el-table-column>

      <!-- 空數據 -->
      <template slot="empty">
        <el-empty description="暫無明細數據" :image-size="80"></el-empty>
      </template>
    </el-table>
  </div>
</template>

<script>
import { formatDate } from "@/utils/dataTable.js";

export default {
  name: "SubTable",

  props: {
    // 表格數據
    data: {
      type: Array,
      required: true
    },
    // 列配置
    columns: {
      type: Array,
      required: true
    },
    // 行唯一標識
    rowKey: {
      type: String,
      default: "id"
    },
    // 是否顯示操作按鈕內容
    showActions: {
      type: Boolean,
      default: false
    },
    // 父行數據
    parentRow: {
      type: Object,
      default: () => ({})
    },
    // 狀態配置
    statusOptions: {
      type: Array,
      default: () => [
        { value: 0, label: "未處理", type: "danger" },
        { value: 1, label: "已處理", type: "success" },
        { value: 2, label: "處理中", type: "warning" }
      ]
    },
    // 操作列設置 - 與主表保持一致
    actionWidth: {
      type: [String, Number],
      default: 150
    },
    actionLabel: {
      type: String,
      default: " "
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.syncRowHeights();
    });
  },

  updated() {
    this.$nextTick(() => {
      this.syncRowHeights();
    });
  },

  methods: {
    // 格式化列值
    formatColumnValue(row, column) {
      const value = row[column.prop];

      if (!value && value !== 0) {
        return "-";
      }

      if (column.formatter) {
        return column.formatter(value, row);
      }

      if (column.type === "date" && value) {
        return formatDate(value, column.format || "YYYY-MM-DD");
      }

      if (column.type === "status") {
        return this.getStatusText(value);
      }

      if (column.type === "number") {
        return this.formatNumber(value, column.precision);
      }

      return value;
    },

    // 格式化數字
    formatNumber(value, precision = 2) {
      if (typeof value !== "number") {
        return value;
      }
      return precision === 0
        ? value.toLocaleString()
        : value.toFixed(precision);
    },

    // 獲取狀態文字
    getStatusText(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },

    // 獲取狀態類型
    getStatusType(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.type : "";
    },

    // 處理行點擊
    handleRowClick(row, column, event) {
      this.$emit("row-click", row, this.parentRow, column, event);
    },

    // 同步行高，確保固定列與主體行高一致
    syncRowHeights() {
      const table = this.$el.querySelector(".sub-table");
      if (!table) return;

      const rows = table.querySelectorAll(".el-table__body .el-table__row");
      const fixedRows = table.querySelectorAll(
        ".el-table__fixed-right .el-table__row"
      );

      rows.forEach((row, index) => {
        const height = row.offsetHeight;
        if (fixedRows[index]) {
          fixedRows[index].style.height = height + "px";
        }
      });
    }
  }
};
</script>

<style lang="scss">
/* 注意：這裡不使用 scoped，讓樣式可以直接應用到 Element UI 的內部元素 */

// 導入與主表格相同的變數
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

// 與主表格匹配的字體大小
$font-size-xs: 14px; // 最小字體
$font-size-sm: 16px; // 小字體
$font-size-base: 18px; // 基礎字體
$font-size-lg: 20px; // 大字體
$font-size-xl: 22px; // 特大字體
$font-size-xxl: 24px; // 標題字體
$font-size-xxxl: 28px; // 大標題字體

// 字體粗細
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;

// 字體族
$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif;

.sub-table-wrapper {
  padding: 12px 16px 16px;
  margin: 0;
  width: 100%;
  font-family: $font-family-base;
  background-color: #fafcff;
  border-radius: $border-radius;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);

  .sub-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      margin: 0;
      color: #303133;
      position: relative;
      padding-left: 10px;

      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 16px;
        width: 4px;
        background-color: $primary-color;
        border-radius: 2px;
      }
    }

    .sub-table-actions {
      display: flex;
      gap: 8px;
    }
  }

  .sub-table {
    margin-bottom: 0;
    border-radius: 6px;
    box-shadow: $box-shadow;
    overflow: hidden;
    table-layout: fixed; /* 確保表格列寬一致 */
  }
}

/* Element UI 表格樣式覆蓋 */
.el-table__expanded-cell {
  padding: 0 !important;
  background-color: #f9fbfe !important;
}

.sub-table {
  background-color: #fff;
  width: 100% !important; /* 確保子表格寬度為100% */

  /* 表頭樣式 */
  .el-table__header-wrapper th {
    background-color: #f5f7fa !important;
    color: #606266;
    font-weight: $font-weight-semibold;
    font-size: $font-size-xs;
    padding: 8px 6px;
    height: 40px !important;
  }

  /* 所有單元格的一致樣式 */
  .el-table__body td {
    padding: 6px 6px;
    font-size: $font-size-xs;
    height: 38px !important;
    line-height: 1.5 !important;
    box-sizing: border-box !important;
  }

  /* 確保固定列和普通列的單元格高度一致 */
  .el-table__fixed-right .el-table__body td {
    height: 38px !important;
    line-height: 1.5 !important;
  }

  /* 統一所有單元格內容樣式 */
  .cell {
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  /* 行懸停效果 */
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #ecf5ff;
  }

  /* 去除多余的边框 */
  &::before,
  &::after {
    display: none;
  }

  /* 确保表格边框圆角显示 */
  .el-table__fixed::before,
  .el-table__fixed-right::before {
    display: none;
  }

  /* 修復固定列的垂直對齊問題 */
  .el-table__fixed-right {
    height: auto !important;
    bottom: 0 !important;
  }

  /* 確保固定列的行與主表格行對齊 */
  .el-table__fixed-right .el-table__row {
    height: 38px !important;
  }

  /* 解決固定列和主體高度不同步的問題 */
  .el-table__body-wrapper,
  .el-table__fixed-right-body-wrapper {
    height: auto !important;
  }
}

/* 狀態標籤樣式 */
.sub-table .el-tag {
  font-size: $font-size-xs;
  padding: 2px 6px;
  height: auto;
  line-height: 1.5;
}

/* 子表格卷軸樣式 */
.sub-table-wrapper .sub-table .el-table__body-wrapper::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.sub-table-wrapper .sub-table .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.sub-table-wrapper .sub-table .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.sub-table-wrapper
  .sub-table
  .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 卷軸樣式 */
.sub-table-wrapper .sub-table .el-table__body-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f5f7fa;
}

/* 確保表格水平卷軸顯示在底部固定位置 */
.sub-table-wrapper .sub-table .el-table__body-wrapper {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}

// 響應式調整
@media screen and (max-width: 768px) {
  .sub-table-wrapper {
    padding: 10px 12px 12px;

    .sub-table-header {
      margin-bottom: 8px;

      h3 {
        font-size: $font-size-base;
      }
    }
  }

  .sub-table {
    .el-table__header-wrapper th {
      font-size: $font-size-xs;
      padding: 4px;
      height: 36px !important;
    }

    .el-table__body td,
    .el-table__fixed-right .el-table__body td {
      font-size: $font-size-xs;
      padding: 4px;
      height: 34px !important;
    }

    .cell {
      font-size: $font-size-xs;
      line-height: 1.3;
    }

    .el-table__fixed-right .el-table__row {
      height: 34px !important;
    }
  }
}
</style>
