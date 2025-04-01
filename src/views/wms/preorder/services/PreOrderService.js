// // src/services/PreOrderService.js
// import axios from "axios";

// // API 基础路径
// const API_BASE_URL = "/api";

// /**
//  * 銷貨預購管理相關 API 服務
//  */
// class PreOrderService {
//   /**
//    * 獲取銷貨預購單列表
//    * @param {Object} params - 查詢參數
//    * @returns {Promise} API 回應
//    */
//   getPreOrderList(params = {}) {
//     return axios.get(`${API_BASE_URL}/preorder`, { params });
//   }

//   /**
//    * 獲取單個銷貨預購單詳情
//    * @param {string|number} id - 銷貨預購單 ID
//    * @returns {Promise} API 回應
//    */
//   getPreOrderDetail(id) {
//     return axios.get(`${API_BASE_URL}/preorder/${id}`);
//   }

//   /**
//    * 創建新銷貨預購單
//    * @param {Object} preorderData - 銷貨預購單數據
//    * @returns {Promise} API 回應
//    */
//   createPreOrder(preorderData) {
//     return axios.post(`${API_BASE_URL}/preorder`, preorderData);
//   }

//   /**
//    * 更新銷貨預購單
//    * @param {Object} preorderData - 銷貨預購單數據
//    * @returns {Promise} API 回應
//    */
//   updatePreOrder(preorderData) {
//     return axios.put(`${API_BASE_URL}/preorder/${preorderData.id}`, preorderData);
//   }

//   /**
//    * 刪除銷貨預購單
//    * @param {string|number} id - 銷貨預購單 ID
//    * @returns {Promise} API 回應
//    */
//   deletePreOrder(id) {
//     return axios.delete(`${API_BASE_URL}/preorder/${id}`);
//   }

//   /**
//    * 添加銷貨預購單明細項
//    * @param {string|number} preorderId - 銷貨預購單 ID
//    * @param {Object} detailData - 明細項數據
//    * @returns {Promise} API 回應
//    */
//   addPreOrderDetail(preorderId, detailData) {
//     return axios.post(`${API_BASE_URL}/preorder/${preorderId}/details`, detailData);
//   }

//   /**
//    * 更新銷貨預購單明細項
//    * @param {string|number} preorderId - 銷貨預購單 ID
//    * @param {Object} detailData - 明細項數據
//    * @returns {Promise} API 回應
//    */
//   updatePreOrderDetail(preorderId, detailData) {
//     return axios.put(
//       `${API_BASE_URL}/preorder/${preorderId}/details/${detailData.id}`,
//       detailData
//     );
//   }

//   /**
//    * 刪除銷貨預購單明細項
//    * @param {string|number} preorderId - 銷貨預購單 ID
//    * @param {string|number} detailId - 明細項 ID
//    * @returns {Promise} API 回應
//    */
//   deletePreOrderDetail(preorderId, detailId) {
//     return axios.delete(`${API_BASE_URL}/preorder/${preorderId}/details/${detailId}`);
//   }

//   /**
//    * 獲取銷貨預購單異動歷史記錄
//    * @param {Object} params - 查詢參數
//    * @returns {Promise} API 回應
//    */
//   getPreOrderHistory(params = {}) {
//     return axios.get(`${API_BASE_URL}/preorder/history`, { params });
//   }

//   /**
//    * 批量更新銷貨預購單
//    * @param {Array} preorderIds - 銷貨預購單 ID 數組
//    * @param {Object} updateData - 要更新的數據
//    * @returns {Promise} API 回應
//    */
//   batchUpdatePreOrder(preorderIds, updateData) {
//     return axios.patch(`${API_BASE_URL}/preorder/batch`, {
//       ids: preorderIds,
//       data: updateData
//     });
//   }

//   /**
//    * 導出銷貨預購數據為 Excel
//    * @param {Object} params - 導出參數
//    * @returns {Promise} API 回應
//    */
//   exportPreOrder(params = {}) {
//     return axios.get(`${API_BASE_URL}/preorder/export`, {
//       params,
//       responseType: "blob" // 指定響應類型為二進制數據
//     });
//   }
// }

// // 導出一個實例
// export default new PreOrderService();

// src/views/wms/preorder/services/PreOrderService.js
import axios from "axios";
import { formatDate } from "@/utils/date";

// 定義銷貨預購單狀態
const preorder_STATUS = {
  PENDING: "pending", // 待處理
  COMPLETED: "completed", // 已完成
  CANCELLED: "cancelled" // 已取消
};

const PAYMENT_METHODS = [
  "現金",
  "信用卡",
  "銀行轉帳",
  "支票",
  "月結30天",
  "月結60天"
];

// 定義操作類型
const OPERATION_TYPES = {
  CREATE: "create", // 新增
  UPDATE: "update", // 修改
  DELETE: "delete", // 刪除
  VIEW: "view" // 查看
};

// 生成模擬數據
const mockPreOrderData = [];
const mockHistoryData = [];

// 產品資料
const products = [
  {
    code: "P001",
    name: "不鏽鋼水壺",
    spec: "500ml",
    unit: "個",
    price: 350,
    box: 24
  },
  {
    code: "P002",
    name: "保溫杯",
    spec: "350ml",
    unit: "個",
    price: 450,
    box: 30
  },
  {
    code: "P003",
    name: "竹製砧板",
    spec: "30x20cm",
    unit: "個",
    price: 280,
    box: 12
  },
  {
    code: "P004",
    name: "多功能攪拌機",
    spec: "220V/550W",
    unit: "台",
    price: 1200,
    box: 4
  },
  {
    code: "P005",
    name: "陶瓷餐盤",
    spec: "8吋",
    unit: "個",
    price: 150,
    box: 50
  },
  {
    code: "P006",
    name: "不鏽鋼餐具組",
    spec: "四件組",
    unit: "組",
    price: 320,
    box: 20
  },
  {
    code: "P007",
    name: "玻璃密封罐",
    spec: "1000ml",
    unit: "個",
    price: 180,
    box: 36
  },
  {
    code: "P008",
    name: "矽膠烘焙工具",
    spec: "五件組",
    unit: "組",
    price: 450,
    box: 15
  }
];

// 客戶資料
const customers = [
  {
    id: 1,
    name: "台北廚具行",
    contact: "張先生",
    phone: "0227654321",
    extension: "101",
    address: "台北市大安區忠孝東路四段100號"
  },
  {
    id: 2,
    name: "好餐具批發",
    contact: "林小姐",
    phone: "0233456789",
    extension: "",
    address: "新北市板橋區中山路一段50號"
  }
];

// 新增倉庫資料
const warehouses = [
  { code: "WH01", name: "主倉庫" },
  { code: "WH02", name: "北區倉庫" },
  { code: "WH03", name: "中區倉庫" },
  { code: "WH04", name: "南區倉庫" }
];

// 操作人員
const operators = ["admin", "王小明", "李小花", "張經理"];

// 產生隨機銷貨預購單
for (let i = 1; i <= 20; i++) {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const paymentMethod =
    PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
  const createdBy = operators[Math.floor(Math.random() * operators.length)];
  const updatedBy = operators[Math.floor(Math.random() * operators.length)];
  const status = Object.values(preorder_STATUS)[
    Math.floor(Math.random() * Object.values(preorder_STATUS).length)
  ];
  const createDate = new Date();
  createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 60)); // 過去 60 天內

  const updateDate = new Date(createDate);
  updateDate.setDate(updateDate.getDate() + Math.floor(Math.random() * 5)); // 創建後 0-5 天更新

  const shipmentDate = new Date(createDate);
  shipmentDate.setDate(
    shipmentDate.getDate() + Math.floor(Math.random() * 10) + 1
  ); // 創建後 1-10 天出貨

  // 產生明細項
  const details = [];
  const detailsCount = Math.floor(Math.random() * 4) + 1; // 1-4 個明細項
  const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
  const storageLocation = `${warehouse.code}-${String.fromCharCode(
    65 + Math.floor(Math.random() * 6)
  )}-${Math.floor(Math.random() * 10) + 1}`;
  const batchNumber = `BN${formatDate(createDate, "YYMMDD")}${String(
    Math.floor(Math.random() * 1000)
  ).padStart(3, "0")}`;

  for (let j = 1; j <= detailsCount; j++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 個數量
    const discount =
      Math.random() < 0.3 ? Math.floor(Math.random() * 20) + 5 : 0; // 30% 機率有折扣 5-25%
    const unitPrice = product.price;
    const finalPrice =
      discount > 0 ? unitPrice * (1 - discount / 100) : unitPrice;
    const amount = Math.round(finalPrice * quantity);

    details.push({
      id: `D${i}${j}`,
      serialNumber: j,
      productCode: product.code,
      productName: product.name,
      specification: product.spec,
      unit: product.unit,
      quantity,
      unitPrice,
      discount,
      amount,
      remarks: discount > 0 ? `${discount}% 折扣` : "",
      box: product.box,
      batchNumber,
      warehouseCode: warehouse.code,
      warehouseName: warehouse.name,
      storageLocation,
      createdBy,
      createdAt: formatDate(createDate, "YYYY-MM-DD HH:mm:ss"),
      updatedBy,
      updatedAt: formatDate(updateDate, "YYYY-MM-DD HH:mm:ss")
    });
  }

  // 計算總金額
  const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);

  const preorderOrder = {
    id: `SO${String(i).padStart(4, "0")}`,
    orderNumber: `SO-${formatDate(createDate, "YYYYMMDD")}-${String(i).padStart(
      3,
      "0"
    )}`,
    customerName: customer.name,
    contactPerson: customer.contact,
    contactPhone: customer.phone,
    extension: customer.extension,
    shippingAddress: customer.address,
    paymentMethod,
    shipmentDate: formatDate(shipmentDate, "YYYY-MM-DD"),
    totalAmount,
    status,
    createdBy,
    createdAt: formatDate(createDate, "YYYY-MM-DD HH:mm:ss"),
    updatedBy,
    updatedAt: formatDate(updateDate, "YYYY-MM-DD HH:mm:ss"),
    remarks: ["特急件", "請電話確認", "送貨時需報備", ""][
      Math.floor(Math.random() * 4)
    ],
    details
  };

  mockPreOrderData.push(preorderOrder);

  // 產生異動記錄 - 創建記錄
  mockHistoryData.push({
    id: `H${i}1`,
    operateTime: createDate,
    operator: operators[Math.floor(Math.random() * operators.length)],
    orderNumber: preorderOrder.orderNumber,
    type: OPERATION_TYPES.CREATE,
    fieldName: "銷貨預購單",
    beforeValue: null,
    afterValue: "新增銷貨預購單",
    remarks: "系統自動生成"
  });

  // 產生異動記錄 - 修改記錄
  if (Math.random() < 0.7) {
    // 70% 的銷貨預購單有修改記錄
    const modifyFields = ["totalAmount", "shipmentDate", "status", "remarks"];
    const field = modifyFields[Math.floor(Math.random() * modifyFields.length)];
    let beforeValue, afterValue;

    if (field === "totalAmount") {
      beforeValue = totalAmount;
      afterValue = Math.round(totalAmount * (1 + (Math.random() * 0.2 - 0.1))); // ±10% 變化
    } else if (field === "shipmentDate") {
      beforeValue = formatDate(shipmentDate, "YYYY-MM-DD");
      const newDate = new Date(shipmentDate);
      newDate.setDate(newDate.getDate() + Math.floor(Math.random() * 7 - 3)); // ±3 天調整
      afterValue = formatDate(newDate, "YYYY-MM-DD");
    } else if (field === "status") {
      const statusValues = Object.values(preorder_STATUS);
      beforeValue = status;
      afterValue =
        statusValues[(statusValues.indexOf(status) + 1) % statusValues.length];
    } else {
      beforeValue = preorderOrder.remarks || "";
      const remarks = [
        "特急件",
        "請電話確認",
        "送貨時需報備",
        "客戶要求週末送達"
      ];
      afterValue = remarks[Math.floor(Math.random() * remarks.length)];
    }

    mockHistoryData.push({
      id: `H${i}2`,
      operateTime: updateDate,
      operator: operators[Math.floor(Math.random() * operators.length)],
      orderNumber: preorderOrder.orderNumber,
      type: OPERATION_TYPES.UPDATE,
      fieldName:
        field === "totalAmount"
          ? "總金額"
          : field === "shipmentDate"
          ? "出貨日期"
          : field === "status"
          ? "狀態"
          : "備註",
      beforeValue,
      afterValue,
      remarks: "人工修改"
    });
  }
}

// API 基礎路徑
const API_BASE_URL = "/api";
const USE_MOCK = true; // 設置是否使用模擬數據

/**
 * 銷貨預購管理相關 API 服務
 */
class PreOrderService {
  /**
   * 獲取銷貨預購單列表
   * @param {Object} params - 查詢參數
   * @returns {Promise} API 回應
   */
  getPreOrderList(params = {}) {
    if (USE_MOCK) {
      // 使用模擬數據，並根據參數進行過濾
      let filteredData = [...mockPreOrderData];

      // 處理日期範圍過濾
      if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59);

        filteredData = filteredData.filter(item => {
          const shipmentDate = new Date(item.shipmentDate);
          return shipmentDate >= startDate && shipmentDate <= endDate;
        });
      }

      // 處理通用搜尋參數 (新增)
      if (params.search) {
        const query = params.search.toLowerCase();
        filteredData = filteredData.filter(
          item =>
            (item.orderNumber &&
              item.orderNumber.toLowerCase().includes(query)) ||
            (item.customerName &&
              item.customerName.toLowerCase().includes(query)) ||
            (item.contactPerson &&
              item.contactPerson.toLowerCase().includes(query)) ||
            (item.contactPhone && item.contactPhone.includes(query)) ||
            (item.shippingAddress &&
              item.shippingAddress.toLowerCase().includes(query)) ||
            (item.paymentMethod &&
              item.paymentMethod.toLowerCase().includes(query)) ||
            // 檢查明細中的產品名稱
            item.details.some(
              detail =>
                detail.productName &&
                detail.productName.toLowerCase().includes(query)
            )
        );
      }

      // 處理特定欄位搜尋條件
      if (params.orderNumber) {
        const query = params.orderNumber.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.orderNumber.toLowerCase().includes(query)
        );
      }

      if (params.customerName) {
        const query = params.customerName.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.customerName.toLowerCase().includes(query)
        );
      }

      if (params.contactPerson) {
        const query = params.contactPerson.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.contactPerson.toLowerCase().includes(query)
        );
      }

      if (params.productName) {
        const query = params.productName.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.details.some(detail =>
            detail.productName.toLowerCase().includes(query)
          )
        );
      }

      if (params.paymentMethod) {
        const query = params.paymentMethod.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.paymentMethod.toLowerCase().includes(query)
        );
      }

      if (params.status) {
        filteredData = filteredData.filter(
          item => item.status === params.status
        );
      }

      return Promise.resolve({
        code: 200,
        message: "成功",
        data: filteredData
      });
    }

    return axios.get(`${API_BASE_URL}/preorder`, { params });
  }

  /**
   * 獲取單個銷貨預購單詳情
   * @param {string|number} id - 銷貨預購單 ID
   * @returns {Promise} API 回應
   */
  getPreOrderDetail(id) {
    if (USE_MOCK) {
      const preorderOrder = mockPreOrderData.find(item => item.id === id);

      if (preorderOrder) {
        return Promise.resolve({
          code: 200,
          message: "成功",
          data: preorderOrder
        });
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.get(`${API_BASE_URL}/preorder/${id}`);
  }

  /**
   * 創建新銷貨預購單
   * @param {Object} preorderData - 銷貨預購單數據
   * @returns {Promise} API 回應
   */
  createPreOrder(preorderData) {
    if (USE_MOCK) {
      const newId = `SO${String(mockPreOrderData.length + 1).padStart(4, "0")}`;
      const createDate = new Date();

      const newPreOrderOrder = {
        ...preorderData,
        id: newId,
        orderNumber: `SO-${formatDate(createDate, "YYYYMMDD")}-${String(
          mockPreOrderData.length + 1
        ).padStart(3, "0")}`,
        createTime: createDate,
        updateTime: createDate
      };

      mockPreOrderData.push(newPreOrderOrder);

      // 添加異動記錄
      mockHistoryData.push({
        id: `H${mockHistoryData.length + 1}`,
        operateTime: createDate,
        operator: "admin",
        orderNumber: newPreOrderOrder.orderNumber,
        type: OPERATION_TYPES.CREATE,
        fieldName: "銷貨預購單",
        beforeValue: null,
        afterValue: "新增銷貨預購單",
        remarks: "用戶操作"
      });

      return Promise.resolve({
        code: 200,
        message: "創建成功",
        data: newPreOrderOrder
      });
    }

    return axios.post(`${API_BASE_URL}/preorder`, preorderData);
  }

  /**
   * 更新銷貨預購單
   * @param {Object} preorderData - 銷貨預購單數據
   * @returns {Promise} API 回應
   */
  updatePreOrder(preorderData) {
    if (USE_MOCK) {
      const index = mockPreOrderData.findIndex(
        item => item.id === preorderData.id
      );

      if (index !== -1) {
        const oldData = { ...mockPreOrderData[index] };
        const updateDate = new Date();

        // 更新數據
        mockPreOrderData[index] = {
          ...oldData,
          ...preorderData,
          updateTime: updateDate
        };

        // 添加異動記錄
        mockHistoryData.push({
          id: `H${mockHistoryData.length + 1}`,
          operateTime: updateDate,
          operator: "admin",
          orderNumber: oldData.orderNumber,
          type: OPERATION_TYPES.UPDATE,
          fieldName: "銷貨預購單",
          beforeValue: null,
          afterValue: "更新銷貨預購單",
          remarks: "用戶操作"
        });

        return Promise.resolve({
          code: 200,
          message: "更新成功",
          data: mockPreOrderData[index]
        });
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.put(
      `${API_BASE_URL}/preorder/${preorderData.id}`,
      preorderData
    );
  }

  /**
   * 刪除銷貨預購單
   * @param {string|number} id - 銷貨預購單 ID
   * @returns {Promise} API 回應
   */
  deletePreOrder(id) {
    if (USE_MOCK) {
      const index = mockPreOrderData.findIndex(item => item.id === id);

      if (index !== -1) {
        const deletedData = mockPreOrderData[index];
        mockPreOrderData.splice(index, 1);

        // 添加異動記錄
        mockHistoryData.push({
          id: `H${mockHistoryData.length + 1}`,
          operateTime: new Date(),
          operator: "admin",
          orderNumber: deletedData.orderNumber,
          type: OPERATION_TYPES.DELETE,
          fieldName: "銷貨預購單",
          beforeValue: deletedData.orderNumber,
          afterValue: null,
          remarks: "用戶操作"
        });

        return Promise.resolve({
          code: 200,
          message: "刪除成功"
        });
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.delete(`${API_BASE_URL}/preorder/${id}`);
  }

  /**
   * 添加銷貨預購單明細項
   * @param {string|number} preorderId - 銷貨預購單 ID
   * @param {Object} detailData - 明細項數據
   * @returns {Promise} API 回應
   */
  addPreOrderDetail(preorderId, detailData) {
    if (USE_MOCK) {
      const preorderIndex = mockPreOrderData.findIndex(
        item => item.id === preorderId
      );

      if (preorderIndex !== -1) {
        const preorderOrder = mockPreOrderData[preorderIndex];
        const newDetail = {
          ...detailData,
          id: `D${preorderId}${preorderOrder.details.length + 1}`
        };

        // 更新明細和總金額
        preorderOrder.details.push(newDetail);
        preorderOrder.totalAmount = preorderOrder.details.reduce(
          (sum, item) => sum + item.amount,
          0
        );
        preorderOrder.updateTime = new Date();

        // 添加異動記錄
        mockHistoryData.push({
          id: `H${mockHistoryData.length + 1}`,
          operateTime: new Date(),
          operator: "admin",
          orderNumber: preorderOrder.orderNumber,
          type: OPERATION_TYPES.UPDATE,
          fieldName: "明細項",
          beforeValue: null,
          afterValue: `新增明細項：${newDetail.productName}`,
          remarks: "用戶操作"
        });

        return Promise.resolve({
          code: 200,
          message: "添加成功",
          data: newDetail
        });
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.post(
      `${API_BASE_URL}/preorder/${preorderId}/details`,
      detailData
    );
  }

  /**
   * 更新銷貨預購單明細項
   * @param {string|number} preorderId - 銷貨預購單 ID
   * @param {Object} detailData - 明細項數據
   * @returns {Promise} API 回應
   */
  updatePreOrderDetail(preorderId, detailData) {
    if (USE_MOCK) {
      const preorderIndex = mockPreOrderData.findIndex(
        item => item.id === preorderId
      );

      if (preorderIndex !== -1) {
        const preorderOrder = mockPreOrderData[preorderIndex];
        const detailIndex = preorderOrder.details.findIndex(
          item => item.id === detailData.id
        );

        if (detailIndex !== -1) {
          const oldDetail = { ...preorderOrder.details[detailIndex] };

          // 更新明細
          preorderOrder.details[detailIndex] = {
            ...oldDetail,
            ...detailData
          };

          // 更新總金額
          preorderOrder.totalAmount = preorderOrder.details.reduce(
            (sum, item) => sum + item.amount,
            0
          );
          preorderOrder.updateTime = new Date();

          // 添加異動記錄
          mockHistoryData.push({
            id: `H${mockHistoryData.length + 1}`,
            operateTime: new Date(),
            operator: "admin",
            orderNumber: preorderOrder.orderNumber,
            type: OPERATION_TYPES.UPDATE,
            fieldName: "明細項",
            beforeValue: `${oldDetail.productName}`,
            afterValue: `更新明細項：${detailData.productName}`,
            remarks: "用戶操作"
          });

          return Promise.resolve({
            code: 200,
            message: "更新成功",
            data: preorderOrder.details[detailIndex]
          });
        } else {
          return Promise.reject({
            code: 404,
            message: "找不到指定的明細項"
          });
        }
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.put(
      `${API_BASE_URL}/preorder/${preorderId}/details/${detailData.id}`,
      detailData
    );
  }

  /**
   * 刪除銷貨預購單明細項
   * @param {string|number} preorderId - 銷貨預購單 ID
   * @param {string|number} detailId - 明細項 ID
   * @returns {Promise} API 回應
   */
  deletePreOrderDetail(preorderId, detailId) {
    if (USE_MOCK) {
      const preorderIndex = mockPreOrderData.findIndex(
        item => item.id === preorderId
      );

      if (preorderIndex !== -1) {
        const preorderOrder = mockPreOrderData[preorderIndex];
        const detailIndex = preorderOrder.details.findIndex(
          item => item.id === detailId
        );

        if (detailIndex !== -1) {
          const deletedDetail = preorderOrder.details[detailIndex];

          // 刪除明細
          preorderOrder.details.splice(detailIndex, 1);

          // 更新序號
          preorderOrder.details.forEach((item, index) => {
            item.serialNumber = index + 1;
          });

          // 更新總金額
          preorderOrder.totalAmount = preorderOrder.details.reduce(
            (sum, item) => sum + item.amount,
            0
          );
          preorderOrder.updateTime = new Date();

          // 添加異動記錄
          mockHistoryData.push({
            id: `H${mockHistoryData.length + 1}`,
            operateTime: new Date(),
            operator: "admin",
            orderNumber: preorderOrder.orderNumber,
            type: OPERATION_TYPES.DELETE,
            fieldName: "明細項",
            beforeValue: `${deletedDetail.productName}`,
            afterValue: null,
            remarks: "用戶操作"
          });

          return Promise.resolve({
            code: 200,
            message: "刪除成功"
          });
        } else {
          return Promise.reject({
            code: 404,
            message: "找不到指定的明細項"
          });
        }
      } else {
        return Promise.reject({
          code: 404,
          message: "找不到指定的銷貨預購單"
        });
      }
    }

    return axios.delete(
      `${API_BASE_URL}/preorder/${preorderId}/details/${detailId}`
    );
  }

  /**
   * 獲取銷貨預購單異動歷史記錄
   * @param {Object} params - 查詢參數
   * @returns {Promise} API 回應
   */
  getPreOrderHistory(params = {}) {
    if (USE_MOCK) {
      let filteredHistory = [...mockHistoryData];

      // 處理銷貨預購單 ID 過濾
      if (params.preorderId) {
        const preorderOrder = mockPreOrderData.find(
          item => item.id === params.preorderId
        );
        if (preorderOrder) {
          filteredHistory = filteredHistory.filter(
            item => item.orderNumber === preorderOrder.orderNumber
          );
        } else {
          filteredHistory = [];
        }
      }

      // 處理日期範圍過濾
      if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59);

        filteredHistory = filteredHistory.filter(item => {
          const operateTime = new Date(item.operateTime);
          return operateTime >= startDate && operateTime <= endDate;
        });
      }

      // 處理通用搜尋參數 (新增)
      if (params.search) {
        const query = params.search.toLowerCase();
        filteredHistory = filteredHistory.filter(
          item =>
            (item.orderNumber &&
              item.orderNumber.toLowerCase().includes(query)) ||
            (item.operator && item.operator.toLowerCase().includes(query)) ||
            (item.fieldName && item.fieldName.toLowerCase().includes(query)) ||
            (item.beforeValue &&
              String(item.beforeValue)
                .toLowerCase()
                .includes(query)) ||
            (item.afterValue &&
              String(item.afterValue)
                .toLowerCase()
                .includes(query)) ||
            (item.remarks && item.remarks.toLowerCase().includes(query)) ||
            (item.type && item.type.toLowerCase().includes(query))
        );
      }

      // 處理特定欄位搜尋條件
      if (params.orderNumber) {
        const query = params.orderNumber.toLowerCase();
        filteredHistory = filteredHistory.filter(item =>
          item.orderNumber.toLowerCase().includes(query)
        );
      }

      if (params.fieldName) {
        const query = params.fieldName.toLowerCase();
        filteredHistory = filteredHistory.filter(item =>
          item.fieldName.toLowerCase().includes(query)
        );
      }

      if (params.operator) {
        const query = params.operator.toLowerCase();
        filteredHistory = filteredHistory.filter(item =>
          item.operator.toLowerCase().includes(query)
        );
      }

      return Promise.resolve({
        code: 200,
        message: "成功",
        data: filteredHistory
      });
    }

    return axios.get(`${API_BASE_URL}/preorder/history`, { params });
  }

  /**
   * 批量更新銷貨預購單
   * @param {Array} preorderIds - 銷貨預購單 ID 數組
   * @param {Object} updateData - 要更新的數據
   * @returns {Promise} API 回應
   */
  batchUpdatePreOrder(preorderIds, updateData) {
    if (USE_MOCK) {
      const updateCount = preorderIds.reduce((count, id) => {
        const index = mockPreOrderData.findIndex(item => item.id === id);

        if (index !== -1) {
          const oldData = { ...mockPreOrderData[index] };
          const updateDate = new Date();

          // 只更新指定的字段
          mockPreOrderData[index] = {
            ...oldData,
            ...updateData,
            updateTime: updateDate
          };

          // 添加異動記錄
          mockHistoryData.push({
            id: `H${mockHistoryData.length + 1}`,
            operateTime: updateDate,
            operator: "admin",
            orderNumber: oldData.orderNumber,
            type: OPERATION_TYPES.UPDATE,
            fieldName: "批量更新",
            beforeValue: null,
            afterValue: `批量更新: ${Object.keys(updateData).join(", ")}`,
            remarks: "用戶操作"
          });

          return count + 1;
        }

        return count;
      }, 0);

      return Promise.resolve({
        code: 200,
        message: `成功更新 ${updateCount} 筆資料`,
        data: { count: updateCount }
      });
    }

    return axios.patch(`${API_BASE_URL}/preorder/batch`, {
      ids: preorderIds,
      data: updateData
    });
  }

  /**
   * 導出銷貨預購數據為 Excel
   * @param {Object} params - 導出參數
   * @returns {Promise} API 回應
   */
  exportPreOrder(params = {}) {
    if (USE_MOCK) {
      // 模擬文件下載，實際上應該返回二進制數據
      return Promise.resolve({
        code: 200,
        message: "導出成功",
        data: "模擬導出文件內容"
      });
    }

    return axios.get(`${API_BASE_URL}/preorder/export`, {
      params,
      responseType: "blob"
    });
  }
}

// 導出一個實例
export default new PreOrderService();
