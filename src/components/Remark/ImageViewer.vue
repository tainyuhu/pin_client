<!-- components/Remark/ImageViewer.vue -->
<template>
  <div class="image-viewer" @click.self="handleBackgroundClick">
    <div class="viewer-header">
      <span class="image-counter"
        >{{ currentIndex + 1 }}/{{ imageList.length }}</span
      >
      <i class="el-icon-close" @click="$emit('close')"></i>
    </div>

    <div
      class="viewer-content"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <el-image
        ref="previewImage"
        :src="src"
        fit="contain"
        class="preview-image"
      >
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </div>

    <div class="viewer-nav">
      <div class="nav-button prev" v-if="hasPrev" @click="prevImage">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div class="nav-button next" v-if="hasNext" @click="nextImage">
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImageViewer",

  props: {
    // 當前圖片URL
    src: {
      type: String,
      required: true
    },

    // 圖片列表 (用於輪播)
    imageList: {
      type: Array,
      default: () => []
    },

    // 初始索引
    initialIndex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      currentIndex: this.initialIndex,
      touchStartX: 0,
      touchEndX: 0,
      minSwipeDistance: 50
    };
  },

  computed: {
    // 是否有前一張圖片
    hasPrev() {
      return this.imageList.length > 1 && this.currentIndex > 0;
    },

    // 是否有下一張圖片
    hasNext() {
      return (
        this.imageList.length > 1 &&
        this.currentIndex < this.imageList.length - 1
      );
    }
  },

  methods: {
    // 切換到前一張圖片
    prevImage() {
      if (this.hasPrev) {
        this.currentIndex--;
        this.$emit(
          "change",
          this.currentIndex,
          this.imageList[this.currentIndex]
        );
      }
    },

    // 切換到下一張圖片
    nextImage() {
      if (this.hasNext) {
        this.currentIndex++;
        this.$emit(
          "change",
          this.currentIndex,
          this.imageList[this.currentIndex]
        );
      }
    },

    // 處理點擊背景關閉
    handleBackgroundClick() {
      this.$emit("close");
    },

    // 觸摸開始
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
    },

    // 觸摸移動
    handleTouchMove(e) {
      this.touchEndX = e.touches[0].clientX;
    },

    // 觸摸結束
    handleTouchEnd() {
      const swipeDistance = this.touchEndX - this.touchStartX;

      // 向左滑動 (下一張)
      if (swipeDistance < -this.minSwipeDistance && this.hasNext) {
        this.nextImage();
      }

      // 向右滑動 (上一張)
      if (swipeDistance > this.minSwipeDistance && this.hasPrev) {
        this.prevImage();
      }

      // 重置觸摸位置
      this.touchStartX = 0;
      this.touchEndX = 0;
    }
  },

  watch: {
    // 監聽初始索引變化
    initialIndex(newVal) {
      this.currentIndex = newVal;
    },

    // 監聽當前索引變化
    currentIndex(newVal) {
      // 根據當前索引更新顯示的圖片
      if (this.imageList && this.imageList.length > 0) {
        this.$emit("update:src", this.imageList[newVal]);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  user-select: none;
  touch-action: pan-y;

  .viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    color: white;

    .image-counter {
      font-size: 14px;
      opacity: 0.8;
    }

    .el-icon-close {
      font-size: 24px;
      cursor: pointer;
      height: 36px;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.3s;

      &:active {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .viewer-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .preview-image {
      max-width: 100%;
      max-height: 100%;

      ::v-deep img {
        max-width: 100%;
        max-height: calc(100vh - 100px);
        object-fit: contain;
      }

      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100px;
        color: #909399;
        font-size: 30px;
      }
    }
  }

  .viewer-nav {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    pointer-events: none;

    .nav-button {
      width: 44px;
      height: 44px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      pointer-events: auto;

      &:active {
        background: rgba(0, 0, 0, 0.7);
      }

      &.prev {
        margin-right: auto;
      }

      &.next {
        margin-left: auto;
      }
    }
  }
}

@media (max-width: 768px) {
  .image-viewer {
    .viewer-nav {
      opacity: 0.7;

      .nav-button {
        width: 36px;
        height: 36px;
        font-size: 16px;
      }
    }
  }
}
</style>
