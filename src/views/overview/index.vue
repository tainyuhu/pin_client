<template>
  <div class="app-container">
    <!-- 頁面標題區 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">團購活動</h2>
        <div class="sub-title">為您精選優質團購商品</div>
      </div>
    </div>

    <!-- 搜索區 -->
    <el-card class="filter-container" shadow="hover">
      <el-form
        :inline="true"
        :model="queryParams"
        class="search-form"
        size="small"
      >
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索活動名稱"
            clearable
            prefix-icon="el-icon-search"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="queryParams.status"
            placeholder="活動狀態"
            clearable
          >
            <el-option label="進行中" value="active">
              <i class="el-icon-video-play status-icon"></i> 進行中
            </el-option>
            <el-option label="已結束" value="ended">
              <i class="el-icon-video-pause status-icon"></i> 已結束
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="queryParams.region"
            placeholder="選擇區域"
            clearable
          >
            <el-option label="台北市" value="taipei">
              <i class="el-icon-location status-icon"></i> 台北市
            </el-option>
            <el-option label="新北市" value="newTaipei">
              <i class="el-icon-location status-icon"></i> 新北市
            </el-option>
            <el-option label="全區域" value="all">
              <i class="el-icon-location status-icon"></i> 全區域
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活動列表 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col
        v-for="item in groupBuyList"
        :key="item.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
        style="margin-bottom: 20px"
      >
        <el-card
          :body-style="{ padding: '0px' }"
          class="activity-card"
          shadow="hover"
          :class="{ 'ended-card': item.status === 'ended' }"
        >
          <!-- 活動圖片 -->
          <div class="activity-image" @click="viewDetail(item.id)">
            <img :src="item.image" class="image" />
            <div class="activity-status" :class="item.statusClass">
              {{ item.statusText }}
            </div>
            <div class="image-overlay">
              <span class="view-detail">查看詳情</span>
            </div>
          </div>

          <!-- 活動內容 -->
          <div class="activity-content">
            <h3 class="activity-title" @click="viewDetail(item.id)">
              {{ item.title }}
            </h3>

            <!-- 區域標籤 -->
            <div class="region-tags">
              <el-tag
                v-for="region in item.regions"
                :key="region"
                size="mini"
                effect="light"
                class="region-tag"
              >
                <i class="el-icon-location-outline"></i> {{ region }}
              </el-tag>
            </div>

            <!-- 活動概要 -->
            <div class="activity-summary">{{ item.summary }}</div>

            <div class="activity-info">
              <!-- 商品數量 -->
              <div class="info-item">
                <i class="el-icon-goods"></i>
                <span>{{ item.productCount }}項商品</span>
              </div>

              <!-- 收單時間 -->
              <div class="info-item">
                <i class="el-icon-time"></i>
                <span>收單時間：{{ formatDateTime(item.endTime) }}</span>
              </div>
            </div>

            <div class="activity-footer">
              <el-button
                type="primary"
                size="small"
                @click="viewDetail(item.id)"
                :disabled="item.status === 'ended'"
                class="buy-button"
              >
                <i class="el-icon-shopping-cart-2"></i>
                {{ item.status === "ended" ? "已結束" : "立即購買" }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 使用 Pagination 組件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
export default {
  name: "GroupBuyOverview",
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 8,
        keyword: "",
        status: ""
      },
      total: 0,
      groupBuyList: [
        {
          id: 1,
          title: "日本空運草莓季預購",
          image: "/api/placeholder/400/300",
          price: 699,
          originalPrice: 899,
          status: "active",
          statusText: "進行中",
          statusClass: "status-active",
          soldCount: 156,
          targetCount: 200,
          progressPercentage: 78,
          progressStatus: "success",
          endTime: "2024-12-25 23:59:59"
        },
        {
          id: 2,
          title: "Apple AirPods Pro 2",
          image: "/api/placeholder/400/300",
          price: 5999,
          originalPrice: 7990,
          status: "ended",
          statusText: "已結束",
          statusClass: "status-ended",
          soldCount: 95,
          targetCount: 100,
          progressPercentage: 95,
          progressStatus: "success",
          endTime: "2024-12-20 23:59:59"
        }
      ]
    };
  },
  methods: {
    formatDateTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date
        .getDate()
        .toString()
        .padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },
    handleSearch() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 8,
        keyword: "",
        status: ""
      };
      this.getList();
    },
    viewDetail(id) {
      this.$router.push(`/groupbuy/detail/${id}`);
    },
    getList() {
      // TODO: 調用後端API獲取數據
      console.log("Fetching list with params:", this.queryParams);
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    }
  },
  created() {
    this.getList();
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 24px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  margin: 0;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 14px;
  opacity: 0.8;
}

.filter-container {
  margin-bottom: 24px;
  border-radius: 8px;

  .el-select {
    width: 160px;
  }
}

.status-icon {
  margin-right: 8px;
}

.activity-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: none;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

    .image-overlay {
      opacity: 1;
    }
  }
}

.ended-card {
  opacity: 0.8;
  filter: grayscale(20%);
}

.activity-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;

  .view-detail {
    color: white;
    font-size: 16px;
    padding: 8px 16px;
    border: 2px solid white;
    border-radius: 20px;
  }
}

.activity-status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  backdrop-filter: blur(4px);
  z-index: 1;
}

.status-active {
  background-color: rgba(103, 194, 58, 0.9);
}

.status-ended {
  background-color: rgba(144, 147, 153, 0.9);
}

.activity-content {
  padding: 16px;
}

.activity-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
  cursor: pointer;

  &:hover {
    color: #409eff;
  }
}

.region-tags {
  margin-bottom: 12px;

  .region-tag {
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 16px;

    .el-icon-location-outline {
      margin-right: 4px;
    }
  }
}

.activity-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-item {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    font-size: 16px;
    color: #409eff;
  }
}

.activity-footer {
  margin-top: 16px;
  text-align: right;

  .buy-button {
    padding: 10px 20px;
    border-radius: 20px;

    i {
      margin-right: 4px;
    }
  }
}

@media screen and (max-width: 768px) {
  .app-container {
    padding: 12px;
  }

  .page-header {
    padding: 16px;
    margin-bottom: 16px;
  }

  .filter-container {
    .search-form {
      .el-form-item {
        margin-right: 0;
        margin-bottom: 12px;
        display: block;
        width: 100%;
      }

      .el-input,
      .el-select {
        width: 100%;
      }

      .search-buttons {
        display: flex;
        gap: 8px;

        .el-button {
          flex: 1;
        }
      }
    }
  }

  .activity-image {
    height: 160px;
  }
}
</style>
