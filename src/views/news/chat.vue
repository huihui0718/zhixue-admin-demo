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
        :messages-loaded="messagesLoaded"
        @send-message="sendMessage($event.detail[0])"
        @fetch-messages="fetchMessages($event.detail[0])"
      />
    </div>
  </div>
</template>

<script>
import { add, getHistory } from '@/api/chat'
import crudNews from '@/api/news'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { register } from 'vue-advanced-chat'
import Avatar from '@/assets/images/zhixue.png'

export default {
  name: 'Chat',
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
      num: '0',
      currentUserId: '1234',
      query: {
        page: 0,
        size: 10,
        sort: 'id,desc'
      },
      rooms: [
        {
          roomId: '1',
          roomName: '知学chat',
          avatar: Avatar,
          users: [
            { _id: '1234', username: 'me' },
            { _id: '4321', username: '知学chat' }
          ]
        }
      ],
      messages: [],
      messagesLoaded: false,
      headers: {}
    }
  },
  mounted() {
    const _this = this
  },
  created() {
    register()
    this.initWebSocket()
  },
  methods: {
    fetchMessages({ options = {}}) {
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
      if (content.length == 0) {
        this.messagesLoaded = true // 暂停历史记录追溯
        return
      }
      for (let i = 0; i < content.length; i++) {
        messages.push({
          _id: reset ? i : this.messages.length + i,
          content: `${content[i].content}`,
          senderId: `${content[i].pid != 0 ? '4321' : '1234'}`,
          username: `${content[i].pid != 0 ? '知学chat' : 'me'}`,
          date: `${content[i].date}`,
          timestamp: `${content[i].date.toString().substring(10, 21)}`
        })
      }
      console.log(messages + '第' + this.num++ + '返回')
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
