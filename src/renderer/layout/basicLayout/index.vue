<template>
    <div class="root" id="root">
        <connection/>
        <updater/>
    </div>
</template>

<script>
    import updater from '@/components/updater'
    import connection from "@/components/connection/connection";
    export default {
        name: 'basicLayout',
        data() {
            return {}
        },
        components: {
            updater,
            connection
        },
        mounted() {
        },
        methods: {
        }
    }
</script>

<style scoped lang="less">
</style>
