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

      <!-- 綁定說明 -->
      <div v-if="!isLineBound" class="binding-guide">
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
import { lineUserAPI, lineUtils } from "@/api/line";

export default {
  name: "LineBinding",

  data() {
    return {
      isLineBound: false,
      loading: false,
      unbindDialogVisible: false,
      userId: ""
    };
  },

  computed: {
    hasValidUserId() {
      return Boolean(this.userId);
    }
  },

  created() {
    // 從 URL query 中獲取參數
    this.userId = this.$route.query.userId;

    // 初始化
    this.initialize();
  },

  methods: {
    // 初始化
    async initialize() {
      if (!this.hasValidUserId) {
        this.$message.error("無效的使用者 ID");
        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
        return;
      }
      await this.checkBindingStatus();
    },

    // 檢查綁定狀態
    async checkBindingStatus() {
      try {
        this.loading = true;
        const response = await lineUserAPI.checkBindStatus(this.userId);

        // 驗證回應資料
        if (!response || typeof response !== "object") {
          throw new Error("無效的回應數據");
        }

        const data = response.data;
        // 直接更新綁定狀態
        this.isLineBound = data.is_bound;
      } catch (error) {
        console.error("檢查綁定狀態錯誤:", error);
        this.$message.error(this.getErrorMessage(error, "檢查綁定狀態失敗"));
        this.resetBindStatus();
      } finally {
        this.loading = false;
      }
    },

    // 重置綁定狀態
    resetBindStatus() {
      this.isLineBound = false;
    },

    // 處理 LINE 綁定
    async handleBinding() {
      if (!this.hasValidUserId) {
        this.$message.error("請先登入系統");
        return;
      }

      try {
        this.loading = true;
        const response = await lineUserAPI.getLoginUrl();

        if (!response || !response.login_url) {
          throw new Error("無效的登入 URL");
        }

        // 生成並存儲 state
        const state = lineUtils.generateState();
        localStorage.setItem("line_login_state", state);
        // 存儲當前用戶 ID，用於綁定完成後的處理
        // localStorage.setItem("binding_user_id", this.userId);

        // 跳轉到 LINE 授權頁面
        window.location.href = response.login_url;
      } catch (error) {
        console.error("LINE 綁定錯誤:", error);
        this.$message.error(this.getErrorMessage(error, "LINE 綁定請求失敗"));
      } finally {
        this.loading = false;
      }
    },

    // 處理解除綁定
    handleUnbinding() {
      if (!this.isLineBound) {
        return;
      }
      this.unbindDialogVisible = true;
    },

    // 確認解除綁定
    async confirmUnbinding() {
      try {
        this.loading = true;
        const response = await lineUserAPI.unbindUser(this.userId);

        if (!response || !response.success) {
          throw new Error("解除綁定失敗");
        }

        this.$message.success("已解除 LINE 綁定");
        this.isLineBound = false;
        this.unbindDialogVisible = false;
      } catch (error) {
        console.error("解除綁定錯誤:", error);
        this.$message.error(this.getErrorMessage(error, "解除綁定失敗"));
      } finally {
        this.loading = false;
      }
    },

    // 返回按鈕處理
    handleBack() {
      this.$router.push("/dashboard");
    },

    // 獲取錯誤信息
    getErrorMessage(error, defaultMessage) {
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        return error.response.data.error;
      }

      if (error && error.message) {
        return error.message;
      }

      return defaultMessage;
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
