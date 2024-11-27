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
      v-if="showUserDialog"
      :visible.sync="showUserDialog"
      :dialog-title="
        (currentOrg && currentOrg.name ? currentOrg.name : '') + ' - 使用者清單'
      "
      :user-list="userList"
      :loading="userListLoading"
    />

    <!-- 新增/編輯對話框 -->
    <Createorg
      v-if="showCreateDialog"
      :visible.sync="showCreateDialog"
      :options="tableData"
      @submit="handleCreate"
      @close="closeCreateDialog"
    />

    <Editorg
      v-if="showEditDialog"
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

    // 獲取數據
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

    // 獲取使用者數量
    async loadUserCounts() {
      try {
        this.setTreeLoading(this.tableData, true);
        const { data } = await fetchGroupUserCounts();
        this.updateUserCounts(this.tableData, data);
      } catch (error) {
        console.error("獲取使用者數量失敗:", error);
        this.$message.error("獲取使用者數量失敗");
      } finally {
        this.setTreeLoading(this.tableData, false);
      }
    },

    // 遞歸設置 loading 狀態
    setTreeLoading(tree, loading) {
      tree.forEach(node => {
        this.$set(node, "loading", loading);
        if (node.children && node.children.length) {
          this.setTreeLoading(node.children, loading);
        }
      });
    },

    // 更新使用者數量
    updateUserCounts(tree, userCountsData) {
      const userCountMap = {};
      userCountsData.forEach(item => {
        userCountMap[item.id] = item.user_count;
      });

      const updateNodes = nodes => {
        nodes.forEach(node => {
          if (userCountMap[node.id] !== undefined) {
            this.$set(node, "user_count", userCountMap[node.id]);
          } else {
            this.$set(node, "user_count", 0);
          }
          if (node.children && node.children.length) {
            updateNodes(node.children);
          }
        });
      };

      updateNodes(tree);
    },

    // 處理使用者清單點擊
    handleUserListClick(row, event) {
      event.stopPropagation(); // 停止事件傳播
      this.showUserList(row);
    },

    // 處理編輯點擊
    handleEditClick(row, event) {
      event.stopPropagation(); // 停止事件傳播
      this.openEditDialog(row);
    },

    // 行點擊處理
    handleRowClick(row, column, event) {
      // 如果需要行點擊的其他功能，可以在這裡處理
      console.log("Row clicked:", row);
    },

    // 顯示使用者清單
    async showUserList(org) {
      if (this.showEditDialog || this.showCreateDialog) {
        return; // 如果編輯或新增對話框開啟，則不執行
      }
      this.currentOrg = org;
      this.showUserDialog = true;
      this.userListLoading = true;

      try {
        const { data } = await fetchOrgUsers(org.id);
        this.userList = data.users;
      } catch (error) {
        console.error("獲取使用者清單失敗:", error);
        this.$message.error("獲取使用者清單失敗");
      } finally {
        this.userListLoading = false;
      }
    },

    // 搜尋相關
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

    // 新增相關
    openCreateDialog() {
      if (this.showUserDialog) {
        this.showUserDialog = false;
      }
      this.showCreateDialog = true;
    },

    closeCreateDialog() {
      this.showCreateDialog = false;
    },

    async handleCreate(org) {
      console.log("新增群組:", org);
      this.$message.success("群組新增成功");
      await this.getList();
      this.closeCreateDialog();
    },

    // 編輯相關
    openEditDialog(org) {
      if (this.showUserDialog) {
        this.showUserDialog = false;
      }
      this.currentOrg = { ...org };
      this.showEditDialog = true;
    },

    closeEditDialog() {
      this.showEditDialog = false;
    },

    async handleEdit(org) {
      console.log("更新群組:", org);
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
