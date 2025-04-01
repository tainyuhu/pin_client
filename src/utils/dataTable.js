/**
 * 数据表格工具函数库
 * 包含处理表格数据的常用工具函数
 */

/**
 * 深度克隆对象或数组
 * @param {Object|Array} obj 要克隆的对象或数组
 * @returns {Object|Array} 克隆后的对象或数组
 */

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Map)
    return new Map(Array.from(obj, ([key, val]) => [key, deepClone(val)]));
  if (obj instanceof Set)
    return new Set(Array.from(obj, val => deepClone(val)));

  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

/**
 * 格式化電話號碼
 * 根據不同格式處理電話號碼，並可選添加分機號
 * @param {string} phone - 電話號碼
 * @param {string} [extension] - 分機號
 * @param {string} [format='default'] - 格式化方式
 * @returns {string} 格式化後的電話號碼
 */
export function formatPhone(phone, extension, format = "default") {
  if (!phone) return "";

  let formattedPhone = "";

  // 移除所有非數字字符
  const digits = phone.replace(/\D/g, "");

  switch (format) {
    case "intl": // 國際格式 +XX-XXXX-XXXX
      if (digits.length >= 10) {
        const countryCode = digits.slice(0, digits.length - 10);
        const areaCode = digits.slice(digits.length - 10, digits.length - 6);
        const number = digits.slice(digits.length - 6);
        formattedPhone = `+${countryCode}-${areaCode}-${number}`;
      } else {
        formattedPhone = phone; // 不符合格式時返回原值
      }
      break;

    case "local": // 本地格式 (XX) XXXX-XXXX
      if (digits.length >= 8) {
        const areaCode = digits.slice(0, digits.length - 8);
        const firstPart = digits.slice(digits.length - 8, digits.length - 4);
        const secondPart = digits.slice(digits.length - 4);
        formattedPhone = areaCode
          ? `(${areaCode}) ${firstPart}-${secondPart}`
          : `${firstPart}-${secondPart}`;
      } else {
        formattedPhone = phone; // 不符合格式時返回原值
      }
      break;

    case "dash": // 短線分隔 XXXX-XXXX-XXXX
      if (digits.length > 8) {
        formattedPhone = digits.match(/.{1,4}/g).join("-");
      } else if (digits.length === 8) {
        formattedPhone = `${digits.slice(0, 4)}-${digits.slice(4)}`;
      } else {
        formattedPhone = phone;
      }
      break;

    case "compact": // 壓縮格式，只返回數字
      formattedPhone = digits;
      break;

    default:
      // 預設格式，保持原樣
      formattedPhone = phone;
  }

  // 添加分機號碼
  if (extension) {
    formattedPhone += ` 分機 ${extension}`;
  }

  return formattedPhone;
}

/**
 * 格式化日期
 * @param {Date|string|number} date 要格式化的日期
 * @param {string} format 格式化模式，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = "YYYY-MM-DD") {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return ""; // 无效日期返回空字符串

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
 * 生成唯一ID
 * @returns {string} 生成的唯一ID
 */
export function generateId() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Date.now().toString(36)
  );
}

/**
 * 格式化数字
 * @param {number} num 要格式化的数字
 * @param {number} precision 小数点精度
 * @param {boolean} useThousandSeparator 是否使用千位分隔符
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num, precision = 2, useThousandSeparator = false) {
  if (num === null || num === undefined || isNaN(num)) return "";

  // 处理精度
  const formattedNum = Number(num).toFixed(precision);

  // 加入千位分隔符
  if (useThousandSeparator) {
    const parts = formattedNum.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  return formattedNum;
}

/**
 * 格式化金额
 * @param {number} amount 金额数字
 * @param {string} currency 货币符号，默认为 '$'
 * @param {number} precision 小数点精度，默认为 2
 * @returns {string} 格式化后的金额字符串
 */
export function formatCurrency(amount, currency = "$", precision = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) return "";
  return `${currency} ${formatNumber(amount, precision, true)}`;
}

/**
 * 获取状态文本和类型
 * @param {number|string} status 状态值
 * @param {Array} statusOptions 状态选项配置
 * @returns {Object} 包含文本和类型的对象
 */
export function getStatusInfo(status, statusOptions = []) {
  const defaultOptions = [
    { value: 0, label: "未处理", type: "danger" },
    { value: 1, label: "已处理", type: "success" },
    { value: 2, label: "处理中", type: "warning" }
  ];

  const options = statusOptions.length ? statusOptions : defaultOptions;
  const option = options.find(opt => opt.value === status);

  return option
    ? { text: option.label, type: option.type }
    : { text: status, type: "" };
}

/**
 * 排序表格数据
 * @param {Array} data 表格数据
 * @param {string} field 排序字段
 * @param {string} order 排序方向 ('ascending'|'descending')
 * @returns {Array} 排序后的数据
 */
export function sortTableData(data, field, order) {
  if (!field || !order || !data || !data.length) return data;

  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    // 处理空值
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return order === "ascending" ? -1 : 1;
    if (bVal == null) return order === "ascending" ? 1 : -1;

    // 数字比较
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "ascending" ? aVal - bVal : bVal - aVal;
    }

    // 日期比较
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === "ascending" ? aVal - bVal : bVal - aVal;
    }

    // 字符串比较
    const aStr = String(aVal);
    const bStr = String(bVal);
    return order === "ascending"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
}

/**
 * 过滤表格数据
 * @param {Array} data 原始数据
 * @param {Object} filters 过滤条件 {field: value}
 * @returns {Array} 过滤后的数据
 */
export function filterTableData(data, filters) {
  if (!filters || Object.keys(filters).length === 0) return data;

  return data.filter(row => {
    return Object.entries(filters).every(([field, value]) => {
      // 如果过滤值为空，不过滤该字段
      if (value === null || value === undefined || value === "") return true;

      const cellValue = row[field];

      // 如果是数组，检查是否包含
      if (Array.isArray(value)) {
        return value.includes(cellValue);
      }

      // 如果是字符串，执行包含检查
      if (typeof cellValue === "string" && typeof value === "string") {
        return cellValue.toLowerCase().includes(value.toLowerCase());
      }

      // 其他类型直接比较
      return cellValue === value;
    });
  });
}

/**
 * 导出表格数据为 CSV
 * @param {Array} data 表格数据
 * @param {Array} columns 列配置
 * @param {string} filename 文件名
 */
export function exportTableToCsv(data, columns, filename) {
  if (!data.length || !columns.length) return;

  // 过滤要导出的列
  const exportColumns = columns.filter(col => !col.noExport);

  // 表头行
  const headerRow = exportColumns.map(col => `"${col.label}"`).join(",");

  // 数据行
  const dataRows = data
    .map(row => {
      return exportColumns
        .map(col => {
          let value = row[col.prop];

          // 特殊类型处理
          if (col.type === "date" && value) {
            value = formatDate(value, col.format || "YYYY-MM-DD");
          } else if (col.formatter) {
            value = col.formatter(value, row);
          }

          // 确保值都是字符串，并处理包含逗号或双引号的情况
          value = value == null ? "" : String(value);
          if (value.includes(",") || value.includes('"')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(",");
    })
    .join("\n");

  // 合并表头和数据
  const csvContent = `${headerRow}\n${dataRows}`;

  // 创建 Blob 和下载链接
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 将表格数据分页
 * @param {Array} data 原始数据
 * @param {number} page 当前页码
 * @param {number} pageSize 每页条数
 * @returns {Array} 分页后的数据
 */
export function paginateData(data, page, pageSize) {
  if (!data.length) return [];
  if (!pageSize || pageSize < 1) return data;

  const startIndex = (page - 1) * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
}

/**
 * 从后端响应中提取表格所需数据
 * @param {Object} response 后端响应对象
 * @param {string} dataPath 数据字段路径，如 'data.items'
 * @param {string} totalPath 总数字段路径，如 'data.total'
 * @returns {Object} 包含数据和总数的对象
 */
export function extractTableData(
  response,
  dataPath = "data.list",
  totalPath = "data.total"
) {
  if (!response) return { data: [], total: 0 };

  // 从路径获取嵌套对象的值
  const getValueByPath = (obj, path) => {
    return path
      .split(".")
      .reduce((o, p) => (o && o[p] !== undefined ? o[p] : null), obj);
  };

  return {
    data: getValueByPath(response, dataPath) || [],
    total: getValueByPath(response, totalPath) || 0
  };
}

/**
 * 处理表格列宽适配
 * @param {Array} columns 列配置数组
 * @param {number} tableWidth 表格总宽度
 * @returns {Array} 处理后的列配置
 */
export function adjustColumnWidths(columns, tableWidth) {
  if (!columns.length || !tableWidth) return columns;

  // 计算已设置宽度的列的总宽度
  const fixedWidthColumns = columns.filter(col => col.width);
  const fixedWidth = fixedWidthColumns.reduce(
    (sum, col) => sum + parseInt(col.width),
    0
  );

  // 计算未设置宽度的列数量
  const flexibleColumns = columns.filter(col => !col.width);
  const flexibleCount = flexibleColumns.length;

  if (!flexibleCount) return columns;

  // 计算剩余宽度和每列平均宽度
  const remainingWidth = tableWidth - fixedWidth;
  const averageWidth = Math.max(80, Math.floor(remainingWidth / flexibleCount));

  // 设置未设置宽度的列的宽度
  return columns.map(col => {
    if (!col.width) {
      return { ...col, width: averageWidth };
    }
    return col;
  });
}

/**
 * 获取用于导出的表格数据
 * @param {Array} data 原始数据
 * @param {Array} columns 列配置
 * @returns {Array} 格式化后用于导出的数据
 */
export function getExportData(data, columns) {
  if (!data.length || !columns.length) return [];

  // 过滤要导出的列
  const exportColumns = columns.filter(col => !col.noExport);

  // 格式化数据
  return data.map(row => {
    const exportRow = {};

    exportColumns.forEach(col => {
      let value = row[col.prop];

      // 特殊类型处理
      if (col.type === "date" && value) {
        exportRow[col.label] = formatDate(value, col.format || "YYYY-MM-DD");
      } else if (col.formatter) {
        exportRow[col.label] = col.formatter(value, row);
      } else {
        exportRow[col.label] = value;
      }
    });

    return exportRow;
  });
}
