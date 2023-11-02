<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">user_id</label>
        <el-input v-model="query.senderId" clearable placeholder="user_id" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="回答" prop="content">
            <el-input v-model="form.content" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="日期" prop="date">
            <el-input v-model="form.date" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="提问回答" prop="type">
            <el-input v-model="form.type" style="width: 370px;" />
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
<!--        <el-table-column prop="Id" label="Id" />-->
<!--        <el-table-column prop="timestamp" label="年月日" />-->
        <el-table-column prop="content" label="content" />
        <el-table-column prop="senderId" label="user_id" />
        <el-table-column prop="date" label="时分" />
        <el-table-column prop="type" label="0:提问 1:回答" />
        <el-table-column prop="chatHot" label="1:热门" />
<!--        <el-table-column prop="pid" label="pid" />-->
<!--        <el-table-column prop="userId" label="userId" />-->
<!--        <el-table-column prop="roomId" label="roomId" />-->
        <el-table-column v-if="checkPer(['admin','chat:edit','chat:del'])" label="操作" width="150px" align="center">
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
import crudChat from '@/api/chat'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { Id: null, timestamp: null, content: null, senderId: null, date: null, type: null, pid: null, userId: null, roomId: null, chatHot: null }
export default {
  name: 'Chat',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '聊天', url: 'api/chat', idField: 'Id', sort: 'Id,desc', crudMethod: { ...crudChat }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'chat:add'],
        edit: ['admin', 'chat:edit'],
        del: ['admin', 'chat:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'senderId', display_name: 'user_id' }
      ]
    }
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
