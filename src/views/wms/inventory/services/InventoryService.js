// InventoryService.js
import axios from "axios";
import { formatDate } from "@/utils/date";
// 庫存服務類別
class InventoryService {
  // 基本API路徑
  //   baseUrl = "/api/inventory";

  // 模擬API延遲
  mockDelay = 500;

  // 儲存已經獲取的批號數據，用於快速訪問
  batchDataCache = {};

  // 控制使用真實API還是模擬數據的開關
  useRealApi = false; // 設置為 true 時使用真實API，false 時使用模擬數據

  // 獲取 ProductDataArray 用於 DocumentButton 組件
  async getProductDataArray() {
    if (this.useRealApi) {
      // 使用真實API
      try {
        const response = await axios.get(`${this.baseUrl}/products/details`);
        return {
          success: response.data.success || true,
          data: response.data.data || [],
          message: response.data.message || ""
        };
      } catch (error) {
        console.error("獲取產品數據陣列失敗:", error);
        let errorMessage = "獲取產品數據陣列失敗";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
        return {
          success: false,
          message: errorMessage,
          data: []
        };
      }
    } else {
      // 使用模擬數據
      try {
        // 模擬延遲
        await this.delay();

        // 首先獲取庫存清單
        const inventoryResponse = await this.getInventoryList();
        let inventoryData = inventoryResponse.data || [];

        // 針對每個庫存項目加載批號數據
        const productDataArray = [];

        // 限制處理的數量，避免加載過多數據
        const limitedInventoryData = inventoryData.slice(0, 5);

        for (const item of limitedInventoryData) {
          // 加載批號數據
          const batchResponse = await this.loadBatchDataForRow(item);

          // 創建包含批號詳情的產品數據
          const productData = {
            id: item.id,
            productCode: item.productCode,
            productName: item.productName,
            category: item.category,
            productcategory: item.productcategory,
            totalStock: item.totalStock,
            safetyStock: item.safetyStock,
            reorderPoint: item.reorderPoint,
            stockStatus: item.stockStatus,
            lastTransferDate: item.lastTransferDate,
            details: batchResponse.success ? batchResponse.data : []
          };

          productDataArray.push(productData);
        }

        return {
          success: true,
          data: productDataArray
        };
      } catch (error) {
        console.error("獲取產品數據陣列失敗:", error);
        return {
          success: false,
          message: "獲取產品數據陣列失敗",
          data: []
        };
      }
    }
  }

  // 獲取指定數量的產品數據陣列
  async getProductDataArrayWithLimit(limit = 5) {
    if (this.useRealApi) {
      // 使用真實API
      try {
        const response = await axios.get(`${this.baseUrl}/products/details`, {
          params: { limit }
        });

        return {
          success: response.data.success || true,
          data: response.data.data || [],
          message: response.data.message || ""
        };
      } catch (error) {
        console.error("獲取指定數量產品數據失敗:", error);
        let errorMessage = "獲取指定數量產品數據失敗";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
        return {
          success: false,
          message: errorMessage,
          data: []
        };
      }
    } else {
      // 使用模擬數據
      try {
        // 模擬延遲
        await this.delay();

        // 獲取庫存清單
        const inventoryResponse = await this.getInventoryList();
        let inventoryData = inventoryResponse.data || [];

        // 限制處理的數量
        const limitedInventoryData = inventoryData.slice(0, limit);

        // 針對每個庫存項目加載批號數據
        const productDataArray = [];

        for (const item of limitedInventoryData) {
          // 加載批號數據
          const batchResponse = await this.loadBatchDataForRow(item);

          // 創建包含批號詳情的產品數據
          const productData = {
            id: item.id,
            productCode: item.productCode,
            productName: item.productName,
            category: item.category,
            productcategory: item.productcategory,
            totalStock: item.totalStock,
            safetyStock: item.safetyStock,
            reorderPoint: item.reorderPoint,
            stockStatus: item.stockStatus,
            lastTransferDate: item.lastTransferDate,
            details: batchResponse.success ? batchResponse.data : []
          };

          productDataArray.push(productData);
        }

        return {
          success: true,
          data: productDataArray
        };
      } catch (error) {
        console.error("獲取產品數據陣列失敗:", error);
        return {
          success: false,
          message: "獲取產品數據陣列失敗",
          data: []
        };
      }
    }
  }

  // 獲取特定狀態的產品數據陣列
  async getProductDataArrayByStatus(status) {
    if (this.useRealApi) {
      // 使用真實API
      try {
        const response = await axios.get(`${this.baseUrl}/products/details`, {
          params: { status }
        });

        return {
          success: response.data.success || true,
          data: response.data.data || [],
          message: response.data.message || ""
        };
      } catch (error) {
        console.error("獲取特定狀態產品數據失敗:", error);
        let errorMessage = "獲取特定狀態產品數據失敗";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
        return {
          success: false,
          message: errorMessage,
          data: []
        };
      }
    } else {
      // 使用模擬數據
      try {
        // 模擬延遲
        await this.delay();

        // 獲取庫存清單
        const inventoryResponse = await this.getInventoryList();
        let inventoryData = inventoryResponse.data || [];

        // 按狀態過濾
        const filteredData = status
          ? inventoryData.filter(item => item.stockStatus === status)
          : inventoryData;

        // 限制處理的數量，避免加載過多數據
        const limitedData = filteredData.slice(0, 5);

        // 針對每個庫存項目加載批號數據
        const productDataArray = [];

        for (const item of limitedData) {
          // 加載批號數據
          const batchResponse = await this.loadBatchDataForRow(item);

          // 創建包含批號詳情的產品數據
          const productData = {
            id: item.id,
            productCode: item.productCode,
            productName: item.productName,
            category: item.category,
            productcategory: item.productcategory,
            totalStock: item.totalStock,
            safetyStock: item.safetyStock,
            reorderPoint: item.reorderPoint,
            stockStatus: item.stockStatus,
            lastTransferDate: item.lastTransferDate,
            details: batchResponse.success ? batchResponse.data : []
          };

          productDataArray.push(productData);
        }

        return {
          success: true,
          data: productDataArray
        };
      } catch (error) {
        console.error("獲取產品數據陣列失敗:", error);
        return {
          success: false,
          message: "獲取產品數據陣列失敗",
          data: []
        };
      }
    }
  }

  // 產生隨機ID
  generateId() {
    return Math.floor(Math.random() * 100000).toString();
  }

  // 產生隨機日期
  randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  // 格式化日期為字串
  formatDateString(date) {
    return formatDate(date, "YYYY-MM-DD");
  }

  // 模擬API延遲
  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay));
  }

  // 獲取庫存列表
  async getInventoryList(params = {}) {
    try {
      // 實際環境中的API呼叫
      // return await axios.get(`${this.baseUrl}/list`, { params });

      // 模擬延遲
      await this.delay();

      // 模擬庫存列表資料
      const mockData = this.generateMockInventoryList(params);

      // 預先產生批號資料並快取
      mockData.forEach(item => {
        if (!this.batchDataCache[item.productCode]) {
          const batchCount =
            item.batchCount || Math.floor(Math.random() * 7) + 3;
          this.batchDataCache[item.productCode] = this.generateMockBatchData(
            item.productCode,
            batchCount
          );
        }
      });

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("獲取庫存列表失敗:", error);
      throw error;
    }
  }

  // 獲取庫存異動記錄
  async getInventoryHistory(params = {}) {
    try {
      // 實際環境中的API呼叫
      // return await axios.get(`${this.baseUrl}/history`, { params });

      // 模擬延遲
      await this.delay();

      // 模擬庫存異動記錄資料
      const mockData = this.generateMockInventoryHistory(params);

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("獲取庫存異動記錄失敗:", error);
      throw error;
    }
  }

  // 創建庫存
  async createInventory(data) {
    try {
      // 實際環境中的API呼叫
      // return await axios.post(`${this.baseUrl}`, data);

      // 模擬延遲
      await this.delay();

      return {
        success: true,
        message: "庫存資料創建成功",
        data: {
          ...data,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("創建庫存失敗:", error);
      throw error;
    }
  }

  // 更新庫存
  async updateInventory(data) {
    try {
      // 實際環境中的API呼叫
      // return await axios.put(`${this.baseUrl}/${data.id}`, data);

      // 模擬延遲
      await this.delay();

      return {
        success: true,
        message: "庫存資料更新成功",
        data: {
          ...data,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("更新庫存失敗:", error);
      throw error;
    }
  }

  // 刪除庫存
  async deleteInventory(id) {
    try {
      // 實際環境中的API呼叫
      // return await axios.delete(`${this.baseUrl}/${id}`);

      // 模擬延遲
      await this.delay();

      return {
        success: true,
        message: "庫存資料刪除成功"
      };
    } catch (error) {
      console.error("刪除庫存失敗:", error);
      throw error;
    }
  }

  // 批量更新庫存
  async batchUpdateInventory(ids, data) {
    try {
      // 實際環境中的API呼叫
      // return await axios.put(`${this.baseUrl}/batch`, { ids, data });

      // 模擬延遲
      await this.delay();

      return {
        success: true,
        message: `已成功更新 ${ids.length} 筆庫存資料`
      };
    } catch (error) {
      console.error("批量更新庫存失敗:", error);
      throw error;
    }
  }

  // 產生模擬庫存列表資料
  generateMockInventoryList(params = {}) {
    // 產品品號前綴
    const productPrefixes = ["A", "B", "C", "D", "E"];

    // 產品類別
    const categories = ["原料", "半成品", "成品", "包材", "其他"];

    // 行銷類別
    const marketingCategories = ["促銷", "常規", "季節", "限定", "新品"];

    // 庫存狀態
    const stockStatuses = ["normal", "low", "critical", "none", "expired"];

    // 產生30筆隨機庫存資料
    let mockData = Array.from({ length: 30 }, (_, index) => {
      // 隨機產生總庫存量
      const totalStock = Math.floor(Math.random() * 1000) + 1;

      // 安全存量通常是總庫存的20-30%
      const safetyStock = Math.floor(totalStock * (0.2 + Math.random() * 0.1));

      // 再轉倉點通常是安全存量的70-80%
      const reorderPoint = Math.floor(
        safetyStock * (0.7 + Math.random() * 0.1)
      );

      // 批號數量1-10個
      const batchCount = Math.floor(Math.random() * 10) + 1;

      // 隨機產生產品編號
      const prefix =
        productPrefixes[Math.floor(Math.random() * productPrefixes.length)];
      const productCode = `${prefix}${String(
        Math.floor(Math.random() * 10000)
      ).padStart(4, "0")}`;

      // 隨機指派類別和行銷類別
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const productcategory =
        marketingCategories[
          Math.floor(Math.random() * marketingCategories.length)
        ];

      // 根據總庫存和安全存量決定庫存狀態
      let stockStatus;
      if (totalStock === 0) {
        stockStatus = "none";
      } else if (totalStock < reorderPoint) {
        stockStatus = "critical";
      } else if (totalStock < safetyStock) {
        stockStatus = "low";
      } else {
        stockStatus = "normal";
      }

      // 隨機5%的產品設為過期
      if (Math.random() < 0.05) {
        stockStatus = "expired";
      }

      // 隨機生成最近轉倉日期 (過去90天內)
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      const lastTransferDate = this.formatDateString(
        this.randomDate(ninetyDaysAgo, today)
      );

      return {
        id: this.generateId(),
        productCode,
        productName: `測試產品 ${productCode}`,
        category,
        productcategory,
        totalStock,
        safetyStock,
        reorderPoint,
        batchCount,
        stockStatus,
        lastTransferDate,
        createdBy: "系統管理員",
        createdAt: this.formatDateString(
          this.randomDate(new Date(2023, 0, 1), new Date())
        ),
        updatedBy: "系統管理員",
        updatedAt: this.formatDateString(new Date()),
        // 添加子表格所需的屬性
        children: [] // 初始化為空數組，加載後將填充批號數據
      };
    });

    // 搜尋過濾
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      mockData = mockData.filter(
        item =>
          item.productCode.toLowerCase().includes(searchLower) ||
          item.productName.toLowerCase().includes(searchLower)
      );
    }

    // 日期過濾
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      mockData = mockData.filter(item => {
        const itemDate = new Date(item.lastTransferDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // 特定產品ID過濾
    if (params.productId) {
      mockData = mockData.filter(item => item.id === params.productId);
    }

    return mockData;
  }

  // 產生模擬庫存批號資料
  generateMockBatchData(productCode, count = 5) {
    // 可能的倉庫
    const warehouses = ["原料倉", "成品倉", "中央倉", "外包倉"];

    // 可能的狀態
    const states = ["active", "locked", "quarantine", "expired"];

    // 產生隨機批號資料
    return Array.from({ length: count }, (_, index) => {
      // 隨機決定批號
      const batchNumber = `${productCode}-${new Date()
        .getFullYear()
        .toString()
        .substr(2)}-${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`;

      // 隨機總數量 (10-500)
      const quantity = Math.floor(Math.random() * 490) + 10;

      // 活動庫存和常態庫存加起來等於總數量
      const activeStock = Math.floor(Math.random() * quantity);
      const stock = quantity - activeStock;

      // 箱數 = 數量 / (5-20的隨機數)
      const boxPerUnit = Math.floor(Math.random() * 15) + 5;
      const boxCount = Math.ceil(quantity / boxPerUnit);

      // 隨機效期 (30-365天)
      const today = new Date();
      const expiryDays = Math.floor(Math.random() * 335) + 30;
      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + expiryDays);

      // 隨機狀態
      const state = states[Math.floor(Math.random() * states.length)];

      return {
        id: this.generateId(),
        productCode,
        batchNumber,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        location: `${String.fromCharCode(
          65 + Math.floor(Math.random() * 26)
        )}-${Math.floor(Math.random() * 100) + 1}-${Math.floor(
          Math.random() * 10
        ) + 1}`,
        state,
        quantity,
        activeStock,
        stock,
        boxCount,
        expiryDate: this.formatDateString(expiryDate),
        daysToExpiry: expiryDays,
        createdBy: "系統管理員",
        createdAt: this.formatDateString(
          this.randomDate(new Date(2023, 0, 1), new Date())
        ),
        updatedBy: "系統管理員",
        updatedAt: this.formatDateString(new Date())
      };
    });
  }

  // 產生模擬庫存異動記錄
  generateMockInventoryHistory(params = {}) {
    // 可能的異動類型
    const historyTypes = [
      "in",
      "out",
      "transfer",
      "adjust",
      "return",
      "discard"
    ];

    // 可能的倉庫
    const warehouses = ["原料倉", "成品倉", "中央倉", "外包倉"];

    // 可能的操作人員
    const operators = ["王小明", "李小華", "張大同", "陳經理", "系統管理員"];

    // 產生50筆隨機異動記錄
    let mockHistory = Array.from({ length: 50 }, (_, index) => {
      // 隨機產品編碼
      const productCode = `${
        ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]
      }${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

      // 隨機批號
      const batchNumber = `${productCode}-${new Date()
        .getFullYear()
        .toString()
        .substr(2)}-${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`;

      // 隨機異動類型
      const type =
        historyTypes[Math.floor(Math.random() * historyTypes.length)];

      // 隨機數量變化 (-100到100)
      const quantity =
        type === "out" || type === "discard"
          ? -Math.floor(Math.random() * 100) - 1
          : Math.floor(Math.random() * 100) + 1;

      // 箱數變化
      const boxCount =
        Math.ceil(Math.abs(quantity) / 10) * (quantity < 0 ? -1 : 1);

      // 異動前後數量
      const beforeQty = Math.floor(Math.random() * 500) + 100;
      const afterQty = beforeQty + quantity;

      // 單號
      const number = `${type.toUpperCase()}-${new Date().getFullYear()}${String(
        Math.floor(Math.random() * 100000)
      ).padStart(5, "0")}`;

      // 關聯單據
      const relatedDocument =
        Math.random() > 0.5
          ? `REF-${new Date().getFullYear()}${String(
              Math.floor(Math.random() * 100000)
            ).padStart(5, "0")}`
          : null;

      // 隨機日期 (過去180天內)
      const today = new Date();
      const halfYearAgo = new Date();
      halfYearAgo.setDate(today.getDate() - 180);
      const datetime = this.formatDateString(
        this.randomDate(halfYearAgo, today)
      );

      return {
        id: this.generateId(),
        number,
        relatedDocument,
        datetime,
        type,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        productCode,
        batchNumber,
        quantity,
        boxCount,
        beforeQty,
        afterQty,
        operator: operators[Math.floor(Math.random() * operators.length)],
        remark:
          Math.random() > 0.7
            ? `異動備註-${Math.floor(Math.random() * 1000)}`
            : null
      };
    });

    // 依日期排序 (最新的在前)
    mockHistory.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    // 過濾條件: 產品ID
    if (params.productId) {
      const targetProduct = this.generateMockInventoryList({
        productId: params.productId
      })[0];
      if (targetProduct) {
        mockHistory = mockHistory.filter(
          item => item.productCode === targetProduct.productCode
        );
      }
    }

    // 過濾條件: 搜尋關鍵字
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      mockHistory = mockHistory.filter(
        item =>
          item.number.toLowerCase().includes(searchLower) ||
          (item.relatedDocument &&
            item.relatedDocument.toLowerCase().includes(searchLower)) ||
          item.productCode.toLowerCase().includes(searchLower) ||
          item.batchNumber.toLowerCase().includes(searchLower)
      );
    }

    // 過濾條件: 日期範圍
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      mockHistory = mockHistory.filter(item => {
        const itemDate = new Date(item.datetime);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return mockHistory;
  }

  // 修改 generateMockFieldHistory 方法
  generateMockFieldHistory(params = {}) {
    // 可能的異動類型
    const historyTypes = ["create", "update", "delete"];

    // 可能的倉庫
    const warehouses = ["原料倉", "成品倉", "中央倉", "外包倉"];

    // 可能的操作人員
    const operators = ["王小明", "李小華", "張大同", "陳經理", "系統管理員"];

    // 可能的異動欄位
    const fields = ["安全存量", "再轉倉點", "倉別", "儲位編號", "狀態", "效期"];

    // 產生30筆隨機欄位異動記錄
    let mockFieldHistory = Array.from({ length: 30 }, (_, index) => {
      // 如果提供了特定的產品代碼和批號，則使用它們
      // 否則隨機生成
      const productCode =
        params.productCode ||
        `${["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]}${String(
          Math.floor(Math.random() * 10000)
        ).padStart(4, "0")}`;

      // 如果有提供批號則使用，否則根據產品代碼生成或設為 null
      const batchNumber =
        params.batchNumber ||
        (Math.random() > 0.3
          ? `${productCode}-${new Date()
              .getFullYear()
              .toString()
              .substr(2)}-${String(Math.floor(Math.random() * 10000)).padStart(
              4,
              "0"
            )}`
          : null);

      // 隨機異動類型
      const type =
        historyTypes[Math.floor(Math.random() * historyTypes.length)];

      // 隨機異動欄位
      const field = fields[Math.floor(Math.random() * fields.length)];

      // 根據欄位類型生成適當的異動前後值
      let beforeValue, afterValue;

      switch (field) {
        case "安全存量":
        case "再轉倉點":
          beforeValue = String(Math.floor(Math.random() * 100) + 50);
          afterValue = String(Math.floor(Math.random() * 100) + 50);
          break;
        case "倉別":
          beforeValue =
            warehouses[Math.floor(Math.random() * warehouses.length)];
          afterValue =
            warehouses[Math.floor(Math.random() * warehouses.length)];
          while (afterValue === beforeValue) {
            afterValue =
              warehouses[Math.floor(Math.random() * warehouses.length)];
          }
          break;
        case "儲位編號":
          beforeValue = `${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}-${Math.floor(Math.random() * 100) + 1}-${Math.floor(
            Math.random() * 10
          ) + 1}`;
          afterValue = `${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}-${Math.floor(Math.random() * 100) + 1}-${Math.floor(
            Math.random() * 10
          ) + 1}`;
          break;
        case "狀態":
          beforeValue = ["active", "locked", "quarantine", "expired"][
            Math.floor(Math.random() * 4)
          ];
          afterValue = ["active", "locked", "quarantine", "expired"][
            Math.floor(Math.random() * 4)
          ];
          while (afterValue === beforeValue) {
            afterValue = ["active", "locked", "quarantine", "expired"][
              Math.floor(Math.random() * 4)
            ];
          }
          break;
        case "效期":
          const baseDate = new Date();
          baseDate.setDate(
            baseDate.getDate() + Math.floor(Math.random() * 365)
          );
          beforeValue = this.formatDateString(baseDate);

          const newDate = new Date(baseDate);
          newDate.setDate(
            newDate.getDate() + Math.floor(Math.random() * 30) - 15
          );
          afterValue = this.formatDateString(newDate);
          break;
      }

      // 如果是建立記錄，則沒有beforeValue
      if (type === "create") {
        beforeValue = null;
      }

      // 如果是刪除記錄，則沒有afterValue
      if (type === "delete") {
        afterValue = null;
      }

      // 隨機日期 (過去180天內)
      const today = new Date();
      const halfYearAgo = new Date();
      halfYearAgo.setDate(today.getDate() - 180);
      const datetime = this.formatDateString(
        this.randomDate(halfYearAgo, today)
      );

      return {
        id: this.generateId(),
        datetime,
        type,
        productCode,
        batchNumber,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        field,
        beforeValue,
        afterValue,
        operator: operators[Math.floor(Math.random() * operators.length)],
        remark:
          Math.random() > 0.7
            ? `欄位異動備註-${Math.floor(Math.random() * 1000)}`
            : null
      };
    });

    // 依日期排序 (最新的在前)
    mockFieldHistory.sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    );

    // 過濾條件: 產品代碼和批號
    if (params.productCode) {
      mockFieldHistory = mockFieldHistory.filter(
        item => item.productCode === params.productCode
      );
    }

    if (params.batchNumber) {
      mockFieldHistory = mockFieldHistory.filter(
        item => item.batchNumber === params.batchNumber
      );
    }

    // 保持原有的其他篩選邏輯
    // 過濾條件: 產品ID
    if (params.productId) {
      const targetProduct = this.generateMockInventoryList({
        productId: params.productId
      })[0];
      if (targetProduct) {
        mockFieldHistory = mockFieldHistory.filter(
          item => item.productCode === targetProduct.productCode
        );
      }
    }

    // 過濾條件: 搜尋關鍵字
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      mockFieldHistory = mockFieldHistory.filter(
        item =>
          item.productCode.toLowerCase().includes(searchLower) ||
          (item.batchNumber &&
            item.batchNumber.toLowerCase().includes(searchLower)) ||
          item.field.toLowerCase().includes(searchLower)
      );
    }

    // 過濾條件: 日期範圍
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      mockFieldHistory = mockFieldHistory.filter(item => {
        const itemDate = new Date(item.datetime);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return mockFieldHistory;
  }
  // 獲取特定產品的批號列表
  async getBatchList(productCode) {
    try {
      // 實際環境中的API呼叫
      // return await axios.get(`${this.baseUrl}/batch`, { params: { productCode } });

      // 模擬延遲
      await this.delay();

      // 從快取中獲取批號資料
      let mockData;
      if (this.batchDataCache[productCode]) {
        // 使用快取的批號資料
        mockData = this.batchDataCache[productCode];
      } else {
        // 如果沒有快取，生成新的批號資料
        const batchCount = Math.floor(Math.random() * 7) + 3; // 3-10筆批號
        mockData = this.generateMockBatchData(productCode, batchCount);
        // 儲存到快取
        this.batchDataCache[productCode] = mockData;
      }

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("獲取批號列表失敗:", error);
      throw error;
    }
  }

  // 為展開行加載批號資料
  async loadBatchDataForRow(row) {
    try {
      // Simulate delay
      await this.delay();

      // Get batch data
      const response = await this.getBatchList(row.productCode);

      if (response.success && response.data) {
        // 使用 details 屬性名而非 children
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        message: "獲取批號資料失敗"
      };
    } catch (error) {
      console.error("加載批號資料失敗:", error);
      throw error;
    }
  }

  // 獲取所有批號列表（從批號角度查看）
  async getAllBatchList(params = {}) {
    try {
      // 模擬延遲
      await this.delay();

      // 這裡我們需要合併所有產品的批號資料
      let allBatches = [];

      // 首先獲取所有產品
      const inventoryResponse = await this.getInventoryList();
      const products = inventoryResponse.data || [];

      // 遍歷產品，獲取每個產品的批號資料
      for (const product of products) {
        // 獲取產品的批號
        const batchResponse = await this.getBatchList(product.productCode);

        if (batchResponse.success && batchResponse.data) {
          // 將產品信息添加到每個批號中，以便於在批號列表頁面顯示產品名稱等資訊
          const batchesWithProductInfo = batchResponse.data.map(batch => ({
            ...batch,
            productName: product.productName,
            category: product.category,
            productCategory: product.productcategory,
            // 為每個批號添加 details 屬性，用於子表格展開
            details: []
          }));

          allBatches = [...allBatches, ...batchesWithProductInfo];
        }
      }

      // 應用搜索過濾
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        allBatches = allBatches.filter(
          batch =>
            batch.batchNumber.toLowerCase().includes(searchLower) ||
            batch.productCode.toLowerCase().includes(searchLower) ||
            (batch.productName &&
              batch.productName.toLowerCase().includes(searchLower))
        );
      }

      // 日期過濾 (對於效期日期)
      if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);

        allBatches = allBatches.filter(batch => {
          const expiryDate = new Date(batch.expiryDate);
          return expiryDate >= startDate && expiryDate <= endDate;
        });
      }

      return {
        success: true,
        data: allBatches
      };
    } catch (error) {
      console.error("獲取所有批號列表失敗:", error);
      throw error;
    }
  }

  // 獲取批號異動記錄
  // 獲取批號異動記錄
  async getBatchHistory(params = {}) {
    try {
      // 模擬延遲
      await this.delay();

      // 如果有指定批號ID，先獲取批號信息
      let targetBatch = null;
      if (params.batchId) {
        targetBatch = this.findBatchById(params.batchId);

        // 如果找不到批號，直接返回空結果
        if (!targetBatch) {
          console.warn(`未找到ID為 ${params.batchId} 的批號`);
          return {
            success: true,
            data: []
          };
        }

        // 將批號信息添加到參數中，以便後續篩選
        params.batchNumber = targetBatch.batchNumber;
        params.productCode = targetBatch.productCode;
      }

      // 獲取所有庫存異動記錄
      const allHistoryResponse = await this.getInventoryHistory();
      let batchHistory = allHistoryResponse.data || [];

      // 獲取對應的字段異動記錄
      const fieldHistory = await this.generateMockFieldHistory({
        productCode: params.productCode,
        batchNumber: params.batchNumber
      });

      // 為字段異動記錄添加標記，並轉換為兼容異動記錄的格式
      const formattedFieldHistory = fieldHistory.map(item => ({
        id: item.id,
        number: `FIELD-${item.id}`,
        datetime: item.datetime,
        type: item.type,
        productCode: item.productCode,
        batchNumber: item.batchNumber,
        warehouse: item.warehouse,
        quantity: 0, // 字段變更不涉及數量變化
        boxCount: 0,
        beforeQty: item.beforeValue || "-",
        afterQty: item.afterValue || "-",
        operator: item.operator,
        remark: `${item.field} 變更: ${item.beforeValue ||
          "-"} → ${item.afterValue || "-"}`,
        field: item.field, // 保留字段信息
        beforeValue: item.beforeValue, // 保留變更前值
        afterValue: item.afterValue, // 保留變更後值
        recordType: "field" // 標記為字段異動記錄
      }));

      // 標記庫存異動記錄
      batchHistory = batchHistory.map(item => ({
        ...item,
        recordType: "inventory" // 標記為庫存異動記錄
      }));

      // 合併兩種記錄
      let combinedHistory = [...batchHistory, ...formattedFieldHistory];

      // 如果有批號信息，進行篩選
      if (params.batchNumber) {
        console.log(`篩選批號為 ${params.batchNumber} 的記錄`);
        combinedHistory = combinedHistory.filter(
          item => item.batchNumber === params.batchNumber
        );
      }

      // 如果有產品代碼，進一步篩選
      if (params.productCode) {
        console.log(`篩選產品代碼為 ${params.productCode} 的記錄`);
        combinedHistory = combinedHistory.filter(
          item => item.productCode === params.productCode
        );
      }

      // 應用其他過濾條件
      // 搜索過濾
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        combinedHistory = combinedHistory.filter(
          item =>
            item.number.toLowerCase().includes(searchLower) ||
            (item.batchNumber &&
              item.batchNumber.toLowerCase().includes(searchLower)) ||
            item.productCode.toLowerCase().includes(searchLower)
        );
      }

      // 日期過濾
      if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);

        combinedHistory = combinedHistory.filter(item => {
          const itemDate = new Date(item.datetime);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // 按日期排序（最新的在前）
      combinedHistory.sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      );

      // 添加日誌以幫助調試
      console.log(`最終返回 ${combinedHistory.length} 條批號相關記錄`);

      return {
        success: true,
        data: combinedHistory
      };
    } catch (error) {
      console.error("獲取批號異動記錄失敗:", error);
      throw error;
    }
  }

  // 通過ID查找批號
  findBatchById(batchId) {
    // 遍歷所有產品的批號數據
    for (const productCode in this.batchDataCache) {
      const batches = this.batchDataCache[productCode];
      const batch = batches.find(b => b.id === batchId);
      if (batch) {
        return batch;
      }
    }
    console.warn(`未找到ID為 ${batchId} 的批號`);
    return null;
  }

  // 更新批號資料
  async updateBatch(batchData) {
    try {
      // 模擬延遲
      await this.delay();

      // 在實際快取中更新批號資料
      if (this.batchDataCache[batchData.productCode]) {
        const index = this.batchDataCache[batchData.productCode].findIndex(
          item => item.id === batchData.id
        );

        if (index !== -1) {
          this.batchDataCache[batchData.productCode][index] = {
            ...this.batchDataCache[batchData.productCode][index],
            ...batchData,
            updatedAt: this.formatDateString(new Date())
          };
        }
      }

      return {
        success: true,
        message: "批號資料更新成功",
        data: batchData
      };
    } catch (error) {
      console.error("更新批號資料失敗:", error);
      throw error;
    }
  }

  // 創建新批號
  async createBatch(batchData) {
    try {
      // 模擬延遲
      await this.delay();

      // 為新批號生成ID
      const newBatch = {
        ...batchData,
        id: this.generateId(),
        createdAt: this.formatDateString(new Date()),
        updatedAt: this.formatDateString(new Date())
      };

      // 將新批號添加到快取中
      if (!this.batchDataCache[batchData.productCode]) {
        this.batchDataCache[batchData.productCode] = [];
      }

      this.batchDataCache[batchData.productCode].push(newBatch);

      return {
        success: true,
        message: "批號資料創建成功",
        data: newBatch
      };
    } catch (error) {
      console.error("創建批號資料失敗:", error);
      throw error;
    }
  }
}

export default new InventoryService();
