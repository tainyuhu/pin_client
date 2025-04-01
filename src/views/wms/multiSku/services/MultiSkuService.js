// client/src/views/wms/multiSku/services/MultiSkuService.js
import axios from "axios";
// import { API_BASE_URL } from "@/config/api";

/**
 * MultiSkuService - 提供品號管理相關的數據與操作
 */
export default class MultiSkuService {
  static USE_MOCK = true; // 設定為 true 使用模擬數據，false 使用實際 API

  /**
   * 獲取品號清單
   * @returns {Promise<Array>} 品號資料陣列
   */
  static async getProductList() {
    if (this.USE_MOCK) {
      return this._getMockProductList();
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error("獲取品號資料失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取品號異動記錄
   * @param {Object} params 查詢參數 (可選)
   * @returns {Promise<Array>} 品號異動記錄陣列
   */
  static async getProductHistoryList(params) {
    if (this.USE_MOCK) {
      return this._getMockProductHistoryList();
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/products/history`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error("獲取品號異動記錄失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取產品類別清單
   * @returns {Promise<Array>} 產品類別陣列
   */
  static async getProductCategories() {
    if (this.USE_MOCK) {
      return this._getMockProductCategories();
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/product-categories`);
      return response.data;
    } catch (error) {
      console.error("獲取產品類別失敗:", error);
      throw error;
    }
  }

  /**
   * 儲存品號資訊
   * @param {Object} productData 品號資料
   * @returns {Promise<Object>} 儲存結果
   */
  static async saveProduct(productData) {
    if (this.USE_MOCK) {
      return this._mockSaveProduct(productData);
    }

    try {
      let response;
      if (productData.id) {
        // 更新現有品號
        response = await axios.put(
          `${API_BASE_URL}/products/${productData.id}`,
          productData
        );
      } else {
        // 新增品號
        response = await axios.post(`${API_BASE_URL}/products`, productData);
      }
      return response.data;
    } catch (error) {
      console.error("儲存品號資料失敗:", error);
      throw error;
    }
  }

  /**
   * 批次匯入品號
   * @param {Array} productList 品號資料列表
   * @returns {Promise<Object>} 匯入結果
   */
  static async batchImportProducts(productList) {
    if (this.USE_MOCK) {
      return this._mockBatchImport(productList);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/batch-import`,
        { products: productList }
      );
      return response.data;
    } catch (error) {
      console.error("批次匯入品號失敗:", error);
      throw error;
    }
  }

  /**
   * 新增產品類別
   * @param {Object} categorysData 類別資料
   * @returns {Promise<Object>} 新增結果
   */
  static async addProductCategory(categorysData) {
    if (this.USE_MOCK) {
      return this._mockAddCategory(categorysData);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/product-categories`,
        categorysData
      );
      return response.data;
    } catch (error) {
      console.error("新增產品類別失敗:", error);
      throw error;
    }
  }

  /**
   * 刪除品號
   * @param {String} productCode 品號
   * @returns {Promise<Object>} 刪除結果
   */
  static async deleteProduct(productCode) {
    if (this.USE_MOCK) {
      return this._mockDeleteProduct(productCode);
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/products/${productCode}`
      );
      return response.data;
    } catch (error) {
      console.error("刪除品號失敗:", error);
      throw error;
    }
  }

  // ====== 以下為模擬數據方法 ======

  /**
   * 模擬品號列表數據
   * @private
   */
  static async _getMockProductList() {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 品號列表測試數據
    return [
      {
        id: "1",
        productCode: "P001",
        productName: "iPhone 15 Pro",
        categorys: "smartphone",
        specification: "256GB",
        unit: "個",
        boxSize: 10,
        status: true,
        createdBy: "admin",
        createdAt: "2024-01-01 10:00:00",
        updatedBy: "manager",
        updatedAt: "2024-01-10 15:30:00",
        remark: "新款旗艦機種"
      },
      {
        id: "2",
        productCode: "P002",
        productName: "iPad Pro",
        categorys: "tablet",
        specification: "12.9吋",
        unit: "個",
        boxSize: 5,
        status: true,
        createdBy: "admin",
        createdAt: "2024-01-15 09:45:00",
        updatedBy: "admin",
        updatedAt: "2024-02-05 14:20:00",
        remark: "M2晶片"
      },
      {
        id: "3",
        productCode: "P003",
        productName: "MacBook Pro",
        categorys: "laptop",
        specification: "14吋 M3 Pro",
        unit: "台",
        boxSize: 1,
        status: true,
        createdBy: "supervisor",
        createdAt: "2024-02-10 11:30:00",
        updatedBy: "supervisor",
        updatedAt: "2024-02-10 11:30:00",
        remark: "2023新款"
      },
      {
        id: "4",
        productCode: "P004",
        productName: "Apple Watch Series 9",
        categorys: "wearable",
        specification: "45mm",
        unit: "個",
        boxSize: 20,
        status: true,
        createdBy: "admin",
        createdAt: "2024-02-20 16:15:00",
        updatedBy: "manager",
        updatedAt: "2024-02-25 10:10:00",
        remark: "支援全天候顯示"
      },
      {
        id: "5",
        productCode: "P005",
        productName: "Galaxy S24 Ultra",
        categorys: "smartphone",
        specification: "512GB",
        unit: "個",
        boxSize: 10,
        status: true,
        createdBy: "admin",
        createdAt: "2024-03-01 08:30:00",
        updatedBy: "admin",
        updatedAt: "2024-03-01 08:30:00",
        remark: "三星旗艦機種"
      }
    ];
  }

  /**
   * 模擬品號異動記錄數據
   * @private
   */
  static async _getMockProductHistoryList() {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 品號異動記錄測試數據
    return [
      {
        id: "1",
        datetime: "2024-01-01 08:00:00",
        type: "create",
        productCode: "P001",
        field: "all",
        beforeValue: "",
        afterValue: "新增品號資料",
        operator: "admin",
        remark: "新增品號"
      },
      {
        id: "2",
        datetime: "2024-01-10 10:15:00",
        type: "update",
        productCode: "P001",
        field: "specification",
        beforeValue: "128GB",
        afterValue: "256GB",
        operator: "manager",
        remark: "規格調整"
      },
      {
        id: "3",
        datetime: "2024-01-20 14:30:00",
        type: "update",
        productCode: "P002",
        field: "boxSize",
        beforeValue: "3",
        afterValue: "5",
        operator: "admin",
        remark: "裝箱容量更新"
      },
      {
        id: "4",
        datetime: "2024-02-05 09:45:00",
        type: "create",
        productCode: "P003",
        field: "all",
        beforeValue: "",
        afterValue: "新增品號資料",
        operator: "supervisor",
        remark: "新增筆電品號"
      },
      {
        id: "5",
        datetime: "2024-02-15 16:20:00",
        type: "create",
        productCode: "P004",
        field: "all",
        beforeValue: "",
        afterValue: "新增品號資料",
        operator: "admin",
        remark: "新增穿戴式產品"
      },
      {
        id: "6",
        datetime: "2024-03-01 11:10:00",
        type: "update",
        productCode: "P001",
        field: "status",
        beforeValue: "false",
        afterValue: "true",
        operator: "manager",
        remark: "啟用產品"
      }
    ];
  }

  /**
   * 模擬產品類別數據
   * @private
   */
  static async _getMockProductCategories() {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    // 品號類別測試數據
    return [
      { id: "1", label: "原料", value: "smartphone" },
      { id: "2", label: "白蝦成品", value: "tablet" },
      { id: "3", label: "草蝦成品", value: "laptop" },
      { id: "4", label: "拉長蝦成品", value: "wearable" }
    ];
  }

  /**
   * 模擬保存品號
   * @private
   */
  static async _mockSaveProduct(productData) {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 800));

    // 如果沒有 ID，則新增一個唯一 ID
    if (!productData.id) {
      productData.id = Date.now().toString();
    }

    // 模擬儲存成功
    return {
      success: true,
      message: "品號資料儲存成功",
      data: productData
    };
  }

  /**
   * 模擬批次匯入
   * @private
   */
  static async _mockBatchImport(productList) {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模擬處理批次匯入
    const successCount = productList.length;
    const failCount = 0;

    return {
      success: true,
      message: `批次匯入完成，成功：${successCount}筆，失敗：${failCount}筆`,
      detail: {
        successCount,
        failCount,
        failItems: []
      }
    };
  }

  /**
   * 模擬新增類別
   * @private
   */
  static async _mockAddCategory(categorysData) {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 800));

    // 新增唯一 ID
    categorysData.id = Date.now().toString();

    // 模擬新增成功
    return {
      success: true,
      message: "品號類別新增成功",
      data: categorysData
    };
  }

  /**
   * 模擬刪除品號
   * @private
   */
  static async _mockDeleteProduct(productCode) {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      message: `品號 ${productCode} 已成功刪除`
    };
  }
}
