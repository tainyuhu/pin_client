import axios from "axios";

// 模擬數據 - 接單列表
const mockOrders = [
  {
    id: 1,
    orderNumber: "ORD20250301001",
    customerName: "張三",
    contactPhone: "0912345678",
    totalAmount: 32000,
    paidAmount: 32000,
    paymentMethod: "銀行轉帳",
    bankLastFive: "12345",
    bankScreenshot: "",
    paymentStatus: "paid",
    orderStatus: "completed",
    orderDate: "2025-03-01T10:00:00",
    paymentDate: "2025-03-01T11:30:00",
    processor: "王經理",
    remark: "指定下午送達",
    details: [
      {
        serialNumber: "D001",
        productName: "高級筆記型電腦",
        specification: "16GB RAM, 512GB SSD",
        unitPrice: 32000,
        quantity: 1,
        subtotal: 32000
      }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD20250302002",
    customerName: "李四",
    contactPhone: "0923456789",
    totalAmount: 56000,
    paidAmount: 0,
    paymentMethod: "銀行轉帳",
    bankLastFive: "",
    bankScreenshot: "",
    paymentStatus: "unpaid",
    orderStatus: "processing",
    orderDate: "2025-03-02T14:30:00",
    paymentDate: null,
    processor: "李助理",
    remark: "客戶要求發票抬頭為公司名稱",
    details: [
      {
        serialNumber: "D002",
        productName: "智能手機",
        specification: "256GB, 黑色",
        unitPrice: 28000,
        quantity: 2,
        subtotal: 56000
      }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD20250303003",
    customerName: "王五",
    contactPhone: "0934567890",
    totalAmount: 8400,
    paidAmount: 1000,
    paymentMethod: "銀行轉帳",
    bankLastFive: "54321",
    bankScreenshot: "",
    paymentStatus: "confirming",
    orderStatus: "processing",
    orderDate: "2025-03-03T09:15:00",
    paymentDate: "2025-03-03T09:45:00",
    processor: "陳主管",
    remark: "部分付款，剩餘金額貨到付款",
    details: [
      {
        serialNumber: "D003",
        productName: "無線耳機",
        specification: "白色, 降噪款",
        unitPrice: 3500,
        quantity: 2,
        subtotal: 7000
      },
      {
        serialNumber: "D004",
        productName: "充電線",
        specification: "2米, Type-C",
        unitPrice: 350,
        quantity: 4,
        subtotal: 1400
      }
    ]
  },
  {
    id: 4,
    orderNumber: "ORD20250304004",
    customerName: "趙六",
    contactPhone: "0945678901",
    totalAmount: 1800,
    paidAmount: 1800,
    paymentMethod: "銀行轉帳",
    bankLastFive: "98765",
    bankScreenshot: "",
    paymentStatus: "refunded",
    orderStatus: "cancelled",
    orderDate: "2025-03-04T16:20:00",
    paymentDate: "2025-03-04T16:50:00",
    processor: "林經理",
    remark: "客戶取消訂單，已退款",
    details: [
      {
        serialNumber: "D005",
        productName: "藍牙音箱",
        specification: "中型, 紅色",
        unitPrice: 1800,
        quantity: 1,
        subtotal: 1800
      }
    ]
  },
  {
    id: 5,
    orderNumber: "ORD20250305005",
    customerName: "孫七",
    contactPhone: "0956789012",
    totalAmount: 4350,
    paidAmount: 0,
    paymentMethod: "",
    bankLastFive: "",
    bankScreenshot: "",
    paymentStatus: "cancelled",
    orderStatus: "cancelled",
    orderDate: "2025-03-05T11:10:00",
    paymentDate: null,
    processor: "黃助理",
    remark: "庫存不足，訂單取消",
    details: [
      {
        serialNumber: "D006",
        productName: "智能手錶",
        specification: "運動版, 黑色",
        unitPrice: 4350,
        quantity: 1,
        subtotal: 4350
      }
    ]
  }
];

// 模擬數據 - 異動記錄
const mockHistory = [
  {
    id: 1,
    orderNumber: "ORD20250301001",
    timestamp: "2025-03-01T10:00:00",
    type: "create",
    field: "系統",
    beforeValue: "",
    afterValue: "新增訂單",
    operator: "系統"
  },
  {
    id: 2,
    orderNumber: "ORD20250301001",
    timestamp: "2025-03-01T11:30:00",
    type: "update",
    field: "paymentStatus",
    beforeValue: "unpaid",
    afterValue: "paid",
    operator: "王經理"
  },
  {
    id: 3,
    orderNumber: "ORD20250301001",
    timestamp: "2025-03-01T11:35:00",
    type: "update",
    field: "orderStatus",
    beforeValue: "processing",
    afterValue: "completed",
    operator: "王經理"
  },
  {
    id: 4,
    orderNumber: "ORD20250302002",
    timestamp: "2025-03-02T14:30:00",
    type: "create",
    field: "系統",
    beforeValue: "",
    afterValue: "新增訂單",
    operator: "系統"
  },
  {
    id: 5,
    orderNumber: "ORD20250303003",
    timestamp: "2025-03-03T09:15:00",
    type: "create",
    field: "系統",
    beforeValue: "",
    afterValue: "新增訂單",
    operator: "系統"
  },
  {
    id: 6,
    orderNumber: "ORD20250303003",
    timestamp: "2025-03-03T09:45:00",
    type: "update",
    field: "paymentStatus",
    beforeValue: "unpaid",
    afterValue: "confirming",
    operator: "陳主管"
  },
  {
    id: 7,
    orderNumber: "ORD20250304004",
    timestamp: "2025-03-04T16:20:00",
    type: "create",
    field: "系統",
    beforeValue: "",
    afterValue: "新增訂單",
    operator: "系統"
  },
  {
    id: 8,
    orderNumber: "ORD20250304004",
    timestamp: "2025-03-04T16:50:00",
    type: "update",
    field: "paymentStatus",
    beforeValue: "unpaid",
    afterValue: "paid",
    operator: "林經理"
  },
  {
    id: 9,
    orderNumber: "ORD20250304004",
    timestamp: "2025-03-04T17:30:00",
    type: "update",
    field: "paymentStatus",
    beforeValue: "paid",
    afterValue: "refunded",
    operator: "林經理"
  },
  {
    id: 10,
    orderNumber: "ORD20250304004",
    timestamp: "2025-03-04T17:35:00",
    type: "update",
    field: "orderStatus",
    beforeValue: "processing",
    afterValue: "cancelled",
    operator: "林經理"
  },
  {
    id: 11,
    orderNumber: "ORD20250305005",
    timestamp: "2025-03-05T11:10:00",
    type: "create",
    field: "系統",
    beforeValue: "",
    afterValue: "新增訂單",
    operator: "系統"
  },
  {
    id: 12,
    orderNumber: "ORD20250305005",
    timestamp: "2025-03-05T11:30:00",
    type: "update",
    field: "orderStatus",
    beforeValue: "processing",
    afterValue: "cancelled",
    operator: "黃助理"
  },
  {
    id: 13,
    orderNumber: "ORD20250305005",
    timestamp: "2025-03-05T11:31:00",
    type: "update",
    field: "paymentStatus",
    beforeValue: "unpaid",
    afterValue: "cancelled",
    operator: "黃助理"
  }
];

// 模擬數據 - 備註資料
const mockRemarks = [
  {
    id: 1,
    orderId: 1,
    content: "客戶要求指定下午 3 點前送達",
    isPinned: true,
    isImportant: true,
    createdBy: "王經理",
    createdAt: "2025-03-01T10:05:00",
    images: []
  },
  {
    id: 2,
    orderId: 1,
    content: "已確認付款金額",
    isPinned: false,
    isImportant: false,
    createdBy: "王經理",
    createdAt: "2025-03-01T11:32:00",
    images: ["https://via.placeholder.com/100?text=Receipt_Check"]
  },
  {
    id: 3,
    orderId: 2,
    content: "客戶詢問配送時間，已告知需等待付款確認",
    isPinned: false,
    isImportant: false,
    createdBy: "李助理",
    createdAt: "2025-03-02T16:30:00",
    images: []
  },
  {
    id: 4,
    orderId: 3,
    content: "部分付款已確認，等待剩餘款項",
    isPinned: true,
    isImportant: true,
    createdBy: "陳主管",
    createdAt: "2025-03-03T09:47:00",
    images: []
  },
  {
    id: 5,
    orderId: 4,
    content: "客戶表示產品不符合預期，要求退款",
    isPinned: false,
    isImportant: true,
    createdBy: "林經理",
    createdAt: "2025-03-04T17:15:00",
    images: []
  },
  {
    id: 6,
    orderId: 4,
    content: "已處理退款，款項將於 1-3 個工作天內退回客戶帳戶",
    isPinned: true,
    isImportant: false,
    createdBy: "林經理",
    createdAt: "2025-03-04T17:40:00",
    images: []
  },
  {
    id: 7,
    orderId: 5,
    content: "經庫存確認，商品缺貨，需取消訂單",
    isPinned: false,
    isImportant: true,
    createdBy: "黃助理",
    createdAt: "2025-03-05T11:25:00",
    images: []
  },
  {
    id: 8,
    orderId: 1,
    content: "經庫存確認，商品缺貨，需取消訂單",
    isPinned: false,
    isImportant: true,
    createdBy: "黃助理",
    createdAt: "2025-03-05T11:25:00",
    images: []
  },
  {
    id: 9,
    orderId: 1,
    content: "經庫存確認，商品缺貨，需取消訂單",
    isPinned: false,
    isImportant: true,
    createdBy: "黃助理",
    createdAt: "2025-03-05T11:25:00",
    images: []
  },
  {
    id: 10,
    orderId: 1,
    content: "經庫存確認，商品缺貨，需取消訂單",
    isPinned: false,
    isImportant: true,
    createdBy: "黃助理",
    createdAt: "2025-03-05T11:25:00",
    images: []
  },
  {
    id: 11,
    orderId: 1,
    content: "經庫存確認，商品缺貨，需取消訂單",
    isPinned: false,
    isImportant: true,
    createdBy: "黃助理",
    createdAt: "2025-03-05T11:25:00",
    images: []
  }
];

// 模擬數據處理輔助函數
const filterMockData = (data, params) => {
  let result = [...data];

  if (params.orderId) {
    result = result.filter(
      item =>
        item.id === parseInt(params.orderId) ||
        (item.orderNumber && item.orderNumber.includes(params.orderId))
    );
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    result = result.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }

  if (params.startDate && params.endDate) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    endDate.setHours(23, 59, 59, 999); // 將結束日期設為當天的最後一毫秒

    result = result.filter(item => {
      const itemDate = new Date(item.orderDate || item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  return result;
};

class OrderTakingService {
  constructor() {
    this.apiPath = "/api/wms/order-taking";
    this.useMock = true; // 設置為 true 使用模擬數據，設置為 false 使用真實 API
  }

  // 獲取接單列表
  async getOrderList(params = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const filteredData = filterMockData(mockOrders, params);
          resolve({
            success: true,
            data: filteredData,
            total: filteredData.length
          });
        }, 300); // 模擬網絡延遲
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(`${this.apiPath}/list`, { params });
      return response.data;
    } catch (error) {
      console.error("獲取接單列表失敗:", error);
      throw error;
    }
  }

  // 獲取單筆接單詳情
  async getOrderDetail(id) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const order = mockOrders.find(
            o => o.id === parseInt(id) || o.orderNumber === id
          );
          resolve({
            success: !!order,
            data: order || null
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(`${this.apiPath}/detail/${id}`);
      return response.data;
    } catch (error) {
      console.error("獲取接單詳情失敗:", error);
      throw error;
    }
  }

  // 創建新接單
  async createOrder(orderData) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const newId = mockOrders.length + 1;
          const newOrder = {
            id: newId,
            ...orderData,
            orderNumber: `ORD${new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "")}${String(newId).padStart(3, "0")}`,
            orderDate: new Date().toISOString()
          };
          mockOrders.push(newOrder);

          // 新增對應的歷史記錄
          const historyEntry = {
            id: mockHistory.length + 1,
            orderNumber: newOrder.orderNumber,
            timestamp: new Date().toISOString(),
            type: "create",
            field: "系統",
            beforeValue: "",
            afterValue: "新增訂單",
            operator: orderData.processor || "系統"
          };
          mockHistory.push(historyEntry);

          resolve({
            success: true,
            data: newOrder,
            message: "接單創建成功"
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.post(`${this.apiPath}/create`, orderData);
      return response.data;
    } catch (error) {
      console.error("創建接單失敗:", error);
      throw error;
    }
  }

  // 更新接單
  async updateOrder(orderData) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockOrders.findIndex(o => o.id === orderData.id);
          if (index !== -1) {
            const oldOrder = { ...mockOrders[index] };
            mockOrders[index] = { ...oldOrder, ...orderData };

            // 記錄有變更的欄位到歷史記錄
            Object.keys(orderData).forEach(key => {
              if (
                orderData[key] !== oldOrder[key] &&
                key !== "id" &&
                key !== "orderNumber"
              ) {
                const historyEntry = {
                  id: mockHistory.length + 1,
                  orderNumber: oldOrder.orderNumber,
                  timestamp: new Date().toISOString(),
                  type: "update",
                  field: key,
                  beforeValue: String(oldOrder[key] || ""),
                  afterValue: String(orderData[key] || ""),
                  operator: orderData.processor || "系統"
                };
                mockHistory.push(historyEntry);
              }
            });

            resolve({
              success: true,
              data: mockOrders[index],
              message: "接單更新成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的接單資料"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.put(
        `${this.apiPath}/update/${orderData.id}`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("更新接單失敗:", error);
      throw error;
    }
  }

  // 更新付款狀態
  async updatePaymentStatus(id, paymentStatus, paymentInfo = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockOrders.findIndex(o => o.id === parseInt(id));
          if (index !== -1) {
            const oldOrder = { ...mockOrders[index] };
            const oldStatus = oldOrder.paymentStatus;

            mockOrders[index] = {
              ...oldOrder,
              paymentStatus,
              ...paymentInfo,
              paymentDate:
                paymentStatus === "paid" || paymentStatus === "confirming"
                  ? new Date().toISOString()
                  : oldOrder.paymentDate
            };

            // 新增歷史記錄
            const historyEntry = {
              id: mockHistory.length + 1,
              orderNumber: oldOrder.orderNumber,
              timestamp: new Date().toISOString(),
              type: "update",
              field: "paymentStatus",
              beforeValue: oldStatus,
              afterValue: paymentStatus,
              operator: paymentInfo.processor || "系統"
            };
            mockHistory.push(historyEntry);

            resolve({
              success: true,
              data: mockOrders[index],
              message: "付款狀態更新成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的接單資料"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const data = {
        paymentStatus,
        ...paymentInfo
      };
      const response = await axios.put(
        `${this.apiPath}/payment-status/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("更新付款狀態失敗:", error);
      throw error;
    }
  }

  // 更新接單狀態
  async updateOrderStatus(id, orderStatus, statusInfo = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockOrders.findIndex(o => o.id === parseInt(id));
          if (index !== -1) {
            const oldOrder = { ...mockOrders[index] };
            const oldStatus = oldOrder.orderStatus;

            mockOrders[index] = {
              ...oldOrder,
              orderStatus,
              ...statusInfo
            };

            // 新增歷史記錄
            const historyEntry = {
              id: mockHistory.length + 1,
              orderNumber: oldOrder.orderNumber,
              timestamp: new Date().toISOString(),
              type: "update",
              field: "orderStatus",
              beforeValue: oldStatus,
              afterValue: orderStatus,
              operator: statusInfo.processor || "系統"
            };
            mockHistory.push(historyEntry);

            resolve({
              success: true,
              data: mockOrders[index],
              message: "接單狀態更新成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的接單資料"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const data = {
        orderStatus,
        ...statusInfo
      };
      const response = await axios.put(
        `${this.apiPath}/order-status/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("更新接單狀態失敗:", error);
      throw error;
    }
  }

  // 刪除接單
  async deleteOrder(id) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockOrders.findIndex(o => o.id === parseInt(id));
          if (index !== -1) {
            const deletedOrder = mockOrders.splice(index, 1)[0];

            // 新增歷史記錄
            const historyEntry = {
              id: mockHistory.length + 1,
              orderNumber: deletedOrder.orderNumber,
              timestamp: new Date().toISOString(),
              type: "delete",
              field: "系統",
              beforeValue: "",
              afterValue: "刪除訂單",
              operator: "系統"
            };
            mockHistory.push(historyEntry);

            resolve({
              success: true,
              message: "接單刪除成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的接單資料"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.delete(`${this.apiPath}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("刪除接單失敗:", error);
      throw error;
    }
  }

  // 獲取接單異動記錄
  async getOrderHistory(params = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          let filteredHistory = [...mockHistory];

          if (params.orderId) {
            const order = mockOrders.find(
              o => o.id === parseInt(params.orderId)
            );
            if (order) {
              filteredHistory = filteredHistory.filter(
                h => h.orderNumber === order.orderNumber
              );
            } else {
              filteredHistory = [];
            }
          }

          // 應用其他過濾條件
          filteredHistory = filterMockData(filteredHistory, params);

          // 依時間排序，最新的排在前面
          filteredHistory.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          resolve({
            success: true,
            data: filteredHistory,
            total: filteredHistory.length
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(`${this.apiPath}/history`, { params });
      return response.data;
    } catch (error) {
      console.error("獲取接單異動記錄失敗:", error);
      throw error;
    }
  }

  // 批量更新付款狀態
  async batchUpdatePaymentStatus(orderIds, paymentStatus, paymentInfo = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const updatedOrders = [];

          orderIds.forEach(id => {
            const index = mockOrders.findIndex(o => o.id === parseInt(id));
            if (index !== -1) {
              const oldOrder = { ...mockOrders[index] };
              const oldStatus = oldOrder.paymentStatus;

              mockOrders[index] = {
                ...oldOrder,
                paymentStatus,
                ...paymentInfo,
                paymentDate:
                  paymentStatus === "paid" || paymentStatus === "confirming"
                    ? new Date().toISOString()
                    : oldOrder.paymentDate
              };

              updatedOrders.push(mockOrders[index]);

              // 新增歷史記錄
              const historyEntry = {
                id: mockHistory.length + 1,
                orderNumber: oldOrder.orderNumber,
                timestamp: new Date().toISOString(),
                type: "update",
                field: "paymentStatus",
                beforeValue: oldStatus,
                afterValue: paymentStatus,
                operator: paymentInfo.processor || "系統"
              };
              mockHistory.push(historyEntry);
            }
          });

          resolve({
            success: true,
            data: updatedOrders,
            message: `已更新 ${updatedOrders.length} 筆接單的付款狀態`
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const data = {
        orderIds,
        paymentStatus,
        ...paymentInfo
      };
      const response = await axios.put(
        `${this.apiPath}/batch-payment-status`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("批量更新付款狀態失敗:", error);
      throw error;
    }
  }

  // 批量更新接單狀態
  async batchUpdateOrderStatus(orderIds, orderStatus, statusInfo = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const updatedOrders = [];

          orderIds.forEach(id => {
            const index = mockOrders.findIndex(o => o.id === parseInt(id));
            if (index !== -1) {
              const oldOrder = { ...mockOrders[index] };
              const oldStatus = oldOrder.orderStatus;

              mockOrders[index] = {
                ...oldOrder,
                orderStatus,
                ...statusInfo
              };

              updatedOrders.push(mockOrders[index]);

              // 新增歷史記錄
              const historyEntry = {
                id: mockHistory.length + 1,
                orderNumber: oldOrder.orderNumber,
                timestamp: new Date().toISOString(),
                type: "update",
                field: "orderStatus",
                beforeValue: oldStatus,
                afterValue: orderStatus,
                operator: statusInfo.processor || "系統"
              };
              mockHistory.push(historyEntry);
            }
          });

          resolve({
            success: true,
            data: updatedOrders,
            message: `已更新 ${updatedOrders.length} 筆接單的狀態`
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const data = {
        orderIds,
        orderStatus,
        ...statusInfo
      };
      const response = await axios.put(
        `${this.apiPath}/batch-order-status`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("批量更新接單狀態失敗:", error);
      throw error;
    }
  }

  // 上傳銀行轉帳截圖
  async uploadBankScreenshot(id, formData) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockOrders.findIndex(o => o.id === parseInt(id));
          if (index !== -1) {
            const oldOrder = { ...mockOrders[index] };
            const mockImageUrl = `https://via.placeholder.com/100?text=Upload_${Date.now()}`;

            mockOrders[index] = {
              ...oldOrder,
              bankScreenshot: mockImageUrl
            };

            // 新增歷史記錄
            const historyEntry = {
              id: mockHistory.length + 1,
              orderNumber: oldOrder.orderNumber,
              timestamp: new Date().toISOString(),
              type: "update",
              field: "bankScreenshot",
              beforeValue: oldOrder.bankScreenshot || "無",
              afterValue: "已上傳截圖",
              operator: "系統"
            };
            mockHistory.push(historyEntry);

            resolve({
              success: true,
              data: { imageUrl: mockImageUrl },
              message: "銀行轉帳截圖上傳成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的接單資料"
            });
          }
        }, 500); // 模擬上傳時間較長
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.post(
        `${this.apiPath}/upload-screenshot/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("上傳銀行轉帳截圖失敗:", error);
      throw error;
    }
  }

  // 統計儀表板數據
  async getDashboardStats(params = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          // 計算付款狀態統計
          const paymentStatusStats = {
            unpaid: mockOrders.filter(o => o.paymentStatus === "unpaid").length,
            paid: mockOrders.filter(o => o.paymentStatus === "paid").length,
            confirming: mockOrders.filter(o => o.paymentStatus === "confirming")
              .length,
            refunded: mockOrders.filter(o => o.paymentStatus === "refunded")
              .length,
            cancelled: mockOrders.filter(o => o.paymentStatus === "cancelled")
              .length
          };

          // 計算接單狀態統計
          const orderStatusStats = {
            processing: mockOrders.filter(o => o.orderStatus === "processing")
              .length,
            completed: mockOrders.filter(o => o.orderStatus === "completed")
              .length,
            cancelled: mockOrders.filter(o => o.orderStatus === "cancelled")
              .length
          };

          // 計算總金額
          const totalAmount = mockOrders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
          );
          const paidAmount = mockOrders.reduce(
            (sum, order) => sum + (order.paidAmount || 0),
            0
          );

          // 返回統計數據
          resolve({
            success: true,
            data: {
              paymentStatusStats,
              orderStatusStats,
              totalAmount,
              paidAmount,
              totalOrders: mockOrders.length,
              unpaidOrders:
                paymentStatusStats.unpaid + paymentStatusStats.confirming
            }
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(`${this.apiPath}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error("獲取統計數據失敗:", error);
      throw error;
    }
  }

  // 獲取指定訂單的所有備註
  async getOrderRemarks(orderId, params = {}) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          let filteredRemarks = mockRemarks.filter(
            r => r.orderId === parseInt(orderId)
          );

          // 處理分頁參數
          if (params.page && params.pageSize) {
            const page = parseInt(params.page) || 1;
            const pageSize = parseInt(params.pageSize) || 10;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            filteredRemarks = filteredRemarks.slice(start, end);
          }

          // 依照創建時間排序，最新的排在前面
          filteredRemarks.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          resolve({
            success: true,
            data: filteredRemarks,
            total: mockRemarks.filter(r => r.orderId === parseInt(orderId))
              .length
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(`${this.apiPath}/remarks/${orderId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error("獲取備註數據失敗:", error);
      throw error;
    }
  }

  // 獲取指定訂單的最新備註
  async getLatestOrderRemark(orderId) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const remarks = mockRemarks.filter(
            r => r.orderId === parseInt(orderId)
          );

          // 先找出被釘選的備註，並按時間排序
          const pinnedRemarks = remarks
            .filter(r => r.isPinned)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // 若有釘選備註，則返回最新的釘選備註；否則返回最新的備註
          const latestRemark =
            pinnedRemarks.length > 0
              ? pinnedRemarks[0]
              : remarks.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )[0];

          resolve({
            success: true,
            data: latestRemark || null
          });
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.get(
        `${this.apiPath}/latest-remark/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("獲取最新備註失敗:", error);
      throw error;
    }
  }

  // 添加備註
  async addOrderRemark(remarkData, formData = null) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const newId = mockRemarks.length + 1;

          // 處理圖片上傳（如果有）
          const images = [];
          if (formData && formData.has("images")) {
            // 假裝處理了圖片上傳
            for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
              images.push(
                `https://via.placeholder.com/100?text=Upload_${Date.now() + i}`
              );
            }
          }

          const newRemark = {
            id: newId,
            orderId: parseInt(remarkData.orderId),
            content: remarkData.content,
            isPinned: remarkData.isPinned || false,
            isImportant: remarkData.isImportant || false,
            createdBy: remarkData.createdBy || "系統",
            createdAt: new Date().toISOString(),
            images: images
          };

          mockRemarks.push(newRemark);

          resolve({
            success: true,
            data: newRemark,
            message: "備註添加成功"
          });
        }, 500); // 模擬上傳時間較長
      });
    }

    // 真實 API 呼叫
    try {
      // 如果有文件上傳
      if (formData) {
        const response = await axios.post(
          `${this.apiPath}/remark`,
          remarkData,
          {
            headers: { "Content-Type": "multipart/form-data" }
          }
        );
        return response.data;
      } else {
        const response = await axios.post(`${this.apiPath}/remark`, remarkData);
        return response.data;
      }
    } catch (error) {
      console.error("添加備註失敗:", error);
      throw error;
    }
  }

  // 更新備註
  async updateOrderRemark(remarkData) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockRemarks.findIndex(r => r.id === remarkData.id);

          if (index !== -1) {
            mockRemarks[index] = {
              ...mockRemarks[index],
              content: remarkData.content,
              isPinned: remarkData.isPinned,
              isImportant: remarkData.isImportant,
              updatedAt: new Date().toISOString()
            };

            resolve({
              success: true,
              data: mockRemarks[index],
              message: "備註更新成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的備註"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.put(
        `${this.apiPath}/remark/${remarkData.id}`,
        remarkData
      );
      return response.data;
    } catch (error) {
      console.error("更新備註失敗:", error);
      throw error;
    }
  }

  // 刪除備註
  async deleteOrderRemark(remarkId) {
    if (this.useMock) {
      // 使用模擬數據
      return new Promise(resolve => {
        setTimeout(() => {
          const index = mockRemarks.findIndex(r => r.id === parseInt(remarkId));

          if (index !== -1) {
            mockRemarks.splice(index, 1);

            resolve({
              success: true,
              message: "備註刪除成功"
            });
          } else {
            resolve({
              success: false,
              message: "找不到對應的備註"
            });
          }
        }, 300);
      });
    }

    // 真實 API 呼叫
    try {
      const response = await axios.delete(`${this.apiPath}/remark/${remarkId}`);
      return response.data;
    } catch (error) {
      console.error("刪除備註失敗:", error);
      throw error;
    }
  }
}

export default new OrderTakingService();
