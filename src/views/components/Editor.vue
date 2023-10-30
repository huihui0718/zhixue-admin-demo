<template>
  <div class="app-container">
    <el-row :gutter="0">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div ref="editor" class="text" />
      </el-col>
      <!-- <el-col :xs="24" :sm="24" :md="9" :lg="9" :xl="9">
        <div v-html="editorContent" />
      </el-col> -->
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { upload } from "@/utils/upload";
import E from "wangeditor";
export default {
  name: "Editor",
  data() {
    return {
      editorContent: `
        `,
    };
  },
  computed: {
    ...mapGetters(["imagesUploadApi", "baseApi"]),
  },
  mounted() {
    const _this = this;
    this.$bus.$on("hello",function(){
      _this.$bus.$emit('saveNews',_this.editorContent)
    });
    var editor = new E(this.$refs.editor);
    // 自定义菜单配置
    editor.config.zIndex = 5;
    // 文件上传
    editor.config.customUploadImg = function (files, insert) {
      // files 是 input 中选中的文件列表
      // insert 是获取图片 url 后，插入到编辑器的方法
      files.forEach((image) => {
        upload(_this.imagesUploadApi, image).then((res) => {
          const data = res.data;
          const url =
            _this.baseApi + "/file/" + data.type + "/" + data.realName;
          insert(url);
        });
      });
    };
    editor.config.onchange = (html) => {
      this.editorContent = html;
    };
    editor.create();
    // 初始化数据
    editor.txt.html(this.editorContent);
  },
};
</script>

<style scoped>
.text {
  text-align: left;
}
::v-deep .w-e-text-container {
  height: 420px !important;
}
</style>
