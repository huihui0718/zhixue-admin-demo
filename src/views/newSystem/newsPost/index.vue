<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">@对象id</label>
        <el-input v-model="query.sendId" clearable placeholder="@对象id" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">发言</label>
        <el-input v-model="query.content" clearable placeholder="发言" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">新闻id</label>
        <el-input v-model="query.newsId" clearable placeholder="新闻id" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">父评论id</label>
        <el-input v-model="query.parentId" clearable placeholder="父评论id" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">用户id</label>
        <el-input v-model="query.userId" clearable placeholder="用户id" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="@对象id">
            <el-input v-model="form.sendId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="发言">
            <el-input v-model="form.content" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="新闻id">
            <el-input v-model="form.newsId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="父评论id">
            <el-input v-model="form.parentId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户id">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="评论点赞">
            <el-input v-model="form.postLikes" style="width: 370px;" />
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
        <el-table-column prop="id" label="id" />
        <el-table-column prop="sendId" label="@对象id" />
        <el-table-column prop="content" label="发言" />
        <el-table-column prop="newsId" label="新闻id" />
        <el-table-column prop="parentId" label="父评论id" />
        <el-table-column prop="userId" label="用户id" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="postLikes" label="评论点赞" />
        <el-table-column v-if="checkPer(['admin','newsPost:edit','newsPost:del'])" label="操作" width="150px" align="center">
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
import crudNewsPost from '@/api/newsPost'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, sendId: null, content: null, newsId: null, parentId: null, userId: null, createTime: null, postLikes: null }
export default {
  name: 'NewsPost',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '新闻评论', url: 'api/newsPost', idField: 'id', sort: 'id,desc', crudMethod: { ...crudNewsPost }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'newsPost:add'],
        edit: ['admin', 'newsPost:edit'],
        del: ['admin', 'newsPost:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'sendId', display_name: '@对象id' },
        { key: 'content', display_name: '发言' },
        { key: 'newsId', display_name: '新闻id' },
        { key: 'parentId', display_name: '父评论id' },
        { key: 'userId', display_name: '用户id' }
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
