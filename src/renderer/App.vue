<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// Vue 3 Composition API
</script>

<style>
@import './assets/font-awsome/css/font-awesome.min.css';

body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.can-drag {
  -webkit-app-region: drag;
}

.no-select {
  -webkit-user-select: none;
  user-select: none;
}

.can-select {
  -webkit-user-select: text;
  user-select: text;
}
</style>
