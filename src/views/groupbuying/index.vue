<template>
  <div class="app-container">
    <h1>🚀 自動部署測試成功！</h1>
    <!-- 狀態分類標籤 -->
    <el-tabs
      v-model="activeTab"
      class="status-tabs"
      @tab-click="handleTabChange"
    >
      <el-tab-pane name="active">
        <template #label>
          <span>進行中活動</span>
          <span class="tab-counter" v-if="tabCounter.active">
            <el-tag type="success">{{ tabCounter.active }} 筆</el-tag>
          </span>
        </template>
      </el-tab-pane>

      <el-tab-pane name="pending">
        <template #label>
          <span>待處理活動</span>
          <span class="tab-counter" v-if="tabCounter.pending">
            <el-tag type="warning">{{ tabCounter.pending }} 筆</el-tag>
          </span>
        </template>
      </el-tab-pane>

      <el-tab-pane name="history">
        <template #label>
          <span>歷史活動</span>
          <span class="tab-counter" v-if="tabCounter.history">
            <el-tag type="info">{{ tabCounter.history }} 筆</el-tag>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 搜尋區域 -->
    <div class="filter-container">
      <div class="filter-header">
        <div class="left">
          <h2 class="page-title">團購管理</h2>
          <el-tag v-if="total" type="info">共 {{ total }} 筆</el-tag>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增活動
        </el-button>
      </div>

      <el-form
        ref="searchForm"
        :model="searchForm"
        :inline="true"
        class="filter-form"
      >
        <!-- 原有搜尋欄位 -->
        <el-input
          v-model.trim="searchForm.name"
          placeholder="搜尋活動名稱"
          clearable
          class="filter-item"
          style="width: 200px"
          @keyup.enter.native="handleSearch"
        />

        <el-select
          v-model="searchForm.status"
          placeholder="活動狀態"
          clearable
          class="filter-item"
          style="width: 140px"
        >
          <el-option-group
            v-for="group in getCurrentStatusOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span class="status-option">
                <el-tag size="small" :type="item.type" class="status-tag">
                  {{ item.label }}
                </el-tag>
              </span>
            </el-option>
          </el-option-group>
        </el-select>

        <!-- 其他搜尋欄位不變 -->
        <el-select
          v-model="searchForm.sort"
          placeholder="排序方式"
          clearable
          class="filter-item"
          style="width: 140px"
        >
          <el-option
            v-for="item in sortOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <div class="filter-buttons">
          <el-button
            type="primary"
            icon="el-icon-search"
            class="filter-item"
            @click="handleSearch"
          >
            搜尋
          </el-button>
          <el-button class="filter-item" @click="resetSearch">
            重置
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 列表區域 -->
    <div class="table-container">
      <div v-show="!isMobileView" class="desktop-view">
        <el-table
          ref="table"
          v-loading="loading"
          :data="tableData"
          border
          fit
          highlight-current-row
        >
          <el-table-column
            label="活動名稱"
            prop="name"
            min-width="200"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column label="狀態" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="參與區域"
            prop="region"
            width="100"
            align="center"
          />
          <el-table-column label="成交率" width="180" align="center">
            <template #default="{ row }">
              <div class="progress-container">
                <el-progress
                  :percentage="row.successRate"
                  :status="getProgressStatus(row.successRate)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="交易金額" width="120" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="編輯" placement="top" :hide-after="300">
                  <el-button
                    v-show="getStatusActions(row.activeTab).canLook"
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    size="mini"
                    @click="handleEdit(row)"
                  />
                </el-tooltip>
                <el-tooltip content="刪除" placement="top" :hide-after="300">
                  <el-button
                    v-show="getStatusActions(row.activeTab).canDelete"
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="handleDelete(row)"
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 手機版卡片列表 -->
      <div v-show="isMobileView" class="mobile-view">
        <el-card
          v-for="item in tableData"
          :key="item.id"
          shadow="hover"
          class="mobile-card"
        >
          <div class="mobile-card-header">
            <span class="title">{{ item.name }}</span>
            <el-tag
              :class="['status-tag', `status-tag--${item.status}`]"
              :type="getStatusType(item.status)"
              size="small"
            >
              {{ getStatusLabel(item.status) }}
            </el-tag>
          </div>
          <div class="mobile-card-content">
            <div class="info-row">
              <span class="label">參與區域:</span>
              <span>{{ item.region }}</span>
            </div>
            <div class="info-row">
              <span class="label">成交率:</span>
              <el-progress
                :percentage="item.successRate"
                :status="getProgressStatus(item.successRate)"
                :stroke-width="10"
              />
            </div>
            <div class="info-row">
              <span class="label">交易金額:</span>
              <span class="amount">{{ formatCurrency(item.totalAmount) }}</span>
            </div>
          </div>
          <div class="mobile-card-footer">
            <div class="action-buttons">
              <el-tooltip content="編輯" placement="top" :hide-after="300">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  circle
                  size="mini"
                  @click="handleEdit(item)"
                />
              </el-tooltip>
              <el-tooltip content="刪除" placement="top" :hide-after="300">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  size="mini"
                  @click="handleDelete(item)"
                />
              </el-tooltip>
            </div>
          </div>
        </el-card>
      </div>

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
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import checkPermission from "@/utils/permission";
import { getStatusActions } from "@/utils/statusManager";

export default {
  name: "GroupBuyingManagement",

  components: {
    Pagination
  },

  data() {
    return {
      activeTab: "active",
      tabCounter: {
        active: 0,
        pending: 0,
        history: 0
      },
      loading: false,
      total: 0,
      isMobileView: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      searchForm: {
        name: "",
        status: "",
        sort: ""
      },
      // 狀態選項配置
      statusOptionsMap: {
        pending: [
          {
            label: "準備中",
            options: [
              { label: "草稿", value: "draft", type: "info" },
              { label: "審核中", value: "reviewing", type: "warning" },
              { label: "退回修改", value: "revision_needed", type: "danger" }
            ]
          }
        ],
        active: [
          {
            label: "進行中",
            options: [
              { label: "未開始", value: "not_started", type: "info" },
              { label: "開放下單中", value: "ordering", type: "success" },
              { label: "收單結束", value: "order_ended", type: "warning" },
              { label: "截單中", value: "processing_orders", type: "warning" },
              { label: "備貨中", value: "preparing", type: "warning" },
              { label: "配送中", value: "shipping", type: "warning" }
            ]
          }
        ],
        history: [
          {
            label: "已結束",
            options: [
              { label: "已完成", value: "completed", type: "info" },
              { label: "已取消", value: "cancelled", type: "danger" },
              { label: "異常結束", value: "terminated", type: "danger" },
              { label: "強制結束", value: "force_closed", type: "danger" }
            ]
          }
        ]
      },
      sortOptions: [
        { label: "最新建立", value: "createTime" },
        { label: "金額高至低", value: "amountDesc" },
        { label: "成交率高至低", value: "rateDesc" }
      ],
      tableData: []
    };
  },

  computed: {
    getCurrentStatusOptions() {
      return this.statusOptionsMap[this.activeTab] || [];
    }
  },

  created() {
    this.checkView();
    this.getList();
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    getStatusActions,
    checkPermission,
    formatCurrency(value) {
      if (!value && value !== 0) return "0";
      return new Intl.NumberFormat("zh-TW", {
        style: "currency",
        currency: "TWD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
        .format(value)
        .replace("TWD", "")
        .trim();
    },
    handleTabChange() {
      this.searchForm.status = ""; // 切換分頁時重設狀態篩選
      this.getList();
    },

    getStatusType(status) {
      // 在所有狀態選項中尋找對應的類型
      for (const tabOptions of Object.values(this.statusOptionsMap)) {
        for (const group of tabOptions) {
          const option = group.options.find(opt => opt.value === status);
          if (option) return option.type;
        }
      }
      return "info";
    },

    getStatusLabel(status) {
      // 在所有狀態選項中尋找對應的標籤
      for (const tabOptions of Object.values(this.statusOptionsMap)) {
        for (const group of tabOptions) {
          const option = group.options.find(opt => opt.value === status);
          if (option) return option.label;
        }
      }
      return status;
    },

    getProgressStatus(rate) {
      if (rate >= 80) return "success";
      if (rate >= 50) return "warning";
      return "exception";
    },

    async getList() {
      this.loading = true;
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // 根據當前標籤頁生成對應的狀態
        const getRandomStatus = tab => {
          const statusGroups = this.statusOptionsMap[tab];
          const allStatuses = statusGroups.reduce((acc, group) => {
            return acc.concat(group.options.map(opt => opt.value));
          }, []);
          return allStatuses[Math.floor(Math.random() * allStatuses.length)];
        };

        // 生成模擬數據
        this.tableData = Array(10)
          .fill()
          .map((_, index) => {
            const status = getRandomStatus(this.activeTab);

            // 根據狀態設置相應的數據
            let successRate = 0;
            let totalAmount = 0;

            switch (this.activeTab) {
              case "pending":
                // 待處理活動沒有成交率和金額
                successRate = 0;
                totalAmount = 0;
                break;
              case "active":
                // 進行中的活動，根據狀態設置不同範圍的數據
                if (status === "not_started") {
                  successRate = 0;
                  totalAmount = 0;
                } else if (status === "ordering") {
                  successRate = Math.floor(Math.random() * 60);
                  totalAmount = Math.floor(Math.random() * 500000);
                } else {
                  successRate = Math.floor(Math.random() * 40) + 60;
                  totalAmount = Math.floor(Math.random() * 500000) + 500000;
                }
                break;
              case "history":
                // 歷史活動都有完整數據
                if (status === "completed") {
                  successRate = Math.floor(Math.random() * 20) + 80;
                  totalAmount = Math.floor(Math.random() * 1000000) + 1000000;
                } else {
                  // 取消或異常結束的活動
                  successRate = Math.floor(Math.random() * 40) + 20;
                  totalAmount = Math.floor(Math.random() * 500000);
                }
                break;
            }

            return {
              id: index + 1,
              name: `團購活動 ${index + 1}`,
              status: status,
              activeTab: this.activeTab,
              region: ["北部", "中部", "南部"][Math.floor(Math.random() * 3)],
              successRate: successRate,
              totalAmount: totalAmount,
              createTime: new Date(
                Date.now() -
                  Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
              )
            };
          });

        // 更新計數器
        this.tabCounter = {
          active: Math.floor(Math.random() * 20) + 30, // 30-50
          pending: Math.floor(Math.random() * 10) + 5, // 5-15
          history: Math.floor(Math.random() * 50) + 50 // 50-100
        };

        // 設置總數
        this.total = this.tabCounter[this.activeTab] || 0;
      } catch (error) {
        console.error("Failed to get list:", error);
        this.$message.error("獲取列表失敗");
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.listQuery.page = 1;
      this.getList();
    },

    resetSearch() {
      this.searchForm = {
        name: "",
        status: "",
        sort: ""
      };
      this.listQuery.page = 1;
      this.getList();
    },

    handleAdd() {
      this.$router.push("/groupbuying/create");
    },

    handleEdit(row) {
      console.log(row.id);
      console.log(row);
      const statusActions = getStatusActions(row.activeTab);
      console.log(statusActions);
      if (statusActions.canLook) {
        // Proceed to the editing page with the specific row ID
        this.$router.push(`/groupbuying/edit/${row.id}`);
      } else {
        // Notify the user that editing is not allowed for this status
        this.$message.warning("此狀態不允許編輯活動");
      }
    },

    handleDelete(row) {
      this.$confirm(`確認要刪除活動「${row.name}」嗎？`, "提示", {
        confirmButtonText: "確認",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            this.$message.success("刪除成功");
            this.getList();
          } catch (error) {
            this.$message.error("刪除失敗");
          }
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.status-tabs {
  background: #fff;
  padding: 0 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .el-tabs__header {
    margin: 0;
    height: 64px; // 增加高度
  }

  .el-tabs__nav-wrap {
    padding: 16px 0; // 增加上下間距

    &::after {
      height: 1px;
      bottom: 0;
    }
  }

  .el-tabs__item {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    padding: 0 24px; // 增加左右間距

    &.is-active {
      font-weight: 600;
    }
  }

  .tab-counter {
    display: inline-flex;
    align-items: center;
    margin-left: 12px; // 增加與文字的間距

    .el-tag {
      height: 24px;
      line-height: 22px;
      border-radius: 12px;
      padding: 0 12px;
      font-size: 12px;
      margin-top: -2px; // 微調垂直位置
    }
  }
}

.status-option {
  display: flex;
  align-items: center;

  .status-tag {
    margin-right: 8px;
  }
}
// 主容器
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  @media screen and (max-width: 768px) {
    padding: 10px;
  }
}

// 過濾器容器
.filter-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 20px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .left {
      display: flex;
      align-items: center;
      gap: 12px;

      .page-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-button {
      padding: 10px 20px;
    }

    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .left {
        justify-content: space-between;
      }

      .el-button {
        width: 100%;
      }
    }
  }

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .el-form-item {
      margin-bottom: 0;
      margin-right: 0;
    }

    .filter-buttons {
      margin-left: auto;
      display: flex;
      gap: 12px;

      .el-button {
        min-width: 90px;
        padding: 9px 15px;

        &--primary {
          background-color: #409eff;
          border-color: #409eff;

          &:hover,
          &:focus {
            background-color: #66b1ff;
            border-color: #66b1ff;
          }
        }

        &--default {
          background-color: #f4f4f5;
          border-color: #dcdfe6;
          color: #606266;

          &:hover,
          &:focus {
            background-color: #e9e9eb;
            border-color: #c6e2ff;
            color: #409eff;
          }
        }
      }
    }

    @media screen and (max-width: 768px) {
      flex-direction: column;

      .el-form-item {
        width: 100%;
      }

      .el-input,
      .el-select {
        width: 100% !important;
      }

      .filter-buttons {
        margin-left: 0;
        flex-direction: column;
        width: 100%;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}

// 表格容器
.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .el-table {
    :deep(th) {
      background-color: #f5f7fa;
      padding: 12px 0;
      font-weight: 600;
      color: #303133;

      &.is-leaf {
        border-bottom: 1px solid #ebeef5;
      }
    }

    :deep(td) {
      padding: 12px 0;
    }

    :deep(.el-button--mini) {
      padding: 7px 12px;
    }
  }

  @media screen and (max-width: 768px) {
    padding: 12px;
  }
}

// 移動版卡片列表
.mobile-view {
  .mobile-card {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
    }

    .mobile-card-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      background-color: #fafafa;

      .name-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          flex: 1;
          margin-right: 12px;
          // 文字超出顯示省略號
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .region {
        color: #909399;
        font-size: 14px;
      }

      .el-tag {
        padding: 0 10px;
        height: 24px;
        line-height: 24px;
        border-radius: 12px;
        font-size: 12px;

        &.el-tag--success {
          background-color: #f0f9eb;
          border-color: #e1f3d8;
          color: #67c23a;
        }

        &.el-tag--info {
          background-color: #f4f4f5;
          border-color: #e9e9eb;
          color: #909399;
        }

        &.el-tag--danger {
          background-color: #fef0f0;
          border-color: #fde2e2;
          color: #f56c6c;
        }
      }
    }

    .mobile-card-content {
      padding: 16px;
      background-color: #fff;

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          color: #909399;
          font-size: 14px;
        }

        .value {
          flex: 1;
          text-align: right;
          color: #303133;
          font-weight: 500;

          &.amount {
            color: #409eff;
            font-size: 16px;
          }
        }

        .progress-wrapper {
          flex: 1;
          padding-right: 40px;
          position: relative;

          :deep(.el-progress) {
            margin-bottom: 0;

            .el-progress-bar__outer {
              background-color: #ebeef5;
              border-radius: 100px;
            }

            .el-progress-bar__inner {
              border-radius: 100px;
            }

            .el-progress-bar__innerText {
              position: absolute;
              right: -35px;
              top: 50%;
              transform: translateY(-50%);
              color: #606266;
            }
          }
        }
      }
    }

    .mobile-card-footer {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: center;
      .action-buttons {
        gap: 16px;
      }

      .el-button {
        flex: 1;
        justify-content: center;

        &--primary {
          background-color: #409eff;
          border-color: #409eff;
        }

        &--danger {
          background-color: #f56c6c;
          border-color: #f56c6c;
        }

        i {
          margin-right: 4px;
        }
      }
    }
  }
}

// 分頁容器
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  @media screen and (max-width: 768px) {
    :deep(.el-pagination) {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;

      .el-pagination__total,
      .el-pagination__sizes,
      .el-pagination__jump {
        margin: 0;
      }

      .el-pagination__sizes {
        margin-right: 0;
      }
    }
  }
}

// 進度條自定義樣式
:deep(.el-progress) {
  &.el-progress--line {
    .el-progress-bar__outer {
      background-color: #e9ecef;
    }
  }

  &.el-progress--success {
    .el-progress-bar__inner {
      background-color: #67c23a;
    }
  }

  &.el-progress--warning {
    .el-progress-bar__inner {
      background-color: #e6a23c;
    }
  }

  &.el-progress--exception {
    .el-progress-bar__inner {
      background-color: #f56c6c;
    }
  }
}

// 元素交互效果
.el-button,
.el-tag {
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

// 按钮组样式
.el-button-group {
  display: inline-flex;
  vertical-align: middle;

  .el-button {
    margin: 2px;

    &:not(:first-child) {
      margin-left: -1px;
    }

    &:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:not(:first-child):not(:last-child) {
      border-radius: 0;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;

  .el-button {
    padding: 8px;

    &.is-circle {
      padding: 8px;
    }

    // 主要按鈕懸浮效果
    &--primary {
      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
    }

    // 危險按鈕懸浮效果
    &--danger {
      &:hover {
        background-color: #f78989;
        border-color: #f78989;
      }
    }
  }
}
</style>
