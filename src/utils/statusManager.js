// utils/statusManager.js

export const STATUS = {
  Pending: "pending",
  ACTIVE: "active",
  HISTORY: "history"
};

// 根據狀態返回對應的行為邏輯
export function getStatusActions(status) {
  const actions = {
    [STATUS.Pending]: {
      canLook: true,
      canSubmit: true,
      canDelete: true,
      canCheck: true,
      canToggleBonus: false
    },
    [STATUS.ACTIVE]: {
      canLook: true,
      canSubmit: true,
      canCheck: false,
      canToggleBonus: true,
      canDelete: false
    },
    [STATUS.HISTORY]: {
      canLook: true,
      canCheck: false,
      canSubmit: false,
      canToggleBonus: false,
      canDelete: false
    }
  };

  return actions[status] || {};
}

// 檢查按鈕是否可用
export function isActionAllowed(status, action) {
  const actions = getStatusActions(status);
  return actions[action] || false;
}
