<!-- components/PromotionSettings.vue -->
<template>
  <div class="promotion-settings">
    <!-- 優惠設定卡片 -->
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <i class="el-icon-s-operation"></i>
          <h3>優惠設定</h3>
        </div>
      </template>

      <div class="form-content">
        <!-- 基本優惠設定 -->
        <div class="form-section">
          <el-form-item label="活動優惠方式" prop="promotion.type">
            <el-select
              :value="value.type"
              @input="updateValue('type', $event)"
              :disabled="disabled"
              style="width: 100%"
              placeholder="請選擇優惠方式"
            >
              <el-option label="買X送Y" value="buyXgetY" />
              <el-option label="第N件Z折" value="nthDiscount" />
              <el-option label="滿N件打Y折" value="quantityDiscount" />
              <el-option label="滿N件折Y元" value="quantityAmount" />
              <el-option label="滿N元打Y折" value="amountDiscount" />
            </el-select>
          </el-form-item>

          <el-form-item label="免運門檻" prop="promotion.freeShippingThreshold">
            <el-input-number
              :value="value.freeShippingThreshold"
              @change="updateValue('freeShippingThreshold', $event)"
              :min="0"
              :disabled="disabled"
              style="width: 200px"
              placeholder="請輸入免運金額"
            >
              <template #prefix>
                <span class="input-prefix">NT$</span>
              </template>
            </el-input-number>
          </el-form-item>
        </div>

        <!-- 加碼活動區塊 -->
        <div class="form-section bonus-section">
          <div class="section-header">
            <div class="header-left">
              <i class="el-icon-timer"></i>
              <span class="section-title">加碼活動</span>
            </div>
            <el-switch
              :value="value.hasBonus"
              @change="updateValue('hasBonus', $event)"
              :disabled="disabled"
            />
          </div>

          <div v-if="value.hasBonus" class="section-content">
            <el-form-item label="延長時間" required>
              <el-date-picker
                :value="value.bonusEndTime"
                @input="updateValue('bonusEndTime', $event)"
                type="datetime"
                :disabled="disabled"
                style="width: 100%"
                placeholder="請選擇延長結束時間"
              />
            </el-form-item>

            <!-- 加碼贈品設定 -->
            <div class="gift-section">
              <gift-form
                :value="value.bonusGift"
                :disabled="disabled"
                @input="updateValue('bonusGift', $event)"
              />
            </div>
          </div>
        </div>

        <!-- 滿額贈禮區塊 -->
        <div class="form-section threshold-section">
          <div class="section-header">
            <div class="header-left">
              <i class="el-icon-present"></i>
              <span class="section-title">滿額贈禮</span>
            </div>
            <el-switch
              :value="value.hasGift"
              @change="updateValue('hasGift', $event)"
              :disabled="disabled"
            />
          </div>

          <div v-if="value.hasGift" class="section-content">
            <el-form-item label="消費門檻" required>
              <el-input-number
                :value="value.giftThreshold"
                @change="updateValue('giftThreshold', $event)"
                :min="0"
                :disabled="disabled"
                style="width: 200px"
              >
                <template #prefix>
                  <span class="input-prefix">NT$</span>
                </template>
              </el-input-number>
            </el-form-item>

            <!-- 滿額贈品設定 -->
            <div class="gift-section">
              <gift-form
                :value="value.thresholdGift"
                :disabled="disabled"
                @input="updateValue('thresholdGift', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import GiftForm from "./GiftForm.vue";

export default {
  name: "PromotionSettings",

  components: {
    GiftForm
  },

  props: {
    value: {
      type: Object,
      required: true,
      default: () => ({
        type: "",
        freeShippingThreshold: 0,
        // 加碼活動
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
        // 滿額贈禮
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
      })
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    updateValue(key, val) {
      const newValue = { ...this.value, [key]: val };
      this.$emit("input", newValue);
    }
  }
};
</script>

<style lang="scss" scoped>
.promotion-settings {
  .settings-card {
    transition: all 0.3s;
    margin-bottom: 24px;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.gift-settings {
      .card-header {
        i {
          color: #67c23a;
        }
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    i {
      color: #409eff;
      font-size: 22px;
    }

    h3 {
      margin: 0;
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .header-switch {
      margin-left: auto;
    }
  }

  .form-content {
    padding: 24px;

    .form-section {
      padding: 16px 0;

      &:not(:last-child) {
        border-bottom: 1px dashed #ebeef5;
        margin-bottom: 16px;
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #606266;
        margin-right: 16px;
      }
    }

    .section-content {
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .bonus-section {
      margin-top: 8px;
    }

    .el-form-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
      }
    }

    .input-prefix,
    .input-suffix {
      color: #909399;
      font-size: 14px;
    }
  }
}

@media screen and (max-width: 768px) {
  .promotion-settings {
    .form-content {
      padding: 16px;
    }

    .section-content {
      padding: 12px;
    }
  }
}
</style>
