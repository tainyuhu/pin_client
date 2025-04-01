<template>
  <div class="stock-in-container">
    <!-- 商品列表 -->
    <el-card
      v-for="(product, productIndex) in products"
      :key="product.id"
      class="mb-4"
    >
      <div slot="header" class="header-with-actions">
        <span class="font-bold">商品信息 #{{ productIndex + 1 }}</span>
        <el-button
          type="text"
          @click="removeProduct(productIndex)"
          v-if="products.length > 1"
        >
          <i class="el-icon-delete"></i>
        </el-button>
      </div>

      <!-- 品號選擇 -->
      <el-form-item
        :prop="'products.' + productIndex + '.productCode'"
        :rules="{ required: true, message: '請選擇品號', trigger: 'change' }"
        class="mb-4"
      >
        <span class="el-form-item__label">品號</span>
        <el-select
          v-model="product.productCode"
          filterable
          placeholder="請選擇品號"
          @change="val => handleProductChange(val, productIndex)"
          class="w-full"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.productCode"
            :label="item.productCode + ' - ' + item.productName"
            :value="item.productCode"
          >
            <div class="option-content">
              <span>{{ item.productCode }}</span>
              <span class="option-name">{{ item.productName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 批號列表 -->
      <div
        v-for="(batch, batchIndex) in product.batches"
        :key="batch.id"
        class="batch-container"
      >
        <div class="batch-header">
          <span class="font-bold">批號 #{{ batchIndex + 1 }}</span>
          <el-button
            type="text"
            @click="removeBatch(productIndex, batchIndex)"
            v-if="product.batches.length > 1"
          >
            <i class="el-icon-delete"></i>
          </el-button>
        </div>

        <!-- 桌面版：上下兩行，每行兩個欄位 -->
        <!-- 手機版：垂直排列四個欄位 -->
        <div class="batch-fields">
          <el-row :gutter="20" class="mb-4">
            <!-- 批號 -->
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <LabelInput
                label="批號"
                :name="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.batchNumber'
                "
                v-model="batch.batchNumber"
                placeholder="請輸入批號"
                required
                :rules="[
                  { required: true, message: '請輸入批號', trigger: 'blur' }
                ]"
                @change="
                  value =>
                    handleBatchNumberChange(value, productIndex, batchIndex)
                "
              />
            </el-col>

            <!-- 箱數 -->
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <LabelInput
                label="箱數"
                :name="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.boxCount'
                "
                v-model="batch.boxCount"
                type="number"
                placeholder="請輸入箱數"
                @change="
                  value =>
                    handleBoxCountChange(
                      Number(value),
                      productIndex,
                      batchIndex
                    )
                "
              />
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <!-- 數量 -->
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <LabelInput
                label="數量"
                :name="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.quantity'
                "
                v-model="batch.quantity"
                type="number"
                placeholder="請輸入數量"
                required
                :rules="[
                  { required: true, message: '請輸入數量', trigger: 'blur' },
                  {
                    type: 'number',
                    min: 1,
                    message: '數量必須大於0',
                    trigger: 'blur'
                  }
                ]"
                @change="
                  value =>
                    handleQuantityChange(
                      Number(value),
                      productIndex,
                      batchIndex
                    )
                "
              />
            </el-col>

            <!-- 效期 -->
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <LabelDatePicker
                label="效期"
                :name="
                  'products.' +
                    productIndex +
                    '.batches.' +
                    batchIndex +
                    '.expiryDate'
                "
                v-model="batch.expiryDate"
                required
                placeholder="請選擇效期"
                :rules="[
                  { required: true, message: '請選擇效期', trigger: 'change' }
                ]"
                @change="
                  value =>
                    handleExpiryDateChange(value, productIndex, batchIndex)
                "
              />
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 新增批號按鈕 -->
      <div class="text-center mt-4">
        <el-button type="text" @click="() => addBatch(productIndex)">
          <i class="el-icon-plus"></i> 新增批號
        </el-button>
      </div>
    </el-card>

    <!-- 新增商品按鈕 -->
    <div class="text-center mt-4">
      <el-button type="primary" plain @click="addProduct">
        <i class="el-icon-plus"></i> 新增商品
      </el-button>
    </div>
  </div>
</template>

<script>
import LabelInput from "@/components/BaseForm/LabelInput.vue";
import LabelDatePicker from "@/components/BaseForm/LabelDatePicker.vue";

export default {
  name: "StockInProduct",

  components: {
    LabelInput,
    LabelDatePicker
  },

  data() {
    return {
      products: [
        {
          id: Date.now(),
          productCode: "",
          productName: "",
          boxSize: 0,
          batches: [
            {
              id: Date.now(),
              batchNumber: "",
              boxCount: 0,
              quantity: 0,
              expiryDate: ""
            }
          ]
        }
      ],
      productOptions: [
        { productCode: "P001", productName: "測試商品1", boxSize: 10 },
        { productCode: "P002", productName: "測試商品2", boxSize: 20 }
      ]
    };
  },

  methods: {
    handleProductChange(productCode, productIndex) {
      const selectedProduct = this.productOptions.find(
        item => item.productCode === productCode
      );
      if (selectedProduct) {
        this.products[productIndex] = {
          ...this.products[productIndex],
          productName: selectedProduct.productName,
          boxSize: selectedProduct.boxSize
        };
      }
    },

    handleBatchNumberChange(value, productIndex, batchIndex) {
      this.products[productIndex].batches[batchIndex].batchNumber = value;
    },

    handleBoxCountChange(value, productIndex, batchIndex) {
      const product = this.products[productIndex];
      if (product.boxSize) {
        this.products[productIndex].batches[batchIndex].quantity =
          value * product.boxSize;
      }
    },

    handleQuantityChange(value, productIndex, batchIndex) {
      const product = this.products[productIndex];
      if (product.boxSize) {
        this.products[productIndex].batches[batchIndex].boxCount = Math.floor(
          value / product.boxSize
        );
      }
    },

    addProduct() {
      this.products.push({
        id: Date.now(),
        productCode: "",
        productName: "",
        boxSize: 0,
        batches: [
          {
            id: Date.now(),
            batchNumber: "",
            boxCount: 0,
            quantity: 0,
            expiryDate: ""
          }
        ]
      });
    },

    removeProduct(productIndex) {
      if (this.products.length > 1) {
        this.products.splice(productIndex, 1);
      }
    },

    addBatch(productIndex) {
      this.products[productIndex].batches.push({
        id: Date.now(),
        batchNumber: "",
        boxCount: 0,
        quantity: 0,
        expiryDate: ""
      });
    },

    removeBatch(productIndex, batchIndex) {
      const product = this.products[productIndex];
      if (product.batches.length > 1) {
        product.batches.splice(batchIndex, 1);
      }
    },

    handleExpiryDateChange(value, productIndex, batchIndex) {
      this.products[productIndex].batches[batchIndex].expiryDate = value;
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-in-container {
  padding: 16px;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.option-content {
  display: flex;
  align-items: center;

  .option-name {
    margin-left: 8px;
    color: #909399;
  }
}

.form-item-container {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
}

.form-item-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-item-input {
  width: 100%;
}

// 響應式調整
.w-full {
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.text-center {
  text-align: center;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}

@media (max-width: 768px) {
  .batch-container {
    padding: 12px;
  }

  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .form-item-container {
    margin-bottom: 16px;
  }
}
</style>
