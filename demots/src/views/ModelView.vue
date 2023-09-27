<template>
  <Transition name="modal">
    <div id="main" class="modal-container" v-if="open">
      <div id="content">
        <button @click="$emit('close')">close</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

import { ref } from 'vue';


</script>

<style scoped>

div#main {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  display: grid;
  background-color: #7f7f7f67;
  transition: opacity 10.35s ease;
}

#content {
  display: flex;
  position: fixed;
  width: 40%;
  height: 300px;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
  background-color: rgb(255, 255, 255);

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 10.35s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-container,
.modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>