<template>
    <div class="root" id="root">
        <connection/>
        <!-- <updater/> -->
    </div>
</template>

<script>
    // import updater from '../../renderer/components/updater'
    import connection from "../../renderer/components/connection/connection.vue";
    export default {
        name: 'basicLayout',
        data() {
            return {}
        },
        components: {
            // updater,
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
