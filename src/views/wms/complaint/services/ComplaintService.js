import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// API 基礎路徑配置
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "";
const API_PATH = "/api/complaints";

// 開發環境使用的模擬數據
const mockComplaintData = [
  {
    id: "COMP-2023001",
    relatedOrderId: "ORD-20231005-789",
    customerName: "台灣電子股份有限公司",
    contactName: "林小明",
    contactPhone: "0912-345-678",
    createdDate: new Date("2023-10-05T10:30:00"),
    status: "processing",
    priority: "high",
    complaintType: "productQuality",
    assignedTo: "王經理",
    hasIssueTicket: true,
    issueTicketId: "ISS-20231005-001",
    issueTicketStatus: "inProgress",
    photoCount: 3,
    details: [
      {
        productId: "PD-10052",
        productName: "高效能伺服器",
        specification: "16 核心 128GB RAM",
        productType: "電子設備",
        problemType: "defective",
        problemQuantity: 2,
        problemDescription:
          "設備開機後無法正常運行，螢幕顯示藍色畫面並自動重啟。"
      },
      {
        productId: "PD-20075",
        productName: "資料儲存陣列",
        specification: "24TB SSD",
        productType: "電子設備",
        problemType: "functionalIssue",
        problemQuantity: 1,
        problemDescription: "設備在大量寫入時出現異常噪音且效能下降嚴重。"
      }
    ]
  }
];

// 模擬照片數據
const mockPhotos = [
  {
    id: "PHOTO-001",
    complaintId: "COMP-2023001",
    url: "https://via.placeholder.com/800x600?text=Server+Issue+1",
    fileName: "server_issue_1.jpg",
    uploadDate: new Date("2023-10-05T10:35:00"),
    uploadedBy: "林小明"
  },
  {
    id: "PHOTO-002",
    complaintId: "COMP-2023001",
    url: "https://via.placeholder.com/800x600?text=Server+Issue+2",
    fileName: "server_issue_2.jpg",
    uploadDate: new Date("2023-10-05T10:36:00"),
    uploadedBy: "林小明"
  },
  {
    id: "PHOTO-003",
    complaintId: "COMP-2023001",
    url: "https://via.placeholder.com/800x600?text=Storage+Array+Issue",
    fileName: "storage_array_issue.jpg",
    uploadDate: new Date("2023-10-05T10:37:00"),
    uploadedBy: "林小明"
  }
];

// 模擬備註數據
const mockRemarks = {
  "COMP-2023001": [
    {
      id: "RMK-001",
      orderId: "COMP-2023001",
      content: "客戶表示設備問題影響其業務運營，希望能加急處理。",
      createdAt: new Date("2023-10-05T10:40:00"),
      createdBy: "系統接線員",
      userAvatar: "https://via.placeholder.com/40"
    },
    {
      id: "RMK-002",
      orderId: "COMP-2023001",
      content: "技術團隊已安排明天上午前往現場檢查。",
      createdAt: new Date("2023-10-05T14:20:00"),
      createdBy: "王經理",
      userAvatar: "https://via.placeholder.com/40"
    },
    {
      id: "RMK-003",
      orderId: "COMP-2023001",
      content: "已通知客戶技術團隊將於明天上午9點抵達。",
      createdAt: new Date("2023-10-05T15:10:00"),
      createdBy: "客服專員",
      userAvatar: "https://via.placeholder.com/40"
    }
  ]
};

// 模擬異動歷史
const mockHistory = [
  {
    id: "HIST-001",
    complaintId: "COMP-2023001",
    timestamp: new Date("2023-10-05T10:30:00"),
    user: "林小明",
    type: "create",
    field: "客訴單",
    beforeValue: null,
    afterValue: "COMP-2023001"
  },
  {
    id: "HIST-002",
    complaintId: "COMP-2023001",
    timestamp: new Date("2023-10-05T10:35:00"),
    user: "林小明",
    type: "update",
    field: "優先級別",
    beforeValue: "medium",
    afterValue: "high"
  },
  {
    id: "HIST-003",
    complaintId: "COMP-2023001",
    timestamp: new Date("2023-10-05T10:40:00"),
    user: "系統接線員",
    type: "update",
    field: "狀態",
    beforeValue: "new",
    afterValue: "processing"
  },
  {
    id: "HIST-004",
    complaintId: "COMP-2023001",
    timestamp: new Date("2023-10-05T14:15:00"),
    user: "王經理",
    type: "update",
    field: "指派人員",
    beforeValue: "未指派",
    afterValue: "王經理"
  },
  {
    id: "HIST-005",
    complaintId: "COMP-2023001",
    timestamp: new Date("2023-10-05T14:20:00"),
    user: "王經理",
    type: "create",
    field: "問題作業單",
    beforeValue: null,
    afterValue: "ISS-20231005-001"
  }
];

// 模擬備註預覽
const mockRemarkPreviews = {
  "COMP-2023001": [
    {
      id: "RMK-003",
      orderId: "COMP-2023001",
      content: "已通知客戶技術團隊將於明天上午9點抵達。",
      createdAt: new Date("2023-10-05T15:10:00"),
      createdBy: "客服專員",
      userAvatar: "https://via.placeholder.com/40"
    },
    {
      id: "RMK-002",
      orderId: "COMP-2023001",
      content: "技術團隊已安排明天上午前往現場檢查。",
      createdAt: new Date("2023-10-05T14:20:00"),
      createdBy: "王經理",
      userAvatar: "https://via.placeholder.com/40"
    },
    {
      id: "RMK-001",
      orderId: "COMP-2023001",
      content: "客戶表示設備問題影響其業務運營，希望能加急處理。",
      createdAt: new Date("2023-10-05T10:40:00"),
      createdBy: "系統接線員",
      userAvatar: "https://via.placeholder.com/40"
    }
  ]
};

// 檢查是否為開發環境
const isDevelopment = process.env.NODE_ENV === "development" || true; // 強制使用模擬數據進行開發

// 將 axios 請求包裝為可模擬的方法
const request = async (method, url, data = null, params = null) => {
  if (isDevelopment) {
    // 在開發環境中返回模擬數據
    // 模擬網絡延遲
    const delay = Math.floor(Math.random() * 300) + 200; // 200-500ms 隨機延遲
    await new Promise(resolve => setTimeout(resolve, delay));
    const response = mockResponse(method, url, data, params);
    return response;
  }

  // 真實環境使用 axios 請求
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${API_PATH}${url}`,
      data,
      params
    });
    return response.data;
  } catch (error) {
    console.error("API 請求失敗:", error);
    throw error;
  }
};

// 模擬 API 響應
const mockResponse = (method, url, data, params) => {
  console.log(`模擬 API 請求: ${method.toUpperCase()} ${url}`, {
    data,
    params
  });

  // 客訴列表
  if (url === "/list" && method === "get") {
    let filteredData = [...mockComplaintData];

    // 搜尋功能
    if (params && params.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(
        item =>
          item.id.toLowerCase().includes(search) ||
          item.customerName.toLowerCase().includes(search) ||
          item.contactName.toLowerCase().includes(search) ||
          item.relatedOrderId.toLowerCase().includes(search)
      );
    }

    // 日期範圍過濾
    if (params && params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999); // 設置結束日期為當天最後一毫秒

      filteredData = filteredData.filter(
        item => item.createdDate >= startDate && item.createdDate <= endDate
      );
    }

    return { data: filteredData };
  }

  // 照片列表
  if (url.includes("/photos") && method === "get") {
    const complaintId = url.split("/").pop();
    const photos = mockPhotos.filter(
      photo => photo.complaintId === complaintId
    );
    return { data: photos };
  }

  // 添加照片
  if (url.includes("/photos") && method === "post") {
    const newPhoto = {
      id: `PHOTO-${uuidv4().substring(0, 8)}`,
      ...data,
      uploadDate: new Date()
    };
    mockPhotos.push(newPhoto);
    return { data: newPhoto };
  }

  // 刪除照片
  if (url.includes("/photos/") && method === "delete") {
    const photoId = url.split("/").pop();
    const index = mockPhotos.findIndex(photo => photo.id === photoId);
    if (index !== -1) {
      mockPhotos.splice(index, 1);
    }
    return { data: { success: true } };
  }

  // 獲取備註預覽
  if (url === "/remarks/previews" && method === "get") {
    return { data: mockRemarkPreviews };
  }

  // 獲取備註
  if (url.includes("/remarks") && method === "get") {
    const complaintId = url.split("/").pop();
    const remarks = mockRemarks[complaintId] || [];
    return { data: remarks, hasMore: false };
  }

  // 添加備註
  if (url.includes("/remarks") && method === "post") {
    const newRemark = {
      id: `RMK-${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: new Date(),
      userAvatar: "https://via.placeholder.com/40"
    };

    if (!mockRemarks[data.orderId]) {
      mockRemarks[data.orderId] = [];
    }

    mockRemarks[data.orderId].unshift(newRemark);

    // 更新備註預覽
    if (!mockRemarkPreviews[data.orderId]) {
      mockRemarkPreviews[data.orderId] = [];
    }

    mockRemarkPreviews[data.orderId].unshift(newRemark);

    return { data: newRemark };
  }

  // 更新備註
  if (url.includes("/remarks/") && method === "put") {
    const remarkId = url.split("/").pop();

    // 查找並更新備註
    for (const complaintId in mockRemarks) {
      const index = mockRemarks[complaintId].findIndex(
        remark => remark.id === remarkId
      );
      if (index !== -1) {
        mockRemarks[complaintId][index] = {
          ...mockRemarks[complaintId][index],
          ...data,
          updatedAt: new Date()
        };

        // 更新備註預覽
        const previewIndex = mockRemarkPreviews[complaintId].findIndex(
          remark => remark.id === remarkId
        );
        if (previewIndex !== -1) {
          mockRemarkPreviews[complaintId][previewIndex] = {
            ...mockRemarkPreviews[complaintId][previewIndex],
            ...data,
            updatedAt: new Date()
          };
        }

        return { data: mockRemarks[complaintId][index] };
      }
    }

    throw new Error("備註不存在");
  }

  // 刪除備註
  if (url.includes("/remarks/") && method === "delete") {
    const remarkId = url.split("/").pop();

    // 查找並刪除備註
    for (const complaintId in mockRemarks) {
      const index = mockRemarks[complaintId].findIndex(
        remark => remark.id === remarkId
      );
      if (index !== -1) {
        mockRemarks[complaintId].splice(index, 1);

        // 更新備註預覽
        const previewIndex = mockRemarkPreviews[complaintId].findIndex(
          remark => remark.id === remarkId
        );
        if (previewIndex !== -1) {
          mockRemarkPreviews[complaintId].splice(previewIndex, 1);
        }

        return { data: { success: true } };
      }
    }

    throw new Error("備註不存在");
  }

  // 獲取異動記錄
  if (url.includes("/history") && method === "get") {
    let filteredHistory = [...mockHistory];

    // 依客訴單號篩選
    if (params && params.complaintId) {
      filteredHistory = filteredHistory.filter(
        item => item.complaintId === params.complaintId
      );
    }

    // 搜尋功能
    if (params && params.search) {
      const search = params.search.toLowerCase();
      filteredHistory = filteredHistory.filter(
        item =>
          item.complaintId.toLowerCase().includes(search) ||
          item.user.toLowerCase().includes(search) ||
          (item.field && item.field.toLowerCase().includes(search)) ||
          (item.afterValue && item.afterValue.toLowerCase().includes(search)) ||
          (item.beforeValue && item.beforeValue.toLowerCase().includes(search))
      );
    }

    // 日期範圍過濾
    if (params && params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999); // 設置結束日期為當天最後一毫秒

      filteredHistory = filteredHistory.filter(
        item => item.timestamp >= startDate && item.timestamp <= endDate
      );
    }

    // 按時間倒序排序
    filteredHistory.sort((a, b) => b.timestamp - a.timestamp);

    return { data: filteredHistory };
  }

  // 更新客訴單
  if (url.includes("/update") && method === "put") {
    const complaintId = data.id;
    const index = mockComplaintData.findIndex(item => item.id === complaintId);

    if (index !== -1) {
      // 記錄變更
      for (const key in data) {
        if (key !== "id" && mockComplaintData[index][key] !== data[key]) {
          mockHistory.push({
            id: `HIST-${uuidv4().substring(0, 8)}`,
            complaintId,
            timestamp: new Date(),
            user: "當前用戶",
            type: "update",
            field: key,
            beforeValue: String(mockComplaintData[index][key] || ""),
            afterValue: String(data[key] || "")
          });
        }
      }

      // 更新客訴單數據
      mockComplaintData[index] = {
        ...mockComplaintData[index],
        ...data
      };

      return {
        data: mockComplaintData[index],
        message: "客訴單更新成功"
      };
    }

    throw new Error("客訴單不存在");
  }
  return { error: "無效的 API 請求" };
};

// 服務物件定義
const ComplaintService = {
  // 獲取客訴列表
  getComplaintList(params) {
    return request("get", "/list", null, params);
  },

  // 獲取單個客訴單詳情
  getComplaintDetail(id) {
    return request("get", `/detail/${id}`);
  },

  // 更新客訴單
  updateComplaint(data) {
    return request("put", `/update`, data);
  },

  // 獲取客訴單異動歷史
  getComplaintHistory(params) {
    return request("get", "/history", null, params);
  },

  // 獲取照片列表
  getPhotos(complaintId) {
    return request("get", `/photos/${complaintId}`);
  },

  // 添加照片
  addPhoto(data) {
    return request("post", `/photos`, data);
  },

  // 刪除照片
  deletePhoto(photoId) {
    return request("delete", `/photos/${photoId}`);
  },

  // 獲取備註預覽（所有客訴單的最新備註）
  getAllRemarkPreviews() {
    return request("get", "/remarks/previews");
  },

  // 獲取特定客訴單的備註
  getRemarks(complaintId) {
    return request("get", `/remarks/${complaintId}`);
  },

  // 獲取更多備註（用於分頁加載）
  getMoreRemarks(complaintId, offset) {
    return request("get", `/remarks/${complaintId}`, null, { offset });
  },

  // 添加備註
  addRemark(data) {
    return request("post", `/remarks`, data);
  },

  // 更新備註
  updateRemark(data) {
    return request("put", `/remarks/${data.id}`, data);
  },

  // 刪除備註
  deleteRemark(remarkId) {
    return request("delete", `/remarks/${remarkId}`);
  }
};

export default ComplaintService;
