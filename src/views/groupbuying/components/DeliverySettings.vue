<!-- components/DeliverySettings.vue -->
<template>
  <div class="delivery-settings">
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <i class="el-icon-truck"></i>
          <h3>取貨方式</h3>
        </div>
      </template>
      <div class="form-content">
        <div class="form-section">
          <el-form-item label="取貨方式" required>
            <div class="checkbox-group">
              <el-checkbox
                :value="value.companyPickup"
                @input="updateValue('companyPickup', $event)"
                :disabled="disabled"
              >
                <span class="checkbox-label">
                  <i class="el-icon-office-building"></i>
                  公司取貨
                </span>
              </el-checkbox>
              <el-checkbox
                :value="value.addressPickup"
                @input="updateValue('addressPickup', $event)"
                :disabled="disabled"
              >
                <span class="checkbox-label">
                  <i class="el-icon-location"></i>
                  地址取貨
                </span>
              </el-checkbox>
            </div>
          </el-form-item>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "DeliverySettings",
  props: {
    value: {
      type: Object,
      required: true
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
.delivery-settings {
  margin-bottom: 24px;

  .settings-card {
    transition: all 0.3s;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .form-content {
    padding: 24px;

    .form-section {
      padding: 16px 0;
    }
  }

  .checkbox-group {
    display: flex;
    gap: 32px;
    padding: 12px 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;

    i {
      font-size: 18px;
      color: #909399;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  :deep(.el-checkbox__label) {
    font-size: 14px;
  }

  :deep(.el-checkbox) {
    display: flex;
    align-items: center;
    height: 32px;

    &.is-checked {
      .checkbox-label i {
        color: #409eff;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .delivery-settings {
    .form-content {
      padding: 16px;
    }

    .checkbox-group {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
