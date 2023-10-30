<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="coverImg">
            <el-input v-model="form.coverImg" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="isHot">
            <el-input v-model="form.isHot" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="newsDesc">
            <el-input v-model="form.newsDesc" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="newsPath">
            <el-input v-model="form.newsPath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="newsTitle">
            <el-input v-model="form.newsTitle" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="publishTime">
            <el-input v-model="form.publishTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="state">
            <el-input v-model="form.state" style="width: 370px;" />
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
        <el-table-column prop="coverImg" label="coverImg" />
        <el-table-column prop="isHot" label="isHot" />
        <el-table-column prop="newsDesc" label="newsDesc" />
        <el-table-column prop="newsPath" label="newsPath" />
        <el-table-column prop="newsTitle" label="newsTitle" />
        <el-table-column prop="publishTime" label="publishTime" />
        <el-table-column prop="state" label="state" />
        <el-table-column v-if="checkPer(['admin','news:edit','news:del'])" label="操作" width="150px" align="center">
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
import crudNews from '@/api/news'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { newsId: null, coverImg: null, isHot: null, newsDesc: null, newsPath: null, newsTitle: null, publishTime: null, state: null, type: null, updateTime: null, newsContent: null }
export default {
  name: 'News',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '咨询', url: 'api/news', idField: 'newsId', sort: 'newsId,desc', crudMethod: { ...crudNews }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'news:add'],
        edit: ['admin', 'news:edit'],
        del: ['admin', 'news:del']
      },
      rules: {
      }
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
