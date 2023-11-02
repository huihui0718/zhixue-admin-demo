<template>
  <div class="app-container">
    <button :disabled="isConnected" @click="connectWebSocket">连接WebSocket</button>
    <button :disabled="!isConnected" @click="disconnectWebSocket">断开WebSocket</button>
    <input v-model="roomId" type="text" placeholder="输入roomId">
    <input v-model="sid" type="text" placeholder="输入sid">
    <input v-model="message" type="text" placeholder="输入消息">
    <input ref="fileInput" type="file" @change="handleFileChange">
    <button :disabled="!isConnected" @click="uploadFile">上传文件</button>
    <button :disabled="!isConnected" @click="sendMessageToBackend">发送消息</button>
    <button :disabled="!isConnected" @click="findByRoomId">查找聊天记录</button>
    <button :disabled="!isConnected" @click="getOnlineUsersNum">查找房间{{ roomId }}的在线人数</button>
    <ul>
      <li v-for="onlineMember in onlineMembers" :key="onlineMember.id">{{ onlineMember.content }}</li>
    </ul>
    <div v-for="message in receivedMessages" :key="message.id">
      <div v-if="message.type === 'TEXT'">
        <!-- 处理文本消息 -->
        <p>{{ message.content }}</p>
      </div>
      <div v-else-if="message.type === 'IMAGE'">
        <!-- 处理图片消息 -->
        <img :src="message.imageUrl" alt="Chat Image">
      </div>
    </div>
    <ul>
      <li v-for="historyMessage in historyMessages" :key="historyMessage.id">{{ historyMessage.content }}</li>
    </ul>
    <div v-for="(imageData, index) in receivedImagesData" :key="index">
      <img :src="imageData" :alt="'Received Image ' + (index + 1)">
    </div>
  </div>
</template>

<script>
import { adduser, addMessage, findByRoomId, getOnlineUsersNum, addImage, addComment } from '@/api/chatroom'
export default {
  data() {
    return {
      baseapi: 'http://localhost:18000',
      websock: null,
      isConnected: false,
      message: '',
      roomId: '',
      sid: '',
      sentMessages: [], // 存储发送的消息
      receivedMessages: [], // 存储接收的消息
      historyMessages: [], // 历史记录的消息
      onlineMembers: [],
      selectedFile: null,
      receivedImagesData: [] // 存储接收到的图片数据的数组
    }
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0]
    },
    uploadFile() {
      if (this.selectedFile) {
        this.addImage(this.selectedFile)
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.error(error)
          })
      }
    },
    addImage(file) {
      const formData = new FormData()
      formData.append('file', file) // 将文件字段名设置为'image'
      console.log(file)
      return addImage(formData, this.roomId)
    },
    connectWebSocket() {
      // console.log('Username:', username)
      const url = 'ws://localhost:18000/webSocket/' + this.sid + '/' + this.roomId
      this.websock = new WebSocket(url)
      this.websock.onopen = () => {
        this.websocketonopen()
      }
      this.websock.onerror = (e) => {
        this.websocketonerror(e)
      }
      this.websock.onmessage = (e) => {
        this.websocketonmessage(e)
      }
      this.websock.onclose = (e) => {
        this.websocketclose(e)
      }
    },
    disconnectWebSocket() {
      if (this.websock) {
        this.websock.close()
      }
    },
    websocketonopen() {
      this.isConnected = true
      console.log('WebSocket连接成功')
    },
    websocketonerror(e) {
      console.log('WebSocket连接发生错误', e)
      console.log('错误消息:', e.message) // 打印错误消息
    },
    websocketonmessage(e) {
      console.info(e.data)
      const jsonObject = JSON.parse(e.data)
      if (jsonObject.type === 'TEXT') {
        console.info(jsonObject)
        console.log('WebSocket以收到消息' + jsonObject.content)
        this.receivedMessages.push({
          id: jsonObject.id,
          type: jsonObject.type,
          content: jsonObject.content,
          timestamp: jsonObject.timestamp
        })
      } else if (jsonObject.type === 'IMAGE') {
        console.log(jsonObject.pathName)
        this.receivedMessages.push({
          id: jsonObject.id,
          type: jsonObject.type,
          imageUrl: 'http://localhost:18000' + '/file/' + jsonObject.pathName,
          timestamp: jsonObject.timestamp
        })
      }
      // console.log('调用(URL.createObjectURL')
      // const receivedData = e.data
      // this.receivedImagesData.push(URL.createObjectURL(receivedData))
    },
    websocketclose(e) {
      this.isConnected = false
      console.log('WebSocket连接已关闭', e)
    },
    addUserToChat() {
      adduser(this.roomId)
        .then((res) => {
          console.log('用户添加成功')
          // 处理成功的逻辑
        })
        .catch(error => {
          console.error('用户添加失败:', error)
          console.info(this.roomId)
          // 处理失败的逻辑
        })
    },
    sendMessageToBackend() {
      if (this.isConnected) {
        const message = '这是来自用户 ' + this.sid + ' 的消息:' + this.message
        this.websock.send(message)
        // this.websock.sendfile()
        console.log('消息已发送:', this.message)
        // this.sentMessages.push({ id: Date.now(), content: this.message })
      } else {
        console.log('WebSocket 连接未建立或已关闭')
      }
      const yourData = {
        roomId: this.roomId,
        content: this.message
      }
      addMessage(yourData)
        .then(response => {
          // 请求成功处理逻辑
          console.log('addMessage请求成功')
          console.log(response)
        })
        .catch(error => {
          // 请求失败处理逻辑
          console.log('addMessage请求失败')
          console.error(error)
        })
      this.message = '' // 清空输入框中的消息
    },
    findByRoomId() {
      findByRoomId(this.roomId)
        .then(response => {
          // 请求成功处理逻辑
          console.log('请求成功')
          console.log(response)

          // 将整个列表赋值给messages数组
          this.historyMessages = response
          console.log(this.historyMessages)
        })
        .catch(error => {
          // 请求失败处理逻辑
          console.log('请求失败')
          console.error(error)
        })
    },
    getOnlineUsersNum() {
      getOnlineUsersNum(this.roomId)
        .then(response => {
          // this.onlineMembers = Object.values(response.data)
          console.log(response)
        })
        .catch(error => {
          // 请求失败处理逻辑
          console.log('请求失败')
          console.error(error)
        })
    }
  }
}
</script>
