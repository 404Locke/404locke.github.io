<template>
  <div><span>Search </span><input type="text" v-model="searchKey"></div>
  <table>
    <thead>
      <tr>
        <th @click="sortbyName" ><span :class="[nameclass1(),'bold']">Name</span><span :class="nameclass()"></span></th>
        <th @click="sortbyPower" ><span :class="[powerclass1(),'bold']">Power</span><span :class="powerclass()"></span></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in dataFilter" :key="index">
        <td>{{ item.name }}</td>
        <td>{{ item.power }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import TodoItem from './components/items/TodoItem.vue';
import { marked } from 'marked'
import { debounce } from "lodash-es";
import GitItem from './components/items/GitItem.vue';

const select = ref('main')
const items = ref([]);
const data = ref([
  { name: 'Chuck Norris', power: Infinity },
  { name: 'Bruce Lee', power: 9000 },
  { name: 'jackie chan', power: 7000 },
  { name: 'nima chan', power: 4000 },
  { name: 'Jet li', power: 8000 },
  { name: 'eackie chan', power: 7000 },
])

const dataOrigin = [...data.value]

const searchKey = ref('')
const sortNameKey = ref('')
const sortPowerKey = ref('')

const dataFilter = computed(() => {
  if ((!sortNameKey.value.length) && (!sortPowerKey.value.length) && (!searchKey.value.length)) {
    return dataOrigin;
  }
  return data.value.filter((value, index, ar) => {
    return value.name.toLowerCase().includes(searchKey.value.toLowerCase()) || value.power.toString().toLowerCase().includes(searchKey.value.toString().toLowerCase());
  })
})

const nameclass = () => {
  if (sortNameKey.value.includes('nameup')) {
    return 'arrowup'
  } else if (sortNameKey.value.includes('namedown')) {
    return 'arrowdown'
  }
  return 'light arrowup'
}

const powerclass = () => {
  if (sortPowerKey.value.includes('powerup')) {
    return 'arrowup'
  } else if (sortPowerKey.value.includes('powerdown')) {
    return 'arrowdown'
  }
  return 'light arrowup'
}

const nameclass1 = () => {
  if (sortNameKey.value.length) {
    return ''
  }
  return 'light'
}

const powerclass1 = () => {
  if (sortPowerKey.value.length) {
    return ''
  }
  return 'light'
}

function sortbyName(e) {
  sortPowerKey.value = ''
  if (!sortNameKey.value.length) {
    sortNameKey.value = 'nameup'
    data.value = data.value.sort((a, b) => {
      return a.name <= b.name ? 1 : -1
    });
  } else if (sortNameKey.value.includes('nameup')) {
    sortNameKey.value = 'namedown'
    data.value = data.value.sort((a, b) => {
      return a.name >= b.name ? 1 : -1
    });
  } else {
    sortNameKey.value = ''
  }
}
function sortbyPower(e) {
  sortNameKey.value = ''
  if (!sortPowerKey.value.length) {
    sortPowerKey.value = 'powerup'
    data.value = data.value.sort((a, b) => {
      return a.power <= b.power ? 1 : -1
    });
  }else if (sortPowerKey.value.includes('powerup')) {
    sortPowerKey.value = 'powerdown'
    data.value = data.value.sort((a, b) => {
      return a.power >= b.power ? 1 : -1
    });
  } else {
    sortPowerKey.value = ''
  }
}

const input = ref('# hello')
const output = computed(() => {
  const a = marked(input.value)
  console.log(a);

  return a
})
// function update(e:any) {
//   input.value = e.value
// }

const update = debounce((e) => {
  input.value = e.target.value
}, 3000)


const API_URL = `https://api.github.com/repos/vuejs/core/commits?per_page=3&sha=`

watchEffect(async () => {
  const url = API_URL + select.value
  const data = await (await fetch(url)).json()
  console.log(data);

  items.value = data;
})


</script>

<style scoped>
table {
  width: 25%;
  border: 2px solid #41B07B;
}

td {
  width: 50%;
  background-color: #F8F8F8;
  padding: 10px;
}

tr>th {
  background-color: #41B07B;
  color: rgba(255, 255, 255, 1);
}

tr {
  height: 40px;
}

span.arrowdown {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid rgba(255, 255, 255, 1);
  vertical-align: middle;
  display: inline-block;
  margin-left: 4px;
}

span.arrowup {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 1);
  vertical-align: middle;
  display: inline-block;
  margin-left: 4px;
}

.light {
  opacity: 0.66;
}

.bold {
  font-weight: bold;
}

</style>