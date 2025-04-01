<!-- components/ActivityStatus.vue -->
<template>
  <div class="activity-status">
    <el-card class="status-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <i class="el-icon-time"></i>
          <h3>活動狀態</h3>
        </div>
      </template>
      <div class="form-content">
        <div class="status-display">
          <el-tag
            :type="statusType"
            effect="dark"
            size="medium"
            class="status-tag"
          >
            {{ statusText }}
          </el-tag>
          <p class="status-description">{{ statusDescription }}</p>
        </div>

        <div class="status-timeline">
          <div class="timeline-header">活動狀態流程</div>
          <el-steps
            :active="activeStep"
            :status="stepStatus"
            class="horizontal-steps"
          >
            <el-step
              v-for="(step, index) in statusSteps"
              :key="index"
              :title="step.title"
              :description="step.description"
            >
              <template #icon>
                <i :class="step.icon"></i>
              </template>
            </el-step>
          </el-steps>
        </div>

        <div class="status-info">
          <el-alert
            :type="statusType"
            :title="statusAlertTitle"
            :description="statusAlertDescription"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "ActivityStatus",
  props: {
    status: {
      type: String,
      required: true,
      default: "draft"
    }
  },

  computed: {
    statusType() {
      const types = {
        // 進行中活動
        not_started: "info",
        ordering: "success",
        order_closed: "warning",
        processing_payment: "warning",
        preparing: "warning",
        shipping: "warning",
        // 待處理活動
        draft: "info",
        reviewing: "warning",
        rejected: "danger",
        ready_to_start: "success",
        // 歷史活動
        finished: "info",
        cancelled: "danger",
        abnormal_end: "danger",
        force_end: "danger"
      };
      return types[this.status] || "info";
    },

    statusText() {
      const texts = {
        // 進行中活動
        not_started: "未開始",
        ordering: "開放下單中",
        order_closed: "收單結束",
        processing_payment: "截單中",
        preparing: "備貨中",
        shipping: "配送中",
        // 待處理活動
        draft: "草稿",
        reviewing: "審核中",
        rejected: "退回修改",
        ready_to_start: "待開始",
        // 歷史活動
        finished: "已結束",
        cancelled: "已取消",
        abnormal_end: "異常結束",
        force_end: "強制結束"
      };
      return texts[this.status] || "草稿";
    },

    statusDescription() {
      const descriptions = {
        // 進行中活動
        not_started: "活動已設定但尚未開始",
        ordering: "正在接受訂購",
        order_closed: "已達到系統設定的結束時間",
        processing_payment: "處理最後付款階段",
        preparing: "廠商準備商品階段",
        shipping: "商品運送到取貨點",
        // 待處理活動
        draft: "活動尚未完成設定",
        reviewing: "等待審核中",
        rejected: "審核未通過，需要修改",
        ready_to_start: "審核通過，等待開始",
        // 歷史活動
        finished: "活動已正常結束",
        cancelled: "活動已取消",
        abnormal_end: "因特殊情況中止",
        force_end: "管理者已強制結束活動"
      };
      return descriptions[this.status] || "";
    },

    statusCategory() {
      if (
        [
          "not_started",
          "ordering",
          "order_closed",
          "processing_payment",
          "preparing",
          "shipping"
        ].includes(this.status)
      ) {
        return "active";
      }
      if (
        ["draft", "reviewing", "rejected", "ready_to_start"].includes(
          this.status
        )
      ) {
        return "pending";
      }
      if (
        ["finished", "cancelled", "abnormal_end", "force_end"].includes(
          this.status
        )
      ) {
        return "historical";
      }
      return "pending";
    },

    statusSteps() {
      const steps = [
        {
          title: "建立活動",
          description: "填寫活動基本資料",
          icon: "el-icon-edit-outline"
        },
        {
          title: "提交審核",
          description: "等待管理員審核",
          icon: "el-icon-document-checked"
        },
        {
          title: "開放下單",
          description: "開始接受訂購",
          icon: "el-icon-shopping-cart-full"
        },
        {
          title: "結束收單",
          description: "處理訂單與付款",
          icon: "el-icon-box"
        },
        {
          title: "完成配送",
          description: "商品送達取貨點",
          icon: "el-icon-circle-check"
        }
      ];
      return steps;
    },

    activeStep() {
      const stepMap = {
        draft: 0,
        reviewing: 1,
        rejected: 1,
        ready_to_start: 2,
        ordering: 2,
        order_closed: 3,
        processing_payment: 3,
        preparing: 4,
        shipping: 4,
        finished: 5
      };
      return stepMap[this.status] || 0;
    },

    stepStatus() {
      if (
        ["rejected", "cancelled", "abnormal_end", "force_end"].includes(
          this.status
        )
      ) {
        return "error";
      }
      if (["finished"].includes(this.status)) {
        return "success";
      }
      return "process";
    },

    statusAlertTitle() {
      const titles = {
        active: "進行中活動",
        pending: "待處理活動",
        historical: "歷史活動"
      };
      return titles[this.statusCategory];
    },

    statusAlertDescription() {
      const descriptions = {
        active: "活動正在進行中，請依照流程處理相關事項。",
        pending: "活動尚未開始，請確認所有設定都已完成。",
        historical: "活動已結束，可查看相關報表與數據。"
      };
      return descriptions[this.statusCategory];
    }
  }
};
</script>

<style lang="scss" scoped>
.activity-status {
  margin-bottom: 24px;

  .status-card {
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
  }

  .status-display {
    text-align: center;
    margin-bottom: 24px;
    padding: 16px;

    .status-tag {
      font-size: 14px;
      padding: 8px 16px;
      height: auto;
      line-height: 1.4;
    }

    .status-description {
      margin: 12px 0 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .status-timeline {
    margin: 24px 0;
    padding: 24px;
    background-color: #f8f9fa;
    border-radius: 8px;
    overflow-x: auto;

    .timeline-header {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 24px;
    }

    .horizontal-steps {
      padding: 0 20px;
      min-width: 800px; // 確保在小螢幕上也能完整顯示

      :deep(.el-step__icon) {
        background-color: transparent;
        width: 32px;
        height: 32px;

        i {
          font-size: 18px;
          line-height: 32px;
        }
      }

      :deep(.el-step__main) {
        white-space: normal;
        min-height: 72px;
      }

      :deep(.el-step__title) {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: 8px;
      }

      :deep(.el-step__description) {
        font-size: 12px;
        line-height: 1.4;
      }

      :deep(.el-step.is-horizontal) {
        .el-step__line {
          height: 2px;
          top: 16px;
        }
      }
    }
  }

  .status-info {
    margin-top: 24px;

    :deep(.el-alert__title) {
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.el-alert__description) {
      margin: 8px 0 0;
      font-size: 12px;
    }
  }
}

@media screen and (max-width: 768px) {
  .activity-status {
    .form-content {
      padding: 16px;
    }

    .status-timeline {
      padding: 16px;
      margin: 16px 0;

      .timeline-header {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
