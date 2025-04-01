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
        <div class="el-upload__text">拖曳檔案至此處或 <em>點擊上傳</em></div>
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

    <div class="template-download">
      <el-button type="text" @click="downloadTemplate">
        <i class="el-icon-download" />
        下載匯入範本
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FileUploadStep",

  props: {
    selectedFile: {
      type: Object,
      default: null
    }
  },

  methods: {
    handleFileChange(uploadFile) {
      console.log("文件變更事件:", uploadFile);

      if (uploadFile && uploadFile.raw) {
        this.$emit("file-change", uploadFile.raw);
        console.log("已選擇文件:", uploadFile.raw.name);
      }
    },

    handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // 檢查文件類型或副檔名
        if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
          this.$emit("file-change", files[0]);
          console.log("已拖放文件:", files[0].name);
        } else {
          this.$message.error("請上傳 CSV 檔案");
        }
      }
    },

    clearFile() {
      this.$emit("clear-file");
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

  .template-download {
    margin-top: 20px;

    .el-button {
      font-size: 14px;
    }
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
</style>
