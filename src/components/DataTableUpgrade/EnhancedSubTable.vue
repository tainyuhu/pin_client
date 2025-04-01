<template>
  <div class="enhanced-sub-table-wrapper">
    <!-- 子表格切換標籤 -->
    <div class="sub-table-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" type="card">
        <el-tab-pane
          v-for="(config, index) in subTableConfigs"
          :key="index"
          :label="config.title || `子表格 ${index + 1}`"
          :name="String(index)"
        >
          <!-- 子表格頭部 (直接在選項卡內部而非外層) -->
          <div class="sub-table-header">
            <h3>{{ getCurrentSubTableTitle() }}</h3>
            <div class="sub-table-actions">
              <slot
                name="sub-table-actions"
                :config="getCurrentSubTableConfig()"
              ></slot>
            </div>
          </div>

          <!-- 子表格主體 -->
          <el-table
            :data="getCurrentSubTableData()"
            border
            size="small"
            class="sub-table"
            :row-key="getRowKey"
            @row-click="handleRowClick"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <!-- 序號列 -->
            <el-table-column
              type="index"
              width="50"
              label="序號"
              align="center"
            />

            <!-- 數據列 -->
            <el-table-column
              v-for="column in getCurrentSubTableColumns()"
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
                    :type="
                      getStatusType(
                        scope.row[column.prop],
                        column.statusOptions
                      )
                    "
                    size="small"
                    effect="plain"
                  >
                    {{
                      getStatusText(
                        scope.row[column.prop],
                        column.statusOptions
                      )
                    }}
                  </el-tag>
                </template>
                <!-- 自定義插槽 -->
                <slot
                  v-else-if="
                    $scopedSlots[`sub-column-${activeTab}-${column.prop}`]
                  "
                  :name="`sub-column-${activeTab}-${column.prop}`"
                  :row="scope.row"
                  :index="scope.$index"
                ></slot>
                <!-- 預設顯示 -->
                <template v-else>
                  {{ formatColumnValue(scope.row, column) }}
                </template>
              </template>
            </el-table-column>

            <!-- 操作列 -->
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
              <el-empty description="暫無數據" :image-size="80"></el-empty>
            </template>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { formatDate } from "@/utils/dataTable.js";

export default {
  name: "EnhancedSubTable",

  props: {
    // 父表格行數據
    data: {
      type: Object,
      required: true
    },
    // 子表格配置陣列
    subTableConfigs: {
      type: Array,
      required: true
      // 每個配置需要:
      // {
      //   title: "子表格標題",
      //   dataKey: "details", // 數據在父行中的鍵名
      //   columns: [], // 列配置
      //   statusOptions: [] // 可選狀態配置
      // }
    },
    // 行唯一標識
    rowKey: {
      type: String,
      default: "id"
    },
    // 父行數據
    parentRow: {
      type: Object,
      default: () => ({})
    },
    // 通用狀態配置
    statusOptions: {
      type: Array,
      default: () => [
        { value: 0, label: "未處理", type: "danger" },
        { value: 1, label: "已處理", type: "success" },
        { value: 2, label: "處理中", type: "warning" }
      ]
    },
    // 操作列設置
    actionWidth: {
      type: [String, Number],
      default: 150
    },
    actionLabel: {
      type: String,
      default: "操作"
    }
  },

  data() {
    return {
      // 當前激活的選項卡
      activeTab: "0"
    };
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
    // 獲取當前子表格配置
    getCurrentSubTableConfig() {
      const index = parseInt(this.activeTab);
      return this.subTableConfigs[index] || {};
    },

    // 獲取當前子表格標題
    getCurrentSubTableTitle() {
      const config = this.getCurrentSubTableConfig();
      return config.title || "明細列表";
    },

    // 獲取當前子表格數據
    getCurrentSubTableData() {
      const config = this.getCurrentSubTableConfig();
      if (!config.dataKey) return [];
      return this.data[config.dataKey] || [];
    },

    // 獲取當前子表格列配置
    getCurrentSubTableColumns() {
      const config = this.getCurrentSubTableConfig();
      return config.columns || [];
    },

    // 處理標籤切換
    handleTabClick(tab) {
      this.$emit("tab-change", parseInt(tab.name));
    },

    // 獲取行的唯一鍵
    getRowKey(row) {
      return row[this.rowKey];
    },

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
        return this.getStatusText(value, column.statusOptions);
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
    getStatusText(value, columnStatusOptions) {
      // 優先使用列特定的狀態選項，其次使用子表格配置的狀態選項，最後使用全局狀態選項
      const statusOptions =
        columnStatusOptions ||
        this.getCurrentSubTableConfig().statusOptions ||
        this.statusOptions;

      const option = statusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },

    // 獲取狀態類型
    getStatusType(value, columnStatusOptions) {
      // 優先使用列特定的狀態選項，其次使用子表格配置的狀態選項，最後使用全局狀態選項
      const statusOptions =
        columnStatusOptions ||
        this.getCurrentSubTableConfig().statusOptions ||
        this.statusOptions;

      const option = statusOptions.find(opt => opt.value === value);
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

.enhanced-sub-table-wrapper {
  padding: 0;
  padding-bottom: 20px;
  margin: 0;
  width: 100%;
  font-family: $font-family-base;
  background-color: #fafcff;
  border-radius: $border-radius;

  // 子表格選項卡樣式
  .sub-table-tabs {
    .el-tabs__header {
      margin-bottom: 16px; // 增加距離，原為10px
      background: #fff;
      padding: 12px 16px 0; // 增加頂部間距，原為8px
      border-bottom: 1px solid #e8e8e8;

      .el-tabs__nav {
        border: none;
      }

      .el-tabs__item {
        height: 36px;
        line-height: 36px;
        font-size: $font-size-sm;
        color: #606266;
        border: 1px solid #e4e7ed;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        margin-right: 4px;
        transition: all 0.3s ease;

        &.is-active {
          color: $primary-color;
          background-color: #f0f7ff;
          border-bottom-color: transparent;
        }

        &:hover {
          color: $primary-color;
        }
      }
    }

    .el-tabs__content {
      padding: 8px 16px 16px; // 增加頂部間距，原為0 16px 16px
    }
  }

  .sub-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px; // 新增頂部間距
    margin-bottom: 16px; // 增加底部間距，原為12px
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
    background-color: #fff;
    width: 100% !important; /* 確保子表格寬度為100% */
  }
}

/* Element UI 表格樣式覆蓋 */
.enhanced-sub-table-wrapper {
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

  /* 狀態標籤樣式 */
  .el-tag {
    font-size: $font-size-xs;
    padding: 2px 6px;
    height: auto;
    line-height: 1.5;
  }
}

/* 子表格卷軸樣式 */
.enhanced-sub-table-wrapper
  .sub-table
  .el-table__body-wrapper::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.enhanced-sub-table-wrapper
  .sub-table
  .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.enhanced-sub-table-wrapper
  .sub-table
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.enhanced-sub-table-wrapper
  .sub-table
  .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 卷軸樣式 */
.enhanced-sub-table-wrapper .sub-table .el-table__body-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f5f7fa;
}

/* 確保表格水平卷軸顯示在底部固定位置 */
.enhanced-sub-table-wrapper .sub-table .el-table__body-wrapper {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}

// 響應式調整
@media screen and (max-width: 768px) {
  .enhanced-sub-table-wrapper {
    .sub-table-tabs {
      .el-tabs__header {
        padding: 10px 10px 0; // 增加頂部間距，原為6px
        margin-bottom: 12px; // 增加底部間距
      }

      .el-tabs__item {
        font-size: $font-size-xs;
        height: 32px;
        line-height: 32px;
        padding: 0 10px;
      }

      .el-tabs__content {
        padding: 6px 10px 10px; // 增加頂部間距，原為0 10px 10px
      }
    }

    .sub-table-header {
      margin-top: 6px; // 新增頂部間距
      margin-bottom: 12px; // 增加間距，原為8px

      h3 {
        font-size: $font-size-base;
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
}
</style>
