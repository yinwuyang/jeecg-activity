<template>
  <div class="logo">
    <router-link :to="{ name: 'dashboard' }">
      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->
      <!-- <img v-if="navTheme === 'dark'" src="~@/assets/logo-white.png" alt="logo" />
      <img v-else src="~@/assets/logo.svg" alt="logo" /> -->
      <!-- <img src="~@/assets/ditielogo.png" style="" alt="logo"/> -->
      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->
      <!-- <h1 v-if="showTitle">{{ title }}</h1> -->
      <template v-if="state.theme=='light' && state.layout=='topmenu'">
        <img src="~@/assets/blackhaiwei.png" alt="logo" />
      </template>
      <template v-else>
        <img v-if="!collapsed" src="~@/assets/whitehaiwei.png" alt="logo" />
        <img v-else src="~@/assets/whitehaiweilogo.png" alt="logo" />
      </template>
    </router-link>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixin.js'

export default {
  name: 'Logo',
  mixins: [mixin],
  props: {
    collapsed: Boolean
  },
  data() {
    return {
      state: this.$store.state.app
    }
  }
}
</script>
<style lang="less" scoped>
/*缩小首页布 局顶部的高度*/
@height: 59px;

.sider {
  box-shadow: none !important;
  .logo {
    height: @height !important;
    line-height: @height !important;
    box-shadow: none !important;
    transition: background 300ms;
    text-align: center;
    a {
      color: white;
      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  &.light .logo {
    background-color: @primary-color;
  }
}
.logo {
  position: relative;
  padding: 0 10px!important;
  img {
    height: 32px !important;
  }
}
</style>
