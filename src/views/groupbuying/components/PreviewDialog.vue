<template>
  <el-dialog
    title="團購預覽"
    :visible.sync="visible"
    width="70%"
    class="preview-dialog"
    :close-on-click-modal="false"
    custom-class="preview-dialog-custom"
    top="5vh"
  >
    <div class="preview-content">
      <!-- 活動狀態區塊 -->
      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-time"></i>
          <h4>活動狀態</h4>
        </div>
        <div class="section-body">
          <div class="status-preview">
            <el-row :gutter="24">
              <el-col :span="24">
                <div class="preview-item">
                  <label>當前狀態：</label>
                  <el-tag :type="getStatusType(formData.status)" effect="dark">
                    {{ getStatusText(formData.status) }}
                  </el-tag>
                </div>
                <div class="preview-item">
                  <label>狀態說明：</label>
                  <span>{{ getStatusDescription(formData.status) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 目標受眾區塊 -->
      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-user"></i>
          <h4>目標受眾</h4>
        </div>
        <div class="section-body">
          <!-- 個人資料篩選條件預覽 -->
          <div
            class="filter-preview"
            v-if="formData.targetAudience.filters.length"
          >
            <h5 class="preview-subtitle">個人資料篩選</h5>
            <el-row :gutter="24">
              <el-col :span="24">
                <div
                  v-for="(filter, index) in formData.targetAudience.filters"
                  :key="index"
                  class="preview-item"
                >
                  <label>篩選條件 {{ index + 1 }}：</label>
                  <span>
                    {{ getFilterText(filter) }}
                  </span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 群組篩選預覽 -->
          <div
            class="group-preview"
            v-if="formData.targetAudience.groups.length"
          >
            <h5 class="preview-subtitle">群組篩選</h5>
            <el-row :gutter="24">
              <el-col :span="24">
                <div class="preview-item">
                  <label>選擇群組：</label>
                  <div class="group-tags">
                    <el-tag
                      v-for="groupId in formData.targetAudience.groups"
                      :key="groupId"
                      size="small"
                      type="info"
                    >
                      {{ getGroupName(groupId) }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 如果沒有設定任何篩選條件 -->
          <div v-if="!hasAudienceSettings" class="empty-hint">
            <i class="el-icon-warning-outline"></i>
            <p>未設定任何目標受眾條件，所有人皆可參與</p>
          </div>
        </div>
      </div>

      <!-- 基本資訊區塊 -->
      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-document"></i>
          <h4>基本資訊</h4>
        </div>
        <div class="section-body">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="preview-item">
                <label>活動標題：</label>
                <span class="highlight">{{
                  formData.basicInfo.title || "未設定"
                }}</span>
              </div>
              <div class="preview-item">
                <label>開始時間：</label>
                <span
                  v-if="formData.basicInfo.startTimeType === 'now'"
                  class="highlight-blue"
                  >立即開始</span
                >
                <span v-else>{{
                  formatDateTime(formData.basicInfo.startTime)
                }}</span>
              </div>
              <div class="preview-item">
                <label>結束時間：</label>
                <span>{{ formatDateTime(formData.basicInfo.endTime) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="preview-item description-item">
                <label>活動描述：</label>
                <div class="description-content">
                  {{ formData.basicInfo.description || "未設定" }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 優惠設定區塊 -->
      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-s-operation"></i>
          <h4>優惠設定</h4>
        </div>
        <div class="section-body">
          <el-row :gutter="24">
            <el-col :span="12">
              <!-- 基本優惠設定 -->
              <div class="preview-item">
                <label>優惠類型：</label>
                <span class="highlight">{{
                  getPromotionTypeName(formData.promotion.type)
                }}</span>
              </div>
              <div class="preview-item">
                <label>免運門檻：</label>
                <span>{{
                  formData.promotion.freeShippingThreshold
                    ? `NT$ ${formData.promotion.freeShippingThreshold}`
                    : "未設定"
                }}</span>
              </div>
            </el-col>
          </el-row>

          <!-- 加碼活動區塊 -->
          <div class="promotion-block" v-if="formData.promotion.hasBonus">
            <div class="block-title">
              <i class="el-icon-timer"></i>
              <span>加碼活動</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="preview-item">
                  <label>延長時間：</label>
                  <span class="highlight-blue">{{
                    formatDateTime(formData.promotion.bonusEndTime)
                  }}</span>
                </div>
              </el-col>
            </el-row>

            <!-- 加碼贈品預覽 -->
            <div v-if="formData.promotion.bonusGift" class="gift-preview">
              <div class="gift-header">
                <span class="gift-title">加碼贈品資訊</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="preview-item">
                    <label>贈品名稱：</label>
                    <span>{{
                      formData.promotion.bonusGift.name || "未設定"
                    }}</span>
                  </div>
                  <div class="preview-item">
                    <label>贈品規格：</label>
                    <span>{{
                      formData.promotion.bonusGift.specification || "未設定"
                    }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="preview-item">
                    <label>贈品數量：</label>
                    <span>{{
                      formatQuantity(
                        formData.promotion.bonusGift.stockLimit,
                        formData.promotion.bonusGift.unit
                      )
                    }}</span>
                  </div>
                  <div class="preview-item">
                    <label>每人限領：</label>
                    <span>{{
                      formatQuantity(
                        formData.promotion.bonusGift.perPersonLimit,
                        formData.promotion.bonusGift.unit
                      )
                    }}</span>
                  </div>
                </el-col>
              </el-row>

              <!-- 贈品圖片預覽 -->
              <div
                class="preview-item"
                v-if="
                  formData.promotion.bonusGift &&
                    formData.promotion.bonusGift.images &&
                    formData.promotion.bonusGift.images.length
                "
              >
                <label>贈品圖片：</label>
                <div class="images-preview">
                  <el-image
                    v-for="(img, index) in formData.promotion.bonusGift.images"
                    :key="index"
                    :src="img"
                    :preview-src-list="formData.promotion.bonusGift.images"
                    class="preview-image"
                    fit="cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 滿額贈禮區塊 -->
          <div class="promotion-block" v-if="formData.promotion.hasGift">
            <div class="block-title">
              <i class="el-icon-present"></i>
              <span>滿額贈禮</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="preview-item">
                  <label>消費門檻：</label>
                  <span class="highlight"
                    >NT$ {{ formData.promotion.giftThreshold || 0 }}</span
                  >
                </div>
              </el-col>
            </el-row>

            <!-- 滿額贈品預覽 -->
            <div v-if="formData.promotion.thresholdGift" class="gift-preview">
              <div class="gift-header">
                <span class="gift-title">滿額贈品資訊</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="preview-item">
                    <label>贈品名稱：</label>
                    <span>{{
                      formData.promotion.thresholdGift.name || "未設定"
                    }}</span>
                  </div>
                  <div class="preview-item">
                    <label>贈品規格：</label>
                    <span>{{
                      formData.promotion.thresholdGift.specification || "未設定"
                    }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="preview-item">
                    <label>贈品數量：</label>
                    <span>{{
                      formatQuantity(
                        formData.promotion.thresholdGift.stockLimit,
                        formData.promotion.thresholdGift.unit
                      )
                    }}</span>
                  </div>
                  <div class="preview-item">
                    <label>每人限領：</label>
                    <span>{{
                      formatQuantity(
                        formData.promotion.thresholdGift.perPersonLimit,
                        formData.promotion.thresholdGift.unit
                      )
                    }}</span>
                  </div>
                </el-col>
              </el-row>

              <!-- 贈品圖片預覽 -->
              <div
                class="preview-item"
                v-if="
                  formData.promotion.thresholdGift &&
                    formData.promotion.thresholdGift.images &&
                    formData.promotion.thresholdGift.images.length
                "
              >
                <label>贈品圖片：</label>
                <div class="images-preview">
                  <el-image
                    v-for="(img, index) in thresholdGiftImages"
                    :key="index"
                    :src="img"
                    :preview-src-list="thresholdGiftImages"
                    class="preview-image"
                    fit="cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-goods"></i>
          <h4>商品列表</h4>
        </div>
        <div class="section-body">
          <template v-if="formData.products && formData.products.length > 0">
            <div
              v-for="(product, index) in formData.products"
              :key="index"
              class="preview-product"
            >
              <!-- 商品標題 -->
              <div class="preview-item">
                <label>商品 #{{ index + 1 }}：</label>
                <span class="highlight">{{
                  product.name || "未命名商品"
                }}</span>
              </div>

              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="preview-item">
                    <label>商品規格：</label>
                    <span>{{ product.specification || "未設定" }}</span>
                  </div>
                  <div class="preview-item">
                    <label>單位：</label>
                    <span>{{ product.unit || "未設定" }}</span>
                  </div>
                  <div class="preview-item">
                    <label>單價：</label>
                    <span class="price">NT$ {{ product.price || 0 }}</span>
                  </div>
                  <div class="preview-item">
                    <label>原價：</label>
                    <span class="original-price"
                      >NT$ {{ product.originalPrice || 0 }}</span
                    >
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="preview-item">
                    <label>數量上限：</label>
                    <span>{{ product.maxQuantity || "無限制" }}</span>
                  </div>
                  <div class="preview-item">
                    <label>警告量：</label>
                    <span>{{ product.warningQuantity || "未設定" }}</span>
                  </div>
                  <div class="preview-item">
                    <label>優惠規則：</label>
                    <span class="highlight">{{
                      getPromotionRulesText(product.promotionRules)
                    }}</span>
                  </div>
                </el-col>
              </el-row>

              <!-- 商品圖片 -->
              <div
                class="preview-item"
                v-if="product.images && product.images.length"
              >
                <label>商品圖片：</label>
                <div class="images-preview">
                  <el-image
                    v-for="(img, imgIndex) in product.images"
                    :key="imgIndex"
                    :src="img"
                    :preview-src-list="product.images"
                    class="preview-image"
                    fit="cover"
                  />
                </div>
              </div>
            </div>
          </template>
          <div v-else class="empty-hint">
            <i class="el-icon-goods"></i>
            <p>尚未新增商品</p>
          </div>
        </div>
      </div>

      <!-- 取貨方式區塊 -->
      <div class="preview-section">
        <div class="section-header">
          <i class="el-icon-truck"></i>
          <h4>取貨方式</h4>
        </div>
        <div class="section-body">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="preview-item">
                <label>公司取貨：</label>
                <span class="highlight">{{
                  formData.delivery.companyPickup ? "可使用" : "未啟用"
                }}</span>
              </div>
              <div class="preview-item">
                <label>地址取貨：</label>
                <span class="highlight">{{
                  formData.delivery.addressPickup ? "可使用" : "未啟用"
                }}</span>
              </div>
            </el-col>
          </el-row>

          <div
            v-if="
              !formData.delivery.companyPickup &&
                !formData.delivery.addressPickup
            "
            class="empty-hint"
          >
            <i class="el-icon-warning-outline"></i>
            <p>尚未設定任何取貨方式</p>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="medium" @click="visible = false"
        >關閉預覽</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import dayjs from "dayjs";

export default {
  name: "PreviewDialog",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true,
      default: () => ({
        status: "draft",
        basicInfo: {
          title: "",
          description: "",
          startTimeType: "now",
          startTime: null,
          endTime: null,
          mainImage: null,
          regions: [],
          departments: [],
          groups: []
        },
        targetAudience: {
          filters: [],
          groups: []
        },
        promotion: {
          type: "",
          freeShippingThreshold: 0,
          hasBonus: false,
          bonusEndTime: null,
          bonusGift: {
            name: "",
            specification: "",
            unit: "",
            stockLimit: 0,
            perPersonLimit: 0,
            images: []
          },
          hasGift: false,
          giftThreshold: 0,
          thresholdGift: {
            name: "",
            specification: "",
            unit: "",
            stockLimit: 0,
            perPersonLimit: 0,
            images: []
          }
        },
        products: [],
        delivery: {
          companyPickup: false,
          addressPickup: false
        }
      })
    }
  },

  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },

    hasAudienceSettings() {
      const { filters = [], groups = [] } = this.formData.targetAudience;
      return filters.length > 0 || groups.length > 0;
    },

    hasDeliveryMethods() {
      const { companyPickup, addressPickup } = this.formData.delivery;
      return companyPickup || addressPickup;
    },
    thresholdGiftImages() {
      if (
        this.formData.promotion &&
        this.formData.promotion.thresholdGift &&
        this.formData.promotion.thresholdGift.images
      ) {
        return this.formData.promotion.thresholdGift.images;
      }
      return [];
    }
  },

  methods: {
    // 活動狀態相關
    getStatusType(status) {
      return (
        (this.formData.statusTypes && this.formData.statusTypes[status]) ||
        "info"
      );
    },

    getStatusText(status) {
      return (
        (this.formData.statusTexts && this.formData.statusTexts[status]) ||
        status
      );
    },

    getStatusDescription(status) {
      return (
        (this.formData.statusDescriptions &&
          this.formData.statusDescriptions[status]) ||
        ""
      );
    },

    // 目標受眾相關
    getFilterText(filter) {
      if (!filter.field) return "未完成設定";

      let valueText = "";
      if (filter.field === "company" || filter.field === "position") {
        // 處理階層式選擇的值
        if (Array.isArray(filter.value)) {
          valueText = filter.value.join(" > ");
        } else {
          valueText = filter.value || "未設定";
        }
      } else {
        valueText = filter.value || "未設定";
      }

      return `${filter.field} = ${valueText}`;
    },

    getGroupName(groupId) {
      return groupId;
    },

    // 格式化方法
    formatDateTime(date) {
      if (!date) return "未設定";
      return dayjs(date).format("YYYY/MM/DD HH:mm");
    },

    formatQuantity(quantity, unit = "件") {
      if (!quantity && quantity !== 0) return "未設定";
      return `${quantity.toLocaleString()} ${unit}`;
    },

    formatPrice(price) {
      if (!price && price !== 0) return "未設定";
      return `NT$ ${price.toLocaleString()}`;
    },

    // 優惠相關
    getPromotionTypeName(type) {
      if (!type) return "未設定";
      return (
        (this.formData.promotionTypes && this.formData.promotionTypes[type]) ||
        type
      );
    },

    getPromotionRulesText(rules) {
      if (!rules || !rules.length) return "無優惠規則";

      return rules
        .map(rule => {
          switch (this.formData.promotion.type) {
            case "buyXgetY":
              return `買${rule.buyQuantity}送${rule.giftQuantity}`;
            case "nthDiscount":
              return `第${rule.nth}件${rule.discount}折`;
            case "quantityDiscount":
              return `滿${rule.quantity}件打${rule.discount}折`;
            case "quantityAmount":
              return `滿${rule.quantity}件折${rule.amount}元`;
            case "amountDiscount":
              return `滿${rule.amount}元打${rule.discount}折`;
            default:
              return `${rule.type}: ${JSON.stringify(rule)}`;
          }
        })
        .join("、");
    },

    // 商品相關
    getProductTagText(product) {
      if (!product.promotionRules || !product.promotionRules.length) return "";
      return this.getPromotionRulesText(product.promotionRules);
    },

    // 取貨方式相關
    getDeliveryMethodText(method) {
      const methods = {
        companyPickup: "公司取貨",
        addressPickup: "地址取貨"
      };
      return methods[method] || method;
    }
  }
};
</script>

<style lang="scss">
.preview-dialog-custom {
  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__header {
    padding: 20px 24px;
    margin-right: 0;
    border-bottom: 1px solid #ebeef5;
    background: #fff;
    border-radius: 8px 8px 0 0;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__headerbtn {
    top: 20px;
    right: 20px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    background: #fff;
    border-radius: 0 0 8px 8px;
  }
}

.preview-dialog {
  .preview-content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 24px;
    background: #f5f7fa;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e4e7ed;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .preview-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;

      i {
        font-size: 20px;
        margin-right: 8px;
        color: #409eff;
      }

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        flex: 1;
      }
    }

    .section-body {
      padding: 20px;
    }
  }

  .preview-item {
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      min-width: 90px;
      flex-shrink: 0;
      color: #606266;
      font-weight: 500;
      line-height: 32px;
      margin-right: 12px;
    }

    span {
      flex: 1;
      color: #303133;
      line-height: 32px;

      &.highlight {
        color: #409eff;
        font-weight: 500;
      }

      &.highlight-blue {
        color: #409eff;
        font-weight: 500;
      }

      &.price {
        color: #f56c6c;
        font-weight: 500;
        font-size: 16px;
      }

      &.original-price {
        color: #909399;
        text-decoration: line-through;
      }
    }
  }

  .description-content {
    background: #f5f7fa;
    padding: 12px 16px;
    border-radius: 4px;
    color: #303133;
    line-height: 1.6;
    min-height: 80px;
  }

  .promotion-block {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed #e4e7ed;

    .block-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        color: #409eff;
        font-size: 18px;
      }
    }
  }

  .gift-preview {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-top: 12px;

    .gift-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .gift-title {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .images-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .preview-image {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      border: 1px solid #ebeef5;
    }
  }

  .preview-subtitle {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 16px;
  }

  .group-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;

    .el-tag {
      margin: 0;
    }
  }

  .empty-hint {
    text-align: center;
    padding: 32px 0;
    color: #909399;

    i {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .status-preview {
    .el-tag {
      margin-right: 8px;
    }
  }

  .filter-preview,
  .group-preview {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

/* 響應式設計 */
@media screen and (max-width: 1200px) {
  .preview-dialog {
    .el-dialog {
      width: 80% !important;
      margin: 0 auto !important;
    }
  }
}

@media screen and (max-width: 768px) {
  .preview-dialog {
    .el-dialog {
      width: 90% !important;
    }

    .preview-content {
      padding: 16px;
    }

    .preview-section {
      margin-bottom: 16px;

      .section-body {
        padding: 16px;
      }
    }

    .preview-item {
      flex-direction: column;

      label {
        width: 100%;
        margin-bottom: 4px;
      }
    }

    .images-preview {
      .preview-image {
        width: 64px;
        height: 64px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .preview-dialog {
    .el-dialog {
      width: 95% !important;
    }

    .preview-content {
      padding: 12px;
    }

    .group-tags {
      flex-direction: column;
      gap: 4px;

      .el-tag {
        width: fit-content;
      }
    }
  }
}
</style>
