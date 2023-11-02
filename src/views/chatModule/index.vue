<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">模型名字</label>
        <el-input v-model="query.moduleName" clearable placeholder="模型名字" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-steps :active="step" align-center>
          <el-step title="Step 1" description="上传封面" />
          <el-step title="Step 2" description="模型信息" />
        </el-steps>
        <el-form v-show="step == 2" ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="模型名字" prop="moduleName">
            <el-input v-model="form.moduleName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="模型描述" prop="moduleContent">
            <el-input v-model="form.moduleContent" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="模型url" prop="moduleUrl">
            <el-input v-model="form.moduleUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="图片地址" prop="path">
            <el-input v-model="form.path" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="图片名" prop="pathName">
            <el-input v-model="form.pathName" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <el-upload
          v-show="step == 1"
          class="avatar-uploader"
          action="/api/localStorage/pictures"
          :show-file-list="false"
          :headers="headers"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
        <el-button  style="margin-top: 12px" @click="next">Next step</el-button>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="moduleName" label="模型名字" />
        <el-table-column prop="moduleContent" label="模型描述" />
        <el-table-column prop="moduleUrl" label="模型url" />
        <el-table-column prop="createBy" label="创作者" />
        <el-table-column prop="createTime" label="创作时间" />
        <el-table-column prop="updateBy" label="修改者" />
        <el-table-column prop="updateTime" label="修改时间" />
        <el-table-column prop="path" label="图片地址" />
        <el-table-column prop="pathName" label="图片名" />
        <el-table-column v-if="checkPer(['admin','chatModule:edit','chatModule:del'])" label="操作" width="150px" align="center">
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
import crudChatModule from '@/api/chatModule1'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getToken } from '@/utils/auth'

const defaultForm = { id: null, moduleName: null, moduleContent: null, moduleUrl: null, createBy: null, createTime: null, updateBy: null, updateTime: null, path: null, pathName: null }
export default {
  name: 'ChatModule',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '模型', url: 'api/chatModule1', idField: 'id', sort: 'id,desc', crudMethod: { ...crudChatModule }})
  },
  data() {
    return {
      step: 1,
      cu: false,
      imageUrl: '',
      headers: {},
      permission: {
        add: ['admin', 'chatModule:add'],
        edit: ['admin', 'chatModule:edit'],
        del: ['admin', 'chatModule:del']
      },
      rules: {
        // moduleName: [
        //   { required: true, message: '模型名字不能为空', trigger: 'blur' }
        // ],
        // moduleContent: [
        //   { required: true, message: '模型描述不能为空', trigger: 'blur' }
        // ],
        // moduleUrl: [
        //   { required: true, message: '模型url不能为空', trigger: 'blur' }
        // ],
        // path: [
        //   { required: true, message: '图片地址不能为空', trigger: 'blur' }
        // ]
        // // ,
        // // pathName: [
        // //   { required: true, message: '图片名不能为空', trigger: 'blur' }
        // // ]
      },
      queryTypeOptions: [
        { key: 'moduleName', display_name: '模型名字' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    submit() {
      this.$bus.$emit('hello')
    },
    next() {
      if (this.step >= 2) {
        this.step = 1
      } else {
        this.step++
      }
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      this.form.path = '/file/' + 'IMAGE' + '/' + res.realName
      this.form.pathName = res.realName
    },
    beforeUpload() {
      this.headers.Authorization = getToken()
      // 执行其他验证...
    },
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
