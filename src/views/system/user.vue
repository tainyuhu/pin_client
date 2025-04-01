// @/views/system/user.vue
<template>
  <div class="app-container">
    <el-card class="list-card">
      <!-- 標題區域 -->
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">使用者列表</span>
            <el-tag class="count-tag" type="info" v-if="userList.count">
              共 {{ userList.count }} 筆
            </el-tag>
          </div>
          <el-button
            type="primary"
            size="small"
            class="column-button"
            @click="showColumnSelector = true"
          >
            <i class="el-icon-setting"></i>
            <span class="button-text">欄位設定</span>
          </el-button>
        </div>
      </template>

      <!-- 搜尋區域 -->
      <div class="search-section">
        <el-form :inline="false" class="search-form">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="8">
              <el-form-item label="狀態" class="form-item">
                <el-select
                  v-model="listQuery.is_active"
                  placeholder="請選擇"
                  clearable
                  class="full-width-input"
                  @change="handleFilter"
                >
                  <el-option
                    v-for="item in enabledOptions"
                    :key="item.key"
                    :label="item.display_name"
                    :value="item.key"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="姓名" class="form-item">
                <el-input
                  v-model="listQuery.name"
                  placeholder="請輸入姓名"
                  clearable
                  class="full-width-input"
                  @keyup.enter.native="handleFilter"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="button-group">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="handleFilter"
                >
                  搜尋
                </el-button>
                <el-button
                  type="info"
                  icon="el-icon-refresh"
                  @click="resetFilter"
                >
                  重置
                </el-button>
                <el-button
                  v-if="checkPermission(['user_create'])"
                  type="success"
                  icon="el-icon-plus"
                  @click="handleAddUser"
                >
                  新增使用者
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 移動端表格視圖 -->
      <div class="mobile-table" v-if="isMobile">
        <div
          v-for="item in userList.results"
          :key="item.id"
          class="mobile-table-item"
        >
          <div class="mobile-table-header">
            <span class="user-name">{{ item.name }}</span>
            <div class="action-buttons">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="handleEdit(item)"
              />
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="handleDelete(item)"
              />
            </div>
          </div>
          <div class="mobile-table-content">
            <template v-for="col in filteredColumns">
              <div :key="col.prop" class="mobile-table-row">
                <span class="label">{{ col.label }}:</span>
                <span class="value">{{ item[col.prop] }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 桌面端表格視圖 -->
      <el-table
        v-else
        v-loading="listLoading"
        :data="userList.results"
        border
        stripe
        highlight-current-row
        class="data-table"
      >
        <el-table-column
          v-for="col in filteredColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :show-overflow-tooltip="true"
        />

        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="編輯" placement="top" :hide-after="1500">
                <el-button
                  v-if="checkPermission(['user_update'])"
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  circle
                  @click="handleEdit(scope.row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-if="userList.count > 0"
          background
          :current-page.sync="listQuery.page"
          :page-sizes="isMobile ? [10, 20] : [10, 20, 30, 50]"
          :page-size="listQuery.page_size"
          :layout="
            isMobile
              ? 'prev, pager, next'
              : 'total, sizes, prev, pager, next, jumper'
          "
          :total="userList.count"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增使用者對話框 -->
    <el-dialog
      title="新增使用者"
      :visible.sync="createDialogVisible"
      :width="isMobile ? '90%' : '50%'"
      :fullscreen="isMobile"
      :before-close="handleDialogClose"
    >
      <Createuser
        ref="createUserForm"
        @createSuccess="handleCreateSuccess"
        @cancel="handleCreateCancel"
      />
    </el-dialog>

    <!-- 編輯使用者對話框 -->
    <el-dialog
      title="編輯使用者"
      :visible.sync="editDialogVisible"
      :width="isMobile ? '90%' : '50%'"
      :fullscreen="isMobile"
      :before-close="handleEditDialogClose"
    >
      <Edituser
        v-if="editDialogVisible"
        ref="editUserForm"
        :user-id="currentEditUserId"
        @updateSuccess="handleUpdateSuccess"
        @cancel="handleEditCancel"
      />
    </el-dialog>

    <!-- 欄位選擇器對話框 -->
    <column-selector-dialog
      v-model="showColumnSelector"
      :columns="columns"
      :visible-columns.sync="visibleColumns"
      @confirm="handleColumnChange"
    />
  </div>
</template>

<script>
import { getUserList } from "@/api/user";
import checkPermission from "@/utils/permission";
import ColumnSelectorDialog from "@/views/system/components/ColumnSelectorDialog.vue";
import Createuser from "@/views/system/components/Createuser.vue";
import Edituser from "@/views/system/components/Edituser.vue";

export default {
  name: "UserList",
  components: {
    ColumnSelectorDialog,
    Createuser,
    Edituser
  },
  data() {
    return {
      userList: {
        results: [],
        count: 0
      },
      listQuery: {
        page: 1,
        page_size: 20,
        name: "",
        is_active: null
      },
      enabledOptions: [
        { key: "true", display_name: "可用" },
        { key: "false", display_name: "禁用" }
      ],
      listLoading: false,
      columns: [
        {
          label: "員工編號",
          prop: "username", // 使用 username 作為員工編號
          width: "120",
          required: true
        },
        {
          label: "姓名",
          prop: "name",
          width: "100",
          required: true
        },
        {
          label: "性別",
          prop: "gender",
          width: "80",
          group: "basic"
        },
        {
          label: "年齡",
          prop: "age",
          width: "80",
          group: "basic"
        },
        {
          label: "公司",
          prop: "company",
          width: "120",
          group: "basic"
        },
        {
          label: "部門",
          prop: "department",
          width: "120",
          group: "basic"
        },
        {
          label: "職位",
          prop: "position",
          width: "120",
          group: "basic",
          required: true
        },
        {
          label: "群組",
          prop: "dept",
          width: "120",
          group: "basic",
          required: true
        },
        {
          label: "電子郵件",
          prop: "email",
          width: "150",
          group: "contact"
        },
        {
          label: "手機號碼",
          prop: "phone",
          width: "120",
          group: "contact"
        },
        {
          label: "通訊地址",
          prop: "address",
          width: "200",
          group: "contact"
        },
        {
          label: "入職日期",
          prop: "hire_date",
          width: "120",
          group: "dates",
          required: true
        },
        {
          label: "員工狀態",
          prop: "employee_status",
          width: "100",
          group: "status",
          required: true
        },
        {
          label: "帳號狀態",
          prop: "is_active", // 使用 AbstractUser 的 is_active
          width: "100",
          group: "status",
          required: true
        },
        {
          label: "角色",
          prop: "roles",
          width: "120",
          group: "status",
          required: true
        }
      ],
      visibleColumns: [
        "username",
        "name",
        "dept",
        "position",
        "phone",
        "email",
        "employee_status",
        "is_active",
        "hire_date"
      ],
      showColumnSelector: false,
      createDialogVisible: false,
      editDialogVisible: false, // 編輯對話框顯示狀態
      currentEditUserId: null, // 當前編輯的使用者ID
      isMobile: false
    };
  },
  computed: {
    filteredColumns() {
      return this.columns.filter(col => this.visibleColumns.includes(col.prop));
    }
  },
  created() {
    this.getList();
    this.checkDeviceType();
    window.addEventListener("resize", this.checkDeviceType);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkDeviceType);
  },
  methods: {
    checkPermission,
    checkDeviceType() {
      this.isMobile = window.innerWidth < 768;
    },
    async getList() {
      this.listLoading = true;
      try {
        const response = await getUserList(this.listQuery);
        console.log(response.data);
        if (response.data) {
          const re = response.data;
          this.userList = response.data;
          console.log(re.results);
        }
      } catch (error) {
        this.$message.error("獲取資料失敗");
      } finally {
        this.listLoading = false;
      }
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    resetFilter() {
      this.listQuery = {
        page: 1,
        page_size: 20,
        name: "",
        is_active: null
      };
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.page_size = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleAddUser() {
      this.createDialogVisible = true;
    },
    handleCreateSuccess() {
      this.createDialogVisible = false;
      this.$message.success("新增使用者成功");
      this.getList();
    },
    handleCreateCancel() {
      this.$confirm("確定要取消新增？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.createDialogVisible = false;
        })
        .catch(() => {});
    },
    handleDialogClose(done) {
      this.$confirm("確定要關閉？未保存的資料將會遺失", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (this.$refs.createUserForm) {
            this.$refs.createUserForm.resetForm();
          }
          done();
        })
        .catch(() => {});
    },
    checkDeviceType() {
      this.isMobile = window.innerWidth < 768;
    },

    // 打開編輯對話框
    handleEdit(row) {
      this.currentEditUserId = row.id;
      this.editDialogVisible = true;
    },

    // 編輯成功處理
    handleUpdateSuccess() {
      this.editDialogVisible = false;
      this.$message.success("修改使用者成功");
      this.getList(); // 重新載入列表
    },

    // 取消編輯
    handleEditCancel() {
      this.$confirm("確認取消編輯？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.editDialogVisible = false;
        })
        .catch(() => {});
    },

    // 關閉編輯對話框前的處理
    handleEditDialogClose(done) {
      this.$confirm("確認關閉？未保存的修改將會遺失", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.editDialogVisible = false;
          this.currentEditUserId = null;
          done();
        })
        .catch(() => {});
    },

    // 新增對話框關閉前的處理
    handleDialogClose(done) {
      this.$confirm("確認關閉？未保存的資料將會遺失", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (this.$refs.createUserForm) {
            this.$refs.createUserForm.resetForm();
          }
          done();
        })
        .catch(() => {});
    },
    handleColumnChange() {
      // 可以在這裡添加列設定保存邏輯
      this.$message.success("欄位設定已更新");
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 10px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  @media screen and (min-width: 768px) {
    padding: 20px;
  }
}

.list-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  :deep(.el-card__body) {
    padding: 10px;

    @media screen and (min-width: 768px) {
      padding: 20px;
    }
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-section {
  margin: 10px 0;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;

  @media screen and (min-width: 768px) {
    margin: 20px 0;
    padding: 18px;
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 10px;

    @media screen and (min-width: 768px) {
      margin-bottom: 18px;
    }
  }
}

.full-width-input {
  width: 100%;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  justify-content: center;

  @media screen and (min-width: 768px) {
    justify-content: flex-start;
  }
}

.mobile-table {
  .mobile-table-item {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .mobile-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 10px;

      .user-name {
        font-weight: bold;
        font-size: 16px;
        color: #303133;
      }
    }

    .mobile-table-content {
      .mobile-table-row {
        display: flex;
        padding: 8px 0;
        border-bottom: 1px dashed #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #909399;
          width: 100px;
          font-size: 14px;
        }

        .value {
          flex: 1;
          color: #303133;
          font-size: 14px;
        }
      }
    }
  }
}

.data-table {
  margin: 16px 0;

  @media screen and (min-width: 768px) {
    margin: 20px 0;
  }

  :deep(.el-table__header-wrapper) {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }

  :deep(.el-table__row) {
    td {
      padding: 8px 0;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;

  .el-button {
    padding: 6px;

    @media screen and (min-width: 768px) {
      padding: 7px;
    }
  }
}

.pagination-wrapper {
  padding: 15px 0;
  text-align: center;

  @media screen and (min-width: 768px) {
    padding: 20px 0;
    text-align: right;
  }

  :deep(.el-pagination) {
    white-space: normal;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;

    @media screen and (min-width: 768px) {
      justify-content: flex-end;
    }

    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      margin: 0 2px;
    }

    .btn-prev,
    .btn-next {
      margin: 0;
    }

    .el-pager {
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
  }
}

// Dialog 相關樣式
:deep(.el-dialog__wrapper) {
  .el-dialog {
    margin-top: 5vh !important;

    @media screen and (max-width: 767px) {
      margin: 0 !important;
      max-width: 100%;
    }

    .el-dialog__header {
      padding: 15px 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .el-dialog__body {
      padding: 20px;
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 15px 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}

// 移動端特殊樣式調整
@media screen and (max-width: 767px) {
  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .el-button {
    font-size: 14px;
    height: 36px;
    padding: 0 15px;

    &.is-circle {
      padding: 0;
      width: 36px;
      height: 36px;
    }
  }

  .el-tag {
    font-size: 12px;
  }
}

// 深色主題適配
@media (prefers-color-scheme: dark) {
  .app-container {
    background-color: #1a1a1a;
  }

  .list-card {
    background: #262626;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }

  .mobile-table-item {
    background-color: #262626;
    border-color: #363636;
  }

  .el-table {
    background-color: #262626;

    th,
    td {
      background-color: #262626;
      border-color: #363636;
    }
  }

  .search-section {
    background: #1f1f1f;
  }

  .title {
    color: #e0e0e0;
  }

  .mobile-table-row {
    .label {
      color: #a0a0a0;
    }
    .value {
      color: #e0e0e0;
    }
  }
}
</style>
