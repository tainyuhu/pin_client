<template>
  <div class="dashboard-container">
    <!-- 員工資訊區塊 -->
    <el-card class="employee-info" shadow="hover">
      <div class="employee-title">員工資訊</div>
      <p><strong>員工編號:</strong> {{ employeeData.employeeId }}</p>
      <p><strong>員工姓名:</strong> {{ employeeData.employeeName }}</p>
    </el-card>

    <!-- 可參加團購區塊 -->
    <el-card class="group-purchase" shadow="hover">
      <div class="section-title">可參加團購</div>
      <div class="purchase-grid">
        <div
          v-for="purchase in paginatedPurchases"
          :key="purchase.id"
          class="purchase-card"
        >
          <el-image :src="purchase.image" fit="cover" class="purchase-image" />
          <div class="purchase-info">
            <div class="purchase-header">
              <h3>{{ purchase.name }}</h3>
              <el-tag :class="getTagClass(purchase.region)">{{
                purchase.region
              }}</el-tag>
            </div>
            <p class="purchase-description">{{ purchase.description }}</p>
            <p class="purchase-deadline">
              <strong>活動期限:</strong> {{ purchase.deadline }}
            </p>
            <el-button
              class="custom-button"
              size="small"
              @click="placeOrder(purchase)"
            >
              立即購買
            </el-button>
          </div>
        </div>
      </div>
      <!-- 分頁控制 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="availablePurchases.length"
          :page-size="purchasePageSize"
          :current-page.sync="purchaseCurrentPage"
        />
      </div>
    </el-card>

    <!-- 已購訂單區塊 -->
    <el-card class="order-history" shadow="hover">
      <div class="section-title">已購訂單</div>
      <el-table :data="paginatedOrders" style="width: 100%">
        <el-table-column
          prop="orderId"
          label="訂單編號"
          width="180"
        ></el-table-column>
        <el-table-column prop="purchaseName" label="團購名稱"></el-table-column>
        <el-table-column
          prop="quantity"
          label="數量"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="date"
          label="購買日期"
          width="180"
        ></el-table-column>
      </el-table>
      <!-- 分頁控制 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="orderHistory.length"
          :page-size="orderPageSize"
          :current-page.sync="orderCurrentPage"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      employeeData: {
        employeeId: "E12345",
        employeeName: "王小明"
      },
      availablePurchases: [
        {
          id: 1,
          name: "白蝦團購",
          description: "高品質冷凍白蝦，限時團購",
          deadline: "2023/12/31",
          region: "高雄",
          image: "https://via.placeholder.com/200",
          isActive: true
        },
        {
          id: 2,
          name: "海藻保健食品",
          description: "營養豐富的海藻食品",
          deadline: "2024/01/15",
          region: "台中",
          image: "https://via.placeholder.com/200",
          isActive: false
        }
      ],
      purchasePageSize: 2,
      purchaseCurrentPage: 1,
      orderHistory: [
        {
          orderId: "OD20231001",
          purchaseName: "白蝦團購",
          quantity: 2,
          date: "2023/10/01"
        },
        {
          orderId: "OD20231002",
          purchaseName: "海藻保健食品",
          quantity: 1,
          date: "2023/10/02"
        }
      ],
      orderPageSize: 5,
      orderCurrentPage: 1
    };
  },
  computed: {
    paginatedPurchases() {
      const start = (this.purchaseCurrentPage - 1) * this.purchasePageSize;
      const end = start + this.purchasePageSize;
      return this.availablePurchases.slice(start, end);
    },
    paginatedOrders() {
      const start = (this.orderCurrentPage - 1) * this.orderPageSize;
      const end = start + this.orderPageSize;
      return this.orderHistory.slice(start, end);
    }
  },
  methods: {
    placeOrder(purchase) {
      alert(`已下單: ${purchase.name}`);
    },
    getTagClass(region) {
      return (
        {
          高雄: "tag-success",
          台中: "tag-warning",
          台北: "tag-danger"
        }[region] || "tag-info"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: $beige;
}

.employee-info,
.group-purchase,
.order-history {
  padding: 20px;
  background-color: $white;
  border-radius: 8px;
}

.section-title,
.employee-title {
  font-size: 22px;
  font-weight: bold;
  color: $navy-blue;
  margin-bottom: 12px;
}

.purchase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.purchase-card {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba($navy-blue, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: $white;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 6px 12px rgba($navy-blue, 0.15);
  }
}

.purchase-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.purchase-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.purchase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    color: $navy-blue;
  }
}

.purchase-description {
  color: rgba($navy-blue, 0.8);
}

.purchase-deadline {
  font-size: 14px;
  color: rgba($navy-blue, 0.6);
}

// 自定義按鈕樣式
.custom-button {
  background-color: $orange;
  color: $white;
  border: none;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darken($orange, 10%);
  }
}

// 分頁容器樣式
.pagination-container {
  display: flex;
  justify-content: center; // 分頁置中
  margin-top: 20px; // 與上方內容保持距離
}

// 分頁按鈕樣式
.el-pagination {
  .el-pagination__link {
    color: $navy-blue;
  }
}
</style>
