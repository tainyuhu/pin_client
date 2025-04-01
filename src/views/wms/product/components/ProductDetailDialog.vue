<template>
  <el-dialog
    :title="`「${categoryName}」產品列表`"
    :visible.sync="visible"
    width="900px"
    :before-close="handleClose"
  >
    <base-table
      v-loading="loading"
      :data="products"
      :columns="columns"
      :show-toolbar="true"
      :show-selection-column="false"
      :show-pagination="true"
      :filename="exportFilename"
    >
    </base-table>
  </el-dialog>
</template>
<script>
import BaseTable from "@/components/BaseTable/index";
export default {
  name: "ProductDetailDialog",
  components: {
    BaseTable
  },
  props: {
    // 對話框可見性
    visible: {
      type: Boolean,
      required: true
    },
    // 類別名稱
    categoryName: {
      type: String,
      default: ""
    },
    // 產品列表
    products: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: true,
      columns: [
        { prop: "productCode", label: "品號", width: 120, sortable: true },
        { prop: "productName", label: "品名", sortable: true },
        { prop: "specification", label: "規格", width: 120 }
      ]
    };
  },
  computed: {
    exportFilename() {
      return `${this.categoryName}產品列表_${new Date().getTime()}`;
    }
  },
  watch: {
    visible(val) {
      // 當對話框開啟時，設置 loading 狀態為 true
      if (val) {
        this.loading = true;
      }
    },

    products: {
      handler(newProducts) {
        // 當產品數據載入完成後，設置 loading 狀態為 false
        if (Array.isArray(newProducts)) {
          this.loading = false;
        }
      },
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
    }
  }
};
</script>
<style lang="scss" scoped>
.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}
::v-deep .el-dialog {
  @media screen and (max-width: 992px) {
    width: 95% !important;
    margin-top: 10vh !important;
  }
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
