<template>
  <div class="data-table-wrapper">
    <!-- 工具欄 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-settings">
        <slot name="toolbar"></slot>

        <div class="toolbar-right">
          <!-- 列設置 -->
          <el-popover
            v-model="columnSettingsVisible"
            placement="bottom-end"
            width="480"
            popper-class="column-settings-popover"
            trigger="click"
          >
            <div class="column-settings">
              <div class="settings-header">
                <div class="header-left">
                  <h3>列設置</h3>
                  <el-tooltip content="恢復默認設置">
                    <el-button
                      type="text"
                      icon="el-icon-refresh-right"
                      @click="resetColumnSettings"
                    >
                      重置
                    </el-button>
                  </el-tooltip>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click="saveColumnSettings"
                >
                  確定
                </el-button>
              </div>

              <el-tabs v-model="activeSettingTab">
                <!-- 顯示與順序頁籤 -->
                <el-tab-pane name="display" label="顯示與順序">
                  <div class="tab-header">
                    <el-checkbox
                      :indeterminate="isIndeterminate"
                      v-model="checkAll"
                      @change="handleCheckAllChange"
                    >
                      全選
                    </el-checkbox>
                    <el-tooltip content="拖拽調整列順序">
                      <span class="tip-text">
                        <i class="el-icon-rank"></i> 拖拽調整順序
                      </span>
                    </el-tooltip>
                  </div>

                  <div class="column-list-container custom-scrollbar">
                    <draggable
                      v-model="tempColumnOrder"
                      handle=".drag-handle"
                      @end="handleColumnOrderChange"
                      :animation="150"
                      :delay="50"
                      :delayOnTouchOnly="true"
                      :disabled="false"
                      :group="{ name: 'columns' }"
                      class="column-list"
                      ghost-class="ghost"
                      chosen-class="chosen"
                      drag-class="drag"
                    >
                      <div
                        v-for="col in tempColumnOrder"
                        :key="col.prop"
                        :class="[
                          'column-item',
                          {
                            'is-disabled': !tempVisibleColumns.includes(
                              col.prop
                            )
                          }
                        ]"
                      >
                        <div class="item-left">
                          <i class="el-icon-rank drag-handle"></i>
                          <el-checkbox
                            v-model="tempVisibleColumns"
                            :label="col.prop"
                            :disabled="isRequired(col)"
                          >
                            {{ col.label }}
                          </el-checkbox>
                        </div>
                        <el-tag
                          v-if="isRequired(col)"
                          size="mini"
                          effect="dark"
                          type="danger"
                        >
                          必須
                        </el-tag>
                      </div>
                    </draggable>
                  </div>
                </el-tab-pane>

                <!-- 固定列頁籤 -->
                <el-tab-pane name="fixed" label="固定列">
                  <div class="fixed-columns">
                    <div class="fixed-columns-header">
                      <div class="header-info">
                        <i class="el-icon-info"></i>
                        <span
                          >固定列會始終顯示在表格的左側或右側，適合放置重要信息</span
                        >
                      </div>
                    </div>

                    <div class="fixed-columns-content">
                      <div class="fixed-columns-list">
                        <div
                          v-for="col in tempColumnOrder"
                          :key="col.prop"
                          class="fixed-item"
                        >
                          <div class="item-content">
                            <div class="column-info">
                              <span class="column-label">{{ col.label }}</span>
                              <el-tag
                                v-if="isRequired(col)"
                                size="mini"
                                type="danger"
                                effect="plain"
                                >必填</el-tag
                              >
                            </div>

                            <el-radio-group
                              v-model="tempColumnFixed[col.prop]"
                              size="small"
                              @change="() => handleFixedChange(col.prop)"
                            >
                              <el-radio-button label="">
                                <i class="el-icon-minus"></i>
                                不固定
                              </el-radio-button>
                              <el-radio-button label="left">
                                <i class="el-icon-arrow-left"></i>
                                靠左
                              </el-radio-button>
                              <el-radio-button label="right">
                                <i class="el-icon-arrow-right"></i>
                                靠右
                              </el-radio-button>
                            </el-radio-group>
                          </div>

                          <div
                            v-if="tempColumnFixed[col.prop]"
                            class="fixed-hint"
                          >
                            <i class="el-icon-warning-outline"></i>
                            已固定在{{
                              tempColumnFixed[col.prop] === "left"
                                ? "左"
                                : "右"
                            }}側
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <el-button
              slot="reference"
              type="primary"
              plain
              size="small"
              class="setting-button"
            >
              <i class="el-icon-s-operation"></i>
              列設置
            </el-button>
          </el-popover>

          <!-- 導出按鈕 -->
          <el-button
            type="warning"
            plain
            size="small"
            :disabled="!selectedRows.length"
            @click="handleExport('selected-xlsx')"
          >
            <i class="el-icon-document"></i>
            匯出選中項為 Excel ({{ selectedRows.length }}項)
          </el-button>

          <el-button-group>
            <el-button
              type="success"
              plain
              size="small"
              @click="handleSelectAll(true)"
              :disabled="!data.length"
            >
              <i class="el-icon-check"></i>
              全選
            </el-button>
            <el-button
              type="success"
              plain
              size="small"
              @click="handleSelectAll(false)"
              :disabled="!selectedRows.length"
            >
              <i class="el-icon-close"></i>
              取消全選
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 表格主體 -->
    <div
      ref="tableWrapper"
      class="table-wrapper"
      :style="{ height: realHeight + 'px' }"
    >
      <el-table
        ref="table"
        v-loading="loading"
        :data="virtualData"
        :height="realHeight"
        :max-height="maxHeight"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @header-dragend="handleHeaderDragend"
        class="main-table"
        v-bind="$attrs"
        :key="tableKey"
        :row-style="getRowStyle"
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <!-- 選擇列 -->
        <el-table-column
          v-if="showSelectionColumn"
          type="selection"
          width="48"
          fixed="left"
          :selectable="checkSelectable"
          :reserve-selection="true"
          sortable="false"
        />

        <!-- 序號列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          width="60"
          label="序號"
          fixed="left"
          :index="calculateIndex"
        />

        <!-- 數據列 -->
        <el-table-column
          v-for="column in displayedColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="columnWidths[column.prop]"
          :min-width="column.minWidth || 80"
          :fixed="getColumnFixed(column)"
          :sortable="column.sortable"
          :show-overflow-tooltip="!column.isImage"
          :resizable="true"
          :align="column.align || 'left'"
        >
          <template slot="header" slot-scope="scope">
            <div class="table-header">
              {{ scope.column.label }}
              <el-tooltip
                v-if="column.tooltip"
                :content="column.tooltip"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </div>
          </template>

          <template slot-scope="scope">
            <!-- 圖片列的特殊處理 -->
            <template v-if="column.isImage">
              <el-image
                :src="scope.row[column.prop]"
                :preview-src-list="[scope.row[column.prop]]"
                fit="cover"
                :style="{
                  width: column.imageWidth || defaultImageConfig.width,
                  height: column.imageHeight || defaultImageConfig.height,
                  borderRadius: column.imageRadius || defaultImageConfig.radius
                }"
                @error="handleImageError"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </template>
            <!-- 自定義插槽 -->
            <slot
              v-else-if="$scopedSlots[`column-${column.prop}`]"
              :name="`column-${column.prop}`"
              :row="scope.row"
              :index="scope.$index"
            ></slot>
            <!-- 默認顯示 -->
            <template v-else>
              {{ formatColumnValue(scope.row, column) }}
            </template>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          v-if="showActionColumn"
          :fixed="actionFixed"
          :width="actionWidth"
          :label="actionLabel"
          align="center"
        >
          <template slot-scope="scope">
            <slot name="action" :row="scope.row" :index="scope.$index"></slot>
          </template>
        </el-table-column>

        <!-- 空數據 -->
        <template slot="empty">
          <slot name="empty">
            <el-empty :description="emptyText" :image-size="100"></el-empty>
          </slot>
        </template>
      </el-table>
    </div>

    <!-- 添加虛擬滾動佔位容器 -->
    <div
      v-if="showVirtualScroll"
      class="virtual-scroll-placeholder"
      :style="{ height: virtualListHeight + 'px' }"
    ></div>

    <!-- 分頁 -->
    <div class="pagination-wrapper" v-if="showPagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="totalCount"
        class="modern-pagination"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { debounce, throttle } from "lodash";
import Draggable from "vuedraggable";
import FileSaver from "file-saver";
import * as XLSX from "xlsx";

// 工具函數
const utils = {
  // 深度克隆
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);

    const clone = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = this.deepClone(obj[key]);
      }
    }
    return clone;
  },

  // 生成唯一ID
  generateId() {
    return (
      Math.random()
        .toString(36)
        .substring(2) + Date.now().toString(36)
    );
  },

  // 格式化日期
  formatDate(date, format = "YYYY-MM-DD") {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return format
      .replace("YYYY", year)
      .replace("MM", month)
      .replace("DD", day);
  }
};

export default {
  name: "BaseTable",

  components: {
    draggable: Draggable
  },

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
    // 表格高度
    height: [String, Number],
    maxHeight: [String, Number],
    // 是否顯示工具欄
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 是否顯示序號
    showIndex: {
      type: Boolean,
      default: false
    },
    // 是否可選擇
    showSelectionColumn: {
      type: Boolean,
      default: true
    },
    // 是否顯示邊框
    border: {
      type: Boolean,
      default: true
    },
    // 加載狀態
    loading: {
      type: Boolean,
      default: false
    },
    // 分頁相關
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 是否顯示操作欄
    showActionColumn: {
      type: Boolean,
      default: false
    },
    // 操作列配置
    actionFixed: {
      type: String,
      default: "right"
    },
    actionWidth: {
      type: [String, Number],
      default: 150
    },
    actionLabel: {
      type: String,
      default: "操作"
    },
    // 文件名
    filename: {
      type: String,
      default: "table-data"
    },
    // 空數據文本
    emptyText: {
      type: String,
      default: "暫無數據"
    },
    // 選擇限制函數
    checkSelectable: {
      type: Function,
      default: () => true
    },
    // 必選列
    requiredColumns: {
      type: Array,
      default: () => []
    },
    // 默認圖片配置
    defaultImageConfig: {
      type: Object,
      default: () => ({
        width: "50px",
        height: "50px",
        radius: "4px"
      })
    },
    // 虛擬滾動配置
    virtualScroll: {
      type: Boolean,
      default: false
    },
    // 每行高度
    rowHeight: {
      type: Number,
      default: 48
    },
    // 緩衝區大小
    buffer: {
      type: Number,
      default: 20
    },
    //隱藏欄位
    defaultHiddenColumns: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      // 分頁相關
      currentPage: 1,
      pageSize: 10,
      // 排序相關
      sortBy: "",
      sortOrder: "",
      // 選擇相關
      selectedRows: [],
      selectedRowKeys: new Set(),
      // 列設置相關
      columnSettingsVisible: false,
      activeSettingTab: "display",
      // 列狀態
      visibleColumns: [],
      columnOrder: [],
      columnFixed: {},
      columnWidths: {},
      originalColumnWidths: {}, // 原始列寬配置
      isDragging: false, // 是否正在拖拽
      // 臨時列設置
      tempVisibleColumns: [],
      tempColumnOrder: [],
      tempColumnFixed: {},
      tempColumnWidths: {},
      // 全選狀態
      checkAll: true,
      isIndeterminate: false,
      // 表格key，用於強制刷新
      tableKey: 0,
      // 響應式分頁布局
      paginationLayout: "total, sizes, prev, pager, next, jumper",
      // 虛擬滾動相關
      scrollTop: 0,
      clientHeight: 0,
      startIndex: 0,
      endIndex: 0,
      // 性能優化相關
      processedDataCache: null,
      lastProcessingKey: null,
      debouncedResize: null,
      throttledScroll: null
    };
  },

  computed: {
    // 實際表格高度
    realHeight() {
      if (typeof this.height === "number") {
        return this.height;
      }
      return this.clientHeight || 400;
    },

    // 是否顯示虛擬滾動
    showVirtualScroll() {
      return this.virtualScroll && this.data.length > 100;
    },

    // 可視區域行數
    visibleCount() {
      return Math.ceil(this.realHeight / this.rowHeight);
    },

    // 處理後的數據（帶緩存）
    processedData() {
      const processingKey = `${this.sortBy}-${this.sortOrder}-${JSON.stringify(
        this.data
      )}`;

      if (this.processedDataCache && this.lastProcessingKey === processingKey) {
        return this.processedDataCache;
      }

      let result = utils.deepClone(this.data);

      // 排序處理
      if (this.sortBy && this.sortOrder) {
        result = this.sortData(result);
      }

      this.processedDataCache = result;
      this.lastProcessingKey = processingKey;
      return result;
    },

    // 虛擬滾動數據
    virtualData() {
      if (!this.showVirtualScroll) {
        return this.paginatedData;
      }

      const start = Math.max(0, this.startIndex - this.buffer);
      const end = Math.min(
        this.processedData.length,
        this.endIndex + this.buffer
      );

      return this.processedData.slice(start, end);
    },

    // 分頁後的數據
    paginatedData() {
      if (!this.showPagination) {
        return this.processedData;
      }

      const start = (this.currentPage - 1) * this.pageSize;
      return this.processedData.slice(start, start + this.pageSize);
    },

    // 顯示的列
    displayedColumns() {
      return this.columnOrder
        .filter(col => this.visibleColumns.includes(col.prop))
        .map(col => ({
          ...col,
          width: this.columnWidths[col.prop] || col.width,
          fixed: this.getColumnFixed(col)
        }));
    },

    // 總數據量
    totalCount() {
      return this.data.length;
    },

    // 是否有未選中的行
    hasUnselectedRows() {
      return this.selectedRows.length < this.processedData.length;
    },

    // 虛擬列表高度
    virtualListHeight() {
      return this.data.length * this.rowHeight;
    }
  },

  watch: {
    columns: {
      handler(newColumns) {
        this.initializeColumnSettings();
        // 初始化列寬
        newColumns.forEach(col => {
          if (col.width && !this.columnWidths[col.prop]) {
            this.columnWidths[col.prop] = col.width;
            this.originalColumnWidths[col.prop] = col.width;
          }
        });
      },
      immediate: true
    },
    visibleColumns: {
      handler: "handleVisibleChange",
      deep: true
    },
    data: {
      handler(newVal) {
        this.processedDataCache = null;
        this.lastProcessingKey = null;
        this.handleDataChange(newVal);
      }
    },
    virtualScroll(newVal) {
      if (newVal) {
        this.$nextTick(this.initVirtualScroll);
      }
    }
  },

  created() {
    this.initialize();
    this.initializeColumnWidths();
  },

  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight();
      this.initVirtualScroll();
    });
  },

  beforeDestroy() {
    this.cleanup();
  },

  methods: {
    // 初始化方法
    initialize() {
      this.initializeColumnSettings();
      this.setupEventHandlers();
      this.loadLocalSettings();
    },

    // 設置事件處理器
    setupEventHandlers() {
      this.debouncedResize = debounce(this.handleResize, 200);
      this.throttledScroll = throttle(this.handleScroll, 16);
      window.addEventListener("resize", this.debouncedResize);
    },

    // 清理方法
    cleanup() {
      if (this.$refs.table) {
        const tableBody = this.$refs.table.$el.querySelector(
          ".el-table__body-wrapper"
        );
        if (tableBody) {
          tableBody.removeEventListener("scroll", this.throttledScroll);
        }
      }
      window.removeEventListener("resize", this.debouncedResize);
    },

    // 初始化虛擬滾動
    initVirtualScroll() {
      if (this.showVirtualScroll && this.$refs.table) {
        const tableBody = this.$refs.table.$el.querySelector(
          ".el-table__body-wrapper"
        );
        if (tableBody) {
          tableBody.addEventListener("scroll", this.throttledScroll);
          this.updateVirtualScroll();
        }
      }
    },

    // 更新表格高度
    updateTableHeight() {
      if (this.$refs.tableWrapper) {
        this.clientHeight = this.$refs.tableWrapper.clientHeight;
        this.$nextTick(() => {
          if (this.$refs.table) {
            this.$refs.table.doLayout();
          }
        });
      }
    },

    // 處理視窗大小改變
    handleResize() {
      this.updateTableHeight();
    },

    // 處理滾動事件
    handleScroll(e) {
      if (!this.showVirtualScroll) return;

      const { scrollTop } = e.target;
      this.scrollTop = scrollTop;
      this.updateVirtualScroll();
    },

    // 更新虛擬滾動狀態
    updateVirtualScroll() {
      if (!this.showVirtualScroll) return;

      const tableBody = this.$refs.table.$el.querySelector(
        ".el-table__body-wrapper"
      );
      if (!tableBody) return;

      const { scrollTop } = tableBody;
      const viewportHeight = tableBody.clientHeight;

      const startIndex = Math.floor(scrollTop / this.rowHeight);
      const visibleCount = Math.ceil(viewportHeight / this.rowHeight);
      const endIndex = Math.min(
        startIndex + visibleCount + this.buffer,
        this.data.length
      );

      this.startIndex = Math.max(0, startIndex - this.buffer);
      this.endIndex = endIndex;
    },

    // 初始化列寬
    initializeColumnWidths() {
      // 先加載保存的列寬
      this.loadColumnWidths();

      // 對於沒有寬度的列,設置默認寬度
      this.columns.forEach(col => {
        if (!this.columnWidths[col.prop]) {
          this.columnWidths[col.prop] = col.width || 120; // 默認寬度 120px
        }
      });
    },

    // 處理列寬拖拽結束
    handleHeaderDragend(newWidth, oldWidth, column) {
      const prop = column.property;
      if (!prop) return;

      // 更新列寬狀態
      this.columnWidths = {
        ...this.columnWidths,
        [prop]: newWidth
      };

      // 觸發列寬變化事件
      this.$emit("column-width-change", {
        prop,
        oldWidth,
        newWidth,
        column
      });

      // 保存到本地存儲
      this.saveColumnWidths();

      // 強制表格重新布局
      this.$nextTick(() => {
        if (this.$refs.table) {
          this.$refs.table.doLayout();
        }
      });
    },

    // 保存列寬到本地存儲
    saveColumnWidths() {
      try {
        const key = `table-column-widths-${this.$route.name}`;
        localStorage.setItem(key, JSON.stringify(this.columnWidths));
      } catch (error) {
        console.warn("Failed to save column widths:", error);
      }
    },

    // 從本地存儲加載列寬
    loadColumnWidths() {
      try {
        const key = `table-column-widths-${this.$route.name}`;
        const savedWidths = JSON.parse(localStorage.getItem(key));
        if (savedWidths) {
          this.columnWidths = {
            ...this.columnWidths,
            ...savedWidths
          };
        }
      } catch (error) {
        console.warn("Failed to load column widths:", error);
      }
    },

    // 重置列寬到原始配置
    resetColumnWidths() {
      this.columnWidths = { ...this.originalColumnWidths };
      this.saveColumnWidths();

      this.$nextTick(() => {
        if (this.$refs.table) {
          this.$refs.table.doLayout();
        }
      });
    },

    // 處理數據變化
    handleDataChange(newData) {
      if (this.showVirtualScroll) {
        this.$nextTick(() => {
          this.updateVirtualScroll();
        });
      }
      this.updateSelection(newData);
    },

    // 更新選中狀態
    updateSelection(newData) {
      if (!this.showSelectionColumn) return;

      const newSelectedRows = [];
      const newSelectedRowKeys = new Set();

      newData.forEach(row => {
        const key = this.getRowKey(row);
        if (this.selectedRowKeys.has(key)) {
          newSelectedRows.push(row);
          newSelectedRowKeys.add(key);
        }
      });

      this.selectedRows = newSelectedRows;
      this.selectedRowKeys = newSelectedRowKeys;
    },

    // 獲取行的唯一鍵
    getRowKey(row) {
      return row.id || utils.generateId();
    },

    // 計算行樣式
    getRowStyle(row, rowIndex) {
      if (this.showVirtualScroll) {
        const top = (this.startIndex + rowIndex) * this.rowHeight;
        return {
          height: `${this.rowHeight}px`,
          transform: `translateY(${top}px)`,
          position: "absolute",
          width: "100%",
          transition: "none"
        };
      }
      return {};
    },

    // 計算實際索引
    calculateIndex(index) {
      if (this.showVirtualScroll) {
        return this.startIndex - this.buffer + index + 1;
      }
      return index + 1;
    },

    // 優化的數據排序
    sortData(data) {
      const field = this.sortBy;
      const order = this.sortOrder;

      return data.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        // 處理空值
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return order === "ascending" ? -1 : 1;
        if (bVal == null) return order === "ascending" ? 1 : -1;

        // 數字比較
        if (typeof aVal === "number" && typeof bVal === "number") {
          return order === "ascending" ? aVal - bVal : bVal - aVal;
        }

        // 日期比較
        if (aVal instanceof Date && bVal instanceof Date) {
          return order === "ascending" ? aVal - bVal : bVal - aVal;
        }

        // 字符串比較
        const aStr = String(aVal);
        const bStr = String(bVal);
        return order === "ascending"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    },

    // 批量數據處理
    async processBatchData(data, batchSize = 1000) {
      const results = [];
      const totalLength = data.length;
      let processedCount = 0;

      try {
        while (processedCount < totalLength) {
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              const batch = data.slice(
                processedCount,
                processedCount + batchSize
              );

              const processedBatch = batch.map(item =>
                this.processDataItem(item)
              );
              results.push(...processedBatch);

              processedCount += batch.length;

              // 觸發進度事件
              this.$emit("batch-process-progress", {
                processed: processedCount,
                total: totalLength,
                percent: Math.round((processedCount / totalLength) * 100)
              });

              resolve();
            });
          });
        }

        return results;
      } catch (error) {
        console.error("Batch processing error:", error);
        throw error;
      }
    },

    // 數據項處理
    processDataItem(item) {
      const processed = { ...item };

      // 處理日期字段
      this.columns.forEach(column => {
        if (column.type === "date" && processed[column.prop]) {
          processed[column.prop] = utils.formatDate(
            processed[column.prop],
            column.format
          );
        }
      });

      return processed;
    },

    // 列設置相關方法
    initializeColumnSettings() {
      this.columnOrder = utils.deepClone(this.columns);

      this.visibleColumns = this.columns
        .filter(col => !this.defaultHiddenColumns.includes(col.prop))
        .map(col => col.prop);

      this.columns.forEach(col => {
        this.columnFixed[col.prop] = col.fixed || "";
        this.columnWidths[col.prop] = col.width || "";
      });

      this.resetTempSettings();
    },

    resetTempSettings() {
      this.tempColumnOrder = utils.deepClone(this.columnOrder);
      this.tempVisibleColumns = [...this.visibleColumns];
      this.tempColumnFixed = { ...this.columnFixed };
      this.tempColumnWidths = { ...this.columnWidths };
      this.handleVisibleChange();
    },

    // 列顯示變化處理
    handleVisibleChange() {
      const checkedCount = this.tempVisibleColumns.length;
      const totalCount = this.columns.length;
      this.checkAll = checkedCount === totalCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },

    // 全選變化處理
    handleCheckAllChange(val) {
      const requiredCols = this.columns
        .filter(col => this.isRequired(col))
        .map(col => col.prop);

      this.tempVisibleColumns = val
        ? this.columns.map(col => col.prop)
        : requiredCols;
    },

    // 列順序變更處理
    handleColumnOrderChange(evt) {
      if (!evt) return;

      const newOrder = [...this.tempColumnOrder];
      const movedItem = newOrder.splice(evt.oldIndex, 1)[0];
      newOrder.splice(evt.newIndex, 0, movedItem);
      this.tempColumnOrder = newOrder;

      this.$nextTick(() => {
        if (this.$refs.table) {
          this.$refs.table.doLayout();
        }
      });
    },

    // 固定列變更處理
    handleFixedChange(prop) {
      this.$nextTick(() => {
        if (this.$refs.table) {
          this.$refs.table.doLayout();
        }
      });
    },

    // 保存列設置
    saveColumnSettings() {
      this.columnOrder = utils.deepClone(this.tempColumnOrder);
      this.visibleColumns = [...this.tempVisibleColumns];
      this.columnFixed = { ...this.tempColumnFixed };
      this.columnWidths = { ...this.tempColumnWidths };

      this.saveLocalSettings();
      this.columnSettingsVisible = false;
      this.tableKey += 1;

      // 添加列寬的保存
      this.saveColumnWidths();

      this.$emit("column-settings-change", {
        order: this.columnOrder,
        visible: this.visibleColumns,
        fixed: this.columnFixed,
        widths: this.columnWidths
      });
    },

    // 保存本地設置
    saveLocalSettings() {
      try {
        const settings = {
          order: this.columnOrder.map(col => col.prop),
          visible: this.visibleColumns,
          fixed: this.columnFixed,
          widths: this.columnWidths
        };

        localStorage.setItem(
          `table-settings-${this.$route.name}`,
          JSON.stringify(settings)
        );
      } catch (error) {
        console.warn("Failed to save table settings:", error);
      }
    },

    // 加載本地設置
    loadLocalSettings() {
      try {
        const settings = JSON.parse(
          localStorage.getItem(`table-settings-${this.$route.name}`)
        );

        if (settings) {
          // 恢復列順序
          if (settings.order) {
            this.columnOrder = this.columns.sort((a, b) => {
              return (
                settings.order.indexOf(a.prop) - settings.order.indexOf(b.prop)
              );
            });
          }

          // 恢復可見列
          if (settings.visible) {
            this.visibleColumns = settings.visible;
          }

          // 恢復固定列
          if (settings.fixed) {
            this.columnFixed = settings.fixed;
          }

          // 恢復列寬
          if (settings.widths) {
            this.columnWidths = settings.widths;
          }

          this.resetTempSettings();
        }
      } catch (error) {
        console.warn("Failed to load table settings:", error);
      }
    },

    // 重置列設置
    resetColumnSettings() {
      this.initializeColumnSettings();
      localStorage.removeItem(`table-settings-${this.$route.name}`);
      this.$message.success("已重置列設置");
      this.tableKey += 1;
    },

    // 全選/取消全選
    handleSelectAll(isSelect) {
      if (this.$refs.table) {
        if (isSelect) {
          // 全選所有數據
          this.processedData.forEach(row => {
            if (this.checkSelectable(row)) {
              this.$refs.table.toggleRowSelection(row, true);
            }
          });

          // 更新選中狀態
          this.selectedRows = this.processedData.filter(row =>
            this.checkSelectable(row)
          );
          this.selectedRowKeys = new Set(
            this.selectedRows.map(row => this.getRowKey(row))
          );
        } else {
          // 取消全選
          this.$refs.table.clearSelection();
          this.selectedRows = [];
          this.selectedRowKeys.clear();
        }

        // 觸發選擇變更事件
        this.$emit("selection-change", this.selectedRows);
      }
    },

    // 工具方法
    getColumnFixed(column) {
      return this.columnFixed[column.prop] || column.fixed;
    },

    isRequired(column) {
      return this.requiredColumns.includes(column.prop);
    },

    formatColumnValue(row, column) {
      const value = row[column.prop];

      if (column.isImage) {
        return value;
      }

      if (column.formatter) {
        return column.formatter(value, row);
      }

      if (column.type === "date" && value) {
        return utils.formatDate(value, column.format);
      }

      return value;
    },

    // 事件處理方法
    handleSelectionChange(rows) {
      this.selectedRows = rows;
      this.selectedRowKeys = new Set(rows.map(row => this.getRowKey(row)));
      this.$emit("selection-change", rows);
    },

    handleSortChange({ prop, order }) {
      this.sortBy = prop;
      this.sortOrder = order;
      this.processedDataCache = null;
      this.$emit("sort-change", { prop, order });
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.$emit("size-change", val);
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      this.$emit("current-change", val);
    },

    // 匯出相關方法
    async handleExport() {
      if (!this.selectedRows.length) {
        this.$message.warning("請至少選擇一條數據");
        return;
      }

      try {
        this.loading = true;
        const fileName = `${this.filename}_${new Date().getTime()}`;

        // 處理選中的數據
        const processedData = await this.processBatchData(this.selectedRows);

        // 格式化導出數據
        const formattedData = processedData.map(row => {
          const newRow = {};
          this.displayedColumns.forEach(col => {
            newRow[col.label] = this.formatColumnValue(row, col);
          });
          return newRow;
        });

        // 導出為 Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

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
    },

    // 錯誤處理方法
    handleError(error, type = "error") {
      console.error(`${type} error:`, error);
      this.$message.error(error.message || "操作失敗");
    },

    // 圖片處理方法
    handleImageError(error, row, column) {
      console.warn("Image loading error:", error);
      this.$emit("image-error", { error, row, column });
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
// 顏色
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;

// 圓角與陰影
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
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
$font-weight-bold: 700;

// 行高
$line-height-tight: 1.2;
$line-height-base: 1.5;
$line-height-relaxed: 1.6;
$line-height-loose: 1.8;

// 字體族
$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif;
$font-family-heading: $font-family-base;

::v-deep .el-table .selection-column .caret-wrapper {
  display: none !important;
}

.data-table-wrapper {
  width: 100%;
  position: relative;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;

  // 工具欄樣式
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;

    .toolbar-settings {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      width: 100%;

      .toolbar-right {
        display: flex;
        gap: 8px;
        align-items: center;

        ::v-deep .el-button {
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
        }
      }

      ::v-deep .el-button {
        margin-left: 0;
      }
    }
  }

  // 表格容器
  .table-wrapper {
    position: relative;
    flex: 1;
    min-height: 400px;
    overflow: auto;
    border: 1px solid #ebeef5;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
  }
}

// 表格主體樣式
.main-table {
  ::v-deep {
    .el-table {
      font-size: 24px !important;

      // 啟用列拖動時的樣式
      .el-table__column-resize-proxy {
        position: absolute;
        left: 200px;
        top: 0;
        bottom: 0;
        width: 0;
        border-left: 1px solid #ebeef5;
        z-index: 10;
      }

      // 表頭拖動區域樣式
      th.el-table__cell {
        .el-table__column-resize-handle {
          position: absolute;
          right: -5px;
          top: 0;
          bottom: 0;
          width: 10px;
          cursor: col-resize;
        }
      }

      th {
        font-size: 24px !important;
        font-weight: $font-weight-semibold;
        background-color: #fafafa;
        padding: 16px 12px;
      }

      td {
        font-size: 24px !important;
        padding: 16px 12px;
      }

      .el-table__header-wrapper {
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .cell {
        font-size: 24px !important;
      }
    }

    // 圖片單元格樣式
    .el-image {
      display: inline-block;
      vertical-align: middle;

      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #f5f7fa;
        color: #909399;
        font-size: $font-size-base;
      }
    }
  }
}

// 列設置彈窗樣式
::v-deep .column-settings-popover {
  padding: 0;

  .el-popover__title {
    font-size: 20px;
  }
}

.column-settings {
  max-height: 80vh;
  overflow-y: auto;

  .settings-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .el-button {
        font-size: 16px;
        padding: 0;
      }
    }
  }

  .el-tabs__item {
    font-size: 16px;
    height: 40px;
    line-height: 40px;
  }

  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;

    .el-checkbox {
      font-size: 16px;
    }

    .tip-text {
      color: #909399;
      font-size: 14px;

      i {
        margin-right: 4px;
      }
    }
  }

  .column-list-container {
    padding: 8px 0;

    .column-list {
      .column-item {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s;
        cursor: move;

        &:hover {
          background-color: #f5f7fa;
        }

        &.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .drag-handle {
            color: #909399;
            cursor: move;
          }

          .el-checkbox {
            font-size: 16px;
          }
        }

        .el-tag {
          margin-left: 8px;
          font-size: 14px;
        }
      }
    }
  }

  // 拖曳時的樣式
  .ghost {
    opacity: 0.5;
    background: #c8ebfb !important;
  }

  .chosen {
    background: #e6f7ff !important;
  }

  // 固定列設置樣式
  .fixed-columns {
    padding: 16px;

    .fixed-columns-header {
      margin-bottom: 16px;

      .header-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #909399;
        font-size: 14px;

        i {
          font-size: 16px;
        }
      }
    }

    .fixed-columns-list {
      .fixed-item {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .column-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .column-label {
              font-size: 16px;
              font-weight: 500;
            }
          }

          .el-radio-group {
            .el-radio-button__inner {
              font-size: 14px;
              padding: 8px 12px;
            }
          }
        }

        .fixed-hint {
          color: #909399;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;

          i {
            font-size: 16px;
          }
        }
      }
    }
  }
}

// 分頁樣式
.pagination-wrapper {
  margin-top: 20px;

  ::v-deep .el-pagination {
    font-size: $font-size-base;

    .el-pagination__total,
    .el-pagination__jump {
      font-size: $font-size-base;
    }

    button {
      font-size: $font-size-base;
    }
  }
}

// 響應式樣式
@media screen and (max-width: 768px) {
  .data-table-wrapper {
    padding: 16px;

    .table-toolbar {
      ::v-deep .el-button {
        font-size: $font-size-base;
      }
    }

    .fixed-columns {
      .fixed-item {
        .column-label {
          font-size: $font-size-base;
        }
      }
    }
  }
}
</style>
