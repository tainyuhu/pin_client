// src/utils/statusHelpers.js

/**
 * 狀態類型配置
 * 定義不同操作類型對應的標籤類型
 */
const TYPE_TAG_MAP = {
  // 操作類型
  create: "success", // 創建操作使用綠色
  update: "primary", // 更新操作使用藍色
  delete: "danger", // 刪除操作使用紅色
  view: "info", // 查看操作使用灰色
  approve: "success", // 批准操作使用綠色
  reject: "danger", // 拒絕操作使用紅色
  cancel: "warning", // 取消操作使用黃色

  // 訂單狀態
  pending: "warning", // 待處理使用黃色
  processing: "primary", // 處理中使用藍色
  shipped: "success", // 已出貨使用綠色
  completed: "success", // 已完成使用綠色
  cancelled: "danger", // 已取消使用紅色

  // 付款狀態
  paid: "success", // 已付款使用綠色
  unpaid: "danger", // 未付款使用紅色
  partial: "warning", // 部分付款使用黃色

  // 預設值
  default: "info" // 預設使用灰色
};

/**
 * 狀態標籤配置
 * 定義不同操作類型對應的標籤文本
 */
const TYPE_LABEL_MAP = {
  // 操作類型
  create: "新增",
  update: "修改",
  delete: "刪除",
  view: "查看",
  approve: "審核通過",
  reject: "審核拒絕",
  cancel: "取消",

  // 訂單狀態
  pending: "待處理",
  processing: "處理中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",

  // 付款狀態
  paid: "已付款",
  unpaid: "未付款",
  partial: "部分付款"
};

/**
 * 根據操作類型獲取對應的標籤類型
 * 用於設置 el-tag 組件的 type 屬性
 * @param {string} type - 操作類型
 * @returns {string} 標籤類型
 */
export function getTypeTag(type) {
  return TYPE_TAG_MAP[type] || TYPE_TAG_MAP.default;
}

/**
 * 根據操作類型獲取對應的標籤文本
 * @param {string} type - 操作類型
 * @returns {string} 標籤文本
 */
export function getTypeLabel(type) {
  return TYPE_LABEL_MAP[type] || type;
}

/**
 * 根據狀態獲取狀態文本和樣式
 * @param {string} status - 狀態代碼
 * @param {Object} options - 選項配置
 * @returns {Object} 包含標籤和樣式的對象
 */
export function getStatusInfo(status, options = {}) {
  const label = TYPE_LABEL_MAP[status] || status;
  const type = TYPE_TAG_MAP[status] || TYPE_TAG_MAP.default;

  return {
    label,
    type,
    ...options
  };
}

/**
 * 獲取所有可用的狀態選項
 * @param {string} category - 狀態類別，如 'order', 'payment'
 * @returns {Array} 狀態選項數組
 */
export function getStatusOptions(category) {
  // 根據類別返回不同的選項
  switch (category) {
    case "order":
      return [
        {
          value: "pending",
          label: TYPE_LABEL_MAP.pending,
          type: TYPE_TAG_MAP.pending
        },
        {
          value: "processing",
          label: TYPE_LABEL_MAP.processing,
          type: TYPE_TAG_MAP.processing
        },
        {
          value: "shipped",
          label: TYPE_LABEL_MAP.shipped,
          type: TYPE_TAG_MAP.shipped
        },
        {
          value: "completed",
          label: TYPE_LABEL_MAP.completed,
          type: TYPE_TAG_MAP.completed
        },
        {
          value: "cancelled",
          label: TYPE_LABEL_MAP.cancelled,
          type: TYPE_TAG_MAP.cancelled
        }
      ];

    case "payment":
      return [
        { value: "paid", label: TYPE_LABEL_MAP.paid, type: TYPE_TAG_MAP.paid },
        {
          value: "unpaid",
          label: TYPE_LABEL_MAP.unpaid,
          type: TYPE_TAG_MAP.unpaid
        },
        {
          value: "partial",
          label: TYPE_LABEL_MAP.partial,
          type: TYPE_TAG_MAP.partial
        }
      ];

    default:
      return [];
  }
}
