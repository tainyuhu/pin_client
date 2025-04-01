<template>
  <div class="app-container">
    <el-card class="list-card">
      <!-- 標題區 -->
      <template #header>
        <div class="card-header">
          <span class="title">群組列表</span>
          <el-tag v-if="orgList.length" class="count-tag" type="info">
            共 {{ orgList.length }} 筆
          </el-tag>
        </div>
      </template>

      <!-- 搜尋區 -->
      <div class="search-area">
        <el-form :inline="false">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="群組名稱">
                <el-input
                  v-model="search"
                  placeholder="請輸入群組名稱"
                  clearable
                  @keyup.enter="handleFilter"
                >
                  <template #append>
                    <el-button
                      icon="el-icon-refresh"
                      @click="resetFilter"
                    ></el-button>
                  </template>
                </el-input>
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
                  v-if="checkPermission(['org_create'])"
                  type="success"
                  icon="el-icon-plus"
                  @click="openCreateDialog"
                >
                  新增群組
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 數據顯示區 -->
      <div class="data-display">
        <el-table
          v-loading="listLoading"
          :data="filteredData"
          border
          stripe
          row-key="id"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          class="desktop-table"
          @row-click="handleRowClick"
        >
          <el-table-column
            type="index"
            width="60"
            align="center"
            label="序號"
          />
          <el-table-column prop="name" label="群組名稱" min-width="200" />
          <el-table-column
            prop="user_count"
            label="使用者數量"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <div class="user-count-cell" @click.stop>
                <span>{{ row.user_count || 0 }}</span>
                <el-tooltip content="查看使用者清單" placement="top">
                  <el-button
                    type="text"
                    :loading="row.loading"
                    @click="handleUserListClick(row, $event)"
                    class="user-list-btn"
                  >
                    <i class="el-icon-warning-outline"></i>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <div @click.stop>
                <el-button
                  v-if="row.type != 'root'"
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="handleEditClick(row, $event)"
                >
                  編輯
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 使用者清單對話框 -->
    <UserListDialog
      v-show="showUserDialog"
      :visible.sync="showUserDialog"
      :dialog-title="
        (currentOrg && currentOrg.name ? currentOrg.name : '') + ' - 使用者清單'
      "
      :user-list="userList"
      :loading="userListLoading"
    />

    <!-- 新增/編輯對話框 -->
    <Createorg
      v-show="showCreateDialog"
      :visible.sync="showCreateDialog"
      :options="tableData"
      @submit="handleCreate"
      @close="closeCreateDialog"
    />

    <Editorg
      v-show="showEditDialog"
      :visible.sync="showEditDialog"
      :options="tableData"
      :org="currentOrg"
      @submit="handleEdit"
      @close="closeEditDialog"
    />
  </div>
</template>

<script>
import Createorg from "@/views/system/components/Createorg.vue";
import Editorg from "@/views/system/components/Editorg.vue";
import UserListDialog from "@/views/system/components/UserListDialog.vue";
import checkPermission from "@/utils/permission";
import { getOrgAll, fetchGroupUserCounts, fetchOrgUsers } from "@/api/org";
import { genTree } from "@/utils";

export default {
  name: "GroupManagement",
  components: {
    Createorg,
    Editorg,
    UserListDialog
  },

  data() {
    return {
      orgList: [],
      tableData: [],
      listLoading: true,
      search: "",
      showCreateDialog: false,
      showEditDialog: false,
      currentOrg: null,
      showUserDialog: false,
      userList: [],
      userListLoading: false
    };
  },

  computed: {
    filteredData() {
      if (!this.search) return this.tableData;
      const searchLower = this.search.toLowerCase();
      return this.tableData.filter(data =>
        data.name.toLowerCase().includes(searchLower)
      );
    }
  },

  created() {
    this.getList();
  },

  methods: {
    checkPermission,

    async getList() {
      this.listLoading = true;
      try {
        const { data } = await getOrgAll();
        this.orgList = data;
        this.tableData = genTree(data);
        await this.loadUserCounts();
      } catch (error) {
        this.$message.error("載入群組資料失敗");
      } finally {
        this.listLoading = false;
      }
    },

    async loadUserCounts() {
      try {
        this.setTreeLoading(this.tableData, true);
        const { data } = await fetchGroupUserCounts();
        this.updateUserCounts(this.tableData, data);
      } catch (error) {
        this.$message.error("獲取使用者數量失敗");
      } finally {
        this.setTreeLoading(this.tableData, false);
      }
    },

    setTreeLoading(tree, loading) {
      tree.forEach(node => {
        this.$set(node, "loading", loading);
        if (node.children) this.setTreeLoading(node.children, loading);
      });
    },

    updateUserCounts(tree, userCountsData) {
      const userCountMap = {};
      userCountsData.forEach(item => {
        userCountMap[item.id] = item.user_count;
      });

      const updateNodes = nodes => {
        nodes.forEach(node => {
          this.$set(node, "user_count", userCountMap[node.id] || 0);
          if (node.children) updateNodes(node.children);
        });
      };

      updateNodes(tree);
    },

    handleUserListClick(row, event) {
      event.stopPropagation();
      this.showUserList(row);
    },

    handleEditClick(row, event) {
      event.stopPropagation();
      this.openEditDialog(row);
    },

    handleRowClick(row) {
      console.log("Row clicked:", row);
    },

    async showUserList(org) {
      if (this.showEditDialog || this.showCreateDialog) return;
      this.currentOrg = org;
      this.showUserDialog = true;
      this.userListLoading = true;

      try {
        const { data } = await fetchOrgUsers(org.id);
        this.userList = data.users;
      } catch (error) {
        this.$message.error("獲取使用者清單失敗");
      } finally {
        this.userListLoading = false;
      }
    },

    handleFilter() {
      const searchLower = this.search.toLowerCase();
      const filtered = this.orgList.filter(
        data => !this.search || data.name.toLowerCase().includes(searchLower)
      );
      this.tableData = genTree(filtered);
      this.loadUserCounts();
    },

    resetFilter() {
      this.search = "";
      this.getList();
    },

    openCreateDialog() {
      if (this.showUserDialog) this.showUserDialog = false;
      this.showCreateDialog = true;
    },

    closeCreateDialog() {
      this.showCreateDialog = false;
    },

    async handleCreate(org) {
      this.$message.success("群組新增成功");
      await this.getList();
      this.closeCreateDialog();
    },

    openEditDialog(org) {
      if (this.showUserDialog) this.showUserDialog = false;
      this.currentOrg = { ...org };
      this.showEditDialog = true;
    },

    closeEditDialog() {
      this.showEditDialog = false;
    },

    async handleEdit(org) {
      this.$message.success("群組更新成功");
      await this.getList();
      this.closeEditDialog();
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.desktop-table {
  margin-top: 20px;
}

.user-list-container {
  padding: 10px 0;
}

.user-count-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.user-list-btn {
  padding: 2px;
  font-size: 16px;
  color: #e6a23c;

  &:hover {
    color: #ebb563;
  }

  i {
    font-weight: bold;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }

  .action-buttons {
    justify-content: space-between;
  }

  .el-button {
    margin: 4px 0;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
