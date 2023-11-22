<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="starRoomId">
            <el-input v-model="form.starRoomId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="1:推文,2:文件,3:视频">
            <el-input v-model="form.type" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.content" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="creatrTime">
            <el-input v-model="form.creatrTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="updateTime">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="coverImg">
            <el-input v-model="form.coverImg" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="starRoomId" label="starRoomId" />
        <el-table-column prop="name" label="name" />
        <el-table-column prop="userId" label="userId" />
        <el-table-column prop="type" label="1:推文,2:文件,3:视频" />
        <el-table-column prop="content" label="描述" />
        <el-table-column prop="creatrTime" label="creatrTime" />
        <el-table-column prop="updateTime" label="updateTime" />
        <el-table-column prop="coverImg" label="coverImg" />
        <el-table-column v-if="checkPer(['admin','starRoom:edit','starRoom:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudStarRoom from '@/api/starRoom'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { starRoomId: null, name: null, userId: null, type: null, content: null, creatrTime: null, updateTime: null, coverImg: null }
export default {
  name: 'StarRoom',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '点赞房间', url: 'api/starRoom', idField: 'starRoomId', sort: 'starRoomId,desc', crudMethod: { ...crudStarRoom }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'starRoom:add'],
        edit: ['admin', 'starRoom:edit'],
        del: ['admin', 'starRoom:del']
      },
      rules: {
      }    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
