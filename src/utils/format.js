/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} [format='YYYY-MM-DD HH:mm:ss']
 * @returns {string}
 */
export function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  if (!date) return "";

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 格式化貨幣
 * @param {number} amount
 * @param {string} [currency='TWD']
 * @returns {string}
 */
export function formatCurrency(amount, currency = "TWD") {
  if (typeof amount !== "number") return "";

  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}
