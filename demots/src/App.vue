<template>
  <div class="main">
    <div>
      <div>
        <svg height="200" width="200">
          <circle cx="100" cy="100" r="80" style="fill:transparent;stroke:purple;stroke-width:1;"></circle>
          <polygon :points="points" style="fill:rgb(0, 26, 255);stroke:rgb(47, 227, 65);stroke-width:1;"></polygon>

        </svg>
      </div>
      <div>
        <div v-for="(item, index) in items" :key="index" class="range">
          <span>{{ item.name }}</span>
          <input type="range" :value="item.value" @input="(el) => item.value = el.target.value">
          <button style="margin-left: 10px;" @click="items.splice(items.indexOf(item), 1)">x</button>
        </div>
        <input type="text" name="" id="" ref="input">
        <button @click="(input.value.length) ? (items.push({ name: input.value, value: 100 }), input.value = '') : ''">Add
          a
          Stat</button>
      </div>
    </div>
    <div style="padding-top: 100px;">
      <div v-for="(item, index) in items" :key="index" style="padding-bottom: 10px;">
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const points = computed(() => {
  const total = items.value.length
  return items.value.map((stat, i) => {
      const { x, y } = valueToPoint(stat.value, i, total)
      return `${x},${y}`
    })
    .join(' ')
})

function valueToPoint(value, index, total) {
  const x = 0
  const y = -value * 0.8
  const angle = ((Math.PI * 2) / total) * index
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const tx = x * cos - y * sin + 100
  const ty = x * sin + y * cos + 100
  return {
    x: tx,
    y: ty
  }
}

const input = ref('')
const items = ref([
  { name: 'a', value: 100 },
  { name: 'b', value: 100 },
  { name: 'c', value: 10 },
  { name: 'd', value: 100 },
  { name: 'e', value: 100 },
  { name: 'f', value: 80 },
  { name: 'g', value: 100 }
])

function changeValue(el: any) {
  console.log(el);

}
</script>

<style scoped>
.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

input {
  vertical-align: middle;
  margin-left: 5px;
  width: 200px;
}

.range {
  margin-bottom: 10px;

}
</style>
