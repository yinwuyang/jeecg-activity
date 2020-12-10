<template>
  <div class="main routerViewMain">
  <keep-alive>
    <router-view v-if="keepAlive" />
  </keep-alive>
  <router-view v-if="!keepAlive" />
  </div>
</template>

<script>
  export default {
    name: "RouteView",
    computed: {
      keepAlive () {
        return this.$route.meta.keepAlive
      }
    },
  }
</script>
<style lang="less" scoped>
.routerViewMain{
  height: 100%;
}
</style>