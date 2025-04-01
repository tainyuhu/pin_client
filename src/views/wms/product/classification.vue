<template>
  <div class="multi-sku">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>行銷類別管理</h2>
      <div class="action-buttons">
        <el-button type="success" @click="handleAddMainCategory">
          <i class="el-icon-plus"></i>
          <span class="button-text">新增根類別</span>
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <!-- 搜尋區域 -->
      <div class="table-operations">
        <div class="operation-wrapper">
          <el-form :inline="true">
            <el-form-item label="類別名稱">
              <search-box
                v-model="searchKeyword"
                placeholder="請輸入類別名稱"
                @clear="handleSearchClear"
                @input="handleSearch"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 資料載入中 -->
      <div v-if="loading" class="loading-container">
        <el-spinner type="primary" />
        <p>正在載入類別資料...</p>
      </div>

      <!-- 表格區域 -->
      <tree-table
        v-else
        ref="treeTable"
        :data="filteredCategoryData"
        :columns="columns"
        tree-column="name"
        :showAction="true"
        :default-expand-level="999"
      >
        <!-- 產品數量列自定義 -->
        <template #column-productCount="{ row }">
          <div class="product-count-cell">
            <span>{{ row.productCount }}</span>
            <el-tooltip
              v-if="row.productCount > 0"
              content="查看產品詳情"
              placement="top"
            >
              <i
                class="el-icon-warning-outline product-info-icon"
                @click.stop="showProductDetails(row)"
              ></i>
            </el-tooltip>
          </div>
        </template>

        <!-- 操作列 -->
        <template #action="{ row }">
          <div class="action-buttons">
            <!-- 所有類別都可以新增子類別 -->
            <el-tooltip content="新增子群組" placement="top">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-plus"
                @click="handleAddSubCategory(row)"
              ></el-button>
            </el-tooltip>

            <!-- 所有類別都可以編輯 -->
            <el-tooltip content="編輯類別" placement="top">
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-edit"
                @click="handleEditCategory(row)"
              ></el-button>
            </el-tooltip>

            <!-- 所有類別都可以刪除 -->
            <el-tooltip content="刪除類別" placement="top">
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteCategory(row)"
              ></el-button>
            </el-tooltip>
          </div>
        </template>
      </tree-table>
    </div>

    <!-- 使用組件化的類別對話框 -->
    <category-dialog
      :visible.sync="dialogVisible"
      :type="dialogType"
      :parent-category="dialogParentCategory"
      :category="categoryForm"
      @save="handleSaveCategory"
      @cancel="dialogVisible = false"
      @close="handleDialogClose"
    />

    <!-- 使用組件化的產品詳情對話框 -->
    <product-detail-dialog
      :visible.sync="productDialogVisible"
      :category-name="currentCategoryName"
      :products="currentProducts"
    />
  </div>
</template>

<script>
import TreeTable from "@/components/TreeTable";
import SearchBox from "@/components/SearchBox";
import CategoryDialog from "./components/CategoryDialog.vue";
import ProductDetailDialog from "./components/ProductDetailDialog.vue";
import CategoryService from "./services/CategoryService.js";

export default {
  name: "CategoryManagement",

  components: {
    TreeTable,
    SearchBox,
    CategoryDialog,
    ProductDetailDialog
  },

  data() {
    return {
      // 搜尋關鍵字
      searchKeyword: "",
      // 資料載入狀態
      loading: true,

      // 表格列定義
      columns: [
        {
          prop: "name",
          label: "類別名稱",
          minWidth: 200
        },
        {
          prop: "productCount",
          label: "產品數量",
          width: 120,
          align: "center"
        }
      ],

      // 類別數據
      categoryData: [],

      // 對話框相關
      dialogVisible: false,
      dialogType: "", // 'add' 或 'edit'
      dialogParentCategory: null, // 父類別對象
      categoryForm: {
        id: null,
        name: ""
      },
      // 產品詳情對話框
      productDialogVisible: false,
      currentProducts: [],
      currentCategoryName: ""
    };
  },

  computed: {
    // 過濾後的類別數據 - 使用異步搜尋或本地過濾
    filteredCategoryData() {
      return this.categoryData;
    }
  },

  created() {
    this.fetchCategories();
  },

  methods: {
    // 獲取類別數據
    async fetchCategories() {
      this.loading = true;
      try {
        // 使用CategoryService獲取所有類別
        this.categoryData = await CategoryService.fetchAllCategories();
      } catch (error) {
        console.error("獲取類別資料失敗", error);
        this.$message.error("獲取類別資料失敗");
      } finally {
        this.loading = false;
      }
    },

    // 搜尋相關方法
    async handleSearch(value) {
      this.searchKeyword = value;
      if (value) {
        try {
          // 使用服務層搜尋功能
          this.loading = true;
          this.categoryData = await CategoryService.searchCategories(value);
        } catch (error) {
          console.error("搜尋類別失敗", error);
          this.$message.error("搜尋類別失敗");
        } finally {
          this.loading = false;
        }
      } else {
        this.fetchCategories();
      }
    },

    async handleSearchClear() {
      this.searchKeyword = "";
      this.fetchCategories();
    },

    // 判斷是否為根類別
    isRootCategory(row) {
      return !row._parent;
    },

    // 新增根類別
    handleAddMainCategory() {
      this.dialogType = "add";
      this.dialogParentCategory = null;
      this.categoryForm = { id: null, name: "" };
      this.dialogVisible = true;
    },

    // 新增子類別 - 支持任何層級
    handleAddSubCategory(row) {
      this.dialogType = "add";
      this.dialogParentCategory = row; // 設置完整父類別對象
      this.categoryForm = { id: null, name: "" };
      this.dialogVisible = true;
    },

    // 編輯類別
    handleEditCategory(row) {
      this.dialogType = "edit";
      this.dialogParentCategory = row._parent || null; // 設置完整父類別對象
      this.categoryForm = { id: row.id, name: row.name };
      this.dialogVisible = true;
    },

    // 刪除類別
    handleDeleteCategory(row) {
      // 檢查是否為根類別且系統中是否只剩一個根類別
      if (this.isRootCategory(row) && this.categoryData.length <= 1) {
        this.$message.error("系統至少需要保留一個根類別，無法刪除");
        return;
      }

      // 檢查根類別是否有子類別
      if (this.isRootCategory(row) && row.children && row.children.length > 0) {
        this.$confirm(
          "此根類別包含子類別，確認要刪除嗎？此操作將連同所有子類別一併刪除！",
          "警告",
          {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(async () => {
            try {
              // 使用CategoryService刪除類別
              await CategoryService.deleteCategory(row.id);

              // 刪除根類別
              const index = this.categoryData.findIndex(
                item => item.id === row.id
              );
              if (index > -1) {
                this.categoryData.splice(index, 1);
                this.$message.success("刪除成功");
              }
            } catch (error) {
              console.error("刪除類別失敗", error);
              this.$message.error("刪除類別失敗");
            }
          })
          .catch(() => {});
        return;
      }

      // 一般刪除確認
      this.$confirm(
        `確認要刪除${this.isRootCategory(row) ? "根" : ""}類別「${
          row.name
        }」嗎？${
          row.children && row.children.length > 0
            ? "此操作將連同子類別一併刪除！"
            : ""
        }`,
        "提示",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(async () => {
          try {
            // 使用CategoryService刪除類別
            await CategoryService.deleteCategory(row.id);

            if (this.isRootCategory(row)) {
              // 刪除根類別
              const index = this.categoryData.findIndex(
                item => item.id === row.id
              );
              if (index > -1) {
                this.categoryData.splice(index, 1);
              }
            } else {
              // 刪除子類別
              const parent = row._parent;
              if (parent) {
                const index = parent.children.findIndex(
                  item => item.id === row.id
                );
                if (index > -1) {
                  parent.children.splice(index, 1);
                }
              }
            }
            this.$message.success("刪除成功");
          } catch (error) {
            console.error("刪除類別失敗", error);
            this.$message.error("刪除類別失敗");
          }
        })
        .catch(() => {});
    },

    // 保存類別
    async handleSaveCategory(formData) {
      try {
        if (this.dialogType === "add") {
          // 新增類別
          const response = await CategoryService.addCategory(formData);

          if (response.success) {
            const newCategory = response.data;
            newCategory.children = []; // 確保新類別有 children 屬性

            if (formData.parentId) {
              // 新增子類別
              const parent = this.findCategoryById(
                this.categoryData,
                formData.parentId
              );
              if (parent) {
                if (!parent.children) {
                  parent.children = [];
                }
                parent.children.push(newCategory);
              }
            } else {
              // 新增根類別
              this.categoryData.push(newCategory);
            }
            this.$message.success("新增類別成功");
          }
        } else {
          // 編輯類別
          const response = await CategoryService.updateCategory(formData);

          if (response.success) {
            const category = this.findCategoryById(
              this.categoryData,
              formData.id
            );
            if (category) {
              category.name = formData.name;
            }
            this.$message.success("編輯類別成功");
          }
        }
        this.dialogVisible = false;
      } catch (error) {
        console.error("保存類別失敗", error);
        this.$message.error("保存類別失敗");
      }
    },

    // 遞迴查找類別
    findCategoryById(categories, id) {
      for (const category of categories) {
        if (category.id === id) {
          return category;
        }
        if (category.children && category.children.length) {
          const found = this.findCategoryById(category.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },

    // 關閉對話框
    handleDialogClose() {
      this.dialogVisible = false;
    },

    // 顯示產品詳情
    async showProductDetails(row) {
      if (row.productCount > 0) {
        try {
          this.currentCategoryName = row.name;
          this.productDialogVisible = true;
          this.currentProducts = []; // 先清空，避免顯示舊數據

          // 在對話框打開後再載入數據，避免等待時間太長
          this.$nextTick(async () => {
            // 使用 CategoryService 獲取產品列表
            this.currentProducts = await CategoryService.fetchProductsByCategory(
              row.id
            );
          });
        } catch (error) {
          console.error("獲取產品列表失敗", error);
          this.$message.error("獲取產品列表失敗");
        }
      } else {
        this.$message.info(`「${row.name}」類別沒有關聯的產品數據`);
      }
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

// 字體大小
$font-size-base: 18px;
$font-size-lg: 20px;
$font-size-xl: 24px;

.multi-sku {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

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
      font-size: $font-size-xl;
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
      display: flex;
      gap: 12px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  // 內容區域
  .page-content {
    background: white;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    padding: 20px;
  }

  // 表格操作區域
  .table-operations {
    margin-bottom: 20px;

    .operation-wrapper {
      padding: 16px;
      background: #f8f9fa;
      border-radius: $border-radius;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .dialog-footer {
    text-align: right;
    margin-top: 20px;
  }

  .product-count-cell {
    display: flex;
    align-items: center;
    justify-content: center;

    .product-info-icon {
      margin-left: 8px;
      color: $warning-color;
      cursor: pointer;
      transition: $transition;

      &:hover {
        transform: scale(1.2);
        color: darken($warning-color, 10%);
      }
    }
  }

  // 載入中容器
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #909399;

    p {
      margin-top: 16px;
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .multi-sku {
    padding: 16px;

    .page-header {
      padding: 16px;
      flex-direction: column;
      gap: 16px;

      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
    }

    .table-operations {
      .operation-wrapper {
        padding: 12px;
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
