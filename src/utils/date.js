// src/utils/date.js

/**
 * 日期處理工具模組
 * 提供各種日期格式化、解析和比較功能
 */

// 日期格式預設值
export const DATE_FORMATS = {
  DATE: "YYYY-MM-DD",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  TIME: "HH:mm:ss",
  MONTH: "YYYY-MM",
  YEAR: "YYYY"
};

/**
 * 驗證日期是否有效
 * @param {Date|string|number} date - 要驗證的日期
 * @returns {boolean} 是否為有效日期
 */
export function isValidDate(date) {
  if (date === null || date === undefined || date === "") return false;

  // 如果是 Date 對象，直接驗證
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }

  // 如果是數字字符串，確保是有效的時間戳
  if (typeof date === "string" && !isNaN(date)) {
    const timestamp = parseInt(date, 10);
    return !isNaN(new Date(timestamp).getTime());
  }

  // 嘗試解析日期字符串
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 要格式化的日期
 * @param {string} [format=DATE_FORMATS.DATE] - 日期格式
 * @param {string} [invalidReturn=''] - 無效日期時的返回值
 * @returns {string} 格式化後的日期字串
 */
export function formatDate(
  date,
  format = DATE_FORMATS.DATE,
  invalidReturn = ""
) {
  if (!isValidDate(date)) return invalidReturn;

  const d = new Date(date);

  // 定義所有可能的格式化標記
  const tokens = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, "0"),
    DD: String(d.getDate()).padStart(2, "0"),
    HH: String(d.getHours()).padStart(2, "0"),
    mm: String(d.getMinutes()).padStart(2, "0"),
    ss: String(d.getSeconds()).padStart(2, "0"),
    // 添加更多格式化選項
    M: d.getMonth() + 1,
    D: d.getDate(),
    H: d.getHours(),
    m: d.getMinutes(),
    s: d.getSeconds(),
    SSS: String(d.getMilliseconds()).padStart(3, "0")
  };

  // 使用正則表達式進行替換，避免部分替換問題
  return format.replace(
    /YYYY|MM|DD|HH|mm|ss|M|D|H|m|s|SSS/g,
    match => tokens[match]
  );
}

/**
 * 解析日期字串
 * @param {string} dateString - 日期字串
 * @param {string} [format=DATE_FORMATS.DATE] - 日期格式
 * @returns {Date|null} 解析後的日期物件，解析失敗時返回 null
 */
export function parseDate(dateString, format = DATE_FORMATS.DATE) {
  if (!dateString) return null;

  // 首先嘗試直接解析標準格式
  if (format === DATE_FORMATS.DATE || format === DATE_FORMATS.DATETIME) {
    const parsed = new Date(dateString);
    if (isValidDate(parsed)) return parsed;
  }

  // 處理自定義格式
  try {
    const formatTokens = format.match(/YYYY|MM|DD|HH|mm|ss/g) || [];
    const valueTokens = dateString.match(/\d+/g) || [];

    if (valueTokens.length < formatTokens.length) return null;

    const dateValues = {
      YYYY: 1970,
      MM: 1,
      DD: 1,
      HH: 0,
      mm: 0,
      ss: 0
    };

    formatTokens.forEach((token, index) => {
      dateValues[token] = parseInt(valueTokens[index], 10);
    });

    // 月份需要減 1，因為 Date 對象的月份是從 0 開始
    const parsed = new Date(
      dateValues.YYYY,
      dateValues.MM - 1,
      dateValues.DD,
      dateValues.HH,
      dateValues.mm,
      dateValues.ss
    );

    return isValidDate(parsed) ? parsed : null;
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
}

/**
 * 計算兩個日期之間的天數差
 * @param {Date|string|number} date1 - 第一個日期
 * @param {Date|string|number} date2 - 第二個日期
 * @returns {number|null} 天數差，任一日期無效時返回 null
 */
export function getDaysDifference(date1, date2) {
  if (!isValidDate(date1) || !isValidDate(date2)) return null;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // 使用 UTC 時間來避免時區問題
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 檢查日期是否在指定範圍內
 * @param {Date|string|number} date - 要檢查的日期
 * @param {Date|string|number} startDate - 開始日期
 * @param {Date|string|number} endDate - 結束日期
 * @returns {boolean} 是否在範圍內，任一參數無效時返回 false
 */
export function isDateInRange(date, startDate, endDate) {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 設置為 UTC 時間以避免時區問題
  checkDate.setUTCHours(0, 0, 0, 0);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  return checkDate >= start && checkDate <= end;
}

/**
 * 取得相對於指定日期的偏移日期
 * @param {Date|string|number} date - 基準日期
 * @param {number} days - 偏移天數
 * @param {boolean} [preserveTime=true] - 是否保留時間部分
 * @returns {Date|null} 偏移後的日期，日期無效時返回 null
 */
export function getOffsetDate(date, days, preserveTime = true) {
  if (!isValidDate(date)) return null;

  const d = new Date(date);
  if (!preserveTime) {
    d.setUTCHours(0, 0, 0, 0);
  }

  // 使用 UTC 時間來設置日期，避免 DST 問題
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * 檢查兩個日期是否為同一天
 * @param {Date|string|number} date1 - 第一個日期
 * @param {Date|string|number} date2 - 第二個日期
 * @returns {boolean} 是否為同一天
 */
export function isSameDay(date1, date2) {
  if (!isValidDate(date1) || !isValidDate(date2)) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}
