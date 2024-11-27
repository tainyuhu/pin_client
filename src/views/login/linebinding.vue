<template>
  <div class="binding-container">
    <!-- LOGO 區域 -->
    <div class="logo-container">
      <img src="@/assets/logo/sunny_logo.png" alt="LOGO" class="logo" />
    </div>

    <div class="binding-card">
      <div class="title-container">
        <h3 class="title">LINE 帳號綁定</h3>
      </div>

      <!-- 綁定狀態 -->
      <div class="status-info">
        <div class="status-label">目前狀態</div>
        <div
          :class="[
            'status-value',
            isLineBound ? 'status-bound' : 'status-unbound'
          ]"
        >
          {{ isLineBound ? "已綁定" : "未綁定" }}
        </div>
      </div>

      <!-- LINE 帳號資訊 -->
      <div v-if="isLineBound" class="line-info">
        <div class="line-profile">
          <img
            :src="lineUserInfo.pictureUrl"
            alt="LINE頭像"
            class="line-avatar"
          />
          <div class="line-details">
            <div class="line-name">{{ lineUserInfo.displayName }}</div>
            <div class="bind-time">綁定時間：{{ lineUserInfo.bindTime }}</div>
          </div>
        </div>
      </div>

      <!-- 綁定說明 -->
      <div v-else class="binding-guide">
        <div class="guide-title">
          <i class="el-icon-info"></i>
          綁定說明
        </div>
        <div class="guide-steps">
          <p>1. 點擊下方「綁定 LINE」按鈕</p>
          <p>2. 掃描 QR Code 或點擊連結</p>
          <p>3. 在 LINE 應用程式中確認授權</p>
        </div>
      </div>

      <!-- 按鈕區域 -->
      <div class="button-group">
        <el-button
          v-if="!isLineBound"
          type="success"
          class="line-button"
          :loading="loading"
          @click="handleBinding"
        >
          綁定 LINE
        </el-button>

        <el-button
          v-else
          type="danger"
          class="unbind-button"
          :loading="loading"
          @click="handleUnbinding"
        >
          解除綁定
        </el-button>

        <el-button class="back-button" @click="handleBack">
          返回
        </el-button>
      </div>

      <!-- 注意事項 -->
      <div class="notice-box">
        <div class="notice-title">
          <i class="el-icon-warning-outline"></i>
          注意事項
        </div>
        <ul class="notice-list">
          <li>綁定後可接收訂單狀態更新通知</li>
          <li>每個 LINE 帳號僅能綁定一個系統帳號</li>
          <li>解除綁定後將無法接收通知訊息</li>
        </ul>
      </div>
    </div>

    <!-- 解除綁定確認對話框 -->
    <el-dialog
      title="確認解除綁定"
      :visible.sync="unbindDialogVisible"
      width="400px"
      center
    >
      <div class="unbind-confirm">
        <i class="el-icon-warning"></i>
        <p>解除綁定後將無法接收LINE通知，確定要解除綁定嗎？</p>
      </div>
      <span slot="footer">
        <el-button @click="unbindDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmUnbinding">確認解除</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "LineBinding",

  data() {
    return {
      isLineBound: false,
      loading: false,
      unbindDialogVisible: false,
      lineUserInfo: {
        pictureUrl: "",
        displayName: "",
        bindTime: ""
      }
    };
  },

  created() {
    this.checkBindingStatus();
  },

  methods: {
    checkBindingStatus() {
      // TODO: 檢查綁定狀態的 API 調用
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        // 模擬數據
        this.isLineBound = false;
      }, 1000);
    },

    handleBinding() {
      this.loading = true;
      // TODO: 實際的 LINE 綁定邏輯
      setTimeout(() => {
        this.loading = false;
        this.$message.success("LINE 綁定成功");
        this.isLineBound = true;
      }, 1500);
    },

    handleUnbinding() {
      this.unbindDialogVisible = true;
    },

    confirmUnbinding() {
      this.loading = true;
      // TODO: 實際的解除綁定邏輯
      setTimeout(() => {
        this.loading = false;
        this.unbindDialogVisible = false;
        this.$message.success("已解除 LINE 綁定");
        this.isLineBound = false;
      }, 1500);
    },

    handleBack() {
      this.$router.push("/dashboard");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.binding-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $navy-blue;
  padding: 20px;
}

.logo-container {
  margin-bottom: 30px;

  .logo {
    width: 200px;
    height: auto;
  }
}

.binding-card {
  width: 100%;
  max-width: 500px;
  background: rgba($white, 0.1);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title-container {
  text-align: center;
  margin-bottom: 30px;

  .title {
    color: $white;
    font-size: 24px;
    font-weight: bold;
  }
}

.status-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .status-label {
    color: $white;
    margin-right: 10px;
  }

  .status-value {
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: bold;

    &.status-bound {
      background-color: rgba($green, 0.2);
      color: $green;
    }

    &.status-unbound {
      background-color: rgba($orange, 0.2);
      color: $orange;
    }
  }
}

.line-info {
  background: rgba($white, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .line-profile {
    display: flex;
    align-items: center;

    .line-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 15px;
    }

    .line-details {
      color: $white;

      .line-name {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .bind-time {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

.binding-guide {
  background: rgba($white, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  color: $white;

  .guide-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-weight: bold;
  }

  .guide-steps {
    font-size: 14px;
    opacity: 0.9;

    p {
      margin-bottom: 8px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  .line-button {
    background-color: #00c300;
    border-color: #00c300;
    height: 45px;
    font-weight: bold;

    &:hover {
      background-color: darken(#00c300, 10%);
      border-color: darken(#00c300, 10%);
    }
  }

  .unbind-button {
    background-color: $red;
    border-color: $red;
    height: 45px;
    font-weight: bold;

    &:hover {
      background-color: darken($red, 10%);
      border-color: darken($red, 10%);
    }
  }

  .back-button {
    background-color: transparent;
    border: 1px solid rgba($white, 0.3);
    color: $white;
    height: 45px;

    &:hover {
      background-color: rgba($white, 0.1);
      border-color: $white;
    }
  }
}

.notice-box {
  background: rgba($white, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: $white;

  .notice-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    color: $gold;
    font-weight: bold;
  }

  .notice-list {
    list-style: none;
    padding: 0;
    margin: 0;
    opacity: 0.9;
    font-size: 14px;

    li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;

      &:before {
        content: "•";
        position: absolute;
        left: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.unbind-confirm {
  text-align: center;
  padding: 20px 0;

  i {
    font-size: 24px;
    color: $red;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    color: #606266;
  }
}
</style>
