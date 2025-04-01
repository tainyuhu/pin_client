<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="filter-container">
      <div class="filter-header">
        <div class="left">
          <h2 class="page-title">審核管理</h2>
          <el-tag v-if="total" type="info">共 {{ total }} 筆</el-tag>
        </div>
      </div>

      <el-form
        ref="searchForm"
        :model="searchForm"
        :inline="true"
        class="filter-form"
      >
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
          placeholder="審核狀態"
          clearable
          class="filter-item"
          style="width: 140px"
        >
          <el-option
            v-for="(status, key) in auditStatus"
            :key="key"
            :label="status.label"
            :value="key"
          >
            <el-tag :type="status.type" size="small">{{ status.label }}</el-tag>
          </el-option>
        </el-select>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          class="filter-item"
          style="width: 260px"
        />
        <div class="filter-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜尋
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
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
      >
        <el-table-column
          label="活動名稱"
          min-width="130"
          show-overflow-tooltip
          prop="name"
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{
              row.name
            }}</el-link>
          </template>
        </el-table-column>

        <el-table-column
          label="提交人"
          width="120"
          align="center"
          prop="submitter"
        />

        <el-table-column
          label="提交時間"
          width="180"
          align="center"
          prop="submitTime"
        />

        <el-table-column label="狀態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="auditStatus[row.status].type">
              {{ auditStatus[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 審核人欄位 -->
        <el-table-column label="審核人" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'approved'">{{ row.auditor }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 審核時間欄位 -->
        <el-table-column label="審核時間" width="180" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'approved'">{{ row.auditTime }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-view"
                @click="handleView(row)"
              >
                查看
              </el-button>
              <template v-if="row.status === 'pending'">
                <el-button
                  type="success"
                  size="mini"
                  icon="el-icon-check"
                  @click="handleApprove(row)"
                >
                  核准
                </el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-close"
                  @click="handleReject(row)"
                >
                  退回
                </el-button>
              </template>
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

    <!-- 退回原因對話框 -->
    <el-dialog
      title="退回原因"
      :visible.sync="rejectDialog.visible"
      width="500px"
    >
      <el-form :model="rejectDialog.form" label-position="top">
        <el-form-item
          label="請填寫退回原因"
          :rules="[{ required: true, message: '請填寫退回原因' }]"
        >
          <el-input
            v-model="rejectDialog.form.reason"
            type="textarea"
            :rows="4"
            placeholder="請填寫具體的退回原因，以協助提交者進行修改"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="rejectDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmReject"
          :loading="rejectDialog.loading"
        >
          確認退回
        </el-button>
      </span>
    </el-dialog>

    <!-- 預覽對話框 -->
    <preview-dialog
      v-model="previewDialog.visible"
      :form-data="previewDialog.data"
    />
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import PreviewDialog from "../components/PreviewDialog.vue";

export default {
  name: "AuditManagement",

  components: {
    Pagination,
    PreviewDialog
  },

  data() {
    return {
      loading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      searchForm: {
        name: "",
        status: "",
        dateRange: null
      },
      auditStatus: {
        pending: { label: "待審核", type: "warning" },
        rejected: { label: "已退回", type: "danger" },
        approved: { label: "已核准", type: "success" }
      },
      tableData: [],
      rejectDialog: {
        visible: false,
        loading: false,
        form: {
          reason: "",
          rowData: null
        }
      },
      previewDialog: {
        visible: false,
        data: null
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    async getList() {
      this.loading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        this.tableData = Array(10)
          .fill()
          .map((_, index) => {
            const status = ["pending", "approved", "rejected"][
              Math.floor(Math.random() * 3)
            ];
            const baseData = {
              id: index + 1,
              name: `${
                ["春季", "夏季", "週年慶", "聖誕節"][
                  Math.floor(Math.random() * 4)
                ]
              }團購活動 ${index + 1}`,
              basicInfo: {
                title: `${
                  ["春季", "夏季", "週年慶", "聖誕節"][
                    Math.floor(Math.random() * 4)
                  ]
                }團購活動 ${index + 1}`,
                description: "活動描述內容...",
                startTime: "2024-01-15 00:00:00",
                endTime: "2024-02-15 23:59:59",
                regions: ["北部", "中部", "南部"],
                departments: ["業務部", "行政部"]
              },
              promotion: {
                type: ["discount", "gift", "bonus"][
                  Math.floor(Math.random() * 3)
                ],
                freeShippingThreshold: Math.floor(Math.random() * 5 + 1) * 1000,
                hasBonus: Math.random() > 0.5
              },
              products: [
                {
                  name: "商品A",
                  specification: "規格A",
                  unit: "件",
                  price: 1000,
                  originalPrice: 1200,
                  maxQuantity: 100
                },
                {
                  name: "商品B",
                  specification: "規格B",
                  unit: "組",
                  price: 2000,
                  originalPrice: 2400,
                  maxQuantity: 50
                }
              ],
              delivery: {
                companyPickup: true,
                addressPickup: Math.random() > 0.5
              },
              status,
              submitter: `${
                ["王", "李", "張", "陳"][Math.floor(Math.random() * 4)]
              }${
                ["小明", "小華", "小美", "小芬"][Math.floor(Math.random() * 4)]
              }`,
              submitTime: new Date(
                Date.now() -
                  Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
              ).toLocaleString(),
              totalAmount: Math.floor(Math.random() * 100000) + 50000,
              successRate: Math.floor(Math.random() * 40) + 60
            };

            // 如果是已核准狀態，添加審核相關資訊
            if (status === "approved") {
              return {
                ...baseData,
                auditor: `${
                  ["林", "黃", "吳", "劉"][Math.floor(Math.random() * 4)]
                }主管`,
                auditTime: new Date(
                  Date.now() -
                    Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000
                ).toLocaleString()
              };
            }

            return baseData;
          });

        this.total = 100;
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
        dateRange: null
      };
      this.listQuery.page = 1;
      this.getList();
    },

    handleView(row) {
      this.previewDialog.data = row;
      this.previewDialog.visible = true;
    },

    async handleApprove(row) {
      try {
        await this.$confirm("確認要核准此活動嗎？", "提示", {
          confirmButtonText: "確認",
          cancelButtonText: "取消",
          type: "warning"
        });

        // TODO: 調用核准 API
        await new Promise(resolve => setTimeout(resolve, 500));
        this.$message.success("核准成功");
        this.getList();
      } catch (error) {
        if (error !== "cancel") {
          this.$message.error("操作失敗");
        }
      }
    },

    handleReject(row) {
      this.rejectDialog.form.rowData = row;
      this.rejectDialog.visible = true;
    },

    async confirmReject() {
      if (!this.rejectDialog.form.reason) {
        this.$message.warning("請填寫退回原因");
        return;
      }

      this.rejectDialog.loading = true;
      try {
        // TODO: 調用退回 API
        await new Promise(resolve => setTimeout(resolve, 500));
        this.$message.success("已退回活動");
        this.rejectDialog.visible = false;
        this.getList();
      } catch (error) {
        this.$message.error("操作失敗");
      } finally {
        this.rejectDialog.loading = false;
        this.rejectDialog.form.reason = "";
        this.rejectDialog.form.rowData = null;
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
}

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;

  .filter-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;

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
  }

  .filter-form {
    padding: 20px 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    .filter-buttons {
      margin-left: auto;
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
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;

  .el-button {
    padding: 7px 12px;
  }
}

.pagination-container {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
