<template>
  <div class="warehouse-inventory">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h2>倉庫庫存管理</h2>
    </div>

    <!-- 儀表板組件 -->
    <DashboardMetrics
      :inventory-data="inventoryData"
      :history-data="historyData"
    />

    <div class="page-header">
      <h2>功能列</h2>
      <div class="action-buttons">
        <el-dropdown @command="handleCommand" trigger="click">
          <el-button type="primary">
            新增單據 <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="in">
              <i class="el-icon-plus text-success"></i> 入庫單
            </el-dropdown-item>
            <el-dropdown-item command="out">
              <i class="el-icon-minus text-danger"></i> 出庫單
            </el-dropdown-item>
            <el-dropdown-item command="revision">
              <i class="el-icon-edit text-info"></i> 調整單
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="success">
          品號管理
        </el-button>
        <el-button type="warning">
          類別管理
        </el-button>
        <el-button class="btn-teal">
          銷貨管理
        </el-button>
        <el-button class="btn-purple">
          銷貨預購管理
        </el-button>
        <el-button class="btn-orange">
          退貨管理
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 庫存列表 -->
        <el-tab-pane label="庫存列表" name="inventory">
          <div class="table-operations">
            <div class="operation-wrapper">
              <SearchBox
                v-model="searchQuery"
                placeholder="搜尋庫存..."
                :fields="inventorySearchFields"
                :show-fields="true"
                @field-change="handleSearchFieldChange"
              />
            </div>
          </div>
          <BaseTable
            :data="filteredInventoryData"
            :columns="inventoryColumns"
            :loading="loading"
            :filename="'inventory-export'"
            :show-action-column="true"
            :default-hidden-columns="[
              'createdBy',
              'createdAt',
              'updatedBy',
              'updatedAt'
            ]"
            border
          >
            <!-- 數量颜色提示 -->
            <template #column-quantity="{ row }">
              <span :class="{ 'text-danger': isLowStock(row) }">
                {{ row.quantity }}
              </span>
            </template>
            <!-- 類別顯示 -->
            <template #column-category="{ row }">
              <el-tag size="small">{{ row.category }}</el-tag>
            </template>
            <!-- 效期顯示 -->
            <template #column-expiryDate="{ row }">
              <span :class="{ 'text-warning': isNearExpiry(row) }">
                {{ row.expiryDate }}
              </span>
            </template>
            <!-- 狀態顯示 -->
            <template #column-state="{ row }">
              <el-tag :type="getStateType(row.state)" size="small">
                {{ row.state }}
              </el-tag>
            </template>
            <template #action="{ row }">
              <el-button
                size="mini"
                type="primary"
                @click="handleEdit('inventory', row)"
                >編輯</el-button
              >
              <el-button
                size="mini"
                type="success"
                @click="viewInventoryHistory(row)"
                icon="el-icon-tickets"
                circle
                title="查看庫存異動紀錄"
              ></el-button>
              <el-button
                size="mini"
                type="warning"
                @click="viewFieldHistory(row)"
                icon="el-icon-document"
                circle
                title="查看欄位異動紀錄"
              ></el-button>
            </template>
          </BaseTable>
        </el-tab-pane>

        <!-- 庫存異動紀錄 -->
        <el-tab-pane label="庫存異動紀錄" name="inventory-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  type="primary"
                  icon="el-icon-back"
                  @click="backToInventory('history')"
                  >返回庫存列表</el-button
                >
                <el-date-picker
                  v-model="inventoryDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="開始日期"
                  end-placeholder="結束日期"
                  @change="handleInventoryDateRangeChange"
                />
                <SearchBox
                  v-model="inventoryHistorySearchQuery"
                  placeholder="搜尋庫存異動..."
                  :fields="inventoryHistorySearchFields"
                  :show-fields="true"
                  @field-change="handleInventoryHistorySearchFieldChange"
                />
              </div>
            </div>
          </div>
          <BaseTable
            :data="filteredInventoryHistoryData"
            :columns="inventoryHistoryColumns"
            :loading="loading"
            :filename="'inventory-history-export'"
            :show-action-column="false"
            border
          >
            <!-- 異動類型顯示 -->
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
            <!-- 異動數量顯示 -->
            <template #column-quantity="{ row }">
              <span
                :class="{
                  'text-danger': row.quantity < 0,
                  'text-success': row.quantity > 0
                }"
              >
                {{ row.quantity > 0 ? "+" : "" }}{{ row.quantity }}
              </span>
            </template>
          </BaseTable>
        </el-tab-pane>

        <!-- 庫存列表異動紀錄 -->
        <el-tab-pane label="庫存列表異動紀錄" name="inventory-field-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  type="primary"
                  icon="el-icon-back"
                  @click="backToInventory('field')"
                  >返回庫存列表</el-button
                >
                <el-date-picker
                  v-model="inventoryFieldHistoryDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="開始日期"
                  end-placeholder="結束日期"
                  @change="handleInventoryFieldHistoryDateRangeChange"
                />
                <SearchBox
                  v-model="inventoryFieldHistorySearchQuery"
                  placeholder="搜尋欄位異動..."
                  :fields="inventoryFieldHistorySearchFields"
                  :show-fields="true"
                  @field-change="handleInventoryFieldHistorySearchFieldChange"
                />
              </div>
            </div>
          </div>
          <BaseTable
            :data="filteredInventoryFieldHistoryData"
            :columns="inventoryFieldHistoryColumns"
            :loading="loading"
            :filename="'inventory-field-history-export'"
            :show-action-column="false"
            border
          >
            <!-- 異動類型顯示 -->
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
            <!-- 異動欄位值對比 -->
            <template #column-beforeValue="{ row }">
              <span class="text-danger">{{ row.beforeValue }}</span>
            </template>
            <template #column-afterValue="{ row }">
              <span class="text-success">{{ row.afterValue }}</span>
            </template>
          </BaseTable>
        </el-tab-pane>

        <!-- 品號列表 -->
        <el-tab-pane label="品號列表" name="products">
          <div class="table-operations">
            <div class="operation-wrapper">
              <SearchBox
                v-model="productSearchQuery"
                placeholder="搜尋品號..."
                :fields="productSearchFields"
                :show-fields="true"
                @field-change="handleProductSearchFieldChange"
              />
            </div>
          </div>
          <BaseTable
            :data="filteredProductData"
            :columns="productColumns"
            :loading="loading"
            :filename="'products-export'"
            :show-action-column="true"
            :default-hidden-columns="[
              'createdBy',
              'createdAt',
              'updatedBy',
              'updatedAt'
            ]"
            border
          >
            <!-- 類別顯示 -->
            <template #column-category="{ row }">
              <el-tag size="small">{{ row.category }}</el-tag>
            </template>
            <template #column-originalPrice="{ row }">
              {{ formatPrice(row.originalPrice) }}
            </template>
            <template #action="{ row }">
              <el-button
                size="mini"
                type="primary"
                @click="handleEdit('product', row)"
                >編輯</el-button
              >
            </template>
          </BaseTable>
        </el-tab-pane>

        <!-- 品號異動記錄 -->
        <el-tab-pane label="品號異動記錄" name="product-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-date-picker
                  v-model="productDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="開始日期"
                  end-placeholder="結束日期"
                  @change="handleProductDateRangeChange"
                />
                <SearchBox
                  v-model="productHistorySearchQuery"
                  placeholder="搜尋品號異動..."
                  :fields="productHistorySearchFields"
                  :show-fields="true"
                  @field-change="handleProductHistorySearchFieldChange"
                />
              </div>
            </div>
          </div>
          <BaseTable
            :data="filteredProductHistoryData"
            :columns="productHistoryColumns"
            :loading="loading"
            :filename="'product-history-export'"
            :show-action-column="false"
            border
          >
            <!-- 異動類型顯示 -->
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
            <!-- 異動欄位值對比 -->
            <template #column-beforeValue="{ row }">
              <span class="text-danger">{{ row.beforeValue }}</span>
            </template>
            <template #column-afterValue="{ row }">
              <span class="text-success">{{ row.afterValue }}</span>
            </template>
          </BaseTable>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 編輯對話框 -->
    <StockListDialog
      :visible.sync="stockDialogVisible"
      :data="currentEditRow"
      @save="handleSaveStock"
    />
    <ProductCodeDialog
      :visible.sync="productDialogVisible"
      :data="currentEditRow"
      @save="handleSaveProduct"
    />

    <!-- 新增入庫單對話框 -->
    <StockInDialog
      :visible.sync="stockInDialogVisible"
      :product-data="productData"
      @submit="handleStockInSubmit"
    />

    <!-- 新增出庫單對話框 -->
    <StockOutDialog
      :visible.sync="stockOutDialogVisible"
      :inventory-data="inventoryData"
      @submit="handleStockOutSubmit"
    />
  </div>
</template>

<script>
import DashboardMetrics from "./components/DashboardMetrics.vue";
import StockListDialog from "./components/StockListDialog.vue";
import StockInDialog from "./components/StockInDialog.vue";
import StockOutDialog from "./components/StockOutDialog.vue";
import ProductCodeDialog from "../multiSku/components/ProductCodeDialog.vue";
import SearchBox from "@/components/SearchBox/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import { formatDate } from "@/utils/date";
import { inventoryColumns, searchFields } from "@/constants/tableColumns";
import { systemLogger, LOG_ACTIONS } from "@/utils/systemLogger";

export default {
  name: "WarehouseInventory",

  components: {
    DashboardMetrics,
    SearchBox,
    BaseTable,
    StockListDialog,
    ProductCodeDialog,
    StockInDialog,
    StockOutDialog
  },

  data() {
    return {
      activeTab: "inventory",
      loading: false,
      lastViewedRow: null, // 記錄上次查看的行數據
      lastScrollPosition: 0, // 記錄滾動位置

      stockDialogVisible: false,
      productDialogVisible: false,
      stockInDialogVisible: false,
      stockOutDialogVisible: false,
      stockRevisionDialogVisible: false,
      currentEditRow: null,

      // 搜索查詢
      productSearchQuery: "",
      searchQuery: "",
      inventoryHistorySearchQuery: "",
      productHistorySearchQuery: "",
      inventoryFieldHistorySearchQuery: "",

      // 搜索欄位
      productSearchField: "",
      searchField: "",
      inventoryHistorySearchField: "",
      productHistorySearchField: "",
      inventoryFieldHistorySearchField: "",

      // 日期範圍
      inventoryDateRange: null,
      productDateRange: null,
      inventoryFieldHistoryDateRange: null,

      // 資料
      productData: [],
      inventoryData: [],
      inventoryHistoryData: [],
      productHistoryData: [],
      inventoryFieldHistoryData: [],
      historyData: [],

      inventoryColumns: inventoryColumns.list,
      inventoryHistoryColumns: inventoryColumns.history,
      inventoryFieldHistoryColumns: inventoryColumns.fieldHistory,
      inventorySearchFields: searchFields.inventory,
      inventoryHistorySearchFields: searchFields.inventoryHistory,
      inventoryFieldHistorySearchFields: searchFields.inventoryFieldHistory,
      // 日期選擇器配置
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一週",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一個月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三個月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },

  computed: {
    // 過濾後的品號資料
    filteredProductData() {
      return this.filterData(
        this.productData,
        this.productSearchQuery,
        this.productSearchField
      );
    },

    // 過濾後的庫存資料
    filteredInventoryData() {
      return this.filterData(
        this.inventoryData,
        this.searchQuery,
        this.searchField
      );
    },

    // 過濾後的庫存異動記錄
    filteredInventoryHistoryData() {
      return this.filterDataWithDate(
        this.inventoryHistoryData,
        this.inventoryHistorySearchQuery,
        this.inventoryHistorySearchField,
        this.inventoryDateRange
      );
    },

    // 過濾後的庫存欄位異動記錄
    filteredInventoryFieldHistoryData() {
      return this.filterDataWithDate(
        this.inventoryFieldHistoryData,
        this.inventoryFieldHistorySearchQuery,
        this.inventoryFieldHistorySearchField,
        this.inventoryFieldHistoryDateRange
      );
    },

    // 過濾後的品號異動記錄
    filteredProductHistoryData() {
      return this.filterDataWithDate(
        this.productHistoryData,
        this.productHistorySearchQuery,
        this.productHistorySearchField,
        this.productDateRange
      );
    }
  },

  created() {
    this.initData();
  },

  methods: {
    // 初始化數據
    async initData() {
      try {
        this.loading = true;
        await this.loadMockData();
      } catch (error) {
        console.error("加載數據失敗:", error);
        this.$message.error("加載數據失敗");
      } finally {
        this.loading = false;
      }
    },

    // 加載模擬數據
    async loadMockData() {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 品號列表測試數據
      this.productData = [
        {
          // 原有欄位
          productCode: "P001",
          productName: "測試商品1",
          category: "智能手機",
          specification: "規格A",
          unit: "個",
          boxSize: 10,
          originalPrice: 25000,
          status: true,
          createdBy: "admin",
          createdAt: "2024-01-01 09:00:00",
          updatedBy: "admin",
          updatedAt: "2024-01-01 09:00:00",
          remark: "測試備註"
        },
        {
          // 原有欄位
          productCode: "P002",
          productName: "測試商品2",
          category: "智能手機",
          specification: "規格A",
          unit: "個",
          boxSize: 10,
          originalPrice: 25000,
          status: true,
          createdBy: "admin",
          createdAt: "2024-01-01 09:00:00",
          updatedBy: "admin",
          updatedAt: "2024-01-01 09:00:00",
          remark: "測試備註"
        }
      ];

      // 庫存列表測試數據
      this.inventoryData = [
        {
          productCode: "P001",
          productName: "測試商品1",
          category: "食品",
          batchNumber: "B001",
          state: "上架中",
          quantity: 100,
          boxCount: 10,
          originalPrice: 1000,
          safetyStock: 50,
          expiryDate: "2024-12-31",
          createdBy: "admin",
          createdAt: "2024-01-01 09:00:00",
          updatedBy: "admin",
          updatedAt: "2024-01-01 09:00:00"
        },
        {
          productCode: "P001",
          productName: "測試商品1",
          category: "食品",
          batchNumber: "B002",
          state: "上架中",
          quantity: 100,
          boxCount: 10,
          originalPrice: 1000,
          safetyStock: 50,
          expiryDate: "2024-12-31",
          createdBy: "admin",
          createdAt: "2024-01-01 09:00:00",
          updatedBy: "admin",
          updatedAt: "2024-01-01 09:00:00"
        }
      ];

      // 庫存異動記錄測試數據
      this.inventoryHistoryData = [
        {
          number: "IN2024010100001",
          datetime: "2024-01-01 09:00:00",
          type: "in",
          productCode: "P001",
          batchNumber: "B001",
          quantity: 100,
          boxCount: 10,
          beforeQty: 0,
          afterQty: 100,
          operator: "admin",
          remark: "初始入庫"
        },
        {
          number: "IN2024010100002",
          datetime: "2024-01-01 09:00:00",
          type: "in",
          productCode: "P001",
          batchNumber: "B002",
          quantity: 100,
          boxCount: 10,
          beforeQty: 0,
          afterQty: 100,
          operator: "admin",
          remark: "初始入庫"
        }
      ];

      // 庫存欄位異動記錄測試數據
      this.inventoryFieldHistoryData = [
        {
          datetime: "2024-01-01 09:30:00",
          type: "update",
          productCode: "P001",
          batchNumber: "B001",
          field: "safetyStock",
          beforeValue: "30",
          afterValue: "50",
          operator: "admin",
          remark: "調整安全存量"
        }
      ];

      // 品號異動記錄測試數據
      this.productHistoryData = [
        {
          datetime: "2024-01-01 08:00:00",
          type: "create",
          productCode: "P001",
          productName: "測試商品1",
          field: "productName",
          beforeValue: "",
          afterValue: "測試商品1",
          operator: "admin",
          remark: "新增品號"
        }
      ];
    },

    // 處理下拉選單命令
    handleCommand(command) {
      console.log("選擇的命令:", command);
      // 根據不同命令執行相應操作
      switch (command) {
        case "in":
          this.stockInDialogVisible = true; // 顯示入庫單對話框
          // 處理入庫單
          break;
        case "out":
          this.stockOutDialogVisible = true; // 顯示出庫單對話框
          // 處理出庫單
          break;
        case "revision":
          this.stockRevisionDialogVisible = true; // 顯示調整單對話框
          // 處理調整單
          break;
      }
    },

    // 搜索欄位變更處理
    handleProductSearchFieldChange(field) {
      this.productSearchField = field;
    },

    handleSearchFieldChange(field) {
      this.searchField = field;
    },

    handleInventoryHistorySearchFieldChange(field) {
      this.inventoryHistorySearchField = field;
    },

    handleInventoryFieldHistorySearchFieldChange(field) {
      this.inventoryFieldHistorySearchField = field;
    },

    handleProductHistorySearchFieldChange(field) {
      this.productHistorySearchField = field;
    },

    // 日期範圍變更處理
    handleInventoryDateRangeChange(range) {
      this.inventoryDateRange = range;
    },

    handleInventoryFieldHistoryDateRangeChange(range) {
      this.inventoryFieldHistoryDateRange = range;
    },

    handleProductDateRangeChange(range) {
      this.productDateRange = range;
    },

    // 數據過濾方法
    filterData(data, query, field) {
      if (!query) return data;
      return data.filter(item => this.matchesSearch(item, query, field));
    },

    filterDataWithDate(data, query, field, dateRange) {
      let filtered = data;

      // 日期過濾
      if (dateRange) {
        const [startDate, endDate] = dateRange;
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        filtered = filtered.filter(record => {
          const recordDate = new Date(record.datetime);
          return recordDate >= new Date(startDate) && recordDate <= endDateTime;
        });
      }

      // 關鍵字過濾
      return this.filterData(filtered, query, field);
    },

    matchesSearch(item, query, field) {
      if (!query) return true;
      if (!field) {
        // 全欄位搜索
        return Object.values(item).some(
          val =>
            val &&
            String(val)
              .toLowerCase()
              .includes(query.toLowerCase())
        );
      }
      // 特定欄位搜索
      const value = item[field];
      return (
        value &&
        String(value)
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    },

    // 處理保存
    handleSaveStock(data) {
      try {
        // 在這裡處理保存邏輯
        const index = this.inventoryData.findIndex(
          item => item.productCode === data.productCode
        );
        if (index !== -1) {
          const oldData = { ...this.inventoryData[index] };
          const newData = { ...data };

          // 更新庫存數據
          this.inventoryData[index] = newData;

          // 記錄修改的欄位到庫存列表異動紀錄
          const changes = this.getDataChanges(oldData, newData);
          changes.forEach(change => {
            this.inventoryFieldHistoryData.unshift({
              datetime: new Date().toISOString(),
              type: "update",
              productCode: data.productCode,
              batchNumber: data.batchNumber,
              field: change.field,
              beforeValue: change.oldValue,
              afterValue: change.newValue,
              operator: "admin", // 實際應該從登入用戶獲取
              remark: "修改庫存資料"
            });
          });

          this.$message.success("保存成功");
        }
      } catch (error) {
        console.error("保存失敗:", error);
        this.$message.error("保存失敗");
      }
    },

    handleSaveProduct(data) {
      try {
        // 尋找是否存在該品號
        const index = this.productData.findIndex(
          item => item.productCode === data.productCode
        );

        if (index !== -1) {
          // 更新現有品號
          const oldData = { ...this.productData[index] };
          this.productData[index] = { ...data };

          // 記錄修改到品號異動記錄
          this.productHistoryData.unshift({
            datetime: new Date().toISOString(),
            type: "update",
            productCode: data.productCode,
            field: "all",
            beforeValue: JSON.stringify(oldData),
            afterValue: JSON.stringify(data),
            operator: "admin", // 實際應該從登入用戶獲取
            remark: "修改品號資料"
          });
        } else {
          // 新增品號
          this.productData.push({ ...data });

          // 記錄新增到品號異動記錄
          this.productHistoryData.unshift({
            datetime: new Date().toISOString(),
            type: "create",
            productCode: data.productCode,
            field: "all",
            beforeValue: "",
            afterValue: JSON.stringify(data),
            operator: "admin",
            remark: "新增品號"
          });
        }

        this.$message.success("保存成功");
      } catch (error) {
        console.error("保存失敗:", error);
        this.$message.error("保存失敗");
      }
    },

    // 處理入庫單提交
    handleStockInSubmit(data) {
      this.$message.success(data);
    },

    handleStockOutSubmit(data) {
      this.$message.success(data);
    },

    // 比較數據變化
    getDataChanges(oldData, newData) {
      const changes = [];
      const excludeFields = ["updatedAt"]; // 不需要記錄的欄位

      Object.keys(newData).forEach(key => {
        if (!excludeFields.includes(key) && oldData[key] !== newData[key]) {
          changes.push({
            field: key,
            oldValue: oldData[key],
            newValue: newData[key]
          });
        }
      });

      return changes;
    },

    // 處理編輯
    handleEdit(type, row) {
      if (type === "inventory") {
        this.currentEditRow = { ...row }; // 複製一份數據
        this.stockDialogVisible = true;
      } else if (type === "product") {
        this.currentEditRow = { ...row }; // 複製一份數據
        this.productDialogVisible = true;
      } else {
        // 其他類型的編輯操作
        this.$emit("edit", { type, data: row });
      }
    },

    // 處理刪除
    handleDelete(type, row) {
      this.$confirm("確認要刪除此記錄嗎？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 根據不同類型處理刪除
          switch (type) {
            case "inventory":
              const index = this.inventoryData.findIndex(
                item =>
                  item.productCode === row.productCode &&
                  item.batchNumber === row.batchNumber
              );
              if (index !== -1) {
                // 記錄刪除操作到異動記錄
                this.inventoryFieldHistoryData.unshift({
                  datetime: new Date().toISOString(),
                  type: "delete",
                  productCode: row.productCode,
                  batchNumber: row.batchNumber,
                  field: "all",
                  beforeValue: JSON.stringify(row),
                  afterValue: "",
                  operator: "admin",
                  remark: "刪除庫存資料"
                });
                this.inventoryData.splice(index, 1);
              }
              break;
            default:
              // 其他類型的刪除操作
              this.$emit("delete", { type, data: row });
          }
          this.$message.success("刪除成功");
        })
        .catch(() => {
          this.$message.info("已取消刪除");
        });
    },

    // 查看庫存異動紀錄
    viewInventoryHistory(row) {
      // 保存當前行數據和滾動位置
      this.lastViewedRow = row;
      this.lastScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      // 切換到庫存異動紀錄頁籤
      this.activeTab = "inventory-history";
      // 設置搜索條件
      this.inventoryDateRange = null;
      this.inventoryHistorySearchQuery = row.batchNumber;
      this.inventoryHistorySearchField = "batchNumber";
    },

    // 查看欄位異動紀錄
    viewFieldHistory(row) {
      // 保存當前行數據和滾動位置
      this.lastViewedRow = row;
      this.lastScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      // 切換到庫存列表異動紀錄頁籤
      this.activeTab = "inventory-field-history";
      // 設置搜索條件
      this.inventoryFieldHistoryDateRange = null;
      this.inventoryFieldHistorySearchQuery = row.batchNumber;
      this.inventoryFieldHistorySearchField = "batchNumber";
    },

    // 返回庫存列表
    backToInventory(type) {
      // 切換到庫存列表頁籤
      this.activeTab = "inventory";

      // 清空搜索條件
      if (type === "history") {
        this.inventoryDateRange = null;
        this.inventoryHistorySearchQuery = "";
      } else if (type === "field") {
        this.inventoryFieldHistoryDateRange = null;
        this.inventoryFieldHistorySearchQuery = "";
      }

      // 等待 DOM 更新後執行滾動
      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.inventoryTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.productCode &&
                cells[3].textContent === this.lastViewedRow.batchNumber
              ) {
                // 滾動到目標行
                rows[i].scrollIntoView({ behavior: "smooth", block: "center" });

                // 添加高亮效果
                rows[i].classList.add("highlight-row");
                setTimeout(() => {
                  rows[i].classList.remove("highlight-row");
                }, 2000);

                break;
              }
            }
          }
        }
      });
    },

    // 取得狀態樣式
    getStateType(state) {
      const types = {
        上架中: "success",
        待上架: "warning"
      };
      return types[state] || "info";
    },

    // 判斷庫存是否過低
    isLowStock(row) {
      return row.quantity <= (row.safetyStock || 0);
    },

    // 判斷是否接近效期
    isNearExpiry(row) {
      if (!row.expiryDate) return false;
      const expiryDate = new Date(row.expiryDate);
      const today = new Date();
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // 30天內視為接近效期
    },

    // 取得異動類型標籤樣式
    getTypeTag(type) {
      const tags = {
        in: "success",
        out: "danger",
        preorder: "info",
        sales: "warning",
        return: "primary",
        create: "success",
        update: "warning",
        delete: "danger",
        revision: "warning"
      };
      return tags[type] || "";
    },

    // 取得異動類型顯示文字
    getTypeLabel(type) {
      const labels = {
        in: "入庫",
        out: "出庫",
        preorder: "預購",
        sales: "銷貨",
        return: "退貨",
        create: "新增",
        update: "修改",
        delete: "刪除",
        revision: "調整"
      };
      return labels[type] || type;
    },

    // 格式化價格顯示
    formatPrice(originalPrice) {
      if (!originalPrice && originalPrice !== 0) return "-"; // 增加空值處理
      return `NT$ ${originalPrice.toLocaleString()}`;
    },

    formatDate(date, format) {
      return formatDate(date, format);
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

.warehouse-inventory {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .btn-orange {
    background-color: #ff7d1a !important;
    border-color: #ff7d1a !important;
    color: white !important;
    &:hover {
      background-color: #ff9347 !important;
      border-color: #ff9347 !important;
    }
  }

  .btn-purple {
    background-color: #8e44ad !important;
    border-color: #8e44ad !important;
    color: white !important;
    &:hover {
      background-color: #9b59b6 !important;
      border-color: #9b59b6 !important;
    }
  }

  .btn-teal {
    background-color: #20b2aa !important;
    border-color: #20b2aa !important;
    color: white !important;
    &:hover {
      background-color: #48d1cc !important;
      border-color: #48d1cc !important;
    }
  }

  // 添加返回按鈕樣式
  .el-button.el-icon-back {
    margin-right: 16px;
  }

  // 搜索過濾器容器樣式調整
  .search-filters {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  // 頁面標題區域
  .page-header {
    background: white;
    padding: 24px;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 3px;
        background: $primary-color;
        border-radius: 2px;
      }
    }

    .action-buttons {
      .el-button {
        height: 40px;
        padding: 0 24px;
        border-radius: $border-radius;
        transition: $transition;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .page {
    padding-top: 24px;
    border-radius: $border-radius;
  }

  // 表格區域樣式
  .el-tabs {
    background: white;
    border-radius: $border-radius;
    box-shadow: $box-shadow;

    .el-tabs__header {
      margin: 0;
      padding: 16px 16px 0;
    }

    .el-tabs__content {
      padding: 24px;
    }
  }

  // 表格操作區
  .table-operations {
    margin-bottom: 24px;

    .operation-wrapper {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding: 24px;
      background: white;
      border-radius: $border-radius;
      box-shadow: $box-shadow;

      .search-filters {
        flex: 1;
        display: flex;
        gap: 16px;

        .el-date-picker {
          max-width: 320px;
        }
      }
    }
  }

  // 表格樣式優化
  .el-table {
    border-radius: $border-radius;
    overflow: hidden;

    th {
      background: #f9fafb !important;
      font-weight: 600;
    }

    td {
      padding: 16px 12px;
    }

    .cell {
      line-height: 1.5;
    }
  }

  // 狀態標籤
  .el-tag {
    border-radius: 4px;
    padding: 4px 8px;

    &--success {
      background: rgba($success-color, 0.1);
    }
    &--warning {
      background: rgba($warning-color, 0.1);
    }
    &--danger {
      background: rgba($danger-color, 0.1);
    }
  }

  // 文字顏色類
  .text-success {
    color: $success-color;
  }
  .text-danger {
    color: $danger-color;
  }
  .text-warning {
    color: $warning-color;
  }
  .text-info {
    color: #909399;
  }
  .text-primary {
    color: $primary-color;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .warehouse-inventory {
    padding: 16px;

    .page-header {
      padding: 16px;
      flex-direction: column;
      gap: 16px;

      h2 {
        font-size: 20px;
      }

      .action-buttons {
        width: 100%;

        .el-dropdown {
          display: block;
          width: 100%;

          .el-button {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }

    .dashboard-metrics {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .table-operations {
      .operation-wrapper {
        flex-direction: column;
        gap: 12px;

        .search-filters {
          flex-direction: column;

          .el-date-picker {
            max-width: 100%;
          }
        }
      }
    }

    .el-tabs__content {
      padding: 16px;
    }

    // 移動端表格滾動
    .el-table {
      width: 100%;
      overflow-x: auto;

      &::before {
        display: none;
      }

      .el-table__body-wrapper {
        overflow-x: auto;
      }
    }
  }
}

// 動畫效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
