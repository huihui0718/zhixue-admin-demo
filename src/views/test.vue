<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <vue-advanced-chat
        height="calc(100vh - 120px)"
        :current-user-id="currentUserId"
        :rooms="JSON.stringify(rooms)"
        :rooms-loaded="true"
        :show-files="true"
        :show-audio="true"
        :show-footer="true"
        :messages="JSON.stringify(messages)"
        :messages-loaded="messagesLoaded"
        :load-first-room="false"
        :multiple-files="true"
        accepted-files="*"
        @open-file="openFile($event.detail[0])"
        @send-message="sendMessage($event.detail[0])"
        @fetch-messages="fetchMessages($event.detail[0])"
        @add-room="dialogVisible = true"
      />
      <el-dialog
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        :title="crud.status.title"
        width="380px"
      >
        <el-form>
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="grid-content bg-purple" />
              <el-form-item v-for="chatModules in chatModule" :key="chatModules.id" @click="module1(chatModules.id) ">
                <div style="font-size: 30px; padding-left: 30px;padding-top:15px ; border: 2px solid rgba(249,249,252); display: block ;border-radius: 10px;">
                  <img
                    :src="Api + chatModules.path "
                    class="avatar"
                    style="vertical-align: middle;  border-radius: 30px; height: 40px; width: 40px;
                  display: inline-block; "
                  >
                  {{ chatModules.moduleName }}
                  <el-button type="primary" plain style="margin-top: 0px; right: 20px; display: inline-block; position: absolute" @click="module1(chatModules.id,chatModules.moduleName)"> 选 择 </el-button>
                  <div style="font-size: 15px;color: #7e7b7b;">{{ chatModules.moduleContent }}</div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form />
          <el-form>
            <el-form-item label="房间名:">
              <el-input v-model="roomTitle" style="width: 160px" />
            </el-form-item>
            <el-form-item label="简介:">
              <el-input v-model="roomContent" style="width: 160px" />
            </el-form-item>
          </el-form>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoom">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { add, getHistory } from '@/api/chat'
import { addImage } from '@/api/chatroom'
import { getChatModule } from '@/api/chatMoudle'
import crudNews from '@/api/news'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { register } from 'vue-advanced-chat'
import Avatar from '@/assets/images/zhixue.png'
import { getRoomHistory, addRoom, delRoom, editRoom } from '@/api/room'
import { getToken } from '@/utils/auth'
import Api from '@/store/modules/api'

export default {
  name: 'Chat',
  mixins: [presenter(), header(), crud()],
  cruds() {
    return CRUD({
      title: '聊天主题',
      url: 'api/news',
      idField: 'newsId',
      sort: 'newsId,desc',
      crudMethod: { ...crudNews }
    })
  },
  data() {
    return {
      sModuleName: '', // 模型名
      sModuleId: '1', // 切换房间时的模型Id
      moduleId: '', // 模型ID
      chatModule: [], // 存储模型的数组
      roomContent: '', // 模型的描述
      roomTitle: '', // 房间的标题
      cu: false,
      imageUrl: '',
      rules: {},
      dialogVisible: false,
      sRoomId: '0', // 切换房间时的roomId
      currentUserId: '1234',
      query: {
        page: 0,
        size: 10,
        sort: 'id,desc'
      },
      rooms: [], // 存储房间的数组
      messages: [], // 存储消息的数组
      messagesLoaded: false,
      headers: {},
      createNew: false,
      selectedFile: null,
      Api: 'http://localhost:8000' // 后端的Api
    }
  },
  mounted() {
    const _this = this
    this.RoomHistory()
    this.getModules()
  },
  created() {
    register()
    this.initWebSocket()
  },
  methods: {
    openFile({ file }) {
      window.open(file.file.url, '_blank')
    },
    handleAvatarSuccess(res, file) {
      console.log(res)
      this.imageUrl = URL.createObjectURL(file.raw)
      this.form.coverImg = '/file/' + res.type + '/' + res.realName
    },
    beforeUpload() {
      this.headers.Authorization = getToken()
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {
        })
    },
    getModules() {
      getChatModule()
        .then(res => {
          this.chatModule = res
        })
        .catch(err => {
          console.log(err)
        })
    },
    module1(moduleId, moduleName) {
      this.moduleId = moduleId
      this.sModuleName = moduleName
      this.createNew = true
    },
    RoomHistory() {
      getRoomHistory().then((res) => {
        this.newRooms = res
        console.log(res)
        this.rooms.push({
          roomId: '0',
          roomName: '知学chat',
          avatar: Avatar,
          users: [
            { _id: '4321', username: '知学chat' },
            { _id: '1234', username: 'me' }
          ],
          module: '1'
        })
        for (let i = 0; i < this.newRooms.length; i++) {
          this.rooms.push({
            roomId: this.newRooms[i].id,
            roomName: this.newRooms[i].title,
            avatar: this.Api + '/file/IMAGE/' + this.newRooms[i].pathName,
            users: [
              { _id: '4321', username: '知学chat' },
              { _id: '1234', username: 'me' }
            ],
            module: this.newRooms[i].module
          })
        }
      })
    },
    fetchMessages({ options = {}, room }) {
      this.messagesLoaded = false
      setTimeout(() => {
        this.sRoomId = room.roomId
        this.sModuleId = room.module
        if (options.reset) {
          this.messages = ''
          this.query.page = 0
          this.addMessages(true)
        } else {
          this.addMessages(false)
        }
      })
    },
    async addMessages(reset) {
      var messages = []
      var content = []
      await getHistory(this.sRoomId, this.query).then((res) => {
        content = res.content
        this.query.page++
      })

      if (content.length === 0) {
        this.messagesLoaded = true // 暂停历史记录追溯
        return
      }
      for (let i = 0; i < content.length; i++) {
        if (content[i].chatType === 'TEXT') {
          messages.push({
            _id: reset ? i : this.messages.length + i,
            content: `${content[i].content}`,
            senderId: `${content[i].type !== 0 ? '4321' : '1234'}`,
            username: `${content[i].type !== 0 ? '知学chat' : 'me'}`,
            date: `${content[i].date}`,
            timestamp: `${content[i].date.toString().substring(10, 21)}`
          })
        } else {
          const type = content[i].pathName.split('.').pop()
          const path = content[i].pathName.split('.').pop() === 'mp3' ? 'MUSIC' : 'TXT'
          messages.push({
            _id: reset ? i : this.messages.length + i,
            senderId: `${content[i].type !== 0 ? '4321' : '1234'}`,
            username: `${content[i].type !== 0 ? '知学chat' : 'me'}`,
            date: `${content[i].date}`,
            timestamp: `${content[i].date.toString().substring(10, 21)}`,
            files: [{
              name: content[i].pathName,
              type: type,
              extension: type,
              url: this.Api + '/file/' + path + '/' + content[i].pathName
            }]
          })
        }
        console.log(content[i].chatType)
      }
      if (reset) {
        this.messages = messages
      } else {
        this.messages = [...messages, ...this.messages]
      }
      if (content.length < 10) {
        this.messagesLoaded = true // 暂停历史记录追溯
        return
      }
    },
    async sendMessage({ content, files, replyMessage }) {
      // content消息内容 、 roomId房间id 、files文件 、replyMessage（微信引用）回复的消息
      debugger
      var timestamp = new Date().toString().substring(16, 21)
      var date = new Date().toDateString()
      if (files) {
        const fileData = {
          blob: files[0].blob,
          name: files[0].name,
          size: files[0].size,
          type: files[0].extension
        }
        console.log(fileData)
        let fileName

        if (files[0].name === 'audio.mp3') {
          fileName = fileData.name
        } else {
          fileName = fileData.name + '.' + fileData.type
        }

        const fileExtension = fileData.name.split('.').pop()
        const file1 = new File([fileData.blob.slice(0, fileData.size)], fileName, {
          type: fileData.type,
          lastModified: Date.now()
        })
        const formData = new FormData()
        formData.append('file', file1)
        console.log(file1)
        this.messages = [
          ...this.messages,
          {
            _id: this.messages.length,
            content: content,
            senderId: this.currentUserId,
            timestamp: timestamp,
            date: date,
            files: this.formattedFiles(files)
            // files: [{
            //   name: 'da',
            //   type: 'mp3',
            //   extension: 'mp3',
            //   url: this.Api + '/file/audio-2023110503454466.mp3'
            // }]
          }
        ]
        addImage(formData, {
          roomId: this.sRoomId,
          moduleId: this.sModuleId
        }).then((res) => {
          res._id = this.messages.length;
          (res.senderId = '4321'), (res.timestamp = timestamp), (res.date = date)
          this.messages = [...this.messages, res]
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.messages = [
          ...this.messages,
          {
            _id: this.messages.length,
            content: content,
            senderId: this.currentUserId,
            timestamp: timestamp,
            date: date
          }
        ]
        add({
          content: content,
          senderId: this.currentUserId,
          roomId: this.sRoomId
        }, this.sModuleId).then((res) => {
          res._id = this.messages.length;
          (res.senderId = '4321'), (res.timestamp = timestamp), (res.date = date)
          this.messages = [...this.messages, res]
        })
      }
    },
    formattedFiles(files) {
      const formattedFiles = []

      files.forEach(file => {
        const messageFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: file.extension || file.type,
          url: file.url || file.localUrl
        }

        if (file.audio) {
          messageFile.audio = true
          messageFile.duration = file.duration
        }

        formattedFiles.push(messageFile)
      })

      return formattedFiles
    },

    addNewMessage() {
      setTimeout(() => {
        this.messages = [
          ...this.messages,
          {
            _id: this.messages.length,
            content: 'NEW MESSAGE',
            senderId: '1234',
            timestamp: new Date().toString().substring(16, 21),
            date: new Date().toDateString()
          }
        ]
      }, 2000)
    },
    addRoom() {
      this.dialogVisible = false
      if (this.roomContent !== '' && this.roomTitle !== '' && this.createNew) {
        addRoom({
          title: this.roomTitle,
          content: this.roomContent,
          module: this.moduleId,
          moduleName: this.sModuleName
        }).then(res => {
          // const targetObject = this.chatModule.find(item => item.id === this.moduleId).moduleName
          this.rooms.push({
            roomId: res.id,
            roomName: res.title,
            avatar: this.Api + this.chatModule.find(item => item.id === this.moduleId).path,
            // this.moduleId + '.png',
            users: [
              { _id: '4321', username: '知学chat' },
              { _id: '1234', username: 'me' }
            ],
            module: this.moduleId
          })
          this.roomTitle = ''
          this.roomContent = ''
          this.createNew = false
        }).catch(err => {
          console.log(err)
        })
      }
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

/* 分 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
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

.hide-new-messages {
  display: none;
}
</style>
