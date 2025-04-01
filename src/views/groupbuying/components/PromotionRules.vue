<!-- components/PromotionRules.vue -->
<template>
  <div class="promotion-rules">
    <!-- 如果沒有選擇優惠類型，顯示提示 -->
    <template v-if="!type">
      <div class="empty-tip">請先在優惠設定中選擇活動優惠方式</div>
    </template>

    <!-- 有選擇優惠類型時顯示規則列表 -->
    <template v-else>
      <div class="rules-header">
        <div class="rule-type-info">
          <el-tag size="large" class="rule-type-tag">{{
            getRuleTypeLabel()
          }}</el-tag>
          <el-button
            v-if="!extrapolate"
            type="primary"
            :disabled="disabled"
            @click="addRule"
            size="small"
            class="add-rule-btn"
          >
            新增優惠規則
          </el-button>
        </div>
        <div class="extrapolate-option">
          <el-checkbox
            v-model="extrapolate"
            :disabled="disabled"
            @change="handleExtrapolateChange"
          >
            以此類推
          </el-checkbox>
        </div>
      </div>

      <div v-for="(rule, index) in displayValue" :key="index" class="rule-item">
        <!-- 買X送Y -->
        <template v-if="type === 'buyXgetY'">
          <div class="rule-content">
            <div class="rule-label">買滿</div>
            <el-input-number
              v-model="rule.buyQuantity"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="quantity-input"
            />
            <div class="rule-label">件</div>

            <div class="rule-label">送</div>
            <el-input-number
              v-model="rule.giftQuantity"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="quantity-input"
            />
            <div class="rule-label">件</div>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              :disabled="disabled"
              @click="removeRule(index)"
            >
              刪除
            </el-button>
          </div>
        </template>

        <!-- 第N件Z折 -->
        <template v-else-if="type === 'nthDiscount'">
          <div class="rule-content">
            <div class="rule-label">第</div>
            <el-input-number
              v-model="rule.nthItem"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="quantity-input"
            />
            <div class="rule-label">件</div>

            <div class="rule-label">打</div>
            <el-input-number
              v-model="rule.discount"
              :min="0"
              :max="100"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="discount-input"
            />
            <div class="rule-label">折</div>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              :disabled="disabled"
              @click="removeRule(index)"
            >
              刪除
            </el-button>
          </div>
        </template>

        <!-- 滿N件打Y折 -->
        <template v-else-if="type === 'quantityDiscount'">
          <div class="rule-content">
            <div class="rule-label">滿</div>
            <el-input-number
              v-model="rule.quantity"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="quantity-input"
            />
            <div class="rule-label">件</div>

            <div class="rule-label">打</div>
            <el-input-number
              v-model="rule.discount"
              :min="0"
              :max="100"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="discount-input"
            />
            <div class="rule-label">折</div>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              :disabled="disabled"
              @click="removeRule(index)"
            >
              刪除
            </el-button>
          </div>
        </template>

        <!-- 滿N件折Y元 -->
        <template v-else-if="type === 'quantityAmount'">
          <div class="rule-content">
            <div class="rule-label">滿</div>
            <el-input-number
              v-model="rule.quantity"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="quantity-input"
            />
            <div class="rule-label">件</div>

            <div class="rule-label">折抵</div>
            <el-input-number
              v-model="rule.amount"
              :min="0"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="amount-input"
            />
            <div class="rule-label">元</div>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              :disabled="disabled"
              @click="removeRule(index)"
            >
              刪除
            </el-button>
          </div>
        </template>

        <!-- 滿N元打Y折 -->
        <template v-else-if="type === 'amountDiscount'">
          <div class="rule-content">
            <div class="rule-label">滿</div>
            <el-input-number
              v-model="rule.amount"
              :min="1"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="amount-input"
            />
            <div class="rule-label">元</div>

            <div class="rule-label">打</div>
            <el-input-number
              v-model="rule.discount"
              :min="0"
              :max="100"
              :disabled="disabled"
              @change="() => updateRule(index)"
              size="small"
              :controls-position="'right'"
              class="discount-input"
            />
            <div class="rule-label">折</div>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              :disabled="disabled"
              @click="removeRule(index)"
            >
              刪除
            </el-button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "PromotionRules",

  props: {
    value: {
      type: Array,
      required: true,
      default: () => []
    },
    type: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      extrapolate: false
    };
  },

  computed: {
    displayValue() {
      if (!this.value || this.value.length === 0) {
        return [this.createNewRule()];
      }
      // 如果啟用"以此類推"，只保留第一條規則
      return this.extrapolate ? [this.value[0]] : this.value;
    }
  },

  methods: {
    getRuleTypeLabel() {
      const typeMap = {
        buyXgetY: "買X送Y 優惠",
        nthDiscount: "第N件折扣 優惠",
        quantityDiscount: "滿件折扣 優惠",
        quantityAmount: "滿件折元 優惠",
        amountDiscount: "滿額折扣 優惠"
      };
      return typeMap[this.type] || "";
    },

    createNewRule() {
      const rules = {
        buyXgetY: { buyQuantity: 1, giftQuantity: 1 },
        nthDiscount: { nthItem: 2, discount: 90 },
        quantityDiscount: { quantity: 3, discount: 90 },
        quantityAmount: { quantity: 3, amount: 100 },
        amountDiscount: { amount: 1000, discount: 90 }
      };

      return rules[this.type] || {};
    },

    handleExtrapolateChange(val) {
      if (val) {
        // 當啟用"以此類推"時，只保留第一條規則
        this.$emit("input", [this.displayValue[0]]);
      }
      // 發出事件通知父組件外推狀態改變
      this.$emit("extrapolate-change", val);
    },

    addRule() {
      const newValue = [...this.displayValue, this.createNewRule()];
      this.$emit("input", newValue);
    },

    removeRule(index) {
      const newValue = [...this.displayValue];
      newValue.splice(index, 1);
      this.$emit("input", newValue);
    },

    updateRule(index) {
      const newValue = [...this.displayValue];
      this.$emit("input", newValue);
    }
  },

  watch: {
    type: {
      handler(newType) {
        if (newType) {
          this.extrapolate = false; // 重置外推狀態
          this.$emit("input", [this.createNewRule()]);
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.promotion-rules {
  .rules-header {
    margin-bottom: 16px;

    .rule-type-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px; // 為下方的單選框留出間距

      .rule-type-tag {
        font-size: 14px;
        padding: 8px 20px;
        min-width: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .el-tag {
        font-size: 14px;
        padding: 8px 12px;
      }

      .add-rule-btn {
        margin-left: 12px;
      }
    }

    // 新增：單選框容器樣式
    .extrapolate-option {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px 0;

      .el-checkbox {
        font-size: 14px;
        color: #606266;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .rule-item {
    padding: 16px;
    margin-bottom: 16px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    background-color: #fafafa;

    &:last-child {
      margin-bottom: 0;
    }

    .rule-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .rule-label {
        font-size: 14px;
        color: #606266;
        margin: 0 4px;
      }

      .quantity-input {
        width: 120px;
      }

      .discount-input {
        width: 120px;
      }

      .amount-input {
        width: 160px;
      }

      .el-button {
        margin-left: 16px;
      }
    }
  }

  .empty-tip {
    color: #909399;
    text-align: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .promotion-rules {
    .rules-header {
      .rule-type-info {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .add-rule-btn {
          margin-left: 0;
          width: 100%;
        }
      }

      // 新增：移動端單選框樣式
      .extrapolate-option {
        justify-content: flex-start;
        padding: 4px 0;
      }
    }

    .rule-item {
      .rule-content {
        flex-wrap: wrap;
        gap: 12px;

        .quantity-input,
        .discount-input,
        .amount-input {
          width: 100%;
        }

        .el-button {
          width: 100%;
          margin: 8px 0 0 0;
        }
      }
    }
  }
}
</style>
