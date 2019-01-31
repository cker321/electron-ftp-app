
<template>
    <div class="folder">
        <div class="src"></div>
        <el-table
                :data="tableData"
                stripe
                style="width: 100%">
            <el-table-column
                    prop="name"
                    label="文件夹 / 名">
                <template slot-scope="props">
                    <el-button
                            style="width: 100%; text-align: left"
                            type="text"
                            @click="changePath(props.row.name)"
                            v-if="props.row.type !== 'd'" disabled><i class="fa fa-file"></i>&nbsp;{{props.row.name}}</el-button>
                    <el-button
                            style="width: 100%; text-align: left"
                            type="text"
                            @click="changePath(props.row.name)"
                            v-else><i class="fa fa-folder"></i>&nbsp;{{props.row.name}}</el-button>
                </template>
            </el-table-column>
            <el-table-column
                    prop="size"
                    width="100"
                    label="大小">
            </el-table-column>
            <el-table-column
                    prop="date"
                    width="200"
                    label="修改日期">
                <template slot-scope="props">
                    {{(new Date(props.row.date.toString())).toLocaleString()}}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: 'folder',
        props: {
            defaultData: {
                type: Array,
                default () {
                    return []
                }
            }
        },
        watch: {
            defaultData (val) {
                this.tableData = val;
            }
        },
        data () {
            return {
                tableData: []
            }
        },
        methods: {
            changePath (path) {
                this.$get('changePath',  {path})
                    .then(res => {
                        console.log(res.data)
                        this.tableData = res.data;
                        // 跳转到folder
                        // this.$router.push({
                        //     name: 'folder'
                        // })
                    })
            }
        }
    }
</script>
<style scoped lang="less">
    .folder {
        padding: 30px;
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: #fff;
    }
</style>
