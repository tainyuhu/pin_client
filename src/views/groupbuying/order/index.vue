<!-- views/groupbuying/order/index.vue -->
<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="filter-container">
      <div class="filter-header">
        <div class="left">
          <h2 class="page-title">訂單管理</h2>
          <el-tag v-if="total" type="info">共 {{ total }} 筆</el-tag>
        </div>
        <div class="header-buttons">
          <el-button
            type="primary"
            icon="el-icon-download"
            :loading="exporting"
            @click="handleExport"
          >
            匯出訂單
          </el-button>
          <el-button
            type="primary"
            icon="el-icon-edit"
            :disabled="!selectedOrders.length"
            @click="handleBatchUpdate"
          >
            批量更新
          </el-button>
        </div>
      </div>

      <el-form
        ref="searchForm"
        :model="searchForm"
        :inline="true"
        class="filter-form"
      >
        <!-- 基本搜尋 -->
        <el-row :gutter="16">
          <el-col :md="6">
            <el-input
              v-model.trim="searchForm.orderId"
              placeholder="訂單編號"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-col>
          <el-col :md="6">
            <el-input
              v-model.trim="searchForm.activityName"
              placeholder="活動名稱"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-col>
          <el-col :md="6">
            <el-input
              v-model.trim="searchForm.customerName"
              placeholder="訂購人"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-col>
          <el-col :md="6">
            <el-input
              v-model.trim="searchForm.productName"
              placeholder="商品名稱"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-col>
        </el-row>

        <!-- 狀態篩選 -->
        <el-row :gutter="16" class="mt-3">
          <el-col :md="6">
            <el-select
              v-model="searchForm.paymentStatus"
              placeholder="付款狀態"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="(status, key) in paymentStatusOptions"
                :key="key"
                :label="status.label"
                :value="key"
              >
                <el-tag :type="status.type" size="small">
                  {{ status.label }}
                </el-tag>
              </el-option>
            </el-select>
          </el-col>
          <el-col :md="6">
            <el-select
              v-model="searchForm.pickupMethod"
              placeholder="取貨方式"
              clearable
              style="width: 100%"
            >
              <el-option label="公司取貨" value="company" />
              <el-option label="地址取貨" value="address" />
            </el-select>
          </el-col>
          <el-col :md="6">
            <el-date-picker
              v-model="searchForm.orderTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="下單開始日期"
              end-placeholder="下單結束日期"
              style="width: 100%"
            />
          </el-col>
          <el-col :md="6">
            <el-date-picker
              v-model="searchForm.paymentTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="付款開始日期"
              end-placeholder="付款結束日期"
              style="width: 100%"
            />
          </el-col>
        </el-row>

        <!-- 金額範圍 -->
        <el-row :gutter="16" class="mt-3">
          <el-col :md="6">
            <el-input-number
              v-model="searchForm.minAmount"
              placeholder="最小金額"
              :min="0"
              style="width: 100%"
            />
          </el-col>
          <el-col :md="6">
            <el-input-number
              v-model="searchForm.maxAmount"
              placeholder="最大金額"
              :min="0"
              style="width: 100%"
            />
          </el-col>
          <el-col :md="12">
            <div class="filter-buttons">
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="handleSearch"
              >
                搜尋
              </el-button>
              <el-button @click="resetSearch">重置</el-button>
              <el-button
                type="text"
                @click="showAdvancedSearch = !showAdvancedSearch"
              >
                {{ showAdvancedSearch ? "收起" : "展開" }}進階搜尋
                <i
                  :class="
                    showAdvancedSearch
                      ? 'el-icon-arrow-up'
                      : 'el-icon-arrow-down'
                  "
                />
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 列表區域 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="訂單編號" width="180" prop="orderId" />
        <el-table-column label="活動名稱" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewActivity(row)">
              {{ row.activityName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="訂購人" width="120" prop="customerName" />
        <el-table-column label="付款狀態" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="paymentStatusOptions[row.paymentStatus].type">
              {{ paymentStatusOptions[row.paymentStatus].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="付款期限" width="180" align="center">
          <template #default="{ row }">
            <div v-if="row.paymentStatus === 'unpaid'">
              <countdown :time="row.paymentDeadline" />
            </div>
            <span v-else>{{ row.paymentTime || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="訂單金額" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="取貨方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{ row.pickupMethod === "company" ? "公司取貨" : "地址取貨" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="建立時間"
          width="180"
          align="center"
          prop="createTime"
        />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="查看詳情" placement="top" :hide-after="300">
                <el-button
                  type="primary"
                  icon="el-icon-view"
                  circle
                  size="mini"
                  @click="handleView(row)"
                />
              </el-tooltip>
              <el-tooltip content="編輯訂單" placement="top" :hide-after="300">
                <el-button
                  type="warning"
                  icon="el-icon-edit"
                  circle
                  size="mini"
                  @click="handleEdit(row)"
                />
              </el-tooltip>
              <el-tooltip content="備註" placement="top" :hide-after="300">
                <el-button
                  type="info"
                  icon="el-icon-notebook-2"
                  circle
                  size="mini"
                  :class="{ 'has-notes': row.hasNotes }"
                  @click="handleNotes(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 各種對話框組件 -->
    <OrderDetailDialog
      v-model="detailDialog.visible"
      :order-data="detailDialog.data"
    />
    <OrderEditDialog
      v-model="editDialog.visible"
      :order-data="editDialog.data"
      @success="handleEditSuccess"
    />
    <BatchUpdateDialog
      v-model="batchDialog.visible"
      :selected-orders="selectedOrders"
      @success="handleBatchSuccess"
    />
    <NotesDialog
      v-model="notesDialog.visible"
      :order-data="notesDialog.data"
      @success="handleNotesSuccess"
    />
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import { formatCurrency } from "@/utils/format";
import OrderDetailDialog from "../components/OrderDetailDialog.vue";
import OrderEditDialog from "../components/OrderEditDialog.vue";
import BatchUpdateDialog from "../components/BatchUpdateDialog.vue";
import NotesDialog from "../components/NotesDialog.vue";
import Countdown from "../components/Countdown.vue";

export default {
  name: "OrderManagement",

  components: {
    Pagination,
    OrderDetailDialog,
    OrderEditDialog,
    BatchUpdateDialog,
    NotesDialog,
    Countdown
  },

  data() {
    return {
      loading: false,
      exporting: false,
      total: 0,
      showAdvancedSearch: false,
      selectedOrders: [],

      // 查詢條件
      searchForm: {
        orderId: "",
        activityName: "",
        customerName: "",
        productName: "",
        paymentStatus: "",
        pickupMethod: "",
        orderTimeRange: null,
        paymentTimeRange: null,
        minAmount: null,
        maxAmount: null
      },

      // 分頁參數
      listQuery: {
        page: 1,
        limit: 10
      },

      // 付款狀態選項
      paymentStatusOptions: {
        unpaid: { label: "待付款", type: "warning" },
        confirming: { label: "付款確認中", type: "info" },
        completed: { label: "付款完成", type: "success" },
        overdue: { label: "付款逾期", type: "danger" },
        refunding: { label: "退款中", type: "warning" },
        refunded: { label: "已退款", type: "info" },
        cancelled: { label: "已取消", type: "danger" }
      },

      // 表格資料
      tableData: [],

      // 對話框控制
      detailDialog: {
        visible: false,
        data: null
      },
      editDialog: {
        visible: false,
        data: null
      },
      batchDialog: {
        visible: false
      },
      notesDialog: {
        visible: false,
        data: null
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    formatCurrency,

    // 獲取列表數據
    async getList() {
      this.loading = true;
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));

        this.tableData = Array(10)
          .fill()
          .map((_, index) => ({
            id: index + 1,
            orderId: `ORD${String(index + 1).padStart(6, "0")}`,
            activityName: `${
              ["春季", "夏季", "週年慶", "聖誕節"][
                Math.floor(Math.random() * 4)
              ]
            }團購活動`,
            customerName: `${
              ["王", "李", "張", "陳"][Math.floor(Math.random() * 4)]
            }${
              ["小明", "小華", "小美", "小芬"][Math.floor(Math.random() * 4)]
            }`,
            paymentStatus: Object.keys(this.paymentStatusOptions)[
              Math.floor(Math.random() * 7)
            ],
            paymentDeadline: Date.now() + Math.floor(Math.random() * 172800000), // 48小時內
            paymentTime:
              Math.random() > 0.5 ? new Date().toLocaleString() : null,
            totalAmount: Math.floor(Math.random() * 10000) + 1000,
            pickupMethod: Math.random() > 0.5 ? "company" : "address",
            createTime: new Date(
              Date.now() - Math.floor(Math.random() * 864000000)
            ).toLocaleString(), // 10天內
            hasNotes: Math.random() > 0.7,
            // 詳細資訊
            orderDetail: {
              products: [
                {
                  name: "商品A",
                  specification: "規格A",
                  price: 1000,
                  quantity: 2
                },
                {
                  name: "商品B",
                  specification: "規格B",
                  price: 500,
                  quantity: 1
                }
              ],
              contactInfo: {
                phone: "0912345678",
                email: "example@email.com",
                address: "台北市信義區信義路五段100號"
              },
              paymentInfo: {
                method: "銀行轉帳",
                account: "012345678912345",
                bankCode: "007",
                amount: 2500
              },
              notes: Math.random() > 0.7 ? "這是一個備註..." : null
            }
          }));

        this.total = 100;
      } catch (error) {
        console.error("Failed to get list:", error);
        this.$message.error("獲取列表失敗");
      } finally {
        this.loading = false;
      }
    },

    // 搜尋相關方法
    handleSearch() {
      this.listQuery.page = 1;
      this.getList();
    },

    resetSearch() {
      this.searchForm = {
        orderId: "",
        activityName: "",
        customerName: "",
        productName: "",
        paymentStatus: "",
        pickupMethod: "",
        orderTimeRange: null,
        paymentTimeRange: null,
        minAmount: null,
        maxAmount: null
      };
      this.listQuery.page = 1;
      this.getList();
    },

    // 表格選擇相關
    handleSelectionChange(selection) {
      this.selectedOrders = selection;
    },

    // 操作相關方法
    handleView(row) {
      this.detailDialog.data = row;
      this.detailDialog.visible = true;
    },

    handleViewActivity(row) {
      // 跳轉到活動詳情頁
      this.$router.push(`/groupbuying/view/${row.activityId}`);
    },

    handleEdit(row) {
      this.editDialog.data = row;
      this.editDialog.visible = true;
    },

    handleNotes(row) {
      this.notesDialog.data = row;
      this.notesDialog.visible = true;
    },

    handleBatchUpdate() {
      if (!this.selectedOrders.length) {
        this.$message.warning("請先選擇訂單");
        return;
      }
      this.batchDialog.visible = true;
    },

    // 各種操作成功後的處理
    handleEditSuccess() {
      this.$message.success("更新成功");
      this.editDialog.visible = false;
      this.getList();
    },

    handleBatchSuccess() {
      this.$message.success("批量更新成功");
      this.batchDialog.visible = false;
      this.getList();
    },

    handleNotesSuccess() {
      this.$message.success("備註已更新");
      this.notesDialog.visible = false;
      this.getList();
    },

    // 匯出功能
    async handleExport() {
      this.exporting = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.$message.success("匯出成功");
      } catch (error) {
        this.$message.error("匯出失敗");
      } finally {
        this.exporting = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  .filter-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;

    .filter-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        display: flex;
        align-items: center;
        gap: 12px;

        .page-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2f3d;
        }
      }

      .header-buttons {
        display: flex;
        gap: 12px;
      }
    }

    .filter-form {
      padding: 24px;

      .mt-3 {
        margin-top: 16px;
      }

      .filter-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    }
  }

  .table-container {
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .el-table {
      .el-link {
        font-weight: 500;
      }

      .el-tag {
        margin: 0 4px;
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;

      .el-button {
        &.has-notes {
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }
  }

  .pagination-container {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: center;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .app-container {
    padding: 12px;

    .filter-container {
      .filter-header {
        flex-direction: column;
        gap: 16px;

        .header-buttons {
          width: 100%;
          .el-button {
            flex: 1;
          }
        }
      }

      .filter-form {
        padding: 16px;
      }
    }

    .table-container {
      padding: 16px;
    }
  }
}
</style>
