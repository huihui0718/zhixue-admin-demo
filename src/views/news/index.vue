<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="1000px"
      >
        <el-steps :active="step" align-center>
          <el-step title="Step 1" description="上传封面" />
          <el-step title="Step 2" description="文章信息" />
        </el-steps>
        <el-form
          v-show="step == 2"
          ref="form"
          style="padding: 20px"
          :model="form"
          :rules="rules"
          size="small"
          label-width="120px"
        >
          <el-form-item label="推文标题:">
            <el-input v-model="form.newsTitle" style="width: 370px" />
          </el-form-item>
          <el-form-item label="推文摘要:">
            <el-input v-model="form.newsDesc" style="width: 370px" />
          </el-form-item>
          <el-form-item label="是否为热点新闻:">
            <el-input v-model="form.isHot" label-width="180px" style="width: 370px" />
          </el-form-item>
          <el-form-item label="新闻类型:">
            <el-input v-model="form.type" label-width="180px" style="width: 370px" />
          </el-form-item>
          <el-form-item label="推文内容:">
            <editor />
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
        <el-button v-show="!(step==2)" style="margin-top: 12px" @click="next">Next step</el-button>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            :loading="cu"
            type="primary"
            @click="submit"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%; "
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="coverImg" label="封面" />
        <el-table-column prop="isHot" label="是否为热点咨询" />
        <el-table-column prop="newsTitle" label="推文标题" />
        <el-table-column prop="publishTime" label="发布时间" />
        <el-table-column prop="newsLike" label="点赞数目" />
        <el-table-column prop="newsStar" label="收藏数目" />
        <el-table-column prop="userId" label="用户Id" />
        <el-table-column
          v-if="checkPer(['admin', 'news:edit', 'news:del'])"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
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
import { getToken } from '@/utils/auth'
import editor from '@/views/components/Editor'
const defaultForm = {
  newsId: null,
  coverImg: null,
  isHot: null,
  newsDesc: null,
  newsPath: null,
  newsTitle: null,
  publishTime: null,
  state: null,
  type: null,
  updateTime: null,
  newsContent: null
}
export default {
  name: 'News',
  components: { pagination, crudOperation, rrOperation, udOperation, editor },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '咨询',
      url: 'api/news',
      idField: 'newsId',
      sort: 'newsId,desc',
      crudMethod: { ...crudNews }
    })
  },
  data() {
    return {
      step: 1,
      cu: false,
      imageUrl: '',
      headers: {},
      permission: {
        add: ['admin', 'news:add'],
        edit: ['admin', 'news:edit'],
        del: ['admin', 'news:del']
      },
      rules: {}
    }
  },
  mounted() {
    const _this = this
    this.$bus.$on('saveNews', function(data) {
      _this.form.newsContent = data
      _this.crud.submitCU()
    })
  },
  methods: {
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
      this.form.coverImg = '/file/' + res.type + '/' + res.realName
    },
    beforeUpload() {
      this.headers.Authorization = getToken()
      // 执行其他验证...
    },
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
