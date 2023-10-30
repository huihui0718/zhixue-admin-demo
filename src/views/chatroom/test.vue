<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <vue-advanced-chat
        height="calc(100vh - 120px)"
        :current-user-id="currentUserId"
        :rooms="JSON.stringify(rooms)"
        :rooms-loaded="true"
        :messages="JSON.stringify(messages)"
        :menu-actions="JSON.stringify(menuActions)"
        :message-actions="JSON.stringify(messageActions)"
        :messages-loaded="messagesLoaded"
        @send-message="sendMessage($event.detail[0])"
        @fetch-messages="fetchMessages($event.detail[0])"
        @add-room="addRoom"
      />
      <el-dialog
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        :title="crud.status.title"
        width="1000px"
      >
        <!-- :before-close="handleClose" -->
        <!-- <el-steps :active="step" align-center> -->
        <!-- 两个step (两个图标)-->
        <!-- <el-step title="Step 1" description="上传封面" />
          <el-step title="Step 2" description="文章信息" />
        </el-steps> -->
        <!-- step为2时 -->
        <el-upload
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
        <el-form>
          <el-form-item label="主题:">
            <el-input v-model="roomTitle" style="width: 370px" />
          </el-form-item>
          <el-form-item label="描述:">
            <el-input v-model="content" style="width: 370px" />
          </el-form-item>
        </el-form>

        <!-- 内容 -->
        <!-- <span>这是一段信息</span> -->
        <!-- 左下角next step按钮 -->
        <!-- <el-button v-show="!(step==2)" style="margin-top: 12px" @click="next">Next step</el-button> -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

    </div></div></template>

<script>
import { getHistory, getMessageHistory, addMessage, getMessageHistory1 } from '@/api/chat'
import { mapGetters } from 'vuex'
import { register } from 'vue-advanced-chat'
import { add } from '@/api/chat'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudNews from '@/api/news'
import { getToken } from '@/utils/auth'

// logo图标
import Avatar from '@/assets/images/zhixue.png'
export default {
  name: 'NewChat',
  mixins: [presenter(), header(), crud()],
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
      content: '',
      roomTitle: '',
      cu: false,
      imageUrl: '',
      headers: {},
      rules: {},
      // 分
      dialogVisible: false,
      currentUserId: '',
      query: {
        page: 1,
        size: 10
      },
      rooms: [
        {
          roomId: '1',
          roomName: '知学chat',
          avatar: Avatar,
          users: [
            // { _id: '1234', username: 'me' },
            { _id: '4321', username: '知学chat' }
          ]
        }
      ], // 存储获取到的房间信息
      messages: [], // 存储消息列表
      messagesLoaded: false,
      headers: {},
      messageText: '', // 存储输入框中的文本
      selectedRoomId: '', // 存储所选房间的ID
      menuActions: [
        {
          name: 'inviteUser',
          title: 'Invite User'
        },
        {
          name: 'removeUser',
          title: 'Remove User'
        },
        {
          name: 'deleteRoom',
          title: 'Delete Room'
        }
      ],
      messageActions: [
        {
          name: 'addMessageToFavorite',
          title: 'Add To Favorite'
        },
        {
          name: 'shareMessage',
          title: 'Share Message'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['user']),
    sortedMessages() {
      return this.messages.sort((a, b) => {
        return new Date(a.date) - new Date(b.date)
      })
    }
  },
  created() {
    register()
    this.currentUserId = (this.user.id).toString()
    const one_user = { _id: this.currentUserId, username: this.user.nickName }
    this.rooms[0].users.unshift(one_user)

    // this.initWebSocket()
  },
  mounted() {
    this.fetchRoomHistory() // 在组件挂载后执行获取房间信息的操作
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      this.form.coverImg = '/file/' + res.type + '/' + res.realName
    },
    beforeUpload() {
      this.headers.Authorization = getToken()
      // 执行其他验证...
    },
    // addRoom弹框
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    historymessage() {
      this.query.page++
      getMessageHistory1(this.selectedRoomId, this.query)
        .then(response => {
          this.messages = this.messages.concat(response) // 将获取到的消息列表存储到组件的 data 中
          console.log(response)
        })
        .catch(error => {
          console.error(error)
        })
    },
    fetchMessages({ options = {}}) {
      console.log(options)
      setTimeout(() => {
        if (options.reset) {
          this.addMessages(true)
        } else {
          this.addMessages()
          // this.messagesLoaded = true //暂停历史记录追溯
        }
        // this.addNewMessage()
      })
    },
    async addMessages(reset) {
      var messages = []
      var content = []
      console.log(this)
      await getHistory(this.query).then((res) => {
        content = res.content
        this.query.page++
      })
      if (content.length === 0) {
        this.messagesLoaded = true // 暂停历史记录追溯
        return
      }
      for (let i = 0; i < content.length; i++) {
        messages.push({
          _id: reset ? i : this.messages.length + i,
          content: `${content[i].content}`,
          senderId: `${content[i].pid !== 0 ? '4321' : '1234'}`,
          username: `${content[i].pid !== 0 ? '知学chat' : 'me'}`,
          date: `${content[i].date}`,
          timestamp: `${content[i].date.toString().substring(10, 21)}`
        })
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
    // sendMessage() {
    //   // 创建消息对象
    //   const messageData = {
    //     roomId: this.selectedRoomId,
    //     content: this.messageText
    //     // 根据实际情况填写发送者的ID
    //   }
    //   this.messages.push(
    //     { date: new Date().toString(),
    //       content: this.messageText
    //     }
    //   )
    //   // 调用添加消息的方法
    //   addMessage(messageData)
    //     .then(response => {
    //       // 执行成功的操作
    //       console.log('Message sent:', response)
    //       // 清空输入框
    //       this.messageText = ''
    //       this.messages.push(
    //         { date: response.date,
    //           content: response.content
    //         }
    //       )
    //     })
    //     .catch(error => {
    //       // 执行失败的操作
    //       console.error('Error sending message:', error)
    //     })
    // },
    sendMessage(message) {
      debugger
      console.log(this.messages.length)
      var timestamp = new Date().toString().substring(16, 21)
      var date = new Date().toDateString()
      this.messages = [
        ...this.messages,
        {
          _id: this.messages.length,
          content: message.content,
          senderId: this.currentUserId,
          timestamp: timestamp,
          date: date
        }
      ]
      add({
        content: message.content,
        senderId: this.currentUserId
      }).then((res) => {
        res._id = this.messages.length;
        (res.senderId = '4321'), (res.timestamp = timestamp), (res.date = date)
        this.messages = [...this.messages, res]
      })
    },
    fetchRoomMessages(roomId) {
      this.query.page = 1
      this.selectedRoomId = roomId
      console.log(this.selectedRoomId)
      getMessageHistory1(roomId, this.query)
        .then(response => {
          this.messages = response // 将获取到的消息列表存储到组件的 data 中
          console.log(response)
        })
        .catch(error => {
          console.error(error)
        })
    },
    fetchRoomHistory() {
      getHistory()
        .then(response => {
          this.rooms = response // 将获取到的房间信息存储到组件的 data 中
          console.log(response)
        })
        .catch(error => {
          console.error(error)
        })
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
    initWebSocket() {
      const wsUri =
        (process.env.VUE_APP_WS_API === '/'
          ? '/'
          : process.env.VUE_APP_WS_API + '/') + 'webSocket/deploy/0'
      this.websock = new WebSocket(wsUri)
      this.websock.onerror = this.webSocketOnError
      this.websock.onmessage = this.webSocketOnMessage
    },
    webSocketOnError(e) {
      this.$notify({
        title: 'WebSocket连接发生错误',
        type: 'error',
        duration: 0
      })
    },
    webSocketOnMessage(e) {
      const data = JSON.parse(e.data)
      if (data.msgType === 'INFO') {
        this.$notify({
          title: '',
          message: data.msg,
          type: 'success',
          dangerouslyUseHTMLString: true,
          duration: 5500
        })
      } else if (data.msgType === 'ERROR') {
        this.$notify({
          title: '',
          message: data.msg,
          dangerouslyUseHTMLString: true,
          type: 'error',
          duration: 0
        })
      }
    },
    webSocketSend(agentData) {
      this.websock.send(agentData)
    },
    addRoom() {
    }

  }}
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
