/**
 * 將平面數組轉換為樹狀結構
 * @param {Array} data - 原始數據數組
 * @returns {Array} - 樹狀結構數組
 */
export function genTree(data) {
  const result = [];
  const itemMap = {};

  // 先轉成 map 存儲
  for (const item of data) {
    itemMap[item.id] = {
      ...item,
      children: []
    };
  }

  // 處理層級關係
  for (const item of data) {
    const id = item.id;
    const pid = item.parent;
    const treeItem = itemMap[id];

    if (pid === null || pid === undefined || pid === 0) {
      // 沒有父節點，作為根節點
      result.push(treeItem);
    } else {
      // 有父節點，放到父節點的 children 中
      if (itemMap[pid]) {
        itemMap[pid].children.push(treeItem);
      }
    }
  }

  return result;
}

/**
 * 移除空的 children 屬性
 * @param {Array} data - 樹狀數據
 */
function cleanupChildren(data) {
  data.forEach(item => {
    if (item.children && item.children.length === 0) {
      delete item.children;
    } else if (item.children && item.children.length > 0) {
      cleanupChildren(item.children);
    }
  });
}

/**
 * 將樹狀數據轉換為平面數組
 * @param {Array} tree - 樹狀數據
 * @returns {Array} - 平面數組
 */
export function flattenTree(tree) {
  const result = [];

  function traverse(node, level = 0) {
    result.push({
      ...node,
      level
    });

    if (node.children) {
      node.children.forEach(child => traverse(child, level + 1));
    }
  }

  tree.forEach(node => traverse(node));
  return result;
}

export default {
  genTree,
  flattenTree
};
