/**
 * 密碼驗證規則：
 * 1. 至少 8 個字元
 * 2. 包含至少一個英文字母
 * 3. 包含至少一個數字
 */
export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error("請輸入密碼"));
    return;
  }

  // 檢查長度
  if (value.length < 8) {
    callback(new Error("密碼長度至少需要8個字元"));
    return;
  }

  // 檢查是否包含英文字母
  if (!/[a-zA-Z]/.test(value)) {
    callback(new Error("密碼需要包含英文字母"));
    return;
  }

  // 檢查是否包含數字
  if (!/[0-9]/.test(value)) {
    callback(new Error("密碼需要包含數字"));
    return;
  }

  callback();
};
