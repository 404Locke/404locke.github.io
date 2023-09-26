<template>
    <li>
        <a :href="todo.url"> {{ todo.sha.substring(0,7) }} </a> <span> - {{ truncate(todo.commit.message)}}</span>
        <span><br>by &nbsp;</span><a :href="todo.author.html_url">{{ todo.commit.author.name }}</a><span>at {{ dateStr(todo.commit.committer.date) }}</span>
</li>
</template>

<script setup lang="ts">
defineProps<{
    todo: any
}>()

function truncate(v: string) {
    const index = v.indexOf('\n')
    return index > 0 ? v.substring(0, index) : v
}

function dateStr(date:string) {
    let a = /fsf/g
    return date.replace(/[TZ]/g,' ')
}
</script>

<style scoped>
li {
    margin-left: 2rem;
    line-height: 2rem;
}
</style>