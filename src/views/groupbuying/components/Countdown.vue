<!-- components/Countdown.vue -->
<template>
  <div class="countdown" :class="statusClass">
    <template v-if="expired">
      <span class="expired-text">已逾期</span>
    </template>
    <template v-else>
      <span class="time-text">剩餘 {{ formatTime }}</span>
      <div v-if="showProgress" class="progress-wrapper">
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="4"
          :show-text="false"
        />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "Countdown",

  props: {
    // 目標時間戳 (毫秒)
    time: {
      type: Number,
      required: true
    },
    // 是否顯示進度條
    showProgress: {
      type: Boolean,
      default: true
    },
    // 總時長（毫秒），用於計算進度，預設 48 小時
    totalDuration: {
      type: Number,
      default: 48 * 60 * 60 * 1000
    }
  },

  data() {
    return {
      now: Date.now(),
      timer: null
    };
  },

  computed: {
    // 剩餘時間（毫秒）
    remaining() {
      return Math.max(0, this.time - this.now);
    },

    // 是否已過期
    expired() {
      return this.remaining <= 0;
    },

    // 格式化後的時間
    formatTime() {
      if (this.remaining <= 0) return "00:00:00";

      const hours = Math.floor(this.remaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (this.remaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((this.remaining % (1000 * 60)) / 1000);

      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0")
      ].join(":");
    },

    // 進度百分比
    progressPercentage() {
      const elapsed = this.totalDuration - this.remaining;
      return Math.min(100, Math.max(0, (elapsed / this.totalDuration) * 100));
    },

    // 狀態樣式
    statusClass() {
      if (this.expired) return "is-expired";
      if (this.remaining < 3600000) return "is-urgent"; // 小於1小時
      if (this.remaining < 7200000) return "is-warning"; // 小於2小時
      return "is-normal";
    }
  },

  watch: {
    time: {
      immediate: true,
      handler(newVal) {
        // 時間變更時重置計時器
        if (newVal) {
          this.startTimer();
        }
      }
    }
  },

  created() {
    this.startTimer();
  },

  beforeDestroy() {
    this.stopTimer();
  },

  methods: {
    startTimer() {
      this.stopTimer();
      if (!this.expired) {
        this.timer = setInterval(() => {
          this.now = Date.now();
          if (this.expired) {
            this.stopTimer();
            this.$emit("expired");
          }
        }, 1000);
      }
    },

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }
};
</script>

<style lang="scss">
.countdown {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;

  .time-text {
    font-family: monospace;
    font-size: 14px;
    text-align: center;
  }

  .expired-text {
    color: #f56c6c;
    font-weight: 500;
  }

  .progress-wrapper {
    width: 100%;
  }

  // 正常狀態
  &.is-normal {
    .time-text {
      color: #409eff;
    }
    .el-progress-bar__inner {
      background-color: #409eff;
    }
  }

  // 警告狀態（小於2小時）
  &.is-warning {
    .time-text {
      color: #e6a23c;
    }
    .el-progress-bar__inner {
      background-color: #e6a23c;
    }
  }

  // 緊急狀態（小於1小時）
  &.is-urgent {
    .time-text {
      color: #f56c6c;
      font-weight: 500;
    }
    .el-progress-bar__inner {
      background-color: #f56c6c;
    }
  }

  // 過期狀態
  &.is-expired {
    .el-progress-bar__inner {
      background-color: #909399;
    }
  }
}
</style>
