<template>
  <div>
    <button @click="openclose = true">show button</button>
  </div>
  <Teleport to='body'>
    <transition>
      <ModelView v-show="openclose" @closemodel="closeModel" :class="openclose?'enter':''"></ModelView>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import ModelView from '@/views/ModelView.vue';
import { ref } from 'vue';
const openclose = ref(false)
// defineEmits(['closemodel'])
function closeModel() {
  openclose.value = false;
}

</script>

<style scoped>
.enter {
  /* transition-property: all;
  transition-duration: 30s; */
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
