<template>
  <div class="tree-table-wrapper">
    <!-- 工具欄 -->
    <div class="table-toolbar">
      <div class="toolbar-right">
        <!-- 匯出按鈕 -->
        <el-button type="warning" plain size="small" @click="exportToExcel">
          <i class="el-icon-document"></i>
          匯出全部數據
        </el-button>
      </div>
    </div>

    <!-- 表格主體 -->
    <div class="table-container">
      <el-table
        ref="table"
        v-loading="loading"
        :data="currentPageData"
        :height="height"
        :max-height="maxHeight"
        @sort-change="handleSortChange"
        border
        stripe
      >
        <!-- 數據列 -->
        <el-table-column
          v-for="column in displayColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :sortable="column.sortable"
          :align="column.align || 'left'"
        >
          <template #default="scope">
            <!-- 樹形列 -->
            <template v-if="column.prop === treeColumn">
              <span
                class="tree-cell"
                :style="{ paddingLeft: `${scope.row._level * 24}px` }"
              >
                <span
                  v-if="hasChildren(scope.row)"
                  class="tree-expand-icon"
                  @click.stop="toggleExpand(scope.row)"
                >
                  <i
                    :class="[
                      'el-icon-arrow-right',
                      { 'is-expanded': scope.row._expanded }
                    ]"
                  ></i>
                </span>
                <span v-else class="tree-placeholder"></span>
                {{ scope.row[column.prop] }}
              </span>
            </template>
            <!-- 使用具名插槽顯示自定義內容 -->
            <template v-else>
              <slot
                :name="`column-${column.prop}`"
                :row="scope.row"
                :index="scope.$index"
              >
                {{ scope.row[column.prop] }}
              </slot>
            </template>
          </template>
        </el-table-column>

        <!-- 操作列 - 修改這裡，僅檢查 showAction 屬性 -->
        <el-table-column
          v-if="showAction"
          :label="actionColumn.label"
          :width="actionColumn.width"
          :align="actionColumn.align"
          :fixed="actionColumn.fixed"
        >
          <template #default="scope">
            <slot name="action" :row="scope.row" :index="scope.$index"></slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁器 -->
      <div class="pagination-container">
        <el-pagination
          :current-page.sync="currentPage"
          :page-size="pageSize"
          :total="processedData.length"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import FileSaver from "file-saver";
import * as XLSX from "xlsx";

export default {
  name: "TreeTable",

  props: {
    // 數據源
    data: {
      type: Array,
      required: true
    },
    // 列配置
    columns: {
      type: Array,
      required: true
    },
    // 樹形列屬性名
    treeColumn: {
      type: String,
      required: true
    },
    // 子節點屬性名
    childrenKey: {
      type: String,
      default: "children"
    },
    // 表格高度
    height: [String, Number],
    maxHeight: [String, Number],
    // 默認展開層級，0 表示全部折疊，1 表示展開第一層，以此類推
    defaultExpandLevel: {
      type: Number,
      default: 1
    },
    // 操作列配置
    showAction: {
      type: Boolean,
      default: true
    },
    actionColumn: {
      type: Object,
      default: () => ({
        label: "操作",
        width: 250,
        align: "center"
      })
    }
  },

  data() {
    return {
      loading: false,
      internalData: [],
      debouncedResize: null,
      currentPage: 1,
      pageSize: 10
    };
  },

  computed: {
    processedData() {
      return this.getFlattenedData(this.internalData);
    },

    displayColumns() {
      return this.columns;
    },

    currentPageData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.processedData.slice(start, end);
    }
  },

  watch: {
    data: {
      handler(newData) {
        this.initializeData(newData);
      },
      immediate: true
    }
  },

  created() {
    this.initialize();
  },

  mounted() {
    this.debouncedResize = debounce(() => {
      if (this.$refs.table) {
        this.$refs.table.doLayout();
      }
    }, 200);

    window.addEventListener("resize", this.debouncedResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.debouncedResize);
  },

  methods: {
    initialize() {
      this.initializeExpandedState();
    },

    initializeData(data) {
      this.internalData = this.processTreeData(data);
      this.initializeExpandedState();
    },

    initializeExpandedState() {
      const initializeNode = (nodes, level) => {
        nodes.forEach(node => {
          node._expanded = level < this.defaultExpandLevel;
          if (node[this.childrenKey] && node[this.childrenKey].length) {
            initializeNode(node[this.childrenKey], level + 1);
          }
        });
      };

      initializeNode(this.internalData, 0);
    },

    processTreeData(nodes, level = 0, parent = null) {
      return nodes.map(node => {
        const processedNode = { ...node };
        processedNode._level = level;
        processedNode._parent = parent;
        processedNode._expanded = false;

        if (node[this.childrenKey] && node[this.childrenKey].length) {
          processedNode[this.childrenKey] = this.processTreeData(
            node[this.childrenKey],
            level + 1,
            processedNode
          );
        }

        return processedNode;
      });
    },

    getFlattenedData(nodes, result = []) {
      nodes.forEach(node => {
        result.push(node);
        if (
          node[this.childrenKey] &&
          node[this.childrenKey].length &&
          node._expanded
        ) {
          this.getFlattenedData(node[this.childrenKey], result);
        }
      });
      return result;
    },

    hasChildren(row) {
      return row[this.childrenKey] && row[this.childrenKey].length > 0;
    },

    toggleExpand(row) {
      row._expanded = !row._expanded;
      this.$emit("tree-expand", {
        row,
        expanded: row._expanded
      });
    },

    handleSortChange(params) {
      this.$emit("sort-change", params);
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },

    handleCurrentChange(val) {
      this.currentPage = val;
    },

    // 計算子分類和商品數量
    calculateCounts(node) {
      let subCategoryCount = 0;
      let productCount = 0;

      if (node[this.childrenKey] && node[this.childrenKey].length) {
        node[this.childrenKey].forEach(child => {
          if (child[this.childrenKey] && child[this.childrenKey].length) {
            subCategoryCount++;
            const childCounts = this.calculateCounts(child);
            subCategoryCount += childCounts.subCategoryCount;
            productCount += childCounts.productCount;
          } else {
            productCount++;
          }
        });
      }

      return { subCategoryCount, productCount };
    },

    async exportToExcel() {
      try {
        this.loading = true;

        // 格式化日期為 YYYYMMDD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateStr = `${year}${month}${day}`;

        const fileName = `商品分類_${dateStr}`;

        // 準備匯出數據
        const prepareExportData = (nodes, level = 0) => {
          const result = [];

          nodes.forEach(node => {
            // 計算當前節點的統計數據
            const counts = this.calculateCounts(node);

            // 創建帶有縮進的名稱
            const indentation = "    ".repeat(level);

            const row = {
              分類名稱: indentation + node[this.treeColumn],
              子分類數量: counts.subCategoryCount,
              商品數量: counts.productCount,
              層級: level + 1
            };

            result.push(row);

            // 遞歸處理子節點
            if (node[this.childrenKey] && node[this.childrenKey].length) {
              result.push(
                ...prepareExportData(node[this.childrenKey], level + 1)
              );
            }
          });

          return result;
        };

        const exportData = prepareExportData(this.internalData);

        // 創建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // 設置列寬
        ws["!cols"] = [
          { wch: 40 }, // 分類名稱
          { wch: 12 }, // 子分類數量
          { wch: 12 }, // 商品數量
          { wch: 8 } // 層級
        ];

        XLSX.utils.book_append_sheet(wb, ws, "分類結構");

        const wbout = XLSX.write(wb, {
          bookType: "xlsx",
          type: "array"
        });

        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          `${fileName}.xlsx`
        );

        this.$message.success("導出成功");
      } catch (error) {
        console.error("Export error:", error);
        this.$message.error("導出失敗");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tree-table-wrapper {
  width: 100%;

  .table-toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;

    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .table-container {
    margin-top: 16px;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

.tree-cell {
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.tree-expand-icon {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  color: #909399;
  transition: transform 0.3s ease;

  i {
    transition: transform 0.3s ease;

    &.is-expanded {
      transform: rotate(90deg);
    }
  }

  &:hover {
    color: #409eff;
  }
}

.tree-placeholder {
  width: 24px;
  display: inline-block;
}

// 深色模式支援
@media (prefers-color-scheme: dark) {
  .tree-expand-icon {
    color: #a6a6a6;

    &:hover {
      color: #409eff;
    }
  }

  .tree-table-wrapper {
    ::v-deep {
      .el-table {
        background-color: #1e1e1e;
        color: #fff;

        &::before,
        &::after {
          background-color: #4c4c4c;
        }

        th,
        td {
          background-color: #1e1e1e;
          border-color: #4c4c4c;

          .cell {
            color: #fff;
          }
        }

        tr:hover > td {
          background-color: #2c2c2c;
        }

        .el-table__empty-block {
          background-color: #1e1e1e;
        }

        .el-table__fixed-right-patch {
          background-color: #1e1e1e;
        }
      }

      .el-pagination {
        background-color: #1e1e1e;
        color: #fff;

        .btn-prev,
        .btn-next {
          background-color: #2c2c2c;
          color: #fff;
        }

        .el-pager li {
          background-color: #2c2c2c;
          color: #fff;

          &.active {
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
