<template>
    <div>
<li> {{ todo.text }}</li>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    todo:any
}>()
</script>

<style lang="scss" scoped>

</style>