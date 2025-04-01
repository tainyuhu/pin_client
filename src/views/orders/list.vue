<template>
  <div class="app-container">
    <el-card class="list-card">
      <!-- 標題區 -->
      <template #header>
        <div class="card-header">
          <span class="title">訂單管理</span>
          <el-tag v-if="total" class="count-tag" type="info">
            共 {{ total }} 筆
          </el-tag>
        </div>
      </template>

      <!-- 搜尋區 -->
      <div class="search-area">
        <el-form :inline="false">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="訂單編號">
                <el-input
                  v-model.trim="searchForm.orderNo"
                  placeholder="請輸入訂單編號"
                  clearable
                  @keyup.enter="handleSearch"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="訂單狀態">
                <el-select
                  v-model="searchForm.status"
                  placeholder="請選擇狀態"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="建立日期">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="開始日期"
                  end-placeholder="結束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 按鈕組 -->
          <el-row>
            <el-col :span="24">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  :loading="loading"
                  @click="handleSearch"
                >
                  搜尋
                </el-button>
                <el-button
                  type="info"
                  icon="el-icon-refresh"
                  :loading="loading"
                  @click="resetSearch"
                >
                  重置
                </el-button>
                <el-button
                  type="success"
                  icon="el-icon-download"
                  :loading="exporting"
                  @click="handleExport"
                >
                  匯出
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 數據顯示區 -->
      <div class="table-container">
        <!-- 桌面版表格 -->
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          class="desktop-table hidden-sm-and-down"
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="orderNo"
            label="訂單編號"
            min-width="160"
            sortable="custom"
          />
          <el-table-column
            prop="createTime"
            label="建立時間"
            min-width="160"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="狀態"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="amount"
            label="金額"
            width="120"
            align="right"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatCurrency(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <el-button type="primary" size="mini" @click="handleView(row)">
                查看
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                size="mini"
                @click="handleProcess(row)"
              >
                處理
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移動版卡片列表 -->
        <div class="mobile-cards hidden-md-and-up">
          <el-card
            v-for="item in tableData"
            :key="item.orderNo"
            class="order-card"
            :body-style="{ padding: '12px' }"
          >
            <div class="order-card-header">
              <span class="order-no">{{ item.orderNo }}</span>
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
            <div class="order-card-content">
              <div class="info-item">
                <span class="label">建立時間：</span>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">金額：</span>
                <span class="amount">{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>
            <div class="order-card-actions">
              <el-button type="primary" size="mini" @click="handleView(item)">
                查看
              </el-button>
              <el-button
                v-if="item.status === 'pending'"
                type="success"
                size="mini"
                @click="handleProcess(item)"
              >
                處理
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { formatDate, formatCurrency } from "@/utils/format";

export default {
  name: "OrderManagementList",

  data() {
    return {
      loading: false,
      exporting: false,
      total: 0,
      page: 1,
      pageSize: 20,
      searchForm: {
        orderNo: "",
        status: "",
        dateRange: null
      },
      tableData: [],
      statusOptions: [
        { label: "待處理", value: "pending" },
        { label: "處理中", value: "processing" },
        { label: "已完成", value: "completed" },
        { label: "已取消", value: "cancelled" }
      ],
      sortBy: null,
      sortOrder: null
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    formatDate,
    formatCurrency,

    getStatusType(status) {
      const typeMap = {
        pending: "warning",
        processing: "primary",
        completed: "success",
        cancelled: "info"
      };
      return typeMap[status] || "info";
    },

    getStatusLabel(status) {
      const option = this.statusOptions.find(opt => opt.value === status);
      return option ? option.label : status;
    },

    async fetchData() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 這裡應該調用實際的 API
        const params = this.getQueryParams();
        console.log("Fetching with params:", params);

        // Mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.tableData = Array(10)
          .fill()
          .map((_, index) => ({
            orderNo: `ORD${String(index + 1).padStart(6, "0")}`,
            createTime: new Date(Date.now() - index * 86400000),
            status: ["pending", "processing", "completed", "cancelled"][
              Math.floor(Math.random() * 4)
            ],
            amount: Math.floor(Math.random() * 10000) + 1000
          }));
        this.total = 100;
      } catch (error) {
        console.error("獲取訂單列表失敗:", error);
        this.$message.error("獲取訂單列表失敗");
      } finally {
        this.loading = false;
      }
    },

    getQueryParams() {
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        orderNo: this.searchForm.orderNo,
        status: this.searchForm.status
      };

      if (this.searchForm.dateRange) {
        const [startDate, endDate] = this.searchForm.dateRange;
        params.startDate = formatDate(startDate);
        params.endDate = formatDate(endDate);
      }

      if (this.sortBy) {
        params.sortBy = this.sortBy;
        params.sortOrder = this.sortOrder;
      }

      return params;
    },

    handleSearch() {
      this.page = 1;
      this.fetchData();
    },

    resetSearch() {
      this.searchForm = {
        orderNo: "",
        status: "",
        dateRange: null
      };
      this.page = 1;
      this.sortBy = null;
      this.sortOrder = null;
      this.fetchData();
    },

    handleSortChange({ prop, order }) {
      this.sortBy = prop;
      this.sortOrder = order;
      this.fetchData();
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.page = val;
      this.fetchData();
    },

    async handleExport() {
      if (this.exporting) return;

      this.exporting = true;
      try {
        // 這裡應該調用實際的匯出 API
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.$message.success("匯出成功");
      } catch (error) {
        console.error("匯出失敗:", error);
        this.$message.error("匯出失敗");
      } finally {
        this.exporting = false;
      }
    },

    handleView(row) {
      console.log("查看訂單:", row);
      // 這裡應該導航到訂單詳情頁
      this.$router.push(`/order/detail/${row.orderNo}`);
    },

    handleProcess(row) {
      console.log("處理訂單:", row);
      // 這裡應該打開處理訂單的對話框或頁面
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.search-area {
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
}

.table-container {
  margin-top: 20px;
}

.mobile-cards {
  .order-card {
    margin-bottom: 12px;

    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .order-no {
        font-weight: 500;
      }
    }

    .order-card-content {
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .label {
          color: #606266;
        }

        .amount {
          font-weight: 500;
          color: #409eff;
        }
      }
    }

    .order-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    .el-pagination {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
  }
}

// Element UI 響應式類
@media (max-width: 768px) {
  .hidden-sm-and-down {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .hidden-md-and-up {
    display: none !important;
  }
}
</style>
