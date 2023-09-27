<template>
  <ul v-for="(item, index) in data" :key="index">
    <li @dblclick="dblclickon(item)" @click="clickon(item)" :style="{ 'font-Weight': item.subs ? 'bold' : '' }"> {{
      item.title }} {{ flagSub(item) }}
    </li>
    <div v-if="item.subs && item.open">
      <ListView :data="item.subs"></ListView>
    </div>
  </ul>
  <ul><li @click="add" >+</li></ul>

</template>

<script setup lang="ts">
const props = defineProps<{
  data: Array
}>()

function flagSub(item) {
  if (item.subs) {
    return item.open ? "[-]" : "[+]"
  } else {
    return ''
  }
}

function dblclickon(item: any) {
  console.log(1, item)

  if (item.subs) return
  item.open = !item.open
  if (item.open && !item.subs) {
    item.subs = [{ title: 'name', open: false }]
  }
}

function clickon(item: any) {
  console.log(2, item)

  if (!item.subs) return
  item.open = !item.open
}

function add() {
  props.data.push({ title: 'name', open: false })
  console.log(props.data)
}
</script>

<style scoped></style>
