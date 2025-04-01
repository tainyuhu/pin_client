<template>
  <div class="upload-step">
    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <el-upload
        ref="upload"
        class="upload-component"
        drag
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        accept=".csv"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          拖曳對帳單檔案至此處或 <em>點擊上傳</em>
        </div>
        <div class="el-upload__tip">只能上傳 CSV 檔案</div>
      </el-upload>
    </div>

    <div v-if="selectedFile" class="file-info">
      <span>已選擇檔案: {{ selectedFile.name }}</span>
      <el-button type="text" @click="clearFile">
        <i class="el-icon-delete" />
        移除
      </el-button>
    </div>

    <div class="template-info">
      <h4>對帳單格式說明</h4>
      <p>對帳單CSV檔案應包含以下欄位：</p>
      <ul>
        <li><strong>交易日期</strong>: 銀行交易日期 (格式: YYYY-MM-DD)</li>
        <li><strong>交易金額</strong>: 實際交易金額</li>
        <li><strong>交易流水號</strong>: 銀行提供的交易識別號</li>
        <li><strong>帳戶資訊</strong>: 顯示的部分帳號資訊</li>
        <li><strong>交易方式</strong>: 如"網銀轉帳"、"ATM轉帳"等</li>
        <li><strong>交易方名稱</strong>: 付款人名稱或代號</li>
        <li><strong>備註</strong>: 銀行交易備註，可能包含客戶提供的訂單編號</li>
      </ul>
    </div>

    <div class="template-download">
      <el-button type="primary" plain @click="downloadTemplate">
        <i class="el-icon-download" />
        下載對帳單範本
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FileUploadStep",

  props: {
    // 修改 selectedFile 的類型定義，允許 File 類型或 null
    selectedFile: {
      type: [Object, File, null],
      default: null
    }
  },

  methods: {
    handleFileChange(uploadFile) {
      if (uploadFile && uploadFile.raw) {
        this.$emit("file-change", uploadFile.raw);
      }
    },

    handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
          this.$emit("file-change", files[0]);
        } else {
          this.$message.error("請上傳 CSV 檔案");
        }
      }
    },

    clearFile() {
      this.$emit("file-clear");
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles();
      }
    },

    downloadTemplate() {
      this.$emit("download-template");
    }
  }
};
</script>

<style lang="scss" scoped>
.upload-step {
  text-align: center;

  .upload-area {
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;

    &:hover {
      border-color: #409eff;
    }
  }

  .file-info {
    margin: 20px 0;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .el-button {
      margin-left: 10px;
      color: #f56c6c;
    }
  }

  .template-info {
    text-align: left;
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #409eff;

    h4 {
      margin-top: 0;
      color: #409eff;
    }

    p {
      margin-bottom: 10px;
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 5px;
      }
    }
  }

  .template-download {
    margin-top: 20px;
  }

  .el-upload {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .el-icon-upload {
      font-size: 48px;
      color: #409eff;
      margin-bottom: 10px;
    }

    .el-upload__text {
      font-size: 16px;
      color: #606266;

      em {
        color: #409eff;
        font-style: normal;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .upload-step {
    .template-info {
      h4 {
        font-size: 16px;
      }

      p,
      ul li {
        font-size: 14px;
      }
    }
  }
}
</style>
