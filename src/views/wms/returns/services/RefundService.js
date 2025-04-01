// services/RefundService.js
import axios from "axios";

// API基礎URL，可以根據環境變量或直接指定
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "/api";

// 創建具有基本配置的 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超時
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// 攔截器: 處理請求錯誤
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 處理共通錯誤情況
    if (error.response) {
      // 伺服器回應了錯誤狀態碼
      console.error("API Error:", error.response.status, error.response.data);

      // 處理特定錯誤碼
      if (error.response.status === 401) {
        // 身份驗證失敗: 可以重定向到登入頁面或刷新 token
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // 請求已發出但沒有收到回應
      console.error("No response received:", error.request);
    } else {
      // 設置請求時發生錯誤
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

// 模擬數據 - 僅用於開發環境
const mockRefundData = [
  {
    id: "RF20250321001",
    originalSalesId: "SO20250315001",
    customerName: "台灣科技有限公司",
    contactName: "張先生",
    contactPhone: "0912345678",
    shippingAddress: "台北市信義區信義路五段7號",
    paymentMethod: "信用卡",
    refundDate: "2025-03-21",
    status: "pending",
    processMethod: "returnExchangeRefundPartial",
    totalAmount: 3200,
    remarks: "",
    details: [
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      },
      {
        serialNumber: "D1001",
        productCode: "P001",
        productName: "高效能筆記型電腦",
        specification: "15吋/8GB/256GB",
        batchNumber: "B2025001",
        quantity: 1,
        price: 3200,
        subtotal: 3200,
        issueType: "damaged",
        lossCost: 1000
      }
    ]
  },
  {
    id: "RF20250321002",
    originalSalesId: "SO20250316002",
    customerName: "豐盛貿易股份有限公司",
    contactName: "李小姐",
    contactPhone: "0923456789",
    shippingAddress: "台中市西區民權路100號",
    paymentMethod: "公司轉帳",
    refundDate: "2025-03-20",
    status: "processing",
    processMethod: "returnExchangeRefundPartial",
    totalAmount: 6500,
    remarks: "客戶希望盡快處理",
    details: [
      {
        serialNumber: "D2001",
        productCode: "P005",
        productName: "網路交換器",
        specification: "8埠/Gigabit",
        batchNumber: "B2025005",
        quantity: 2,
        price: 2200,
        subtotal: 4400,
        issueType: "wrong_item",
        lossCost: 600
      },
      {
        serialNumber: "D2002",
        productCode: "P010",
        productName: "無線路由器",
        specification: "雙頻/WiFi 6",
        batchNumber: "B2025008",
        quantity: 1,
        price: 2100,
        subtotal: 2100,
        issueType: "quality",
        lossCost: 500
      }
    ]
  },
  {
    id: "RF20250320003",
    originalSalesId: "SO20250310005",
    customerName: "創新資訊有限公司",
    contactName: "王經理",
    contactPhone: "0934567890",
    shippingAddress: "高雄市前鎮區中山三路132號",
    paymentMethod: "月結",
    refundDate: "2025-03-18",
    status: "completed",
    processMethod: "returnExchangeRefundPartial",
    totalAmount: 12800,
    remarks: "已完成退款程序",
    details: [
      {
        serialNumber: "D3001",
        productCode: "P020",
        productName: "伺服器",
        specification: "16GB/1TB/Xeon",
        batchNumber: "B2025012",
        quantity: 1,
        price: 12800,
        subtotal: 12800,
        issueType: "damaged",
        lossCost: 3500
      }
    ]
  },
  {
    id: "RF20250319004",
    originalSalesId: "SO20250305003",
    customerName: "全球通訊科技股份有限公司",
    contactName: "陳協理",
    contactPhone: "0945678901",
    shippingAddress: "新北市板橋區縣民大道300號",
    paymentMethod: "信用卡",
    refundDate: "2025-03-17",
    status: "rejected",
    processMethod: "returnExchangeRefundPartial",
    totalAmount: 4500,
    remarks: "商品已超過保固期",
    details: [
      {
        serialNumber: "D4001",
        productCode: "P030",
        productName: "企業防火牆",
        specification: "標準版/1年授權",
        batchNumber: "B2025020",
        quantity: 1,
        price: 4500,
        subtotal: 4500,
        issueType: "damaged",
        lossCost: 0
      }
    ]
  }
];

// 模擬異動記錄數據
const mockHistoryData = [
  {
    id: 1,
    refundId: "RF20250321001",
    timestamp: "2025-03-21T09:30:25",
    user: "admin",
    type: "create",
    field: "status",
    beforeValue: null,
    afterValue: "pending"
  },
  {
    id: 2,
    refundId: "RF20250321001",
    timestamp: "2025-03-21T10:15:42",
    user: "john",
    type: "update",
    field: "remarks",
    beforeValue: "",
    afterValue: "客戶要求盡快處理"
  },
  {
    id: 3,
    refundId: "RF20250321002",
    timestamp: "2025-03-20T14:22:33",
    user: "admin",
    type: "create",
    field: "status",
    beforeValue: null,
    afterValue: "pending"
  },
  {
    id: 4,
    refundId: "RF20250321002",
    timestamp: "2025-03-21T08:45:12",
    user: "mary",
    type: "update",
    field: "status",
    beforeValue: "pending",
    afterValue: "processing"
  },
  {
    id: 5,
    refundId: "RF20250320003",
    timestamp: "2025-03-18T11:10:05",
    user: "admin",
    type: "create",
    field: "status",
    beforeValue: null,
    afterValue: "pending"
  },
  {
    id: 6,
    refundId: "RF20250320003",
    timestamp: "2025-03-19T09:25:18",
    user: "john",
    type: "update",
    field: "status",
    beforeValue: "pending",
    afterValue: "processing"
  },
  {
    id: 7,
    refundId: "RF20250320003",
    timestamp: "2025-03-20T16:05:30",
    user: "mary",
    type: "update",
    field: "status",
    beforeValue: "processing",
    afterValue: "completed"
  },
  {
    id: 8,
    refundId: "RF20250319004",
    timestamp: "2025-03-17T13:42:15",
    user: "admin",
    type: "create",
    field: "status",
    beforeValue: null,
    afterValue: "pending"
  },
  {
    id: 9,
    refundId: "RF20250319004",
    timestamp: "2025-03-18T10:30:22",
    user: "john",
    type: "update",
    field: "processMethod",
    beforeValue: "refundOnly",
    afterValue: "refundCancel"
  },
  {
    id: 10,
    refundId: "RF20250319004",
    timestamp: "2025-03-19T15:18:40",
    user: "mary",
    type: "update",
    field: "status",
    beforeValue: "pending",
    afterValue: "rejected"
  }
];

// 備註數據
const mockRemarks = {
  RF20250321001: [
    {
      id: 1,
      orderId: "RF20250321001",
      content: "客戶要求盡快處理退款",
      createdAt: "2025-03-21T10:15:42",
      isImportant: true,
      isPinned: false
    },
    {
      id: 2,
      orderId: "RF20250321001",
      content: "原始商品有明顯瑕疵，已與客戶確認",
      createdAt: "2025-03-21T09:30:25",
      isImportant: false,
      isPinned: false
    }
  ],
  RF20250321002: [
    {
      id: 3,
      orderId: "RF20250321002",
      content: "換貨商品已準備好，等待安排寄送",
      createdAt: "2025-03-21T08:45:12",
      isImportant: false,
      isPinned: true
    }
  ],
  RF20250320003: [
    {
      id: 4,
      orderId: "RF20250320003",
      content: "退款已完成，金額 NT$9,300",
      createdAt: "2025-03-20T16:05:30",
      isImportant: true,
      isPinned: false
    },
    {
      id: 5,
      orderId: "RF20250320003",
      content: "已通知倉庫準備替換商品",
      createdAt: "2025-03-19T09:25:18",
      isImportant: false,
      isPinned: false
    }
  ],
  RF20250319004: [
    {
      id: 6,
      orderId: "RF20250319004",
      content: "商品已超過保固期，無法受理退貨",
      createdAt: "2025-03-19T15:18:40",
      isImportant: true,
      isPinned: true
    }
  ]
};

// 退貨單數據 API 服務
const RefundService = {
  // 獲取退貨單列表
  getRefundList: async (params = {}) => {
    try {
      // 實際 API 調用
      // const response = await apiClient.get('/refunds', { params });
      // return response.data;

      // 模擬 API 回應
      console.log("Fetching refund list with params:", params);

      // 模擬搜尋功能
      let filteredData = [...mockRefundData];

      if (params.search) {
        const keyword = params.search.toLowerCase();
        filteredData = filteredData.filter(
          refund =>
            refund.id.toLowerCase().includes(keyword) ||
            refund.originalSalesId.toLowerCase().includes(keyword) ||
            refund.customerName.toLowerCase().includes(keyword) ||
            refund.contactName.toLowerCase().includes(keyword)
        );
      }

      // 模擬日期篩選
      if (params.startDate && params.endDate) {
        filteredData = filteredData.filter(refund => {
          const refundDate = new Date(refund.refundDate);
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);
          return refundDate >= startDate && refundDate <= endDate;
        });
      }

      // 模擬狀態篩選
      if (params.status && params.status !== "all") {
        filteredData = filteredData.filter(
          refund => refund.status === params.status
        );
      }

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: filteredData,
            total: filteredData.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
          });
        }, 300);
      });
    } catch (error) {
      console.error("Error fetching refund list:", error);
      throw error;
    }
  },

  // 獲取單一退貨單詳情
  getRefunddetails: async id => {
    try {
      // 實際 API 調用
      // const response = await apiClient.get(`/refunds/${id}`);
      // return response.data;

      // 模擬 API 回應
      console.log("Fetching refund details for ID:", id);

      const refund = mockRefundData.find(item => item.id === id);

      if (!refund) {
        throw new Error("Refund not found");
      }

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: refund });
        }, 200);
      });
    } catch (error) {
      console.error(`Error fetching refund details for ID ${id}:`, error);
      throw error;
    }
  },

  // 更新退貨單
  updateRefund: async refundData => {
    try {
      // 實際 API 調用
      // const response = await apiClient.put(`/refunds/${refundData.id}`, refundData);
      // return response.data;

      // 模擬 API 回應
      console.log("Updating refund with data:", refundData);

      // 找到要更新的退貨單索引
      const index = mockRefundData.findIndex(item => item.id === refundData.id);

      if (index === -1) {
        throw new Error("Refund not found");
      }

      // 更新數據
      mockRefundData[index] = { ...mockRefundData[index], ...refundData };

      // 添加一條異動記錄
      const newHistory = {
        id: mockHistoryData.length + 1,
        refundId: refundData.id,
        timestamp: new Date().toISOString(),
        user: "currentUser", // 實際應從身分驗證中獲取
        type: "update",
        field: "multiple",
        beforeValue: "previous state",
        afterValue: "updated state"
      };

      mockHistoryData.push(newHistory);

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: mockRefundData[index],
            message: "退貨單更新成功"
          });
        }, 500);
      });
    } catch (error) {
      console.error(`Error updating refund:`, error);
      throw error;
    }
  },

  // 獲取退貨單異動記錄
  getRefundHistory: async (params = {}) => {
    try {
      // 實際 API 調用
      // const response = await apiClient.get('/refund-history', { params });
      // return response.data;

      // 模擬 API 回應
      console.log("Fetching refund history with params:", params);

      let filteredHistory = [...mockHistoryData];

      // 根據退貨單 ID 篩選
      if (params.refundId) {
        filteredHistory = filteredHistory.filter(
          record => record.refundId === params.refundId
        );
      }

      // 根據搜尋關鍵字篩選
      if (params.search) {
        const keyword = params.search.toLowerCase();
        filteredHistory = filteredHistory.filter(
          record =>
            record.user.toLowerCase().includes(keyword) ||
            record.type.toLowerCase().includes(keyword) ||
            record.field.toLowerCase().includes(keyword) ||
            (record.beforeValue &&
              record.beforeValue
                .toString()
                .toLowerCase()
                .includes(keyword)) ||
            (record.afterValue &&
              record.afterValue
                .toString()
                .toLowerCase()
                .includes(keyword))
        );
      }

      // 根據日期範圍篩選
      if (params.startDate && params.endDate) {
        filteredHistory = filteredHistory.filter(record => {
          const recordDate = new Date(record.timestamp);
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }

      // 排序: 默認按時間降序
      filteredHistory = filteredHistory.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: filteredHistory,
            total: filteredHistory.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
          });
        }, 300);
      });
    } catch (error) {
      console.error("Error fetching refund history:", error);
      throw error;
    }
  },

  // 獲取所有退貨單的備註預覽
  getAllRemarkPreviews: async () => {
    try {
      // 實際 API 調用
      // const response = await apiClient.get('/refund-remarks/previews');
      // return response.data;

      // 模擬 API 回應
      console.log("Fetching all remark previews");

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: mockRemarks });
        }, 300);
      });
    } catch (error) {
      console.error("Error fetching remark previews:", error);
      throw error;
    }
  },

  // 獲取特定退貨單的備註
  getRemarks: async refundId => {
    try {
      // 實際 API 調用
      // const response = await apiClient.get(`/refund-remarks/${refundId}`);
      // return response.data;

      // 模擬 API 回應
      console.log("Fetching remarks for refund ID:", refundId);

      const remarks = mockRemarks[refundId] || [];

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: remarks,
            hasMore: false
          });
        }, 200);
      });
    } catch (error) {
      console.error(`Error fetching remarks for refund ID ${refundId}:`, error);
      throw error;
    }
  },

  // 添加備註
  addRemark: async remarkData => {
    try {
      // 實際 API 調用
      // const response = await apiClient.post('/refund-remarks', remarkData);
      // return response.data;

      // 模擬 API 回應
      console.log("Adding remark with data:", remarkData);

      const newRemark = {
        id: Date.now(),
        orderId: remarkData.orderId,
        content: remarkData.content,
        createdAt: new Date().toISOString(),
        isImportant: remarkData.isImportant || false,
        isPinned: remarkData.isPinned || false
      };

      // 如果尚未有這個退貨單的備註陣列，則新建一個
      if (!mockRemarks[remarkData.orderId]) {
        mockRemarks[remarkData.orderId] = [];
      }

      // 添加新備註到陣列最前面
      mockRemarks[remarkData.orderId].unshift(newRemark);

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: newRemark,
            message: "備註添加成功"
          });
        }, 300);
      });
    } catch (error) {
      console.error(`Error adding remark:`, error);
      throw error;
    }
  },

  // 更新備註
  updateRemark: async remarkData => {
    try {
      // 實際 API 調用
      // const response = await apiClient.put(`/refund-remarks/${remarkData.id}`, remarkData);
      // return response.data;

      // 模擬 API 回應
      console.log("Updating remark with data:", remarkData);

      // 找到要更新的備註
      const remarks = mockRemarks[remarkData.orderId];

      if (!remarks) {
        throw new Error("Remark not found");
      }

      const index = remarks.findIndex(r => r.id === remarkData.id);

      if (index === -1) {
        throw new Error("Remark not found");
      }

      // 更新備註
      remarks[index] = { ...remarks[index], ...remarkData };

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: remarks[index],
            message: "備註更新成功"
          });
        }, 200);
      });
    } catch (error) {
      console.error(`Error updating remark:`, error);
      throw error;
    }
  },

  // 刪除備註
  deleteRemark: async remarkId => {
    try {
      // 實際 API 調用
      // const response = await apiClient.delete(`/refund-remarks/${remarkId}`);
      // return response.data;

      // 模擬 API 回應
      console.log("Deleting remark with ID:", remarkId);

      // 在所有備註陣列中尋找並刪除指定 ID 的備註
      let deleted = false;

      Object.keys(mockRemarks).forEach(refundId => {
        const index = mockRemarks[refundId].findIndex(r => r.id === remarkId);

        if (index !== -1) {
          mockRemarks[refundId].splice(index, 1);
          deleted = true;
        }
      });

      if (!deleted) {
        throw new Error("Remark not found");
      }

      // 延遲回應以模擬網絡請求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ message: "備註刪除成功" });
        }, 200);
      });
    } catch (error) {
      console.error(`Error deleting remark:`, error);
      throw error;
    }
  }
};

export default RefundService;
