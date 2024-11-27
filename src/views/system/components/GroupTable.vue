<template>
  <el-table
    v-loading="loading"
    :data="data"
    border
    stripe
    row-key="id"
    default-expand-all
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    class="desktop-table"
  >
    <el-table-column type="index" width="60" align="center" label="序號" />
    <el-table-column prop="name" label="群組名稱" min-width="200" />
    <el-table-column
      prop="user_count"
      label="使用者數量"
      width="120"
      align="center"
    >
      <template #default="{ row }">
        <el-link
          :underline="false"
          type="primary"
          @click="$emit('show-users', row)"
          :loading="row.loading"
        >
          {{ row.user_count || 0 }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="120" align="center">
      <template #default="{ row }">
        <el-button
          v-if="row.type !== 'root'"
          type="primary"
          size="mini"
          icon="el-icon-edit"
          @click="$emit('edit', row)"
        >
          編輯
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "GroupTable",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ["show-users", "edit"]
};
</script>
