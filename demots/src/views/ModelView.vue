<template>
  <div id="main">
    <div id="background" style="opacity: 0.35; background-color: gray; height: 100%;"></div>
    <div id="content">
      <button @click="$emit('closemodel')">close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()
</script>

<style scoped>
div#main {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  display: grid;
}

#content {
  display: grid;
  position: fixed;
  width: 40%;
  height: 300px;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
  background-color: red;
}
</style>