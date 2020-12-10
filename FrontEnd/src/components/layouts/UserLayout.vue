<template>
  <div id="userLayout" :class="['user-layout-wrapper', device]">
    <div class="container">
      <!-- <img class="containerImg" src="../../assets/denglulogo.png"> -->
      <div class="containerLeft"></div>
      <route-view></route-view>

      <div class="footer">
        <div class="footerFlex">
          <div class="footerLeft"></div>
          <!-- <div class="copyright">
            中国船舶第七一三研究所
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RouteView from '@/components/layouts/RouteView'
import { mixinDevice } from '@/utils/mixin.js'

export default {
  name: 'UserLayout',
  components: { RouteView },
  mixins: [mixinDevice],
  data() {
    return {}
  },
  mounted() {
    document.body.classList.add('userLayout')
  },
  beforeDestroy() {
    document.body.classList.remove('userLayout')
  }
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;
  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    width: 100%;
    min-height: 100%;
    background: #f0f2f5 url(~@/assets/denglubeijing.jpg) no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    a {
      text-decoration: none;
    }
    .main {
      min-width: 260px;
      width: 368px;
      margin: 0 auto;
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      // padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;
      .footerFlex {
        display: flex;
      }
      .footerLeft {
        width: 64.3%;
        height: 1px;
      }
      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        display: flex;
        width: 35.7%;
        justify-content: center;
      }
    }
    .containerLeft {
      width: 64.3%;
      height: 1px;
    }
  }
}
</style>
<style lang="less">
.containerImg{
 position: absolute;
 top: 30px;
 left: 30px;
 width: 358px;
}
.userLayout {
  overflow: hidden;
}
html > body {
  overflow: hidden;
}
</style>
