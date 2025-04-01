<!-- components/ProductList.vue -->
<template>
  <div class="product-list">
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <i class="el-icon-goods"></i>
            <h3>商品設定</h3>
          </div>
          <el-button
            type="primary"
            :disabled="disabled"
            @click="addProduct"
            class="add-button"
          >
            <i class="el-icon-plus"></i>
            新增商品
          </el-button>
        </div>
      </template>

      <div class="form-content">
        <div v-if="value.length === 0" class="empty-state">
          <i class="el-icon-goods"></i>
          <p>尚未添加商品</p>
          <el-button type="primary" :disabled="disabled" @click="addProduct">
            新增第一個商品
          </el-button>
        </div>

        <template v-else>
          <div
            v-for="(product, index) in value"
            :key="index"
            class="product-item"
          >
            <div class="product-header">
              <div class="header-left">
                <span class="product-number">商品 #{{ index + 1 }}</span>
                <el-tag size="small" :type="product.name ? 'success' : 'info'">
                  {{ product.name || "未命名商品" }}
                </el-tag>
              </div>
              <el-button
                type="danger"
                size="small"
                :disabled="disabled"
                @click="removeProduct(index)"
                class="remove-button"
              >
                <i class="el-icon-delete"></i>
                刪除
              </el-button>
            </div>

            <div class="form-section basic-info">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    :prop="`products[${index}].name`"
                    label="商品名稱"
                  >
                    <el-input
                      :value="product.name"
                      @input="updateProduct(index, 'name', $event)"
                      :disabled="disabled"
                      placeholder="請輸入商品名稱"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item
                    :prop="`products[${index}].specification`"
                    label="商品規格"
                  >
                    <el-input
                      :value="product.specification"
                      @input="updateProduct(index, 'specification', $event)"
                      :disabled="disabled"
                      placeholder="請輸入商品規格"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item :prop="`products[${index}].unit`" label="單位">
                    <el-input
                      :value="product.unit"
                      @input="updateProduct(index, 'unit', $event)"
                      :disabled="disabled"
                      placeholder="如: 個、件"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item :prop="`products[${index}].price`" label="單價">
                    <el-input-number
                      :value="product.price"
                      @change="updateProduct(index, 'price', $event)"
                      :min="0"
                      :disabled="disabled"
                      :controls-position="'right'"
                      style="width: 100%"
                    >
                      <template #prefix>
                        <span class="input-prefix">NT$</span>
                      </template>
                    </el-input-number>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item
                    :prop="`products[${index}].originalPrice`"
                    label="原價"
                  >
                    <el-input-number
                      :value="product.originalPrice"
                      @change="updateProduct(index, 'originalPrice', $event)"
                      :min="0"
                      :disabled="disabled"
                      :controls-position="'right'"
                      style="width: 100%"
                    >
                      <template #prefix>
                        <span class="input-prefix">NT$</span>
                      </template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="form-section inventory-settings">
              <div class="section-header">
                <span class="section-title">庫存設定</span>
              </div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    :prop="`products[${index}].maxQuantity`"
                    label="數量上限"
                  >
                    <el-input-number
                      :value="product.maxQuantity"
                      @change="updateProduct(index, 'maxQuantity', $event)"
                      :min="0"
                      :disabled="disabled"
                      :controls-position="'right'"
                      style="width: 100%"
                    >
                      <template #suffix>
                        <span class="input-suffix">{{
                          product.unit || "件"
                        }}</span>
                      </template>
                    </el-input-number>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item
                    :prop="`products[${index}].warningQuantity`"
                    label="警告量"
                  >
                    <el-input-number
                      :value="product.warningQuantity"
                      @change="updateProduct(index, 'warningQuantity', $event)"
                      :min="0"
                      :disabled="disabled"
                      :controls-position="'right'"
                      style="width: 100%"
                    >
                      <template #suffix>
                        <span class="input-suffix">{{
                          product.unit || "件"
                        }}</span>
                      </template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="form-section promotion-settings">
              <div class="section-header">
                <span class="section-title">優惠設定</span>
              </div>
              <promotion-rules
                :value="product.promotionRules"
                @input="updateProduct(index, 'promotionRules', $event)"
                :type="promotionType"
                :disabled="disabled"
              />
            </div>

            <div class="form-section image-settings">
              <div class="section-header">
                <span class="section-title">商品圖片</span>
              </div>
              <el-upload
                :disabled="disabled"
                action="/api/upload"
                list-type="picture-card"
                :on-success="response => handleImageSuccess(index, response)"
                :before-upload="beforeImageUpload"
                multiple
                class="image-uploader"
              >
                <div class="upload-content">
                  <i class="el-icon-plus"></i>
                  <div class="upload-text">上傳圖片</div>
                </div>
              </el-upload>
              <div class="upload-tip">
                建議尺寸 800x800px，檔案大小不超過 2MB
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script>
import PromotionRules from "./PromotionRules.vue";

export default {
  name: "ProductList",
  components: {
    PromotionRules
  },
  props: {
    value: {
      type: Array,
      required: true
    },
    promotionType: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    addProduct() {
      const newProduct = {
        name: "",
        specification: "",
        unit: "",
        price: 0,
        originalPrice: 0,
        maxQuantity: 0,
        warningQuantity: 0,
        promotionRules: [],
        images: []
      };
      const newValue = [...this.value, newProduct];
      this.$emit("input", newValue);
    },
    removeProduct(index) {
      const newValue = [...this.value];
      newValue.splice(index, 1);
      this.$emit("input", newValue);
    },
    updateProduct(index, key, val) {
      const newValue = [...this.value];
      newValue[index] = {
        ...newValue[index],
        [key]: val
      };
      this.$emit("input", newValue);
    },
    handleImageSuccess(index, response) {
      const newValue = [...this.value];
      if (!newValue[index].images) {
        newValue[index].images = [];
      }
      newValue[index].images.push(response.url);
      this.$emit("input", newValue);
    },
    beforeImageUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("只能上傳圖片檔案!");
      }
      if (!isLt2M) {
        this.$message.error("圖片大小不能超過 2MB!");
      }

      return isImage && isLt2M;
    }
  }
};
</script>

<style lang="scss" scoped>
.product-list {
  margin-bottom: 24px;

  .list-card {
    transition: all 0.3s;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        color: #409eff;
        font-size: 22px;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .add-button {
      i {
        margin-right: 6px;
      }
    }
  }

  .form-content {
    padding: 24px;

    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #909399;

      i {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        margin: 0 0 24px;
        font-size: 14px;
      }
    }
  }

  .product-item {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    margin-bottom: 24px;
    transition: all 0.3s;

    &:hover {
      border-color: #c0c4cc;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .product-number {
          font-weight: 500;
          color: #606266;
        }

        .el-tag {
          margin: 0;
        }
      }

      .remove-button {
        opacity: 0.9;
        transition: all 0.3s;

        &:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        i {
          margin-right: 6px;
        }
      }
    }

    .form-section {
      padding: 24px 20px;

      &:not(:last-child) {
        border-bottom: 1px dashed #ebeef5;
      }

      .section-header {
        margin-bottom: 24px;

        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #606266;
          position: relative;
          padding-left: 12px;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }

      .el-row {
        margin-bottom: 0;

        .el-col {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .basic-info {
      background-color: #fafafa;
    }
  }

  .el-form-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 8px;
    }

    :deep(.el-input),
    :deep(.el-input-number) {
      width: 100%;
    }
  }

  .input-prefix,
  .input-suffix {
    color: #909399;
    font-size: 14px;
    padding: 0 4px;
  }

  .image-uploader {
    :deep(.el-upload--picture-card) {
      width: 128px;
      height: 128px;
      border-radius: 8px;
      border: 1px dashed #d9d9d9;
      transition: all 0.3s;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }

    :deep(.el-upload-list--picture-card) {
      .el-upload-list__item {
        width: 128px;
        height: 128px;
        border-radius: 8px;
        margin: 0 8px 8px 0;
      }
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 8px;

      i {
        font-size: 24px;
        margin-bottom: 8px;
        line-height: 1;
      }

      .upload-text {
        font-size: 12px;
        color: #909399;
        line-height: 1.2;
      }
    }
  }

  .upload-tip {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}

@media screen and (max-width: 768px) {
  .product-list {
    .form-content {
      padding: 16px;
    }

    .product-item {
      .form-section {
        padding: 16px;

        .el-row {
          .el-col {
            margin-bottom: 16px;
          }
        }
      }

      .product-header {
        padding: 12px 16px;

        .header-left {
          gap: 8px;
        }
      }
    }

    .image-uploader {
      :deep(.el-upload--picture-card),
      :deep(.el-upload-list--picture-card .el-upload-list__item) {
        width: 100px;
        height: 100px;
        line-height: 100px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .product-list {
    .product-item {
      .product-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .remove-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
