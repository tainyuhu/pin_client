<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="1000px"
    append-to-body
    destroy-on-close
    class="user-list-dialog"
  >
    <div class="user-list-wrapper">
      <!-- 搜索區域 -->
      <div class="search-section">
        <div class="search-container">
          <!-- 欄位選擇器 -->
          <el-select
            v-model="searchField"
            placeholder="選擇欄位"
            class="field-select"
          >
            <el-option label="全部欄位" value="all" />
            <el-option label="帳號" value="username" />
            <el-option label="姓名" value="name" />
            <el-option label="Email" value="email" />
            <el-option label="電話" value="phone" />
            <el-option label="群組" value="dept__name" />
          </el-select>

          <!-- 搜尋輸入框 -->
          <el-input
            v-model="searchText"
            :placeholder="getPlaceholder"
            prefix-icon="el-icon-search"
            clearable
            class="search-input"
            @clear="handleSearch"
            @input="handleSearchInput"
          />
        </div>
      </div>

      <!-- 表格區域 -->
      <div class="table-section">
        <el-table
          ref="userTable"
          v-loading="loading"
          :data="filteredUserList"
          :height="tableHeight"
          border
          stripe
        >
          <el-table-column
            type="index"
            width="60"
            align="center"
            label="序號"
            :index="getIndex"
            class-name="column-index"
          />
          <el-table-column
            prop="username"
            label="帳號"
            min-width="120"
            show-overflow-tooltip
            sortable
            class-name="column-username"
          >
            <template #default="{ row }">
              <span v-html="highlightText(row.username)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名"
            min-width="100"
            show-overflow-tooltip
            sortable
            class-name="column-name"
          >
            <template #default="{ row }">
              <span v-html="highlightText(row.name)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="email"
            label="Email"
            min-width="180"
            show-overflow-tooltip
            class-name="column-email"
          >
            <template #default="{ row }">
              <span v-html="highlightText(row.email)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="phone"
            label="電話"
            min-width="120"
            show-overflow-tooltip
            class-name="column-phone"
          >
            <template #default="{ row }">
              <span v-html="highlightText(row.phone)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="dept__name"
            label="所屬群組"
            min-width="120"
            show-overflow-tooltip
            sortable
            class-name="column-dept"
          >
            <template #default="{ row }">
              <span v-html="highlightText(row.dept__name)"></span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分頁區域 -->
      <div class="pagination-section">
        <el-pagination
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "UserListDialog",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    dialogTitle: {
      type: String,
      default: "使用者清單"
    },
    userList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchText: "",
      searchField: "all",
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchTimeout: null,
      tableHeight: 450
    };
  },
  computed: {
    // 添加動態placeholder
    getPlaceholder() {
      const fieldMap = {
        all: "搜尋全部欄位",
        username: "搜尋帳號",
        name: "搜尋姓名",
        email: "搜尋Email",
        phone: "搜尋電話",
        dept__name: "搜尋群組"
      };
      return fieldMap[this.searchField] || "請輸入搜尋文字";
    },
    filteredUserList() {
      if (!this.searchText) {
        this.total = this.userList.length;
        return this.paginateData(this.userList);
      }

      const searchValue = this.searchText.toLowerCase().trim();

      let filtered = this.userList.filter(user => {
        if (this.searchField === "all") {
          return (
            this.includesText(user.username, searchValue) ||
            this.includesText(user.name, searchValue) ||
            this.includesText(user.email, searchValue) ||
            this.includesText(user.phone, searchValue) ||
            this.includesText(user.dept__name, searchValue)
          );
        } else {
          return this.includesText(user[this.searchField], searchValue);
        }
      });

      this.total = filtered.length;
      return this.paginateData(filtered);
    }
  },
  methods: {
    includesText(value, searchText) {
      return String(value)
        .toLowerCase()
        .includes(searchText);
    },
    highlightText(text) {
      if (
        !this.searchText ||
        (this.searchField !== "all" &&
          !text
            .toString()
            .toLowerCase()
            .includes(this.searchText.toLowerCase()))
      ) {
        return text;
      }

      const regex = new RegExp(this.escapeRegExp(this.searchText), "gi");
      return text
        .toString()
        .replace(
          regex,
          match => `<span class="highlight-text">${match}</span>`
        );
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },
    paginateData(data) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return data.slice(startIndex, endIndex);
    },
    handleSearchInput() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.handleSearch();
      }, 300);
    },
    handleSearch() {
      this.currentPage = 1;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    getIndex(index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },
    calculateTableHeight() {
      // 計算表格高度
      const windowHeight = window.innerHeight;
      const minHeight = 300; // 最小高度
      const maxHeight = 600; // 最大高度
      const calculatedHeight = windowHeight * 0.5; // 視窗高度的50%

      this.tableHeight = Math.min(
        Math.max(calculatedHeight, minHeight),
        maxHeight
      );
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.searchText = "";
        this.searchField = "all";
        this.currentPage = 1;
        this.$nextTick(() => {
          this.calculateTableHeight();
        });
      }
    },
    searchField() {
      this.handleSearch();
    }
  },
  mounted() {
    this.calculateTableHeight();
    window.addEventListener("resize", this.calculateTableHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.calculateTableHeight);
  }
};
</script>

<style lang="scss" scoped>
.user-list-dialog {
  // 欄位選擇器樣式優化
  .field-select {
    padding: 5px;
    .el-input__inner {
      border-radius: 4px;
    }
  }

  .el-select-dropdown__item {
    padding: 0 12px;
    height: 34px;
    line-height: 34px;
  }

  // 搜尋框樣式優化
  .search-input {
    padding: 5px;
    .el-input__inner {
      border-radius: 4px;
    }

    .el-input__prefix {
      left: 8px;
    }

    .el-input__inner {
      padding-left: 32px;
    }
  }

  .table-section {
    position: relative;
  }

  .pagination-section {
    padding: 16px 0 0 0;
    display: flex;
    justify-content: flex-end;
  }
}

// 高亮文字樣式
.highlight-text {
  background-color: #ffd04b;
  padding: 0 2px;
  border-radius: 2px;
}
</style>

<style lang="scss">
// 全局樣式 - 針對特定組件
.user-list-dialog {
  // 表格樣式
  .el-table {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      padding: 8px 0;
    }

    td {
      padding: 8px 0;
    }
  }

  // 搜尋框樣式
  .el-input-group__append {
    background-color: #fff;
    padding: 0;

    .el-select {
      .el-input__inner {
        border: none;
        padding: 0 8px;
      }
    }
  }

  // 分頁樣式
  .el-pagination {
    padding: 0;
    font-weight: normal;

    .el-pagination__total {
      margin-right: 16px;
    }
  }
}
</style>
