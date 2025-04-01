<!-- components/Remark/ImageGrid.vue -->
<template>
  <div class="image-grid" :class="`image-count-${Math.min(images.length, 4)}`">
    <div
      v-for="(img, imgIndex) in visibleImages"
      :key="imgIndex"
      class="image-wrapper"
      @click="handleImageClick(img, imgIndex)"
    >
      <el-image :src="img.url" fit="cover" class="remark-image">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div v-if="imgIndex === 3 && images.length > 4" class="more-images">
        +{{ images.length - 4 }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImageGrid",

  props: {
    // 圖片列表
    images: {
      type: Array,
      required: true,
      default: () => []
    },

    // 最大顯示數量
    maxDisplay: {
      type: Number,
      default: 4
    }
  },

  computed: {
    // 可見圖片列表
    visibleImages() {
      return this.images.slice(0, this.maxDisplay);
    }
  },

  methods: {
    // 處理圖片點擊，觸發上層查看圖片事件
    handleImageClick(img, index) {
      this.$emit("view-image", img, index);
    }
  }
};
</script>

<style lang="scss" scoped>
.image-grid {
  display: grid;
  gap: 8px;
  margin-top: 12px;

  &.image-count-1 {
    grid-template-columns: 1fr;

    .image-wrapper {
      padding-bottom: 60%;
      height: 0;
    }
  }

  &.image-count-2 {
    grid-template-columns: 1fr 1fr;

    .image-wrapper {
      padding-bottom: 100%;
    }
  }

  &.image-count-3 {
    grid-template-columns: 1fr 1fr;

    .image-wrapper {
      padding-bottom: 100%;

      &:first-child {
        grid-column: span 2;
        padding-bottom: 60%;
      }
    }
  }

  &.image-count-4 {
    grid-template-columns: 1fr 1fr;

    .image-wrapper {
      padding-bottom: 100%;
    }
  }

  .image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 8px;

    .remark-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .more-images {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
    }
  }
}
</style>
