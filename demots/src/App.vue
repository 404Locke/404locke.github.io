<template>
  <ListView :data="items"></ListView>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import ListView from './views/ListView.vue';
const items = ref([{ title: 'name', open: false }]);


</script>

<style scoped></style>