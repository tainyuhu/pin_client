import request from "@/utils/request";
// API 端點路徑
// const API_PREFIX = "/api/wms/product/category";

class WarehouseCategoryService {
  constructor() {
    // 是否使用 mock 資料
    this.useMock = true;

    // Mock 資料
    this.mockCategories = [
      {
        id: 1,
        name: "原物料",
        description: "生產所需的各類原材料",
        productCount: 24,
        createTime: "2023-05-10 09:23:45",
        updateTime: "2023-08-15 14:36:22"
      },
      {
        id: 2,
        name: "半成品",
        description: "需要進一步加工的產品",
        productCount: 18,
        createTime: "2023-05-11 10:15:32",
        updateTime: "2023-09-01 16:42:18"
      },
      {
        id: 3,
        name: "成品",
        description: "可直接出貨的完成品",
        productCount: 36,
        createTime: "2023-05-12 11:05:27",
        updateTime: "2023-09-10 13:21:45"
      },
      {
        id: 4,
        name: "包裝材料",
        description: "各類包裝紙盒、膠帶等",
        productCount: 15,
        createTime: "2023-06-05 14:23:41",
        updateTime: "2023-08-20 09:54:12"
      },
      {
        id: 5,
        name: "耗材",
        description: "生產過程中使用的消耗品",
        productCount: 29,
        createTime: "2023-06-10 08:36:19",
        updateTime: "2023-09-05 11:32:47"
      }
    ];

    // 只保留 productCode、productName 和 specification 三個欄位
    this.mockProducts = {
      1: [
        {
          productCode: "RAW-AL-001",
          productName: "鋁合金板材",
          specification: "2mx1m"
        },
        {
          productCode: "RAW-SS-002",
          productName: "不鏽鋼管",
          specification: "直徑20mm"
        },
        {
          productCode: "RAW-CU-003",
          productName: "銅線",
          specification: "1.5mm²"
        }
      ],
      2: [
        {
          productCode: "SEMI-PCB-001",
          productName: "電路板組件",
          specification: "A型"
        },
        {
          productCode: "SEMI-CASE-002",
          productName: "機殼底座",
          specification: "標準型"
        }
      ],
      3: [
        {
          productCode: "FIN-TEMP-001",
          productName: "智能溫控器",
          specification: "家用型"
        },
        {
          productCode: "FIN-AIR-002",
          productName: "空氣淨化器",
          specification: "小型"
        },
        {
          productCode: "FIN-LOCK-003",
          productName: "智能門鎖",
          specification: "指紋識別"
        }
      ],
      4: [
        {
          productCode: "PKG-BOX-001",
          productName: "產品外盒",
          specification: "小號"
        },
        {
          productCode: "PKG-BUB-002",
          productName: "氣泡包裝",
          specification: "標準型"
        }
      ],
      5: [
        {
          productCode: "CONS-CLN-001",
          productName: "清潔劑",
          specification: "1L裝"
        },
        {
          productCode: "CONS-GLV-002",
          productName: "手套",
          specification: "L號"
        },
        {
          productCode: "CONS-ESD-003",
          productName: "防靜電腕帶",
          specification: "可調節"
        }
      ]
    };
  }

  // 模擬網路延遲
  async mockNetworkDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 獲取當前時間格式化字符串
  getFormattedNow() {
    return new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
  }

  /**
   * 獲取所有類別
   * @returns {Promise<Array>} 類別列表
   */
  async fetchAllCategories() {
    if (this.useMock) {
      await this.mockNetworkDelay();
      return [...this.mockCategories];
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/list`,
        method: "get"
      });
      return response.data || [];
    } catch (error) {
      console.error("獲取所有類別失敗", error);
      throw error;
    }
  }

  /**
   * 搜尋類別
   * @param {string} keyword 搜尋關鍵字
   * @returns {Promise<Array>} 搜尋結果
   */
  async searchCategories(keyword) {
    if (this.useMock) {
      await this.mockNetworkDelay();
      return this.mockCategories.filter(
        item =>
          item.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/search`,
        method: "get",
        params: { keyword }
      });
      return response.data || [];
    } catch (error) {
      console.error("搜尋類別失敗", error);
      throw error;
    }
  }

  /**
   * 新增類別
   * @param {Object} data 類別數據
   * @returns {Promise<Object>} 新增結果
   */
  async addCategory(data) {
    if (this.useMock) {
      await this.mockNetworkDelay();

      // 生成新 ID
      const newId = Math.max(...this.mockCategories.map(c => c.id), 0) + 1;
      const now = this.getFormattedNow();

      const newCategory = {
        id: newId,
        name: data.name,
        description: data.description || "",
        productCount: 0,
        createTime: now,
        updateTime: now
      };

      this.mockCategories.push(newCategory);

      return {
        success: true,
        data: newCategory,
        message: "新增成功"
      };
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/add`,
        method: "post",
        data
      });
      return response;
    } catch (error) {
      console.error("新增類別失敗", error);
      throw error;
    }
  }

  /**
   * 更新類別
   * @param {Object} data 類別數據
   * @returns {Promise<Object>} 更新結果
   */
  async updateCategory(data) {
    if (this.useMock) {
      await this.mockNetworkDelay();

      const index = this.mockCategories.findIndex(c => c.id === data.id);
      if (index !== -1) {
        const now = this.getFormattedNow();

        this.mockCategories[index] = {
          ...this.mockCategories[index],
          name: data.name,
          description: data.description || "",
          updateTime: now
        };

        return {
          success: true,
          data: this.mockCategories[index],
          message: "更新成功"
        };
      }

      return {
        success: false,
        message: "找不到指定類別"
      };
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/update`,
        method: "put",
        data
      });
      return response;
    } catch (error) {
      console.error("更新類別失敗", error);
      throw error;
    }
  }

  /**
   * 刪除類別
   * @param {number|string} id 類別ID
   * @returns {Promise<Object>} 刪除結果
   */
  async deleteCategory(id) {
    if (this.useMock) {
      await this.mockNetworkDelay();

      const index = this.mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.mockCategories.splice(index, 1);
        return {
          success: true,
          message: "刪除成功"
        };
      }

      return {
        success: false,
        message: "找不到指定類別"
      };
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/delete/${id}`,
        method: "delete"
      });
      return response;
    } catch (error) {
      console.error("刪除類別失敗", error);
      throw error;
    }
  }

  /**
   * 獲取類別關聯的產品
   * @param {number|string} categoryId 類別ID
   * @returns {Promise<Array>} 產品列表
   */
  async fetchProductsByCategory(categoryId) {
    if (this.useMock) {
      await this.mockNetworkDelay();
      return this.mockProducts[categoryId] || [];
    }

    try {
      const response = await request({
        url: `${API_PREFIX}/${categoryId}/products`,
        method: "get"
      });
      return response.data || [];
    } catch (error) {
      console.error("獲取類別產品失敗", error);
      throw error;
    }
  }
}

export default new WarehouseCategoryService();
