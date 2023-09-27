<template>
<div style="margin-top: 100px;">
  <transition-group name="fade">

  <div v-for="(item) in items" :key="item" style="width: 200px;height: 40px; background-color: rgb(52, 164, 103);border: 2px dotted rgb(245, 251, 245);">
  {{ item }}

</div>
</transition-group>

</div>
<button @click="remove"> remove</button>
</template>

<script setup lang="ts">
import ModelView from '@/views/ModelView.vue';
import { ref } from 'vue';
const items = ref([1,2,3,4,5,6,7,8])

function remove() {
  const rand = Math.floor(Math.random() * items.value.length)
  console.log(rand);
  
  items.value.splice(rand,1)
}
</script>
<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
