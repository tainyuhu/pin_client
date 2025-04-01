// src/utils/systemLogger.js
export const LOG_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  STATE_CHANGE: "STATE_CHANGE",
  ERROR: "ERROR"
};

class SystemLogger {
  // 記錄系統日誌
  log(action, details, operator = "system") {
    const logEntry = {
      datetime: new Date().toISOString(),
      action,
      details,
      operator
    };

    // 開發環境下在控制台輸出
    if (process.env.NODE_ENV === "development") {
      console.log(`[${action}]:`, details);
    }

    // 這裡可以添加發送日誌到後端的邏輯
    // await api.post('/system-logs', logEntry);

    return logEntry;
  }
}

export const systemLogger = new SystemLogger();
