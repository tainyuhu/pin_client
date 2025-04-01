<template>
  <div class="sample-data-container">
    <div class="sample-title">
      <i class="el-icon-document"></i> 庫存報表示範資料
    </div>
    <div class="table-container">
      <table class="sample-table">
        <thead>
          <tr>
            <th>品號</th>
            <th>品名</th>
            <th>批號</th>
            <th>庫存數量</th>
            <th>有效期限</th>
            <th>庫位</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in sampleData" :key="index">
            <td>{{ item.productId }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.batchNumber }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.expiryDate }}</td>
            <td>{{ item.location }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="sample-notes">
      <div class="note-item">
        <span class="note-mark">*</span>
        <span class="note-text">必填欄位：品號、批號、庫存數量</span>
      </div>
      <div class="note-item">
        <span class="note-mark">*</span>
        <span class="note-text"
          >品名和有效期限為選填欄位，但建議提供以便於識別</span
        >
      </div>
      <div class="note-item">
        <span class="note-mark">*</span>
        <span class="note-text">庫位欄位非必要，可根據需求決定是否包含</span>
      </div>
      <div class="note-item">
        <span class="note-mark">*</span>
        <span class="note-text"
          >Excel檔案可以包含其他欄位，但系統只會處理以上欄位</span
        >
      </div>
    </div>
    <div class="action-buttons">
      <el-button type="primary" size="small" @click="downloadExcel">
        <i class="el-icon-download"></i> 下載Excel範本
      </el-button>
    </div>
  </div>
</template>

<script>
// 引入XLSX庫來生成Excel檔案
import * as XLSX from "xlsx";

export default {
  name: "SampleDataTable",

  data() {
    return {
      sampleData: [
        {
          productId: "P001-A01",
          productName: "醫療口罩",
          batchNumber: "B202301001",
          quantity: 1200,
          expiryDate: "2025-01-15",
          location: "A-01-01"
        },
        {
          productId: "P001-A01",
          productName: "醫療口罩",
          batchNumber: "B202302005",
          quantity: 850,
          expiryDate: "2025-02-20",
          location: "A-01-02"
        },
        {
          productId: "P002-B03",
          productName: "75%酒精",
          batchNumber: "B202301008",
          quantity: 320,
          expiryDate: "2026-03-10",
          location: "B-02-01"
        },
        {
          productId: "P003-C02",
          productName: "額溫槍",
          batchNumber: "B202211012",
          quantity: 45,
          expiryDate: "2027-11-30",
          location: "C-03-05"
        },
        {
          productId: "P004-D05",
          productName: "快篩試劑",
          batchNumber: "B202302025",
          quantity: 730,
          expiryDate: "2024-08-15",
          location: "D-01-03"
        }
      ]
    };
  },

  methods: {
    // 下載Excel範本
    downloadExcel() {
      try {
        // 將樣本資料轉換為Excel格式的資料
        const excelData = this.sampleData.map(item => ({
          品號: item.productId,
          品名: item.productName,
          批號: item.batchNumber,
          庫存數量: item.quantity,
          有效期限: item.expiryDate,
          庫位: item.location
        }));

        // 創建工作簿
        const workbook = XLSX.utils.book_new();

        // 將數據轉換為工作表
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 設定欄寬
        const columnWidths = [
          { wch: 12 }, // 品號
          { wch: 15 }, // 品名
          { wch: 12 }, // 批號
          { wch: 10 }, // 庫存數量
          { wch: 12 }, // 有效期限
          { wch: 8 } // 庫位
        ];
        worksheet["!cols"] = columnWidths;

        // 加入工作表到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, "庫存報表範本");

        // 加入說明工作表
        const instructionData = [
          { 說明項目: "檔案用途", 內容: "ERP庫存報表匯入範本" },
          { 說明項目: "必填欄位", 內容: "品號、批號、庫存數量" },
          { 說明項目: "選填欄位", 內容: "品名、有效期限、庫位" },
          {
            說明項目: "注意事項",
            內容: "匯入前請確認資料正確性，匯入後系統將自動比對出差異"
          }
        ];

        const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
        instructionSheet["!cols"] = [{ wch: 15 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(workbook, instructionSheet, "說明");

        // 將工作簿轉換為二進位數據
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array"
        });

        // 創建Blob對象
        const blob = new Blob([excelBuffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        // 創建下載連結並觸發下載
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ERP庫存報表範本.xlsx";
        document.body.appendChild(link);
        link.click();

        // 清理資源
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);

        // 通知父元件
        this.$emit("download-sample", "excel");

        // 顯示成功提示
        this.$message({
          message: "Excel範本已成功下載",
          type: "success"
        });
      } catch (error) {
        console.error("下載Excel範本失敗:", error);
        this.$message.error("下載失敗，請稍後再試");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sample-data-container {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.sample-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;

  i {
    color: #409eff;
    margin-right: 6px;
  }
}

.table-container {
  overflow-x: auto;
  margin-bottom: 16px;
}

.sample-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px;
    text-align: left;
    border: 1px solid #dcdfe6;
  }

  th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
  }

  tr:nth-child(even) {
    background-color: #fafafa;
  }

  tr:hover {
    background-color: #f0f7ff;
  }
}

.sample-notes {
  background: #f0f9eb;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #606266;
  border-left: 3px solid #67c23a;
}

.note-item {
  margin-bottom: 6px;
  display: flex;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }
}

.note-mark {
  color: #67c23a;
  margin-right: 6px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .sample-table {
    font-size: 12px;

    th,
    td {
      padding: 8px 6px;
    }
  }

  .sample-notes {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
