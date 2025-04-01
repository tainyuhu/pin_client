// 各種規格選項
const SPECIFICATIONS = [
  "標準型",
  "進階型",
  "豪華型",
  "入門型",
  "輕量型",
  "專業型",
  "經濟型",
  "高效型",
  "智能型",
  "頂級型"
];

// 不同價格區間配置
const PRICE_RANGES = [
  { min: 100, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 2000, max: 5000 },
  { min: 5000, max: 10000 }
];

// 初始類別資料
const initialCategories = [
  {
    id: 1,
    name: "根類別1",
    productCount: 0,
    children: [
      {
        id: 11,
        name: "子類別1-1",
        productCount: 15,
        children: [
          {
            id: 111,
            name: "子類別1-1-1",
            productCount: 8
          }
        ]
      },
      {
        id: 12,
        name: "子類別1-2",
        productCount: 12
      }
    ]
  },
  {
    id: 2,
    name: "根類別2",
    productCount: 0,
    children: [
      {
        id: 21,
        name: "子類別2-1",
        productCount: 18
      }
    ]
  }
];

/**
 * 生成指定數量範圍內的隨機產品資料
 * @param {number} baseCount - 基礎數量
 * @param {string} categoryName - 類別名稱
 * @param {string} codePrefix - 產品編號前綴
 * @return {Array} 產品列表
 */
function generateMockProducts(baseCount, categoryName, codePrefix) {
  const result = [];
  // 隨機化產品數量 (基數 ± 5)
  const count = baseCount + Math.floor(Math.random() * 11) - 5;

  for (let i = 1; i <= count; i++) {
    const priceRange =
      PRICE_RANGES[Math.floor(Math.random() * PRICE_RANGES.length)];
    const price =
      Math.floor(Math.random() * (priceRange.max - priceRange.min)) +
      priceRange.min;

    result.push({
      id: Date.now() + i,
      productCode: `${codePrefix}-${String(i).padStart(3, "0")}`,
      productName: `${categoryName}產品-${i}`,
      specification:
        SPECIFICATIONS[Math.floor(Math.random() * SPECIFICATIONS.length)],
      price: price
    });
  }

  return result;
}

/**
 * 獲取所有類別
 * @return {Promise} 返回Promise包含所有類別
 */
function fetchAllCategories() {
  return new Promise(resolve => {
    // 模擬API延遲
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(initialCategories)));
    }, 300);
  });
}

/**
 * 根據ID查找類別
 * @param {Array} categories - 類別列表
 * @param {number} id - 類別ID
 * @return {Object|null} 找到的類別或null
 */
function findCategoryById(categories, id) {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children && category.children.length) {
      const found = findCategoryById(category.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 新增類別
 * @param {Object} categoryData - 類別資料
 * @return {Promise} 返回Promise包含新增結果
 */
function addCategory(categoryData) {
  return new Promise(resolve => {
    setTimeout(() => {
      const newCategory = {
        id: Date.now(),
        name: categoryData.name,
        productCount: 0,
        children: []
      };

      resolve({
        success: true,
        data: newCategory
      });
    }, 300);
  });
}

/**
 * 修改類別
 * @param {Object} categoryData - 類別資料
 * @return {Promise} 返回Promise包含修改結果
 */
function updateCategory(categoryData) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: categoryData
      });
    }, 300);
  });
}

/**
 * 刪除類別
 * @param {number} categoryId - 類別ID
 * @return {Promise} 返回Promise包含刪除結果
 */
function deleteCategory(categoryId) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: { id: categoryId }
      });
    }, 300);
  });
}

/**
 * 獲取指定類別的產品列表
 * @param {number} categoryId - 類別ID
 * @return {Promise} 返回Promise包含產品列表
 */
function fetchProductsByCategory(categoryId) {
  return new Promise(resolve => {
    // 模擬API延遲
    setTimeout(() => {
      // 根據類別ID生成不同的模擬資料
      let products = [];
      let categoryName = "";
      let codePrefix = "OT";

      switch (categoryId) {
        case 11: // 子類別1-1
          categoryName = "電子";
          codePrefix = "EL";
          break;
        case 111: // 子類別1-1-1
          categoryName = "手機";
          codePrefix = "MP";
          break;
        case 12: // 子類別1-2
          categoryName = "家電";
          codePrefix = "AP";
          break;
        case 21: // 子類別2-1
          categoryName = "電腦";
          codePrefix = "PC";
          break;
        default:
          categoryName = "其他";
      }

      products = generateMockProducts(
        getBaseCountForCategory(categoryId),
        categoryName,
        codePrefix
      );
      resolve(products);
    }, 500);
  });
}

/**
 * 獲取類別基礎產品數量
 * @param {number} categoryId - 類別ID
 * @return {number} 基礎產品數量
 */
function getBaseCountForCategory(categoryId) {
  switch (categoryId) {
    case 11:
      return 15;
    case 111:
      return 8;
    case 12:
      return 12;
    case 21:
      return 18;
    default:
      return 5;
  }
}

/**
 * 獲取指定類別的產品數量
 * @param {number} categoryId - 類別ID
 * @return {Promise} 返回Promise包含產品數量
 */
function fetchProductCount(categoryId) {
  return new Promise(resolve => {
    setTimeout(() => {
      // 根據類別ID返回基礎數量
      let count = getBaseCountForCategory(categoryId);

      // 隨機浮動±3使數據看起來更真實
      count = Math.max(0, count + Math.floor(Math.random() * 7) - 3);
      resolve(count);
    }, 200);
  });
}

/**
 * 搜尋類別
 * @param {string} keyword - 搜尋關鍵字
 * @return {Promise} 返回Promise包含搜尋結果
 */
function searchCategories(keyword) {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模擬API搜尋
      if (!keyword) {
        resolve(JSON.parse(JSON.stringify(initialCategories)));
        return;
      }

      const searchLower = keyword.toLowerCase();

      const filterNodes = nodes => {
        return nodes.reduce((filtered, node) => {
          const newNode = { ...node };
          const nameMatches = node.name.toLowerCase().includes(searchLower);

          if (node.children && node.children.length) {
            const filteredChildren = filterNodes(node.children);
            if (filteredChildren.length) {
              newNode.children = filteredChildren;
              filtered.push(newNode);
              return filtered;
            }
          }

          if (nameMatches) {
            filtered.push(newNode);
          }

          return filtered;
        }, []);
      };

      resolve(filterNodes(JSON.parse(JSON.stringify(initialCategories))));
    }, 300);
  });
}

export default {
  fetchAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchProductsByCategory,
  fetchProductCount,
  searchCategories,
  findCategoryById
};
