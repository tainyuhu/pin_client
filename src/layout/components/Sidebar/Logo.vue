<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: "SidebarLogo",
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: "企業員工專屬團購平台",
      logo: require("@/assets/logo/sunny_logo.png")
    };
  }
};
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 80px; // Adjusted height to accommodate both logo and title
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  & .sidebar-logo-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding-top: 5px;

    & .sidebar-logo {
      width: 140px;
      height: 40px;
      margin-bottom: 4px;
    }

    & .sidebar-title {
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      margin: 0;
      letter-spacing: 2px;
    }
  }

  &.collapse .sidebar-logo {
    margin-bottom: 0; // Remove bottom margin when collapsed
  }
}
</style>
