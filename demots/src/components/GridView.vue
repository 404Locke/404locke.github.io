<template>
  <div id="main">
    <div id="header">
      <span @click="sortbyname">{{ header[0] }}<span :class="nameClass"></span></span>
      <span @click="sortbyPower">{{ header[1] }}<span></span></span>
    </div>
    <div class="cell" v-for="(item, index) in data" :key="index">
      <span>{{ item.name }}</span>
      <span>{{ item.power }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';


defineProps<{
  header: Array<Object>,
  data: Array<Object>
}>()
const nameClass = ref('arrow up')

const emit = defineEmits(['sortname', 'sortpower'])

function sortbyname() {
  emit('sortname',)
}
function sortbyPower() {
  emit('sortpower')
}
</script>

<style scoped>
#main {
  display: grid;
  width: 300px;
  grid-template-columns: 100%;
  grid-template-rows: 70px;
}

#header,
.cell {
  /* margin: 0; */
  height: 70px;
  background-color: aqua;
  display: grid;
  grid-template-columns: 50% 50%;
  place-items: stretch;
  margin: 2px;
  padding: 10px;
  /* justify-items: stretch;
  align-items: stretch; */
}

span {
  margin: 0px 0px 0px 0px;
  background-color: red;
  /* text-align: center; */
  /* text-justify: center; */
  /* vertical-align: middle; */
  line-height: 50px;
}

.cell {

  background-color: rgb(228, 215, 215);
}

.arrow {
  opacity: 0.6;
  position: absolute;
  width: 0px;
  height: 0px;
  margin-top: 20px;
}
.arrow.down {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid black;
}


.arrow.up {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid black;
}

</style>