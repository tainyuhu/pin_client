# BaseTable 表格組件使用指南

`BaseTable` 是一個基於 Element UI 的增強型表格組件，提供了豐富的功能和良好的性能優化，適合處理大量數據的展示和操作。本文檔將詳細介紹如何使用該組件。

## 目錄

- [基本用法](#基本用法)
- [組件特性](#組件特性)
- [屬性說明](#屬性說明)
- [事件說明](#事件說明)
- [插槽說明](#插槽說明)
- [常見使用場景](#常見使用場景)
- [性能優化建議](#性能優化建議)
- [常見問題](#常見問題)

## 基本用法

### 安裝與引入

在您的 Vue 項目中引入組件：

// 引入組件
import BaseTable from "@/components/BaseTable/index. ";

export default {
components: {
BaseTable
}
};

### 基本示例

<template>
  <base-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    height="600"
    @selection-change="handleSelectionChange"
  >
    <!-- 自定義操作列 -->
    <template #action="{ row }">
      <el-button type="primary" size="small" @click="handleEdit(row)"
        >編輯</el-button
      >
      <el-button type="danger" size="small" @click="handleDelete(row)"
        >刪除</el-button
      >
    </template>
  </base-table>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      tableData: [
        { id: 1, name: "產品A", price: 100, date: "2023-01-01" },
        { id: 2, name: "產品B", price: 200, date: "2023-01-02" }
      ],
      columns: [
        { prop: "id", label: "ID", width: 80 },
        { prop: "name", label: "名稱", minWidth: 120 },
        { prop: "price", label: "價格", sortable: true },
        {
          prop: "date",
          label: "日期",
          type: "date",
          format: "YYYY-MM-DD",
          sortable: true
        }
      ],
      selectedRows: []
    };
  },
  methods: {
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },
    handleEdit(row) {
      // 實現編輯邏輯
      console.log("編輯", row);
    },
    handleDelete(row) {
      // 實現刪除邏輯
      console.log("刪除", row);
    }
  }
};
</script>

## 組件特性

BaseTable 組件具有以下特性：

1. **列設置功能**：支持自定義列顯示、排序和固定
2. **虛擬滾動**：處理大數據量時的性能優化
3. **導出功能**：支持將選中的數據導出為 Excel
4. **本地存儲**：自動保存用戶的列設置偏好
5. **彈性布局**：適應不同屏幕尺寸
6. **高度自定義**：豐富的插槽和事件

## 屬性說明

| 屬性                   | 說明                        | 類型          | 默認值                                         |
| ---------------------- | --------------------------- | ------------- | ---------------------------------------------- |
| `data`                 | 表格數據                    | Array         | 必填                                           |
| `columns`              | 列配置                      | Array         | 必填                                           |
| `height`               | 表格高度                    | String/Number | -                                              |
| `maxHeight`            | 表格最大高度                | String/Number | -                                              |
| `showToolbar`          | 是否顯示工具欄              | Boolean       | true                                           |
| `showIndex`            | 是否顯示序號列              | Boolean       | false                                          |
| `showSelectionColumn`  | 是否顯示選擇列              | Boolean       | true                                           |
| `border`               | 是否顯示邊框                | Boolean       | true                                           |
| `loading`              | 加載狀態                    | Boolean       | false                                          |
| `showPagination`       | 是否顯示分頁                | Boolean       | true                                           |
| `pageSizes`            | 每頁顯示數量選擇器          | Array         | [10, 20, 50, 100]                              |
| `showActionColumn`     | 是否顯示操作列              | Boolean       | false                                          |
| `actionFixed`          | 操作列是否固定              | String        | "right"                                        |
| `actionWidth`          | 操作列寬度                  | String/Number | 150                                            |
| `actionLabel`          | 操作列標題                  | String        | "操作"                                         |
| `filename`             | 導出文件名                  | String        | "table-data"                                   |
| `emptyText`            | 空數據文本                  | String        | "暫無數據"                                     |
| `checkSelectable`      | 行是否可選擇的判斷函數      | Function      | () => true                                     |
| `requiredColumns`      | 必選列 (不可隱藏)           | Array         | []                                             |
| `defaultImageConfig`   | 默認圖片配置                | Object        | {width: "50px", height: "50px", radius: "4px"} |
| `virtualScroll`        | 是否使用虛擬滾動            | Boolean       | false                                          |
| `rowHeight`            | 行高 (虛擬滾動時使用)       | Number        | 48                                             |
| `buffer`               | 緩衝區大小 (虛擬滾動時使用) | Number        | 20                                             |
| `defaultHiddenColumns` | 默認隱藏的列                | Array         | []                                             |

### columns 配置項說明

每個列對象可以包含以下屬性：

| 屬性          | 說明                | 類型          | 默認值 |
| ------------- | ------------------- | ------------- | ------ |
| `prop`        | 字段名稱            | String        | 必填   |
| `label`       | 列標題              | String        | 必填   |
| `width`       | 列寬度              | String/Number | -      |
| `minWidth`    | 最小列寬度          | String/Number | 80     |
| `fixed`       | 固定列 (left/right) | String        | -      |
| `sortable`    | 是否可排序          | Boolean       | false  |
| `isImage`     | 是否為圖片列        | Boolean       | false  |
| `imageWidth`  | 圖片寬度            | String        | "50px" |
| `imageHeight` | 圖片高度            | String        | "50px" |
| `imageRadius` | 圖片圓角            | String        | "4px"  |
| `type`        | 類型 (如 date)      | String        | -      |
| `format`      | 格式化模式 (日期等) | String        | -      |
| `tooltip`     | 列標題提示信息      | String        | -      |
| `formatter`   | 自定義格式化函數    | Function      | -      |
| `align`       | 對齊方式            | String        | "left" |

示例：

const columns = [
{
prop: "name",
label: "名稱",
minWidth: 120,
tooltip: "產品名稱"
},
{
prop: "price",
label: "價格",
sortable: true,
formatter: value => `$${value.toFixed(2)}`
},
{
prop: "date",
label: "日期",
type: "date",
format: "YYYY-MM-DD"
},
{
prop: "image",
label: "產品圖片",
isImage: true,
imageWidth: "80px",
imageHeight: "80px",
imageRadius: "8px"
}
];

## 事件說明

| 事件名                   | 說明         | 參數                               |
| ------------------------ | ------------ | ---------------------------------- |
| `selection-change`       | 選中項變化   | 選中的行數組                       |
| `sort-change`            | 排序變化     | {prop, order}                      |
| `current-change`         | 當前頁變化   | 當前頁頁碼                         |
| `size-change`            | 每頁數量變化 | 每頁數量                           |
| `column-width-change`    | 列寬變化     | {prop, oldWidth, newWidth, column} |
| `column-settings-change` | 列設置變化   | {order, visible, fixed, widths}    |
| `batch-process-progress` | 批處理進度   | {processed, total, percent}        |
| `image-error`            | 圖片加載錯誤 | {error, row, column}               |

## 插槽說明

| 插槽名          | 說明             | 插槽參數     |
| --------------- | ---------------- | ------------ |
| `toolbar`       | 自定義工具欄內容 | -            |
| `action`        | 自定義操作列     | {row, index} |
| `empty`         | 自定義空數據展示 | -            |
| `column-[prop]` | 自定義列內容     | {row, index} |

例如，自定義 "name" 列的內容：

<template #column-name="{ row }">
<span style="color: red">{{ row.name }}</span>
</template>

## 常見使用場景

### 1. 基本數據展示

<base-table :data="tableData" :columns="columns" height="600" />

### 2. 帶操作列的表格

<base-table
:data="tableData"
:columns="columns"
:show-action-column="true"
action-width="200"

> <template #action="{ row }">

    <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
    <el-button type="warning" size="small" @click="handleEdit(row)">編輯</el-button>
    <el-button type="danger" size="small" @click="handleDelete(row)">刪除</el-button>

  </template>
</base-table>

### 3. 使用虛擬滾動處理大數據量

<base-table
  :data="largeDataset"
  :columns="columns"
  :virtual-scroll="true"
  :row-height="48"
  :buffer="30"
  height="600"
/>

### 4. 圖片列表

const columns = [
{ prop: "id", label: "ID", width: 80 },
{ prop: "name", label: "產品名稱" },
{
prop: "image",
label: "產品圖片",
isImage: true,
imageWidth: "100px",
imageHeight: "100px"
},
{ prop: "price", label: "價格" }
];

### 5. 自定義列顯示

<base-table
:data="tableData"
:columns="columns"
:required-columns="['id', 'name']" <!-- 這些列不能被隱藏 -->
:default-hidden-columns="['desc']" <!-- 這些列默認隱藏 -->
/>

## 性能優化建議

1. **使用虛擬滾動**：當數據量超過 1000 條時，建議開啟虛擬滾動：

<base-table
  :data="largeDataset"
  :columns="columns"
  :virtual-scroll="true"
  height="600"
/>

2. **避免頻繁更新數據**：可以使用防抖或節流函數處理頻繁操作

3. **合理設置列寬**：為每一列設置合適的 `width` 或 `minWidth`，避免表格寬度計算不正確

4. **使用批處理**：處理大量數據時，使用組件內置的批處理機制

## 常見問題

### 表格列寬度不均勻或異常

**解決方案**：

- 確保為每一列設置適當的 `width` 或 `minWidth`
- 檢查表格容器是否有足夠的寬度
- 使用 `table-layout: fixed` 可以幫助穩定列寬

### 虛擬滾動時數據顯示不完整

**解決方案**：

- 增加 `buffer` 值，如 `:buffer="30"`
- 確保 `rowHeight` 值與實際行高匹配
- 確保所有行的高度一致

### 列設置保存不生效

**解決方案**：

- 確保當前路由具有有效的 `name` 屬性
- 檢查瀏覽器本地存儲是否可用
- 清空瀏覽器緩存後重試

### 導出數據格式不正確

**解決方案**：

- 確保數據中不包含複雜對象，只包含基本類型值
- 使用 `formatter` 函數將複雜數據轉換為字符串
- 檢查日期格式化是否正確

## 完整示例

<template>
  <div class="page-container">
    <base-table
      ref="baseTable"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :show-toolbar="true"
      :show-action-column="true"
      :show-index="true"
      :required-columns="['id', 'name']"
      height="600"
      @selection-change="handleSelectionChange"
    >
      <!-- 自定義工具欄 -->
      <template #toolbar>
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button
          type="danger"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
        >
          批量刪除
        </el-button>
      </template>

      <!-- 自定義名稱列 -->
      <template #column-name="{ row }">
        <el-tag>{{ row.name }}</el-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <el-button type="primary" size="small" @click="handleView(row)"
          >查看</el-button
        >
        <el-button type="warning" size="small" @click="handleEdit(row)"
          >編輯</el-button
        >
        <el-button type="danger" size="small" @click="handleDelete(row)"
          >刪除</el-button
        >
      </template>
    </base-table>

  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      tableData: [],
      columns: [
        { prop: "id", label: "ID", width: 80 },
        { prop: "name", label: "名稱", minWidth: 120 },
        { prop: "category", label: "分類", minWidth: 100 },
        { prop: "price", label: "價格", sortable: true },
        { prop: "stock", label: "庫存", sortable: true },
        {
          prop: "image",
          label: "圖片",
          isImage: true,
          imageWidth: "60px",
          imageHeight: "60px"
        },
        {
          prop: "createTime",
          label: "創建時間",
          type: "date",
          format: "YYYY-MM-DD",
          sortable: true
        },
        {
          prop: "status",
          label: "狀態",
          formatter: value => (value === 1 ? "啟用" : "禁用")
        },
        { prop: "description", label: "描述", minWidth: 200 }
      ],
      selectedRows: []
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    // 獲取數據
    fetchData() {
      this.loading = true;
      // 模擬API請求
      setTimeout(() => {
        this.tableData = Array.from({ length: 100 }, (_, index) => ({
          id: index + 1,
          name: `產品${index + 1}`,
          category: ["電子", "服裝", "食品", "家具"][index % 4],
          price: Math.floor(Math.random() * 1000),
          stock: Math.floor(Math.random() * 500),
          image: "https://example.com/image.jpg",
          createTime: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 86400000
          ),
          status: Math.random() > 0.5 ? 1 : 0,
          description: `這是產品${index + 1}的詳細描述信息。`
        }));
        this.loading = false;
      }, 1000);
    },

    // 選擇變化
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },

    // 新增
    handleAdd() {
      // 實現新增邏輯
      this.$message.success("點擊了新增按鈕");
    },

    // 查看
    handleView(row) {
      this.$message.info(`查看 ID: ${row.id}, 名稱: ${row.name}`);
    },

    // 編輯
    handleEdit(row) {
      this.$message.warning(`編輯 ID: ${row.id}, 名稱: ${row.name}`);
    },

    // 刪除
    handleDelete(row) {
      this.$confirm(`確定要刪除 ${row.name} 嗎?`, "提示", {
        type: "warning"
      })
        .then(() => {
          // 實現刪除邏輯
          this.$message.success(`成功刪除 ${row.name}`);
        })
        .catch(() => {});
    },

    // 批量刪除
    handleBatchDelete() {
      this.$confirm(
        `確定要刪除選中的 ${this.selectedRows.length} 項嗎?`,
        "提示",
        {
          type: "warning"
        }
      )
        .then(() => {
          // 實現批量刪除邏輯
          this.$message.success(`成功刪除 ${this.selectedRows.length} 項`);
          // 清空選擇
          this.$refs.baseTable.handleSelectAll(false);
        })
        .catch(() => {});
    }
  }
};
</script>

---

如有其他問題或需求，請聯繫開發團隊。
