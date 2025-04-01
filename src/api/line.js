import request from "@/utils/request";

// LINE 用戶相關的 API
export const lineUserAPI = {
  // 獲取 LINE 用戶列表
  getUsers(params) {
    return request({
      url: "/line_bot/line-users/",
      method: "get",
      params
    });
  },

  // 獲取特定 LINE 用戶詳情
  getUserDetail(id) {
    return request({
      url: `/line_bot/line-users/${id}/`,
      method: "get"
    });
  },

  // 檢查用戶綁定狀態
  checkBindStatus(id) {
    return request({
      url: `/line_bot/${id}/check_bind_status/`,
      method: "get"
    });
  },

  // 獲取LINE登入URL
  getLoginUrl() {
    return request({
      url: "/line_bot/line-login-url/",
      method: "get"
    });
  },

  // 處理LINE登入回調
  handleLoginCallback(data) {
    return request({
      url: "/line_bot/line-login-callback/",
      method: "post",
      data
    });
  },

  // 綁定用戶
  bindUser(lineUserId, data) {
    return request({
      url: `/line_bot/line-users/${lineUserId}/bind_user/`,
      method: "post",
      data
    });
  },

  // 解除綁定
  unbindUser(lineUserId) {
    return request({
      url: `/line_bot/line-users/${lineUserId}/unbind_user/`,
      method: "post"
    });
  },

  // 發送消息給用戶
  sendMessage(lineUserId, message) {
    return request({
      url: `/line_bot/line-users/${lineUserId}/send_message/`,
      method: "post",
      data: { message }
    });
  },

  // 獲取用戶消息統計
  getMessageStatistics(lineUserId, days = 7) {
    return request({
      url: `/line_bot/line-users/${lineUserId}/message_statistics/`,
      method: "get",
      params: { days }
    });
  },

  // 獲取未綁定的系統用戶
  getUnboundSystemUsers() {
    return request({
      url: "/line_bot/line-users/unbound_system_users/",
      method: "get"
    });
  },

  // 獲取綁定統計
  getBindingStatistics() {
    return request({
      url: "/line_bot/line-users/binding_statistics/",
      method: "get"
    });
  }
};

// LINE 消息相關的 API
export const lineMessageAPI = {
  // 獲取消息列表
  getMessages(params) {
    return request({
      url: "/line_bot/line-messages/",
      method: "get",
      params
    });
  },

  // 批量發送消息
  bulkSend(data) {
    return request({
      url: "/line_bot/line-messages/bulk_send/",
      method: "post",
      data
    });
  },

  // 獲取每日用戶活動統計
  getDailyActivity(days = 30) {
    return request({
      url: "/line_bot/statistics/daily-activity/",
      method: "get",
      params: { days }
    });
  }
};

// LINE 統計相關的 API
export const lineStatisticsAPI = {
  // 獲取用戶統計
  getUserStatistics() {
    return request({
      url: "/line_bot/statistics/user/",
      method: "get"
    });
  },

  // 獲取每日活動統計
  getDailyActivity(days = 30) {
    return request({
      url: "/line_bot/statistics/daily-activity/",
      method: "get",
      params: { days }
    });
  }
};

// LINE 工具函數
export const lineUtils = {
  // 生成 LINE Login URL
  generateLoginUrl(redirectUri, state) {
    const LINE_CHANNEL_ID = process.env.VUE_APP_LINE_CHANNEL_ID;
    return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=profile`;
  },

  // 格式化時間
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  },

  // 生成隨機 state
  generateState() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }
};

// 預設導出所有 API
export default {
  user: lineUserAPI,
  message: lineMessageAPI,
  statistics: lineStatisticsAPI,
  utils: lineUtils
};
