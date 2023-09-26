<template>
    <div>
        <h3>items:</h3>
        <ul>
            <li v-for="item in props.items" :key="item.id" @click="dopick(item)"> {{ item.name  }} &nbsp; &nbsp;&nbsp;{{item.selected }}</li>
        </ul>
    </div>
    <button @click="doit(1)"></button>
</template>

<script setup lang="ts">

const props = defineProps({
    items: { type: null, required: true }
})

function doit(params: any) {
    props.items.forEach((element: { name: string; }) => {
        element.name += 1 + params
    });
}

function dopick(item: any) {
    item.selected = !item.selected
    console.log(new URL('scr.vue',import.meta.url));
    
    
}

</script>

<style scoped></style>