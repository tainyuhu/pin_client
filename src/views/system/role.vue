<template>
  <div class="app-container">
    <!-- 頂部操作區 -->
    <el-card class="header-card">
      <div class="header-operations">
        <div class="search-box">
          <el-input
            v-model="search"
            placeholder="搜尋角色名稱"
            clearable
            prefix-icon="el-icon-search"
            @clear="handleFilter"
            @keyup.enter.native="handleFilter"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="handleFilter"
                >搜尋</el-button
              >
            </template>
          </el-input>
        </div>

        <el-button
          v-if="checkPermission(['role_create'])"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增角色
        </el-button>
      </div>
    </el-card>

    <!-- 角色列表 -->
    <el-card class="role-list-card">
      <!-- 桌面端表格視圖 -->
      <el-table
        v-if="!isMobile"
        v-loading="listLoading"
        :data="tableData"
        style="width: 100%"
        :height="tableHeight"
        stripe
        border
      >
        <el-table-column prop="name" label="角色名稱" min-width="150" />
        <el-table-column
          prop="description"
          label="角色描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="datas" label="數據權限" min-width="120" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-tooltip content="編輯" placement="top" :hide-after="300">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="handleEdit(scope)"
                :disabled="!checkPermission(['role_update'])"
              />
            </el-tooltip>
            <!-- <el-tooltip content="刪除" placement="top" :hide-after="300">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="handleDelete(scope)"
                :disabled="!checkPermission(['role_delete'])"
              />
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 移動端卡片視圖 -->
      <div v-else class="mobile-role-list">
        <div v-for="item in tableData" :key="item.id" class="mobile-role-item">
          <div class="role-item-header">
            <span class="role-name">{{ item.name }}</span>
            <div class="role-actions">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="handleEdit({ row: item })"
                :disabled="!checkPermission(['role_update'])"
              />
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="
                  handleDelete({ row: item, $index: tableData.indexOf(item) })
                "
                :disabled="!checkPermission(['role_delete'])"
              />
            </div>
          </div>
          <div class="role-item-content">
            <div class="role-info">
              <span class="label">描述：</span>
              <span class="value">{{ item.description || "暫無描述" }}</span>
            </div>
            <div class="role-info">
              <span class="label">數據權限：</span>
              <span class="value">{{ item.datas }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 角色編輯對話框 -->
    <el-dialog
      :title="dialogType === 'edit' ? '編輯角色' : '新增角色'"
      :visible.sync="dialogVisible"
      :width="isMobile ? '95%' : '60%'"
      :fullscreen="isMobile"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
    >
      <el-form
        ref="roleForm"
        :model="role"
        :rules="rules"
        label-width="100px"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-form-item label="角色名稱" prop="name">
            <el-input
              v-model="role.name"
              placeholder="請輸入角色名稱"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="角色描述" prop="description">
            <el-input
              v-model="role.description"
              type="textarea"
              :rows="3"
              placeholder="請輸入角色描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="數據權限" prop="datas">
            <el-select
              v-model="role.datas"
              placeholder="請選擇數據權限"
              style="width: 100%"
              @change="handleDataPermissionChange"
            >
              <el-option
                v-for="item in dataOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 權限設定部分 -->
        <div v-if="showPermissionSettings" class="form-section">
          <div class="section-title">權限設定</div>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="role.datas === '自定義' ? 12 : 24">
              <el-form-item label="功能權限" prop="perms">
                <div class="tree-container">
                  <div class="tree-toolbar">
                    <el-button
                      type="text"
                      size="mini"
                      @click="handleCheckAllChange(true)"
                    >
                      全選
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      @click="handleCheckAllChange(false)"
                    >
                      清空
                    </el-button>
                  </div>
                  <el-tree
                    ref="tree"
                    :data="routes"
                    show-checkbox
                    node-key="id"
                    :check-strictly="checkStrictly"
                    default-expand-all
                    @check="handleTreeCheck"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" v-if="role.datas === '自定義'">
              <el-form-item label="部門權限" prop="depts">
                <div class="tree-container">
                  <div class="tree-toolbar">
                    <el-button
                      type="text"
                      size="mini"
                      @click="handleDeptCheckAllChange(true)"
                    >
                      全選
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      @click="handleDeptCheckAllChange(false)"
                    >
                      清空
                    </el-button>
                  </div>
                  <el-tree
                    ref="depts_tree"
                    :data="orgData"
                    show-checkbox
                    node-key="id"
                    default-expand-all
                    highlight-current
                    :expand-on-click-node="false"
                    @check="handleDeptTreeCheck"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ showPermissionSettings ? "確認" : "下一步" }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { genTree, deepClone } from "@/utils";
import checkPermission from "@/utils/permission";
import {
  getRoutes,
  getRoleAll,
  createRole,
  deleteRole,
  updateRole
} from "@/api/role";
import { getOrgAll } from "@/api/org";

const defaultRole = {
  id: "",
  name: "",
  description: "",
  perms: [],
  datas: "僅本人",
  depts: []
};

export default {
  data() {
    return {
      search: "",
      role: Object.assign({}, defaultRole),
      routes: [],
      tableData: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: "new",
      checkStrictly: true,
      listLoading: true,
      orgData: [],
      dataOptions: [
        {
          value: "全部",
          label: "全部"
        },
        {
          value: "僅本人",
          label: "僅本人"
        }
      ],
      rules: {
        name: [
          { required: true, message: "請輸入角色名稱", trigger: "blur" },
          { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" }
        ],
        description: [
          { required: true, message: "請輸入角色描述", trigger: "blur" },
          { max: 200, message: "最多 200 個字符", trigger: "blur" }
        ],
        datas: [
          { required: true, message: "請選擇數據權限", trigger: "change" }
        ]
      },
      showPermissionSettings: false
    };
  },
  computed: {},
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes();
    this.getOrgAll();
    this.getRoleAll();
  },
  methods: {
    checkPermission,
    handleFilter() {
      const newData = this.rolesList.filter(
        data =>
          !this.search ||
          data.name.toLowerCase().includes(this.search.toLowerCase())
      );
      this.tableData = genTree(newData);
    },
    async getRoutes() {
      const res = await getRoutes();
      // this.serviceRoutes = res.data
      this.routes = genTree(res.data);
    },
    async getOrgAll() {
      const res = await getOrgAll();
      this.orgData = genTree(res.data);
    },
    async getRoleAll() {
      this.listLoading = true;
      const res = await getRoleAll();
      this.tableData = res.data;
      this.rolesList = res.data;
      this.listLoading = false;
    },
    handleAdd() {
      this.role = Object.assign({}, defaultRole);
      this.showPermissionSettings = false;
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([]);
      }
      this.dialogType = "new";
      this.dialogVisible = true;
    },

    handleDataPermissionChange(value) {
      if (value === "自定義") {
        this.$nextTick(() => {
          if (this.$refs.depts_tree) {
            this.$refs.depts_tree.setCheckedKeys([]);
          }
        });
      }
    },

    handleCheckAllChange(checked) {
      if (this.$refs.tree) {
        const allKeys = this.getAllTreeKeys(this.routes);
        this.$refs.tree.setCheckedKeys(checked ? allKeys : []);
      }
    },

    handleDeptCheckAllChange(checked) {
      if (this.$refs.depts_tree) {
        const allKeys = this.getAllTreeKeys(this.orgData);
        this.$refs.depts_tree.setCheckedKeys(checked ? allKeys : []);
      }
    },

    getAllTreeKeys(data) {
      const keys = [];
      const getKeys = nodes => {
        nodes.forEach(node => {
          keys.push(node.id);
          if (node.children) {
            getKeys(node.children);
          }
        });
      };
      getKeys(data);
      return keys;
    },

    handleTreeCheck() {
      if (this.$refs.tree) {
        const checkedKeys = this.$refs.tree.getCheckedKeys();
        this.role.perms = checkedKeys;
      }
    },

    handleDeptTreeCheck() {
      if (this.$refs.depts_tree) {
        const checkedKeys = this.$refs.depts_tree.getCheckedKeys();
        this.role.depts = checkedKeys;
      }
    },
    submitForm() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          if (!this.showPermissionSettings) {
            this.showPermissionSettings = true;
          } else {
            this.confirmRole();
          }
        }
      });
    },
    async confirmRole() {
      this.submitLoading = true;
      try {
        const isEdit = this.dialogType === "edit";

        // 獲取權限樹選中的值
        this.role.perms = this.$refs.tree.getCheckedKeys();

        // 處理部門權限
        if (this.role.datas === "自定義") {
          this.role.depts = this.$refs.depts_tree.getCheckedKeys();
        } else {
          this.role.depts = [];
        }

        if (isEdit) {
          await updateRole(this.role.id, this.role);
          this.$message.success("修改成功");
        } else {
          await createRole(this.role);
          this.$message.success("創建成功");
        }

        this.dialogVisible = false;
        this.getRoleAll();
      } catch (error) {
        console.error("操作失敗:", error);
        this.$message.error("操作失敗");
      } finally {
        this.submitLoading = false;
      }
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.showPermissionSettings = true;
      this.dialogVisible = true;

      // 深拷貝當前編輯的角色數據
      this.role = deepClone(scope.row);

      // 等待DOM更新後設置樹的選中狀態
      this.$nextTick(() => {
        // 設置功能權限樹的選中狀態
        if (this.$refs.tree) {
          // 先清空所有選中狀態
          this.$refs.tree.setCheckedKeys([]);
          // 設置當前角色擁有的權限
          if (this.role.perms && this.role.perms.length > 0) {
            this.$refs.tree.setCheckedKeys(this.role.perms);
          }
        }

        // 如果是自定義數據權限，設置部門樹的選中狀態
        if (this.role.datas === "自定義" && this.$refs.depts_tree) {
          // 先清空所有選中狀態
          this.$refs.depts_tree.setCheckedKeys([]);
          // 設置當前角色擁有的部門權限
          if (this.role.depts && this.role.depts.length > 0) {
            this.$refs.depts_tree.setCheckedKeys(this.role.depts);
          }
        }
      });
    },

    // 添加一個處理對話框關閉的方法
    handleDialogClose() {
      this.dialogVisible = false;
      this.showPermissionSettings = false;
      // 重置表單
      this.$refs.roleForm.resetFields();
      // 清空樹的選中狀態
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedKeys([]);
      }
      if (this.$refs.depts_tree) {
        this.$refs.depts_tree.setCheckedKeys([]);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 15px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  .header-card {
    margin-bottom: 15px;

    .header-operations {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;

      .search-box {
        flex: 1;
        min-width: 200px;
      }

      @media screen and (max-width: 767px) {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  .role-list-card {
    .mobile-role-list {
      .mobile-role-item {
        background: #fff;
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .role-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ebeef5;

          .role-name {
            font-size: 16px;
            font-weight: bold;
          }

          .role-actions {
            display: flex;
            gap: 8px;
          }
        }

        .role-item-content {
          .role-info {
            margin: 8px 0;

            .label {
              color: #909399;
              margin-right: 8px;
            }
          }
        }
      }
    }
  }

  .tree-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
    height: 300px;
    overflow-y: auto;
  }

  .dialog-footer {
    padding-top: 15px;
    border-top: 1px solid #dcdfe6;

    @media screen and (max-width: 767px) {
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;

      .el-button {
        width: 100%;
        margin: 0;
      }
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .app-container {
    background-color: #1a1a1a;

    .mobile-role-item {
      background: #262626 !important;
      border-color: #363636 !important;
    }

    .tree-container {
      border-color: #363636;
      background-color: #262626;
    }
  }
}
</style>
