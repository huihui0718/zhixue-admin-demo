<template>
  <div class="app-container">
    <div class="sound">
      <textarea id="" v-model="text" name="" cols="30" rows="10" placeholder="点击按钮开始说话，您的语音将会被转为文本，请允许浏览器获取麦克风权限" />
      <div class="btn">
        <button @click="startSpeechRecognition()">开始识别</button>
        <button @click="closeWebsocket()">停止识别</button>
      </div>
    </div>
  </div>
</template>

<script>

import { jsRecorder } from '@/api/record'

export default {
  data() {
    return {
      text: '', // 识别文本
      isRecording: false,
      websocket: null, // websocket定义
      recStart: null, // 开始录音
      recStop: null// 结束录音
    }
  },
  created() {
    // 使用 jsRecorder 创建一个对象并进行解构操作
    const callback = (blob, encTime) => {
      // 发送音频blob
      if (this.websocket && this.isRecording) {
        this.websocket.send(blob)
      }
    }
    const recorder = jsRecorder(callback)
    // 开始录音、结束录音方法
    this.recStart = recorder.recStart
    this.recStop = recorder.recStop
  },
  methods: {
    startSpeechRecognition() {
      // 判断麦克风是否打开
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        // 调用websocket方法
        // 如果需要加一些图片验证或者其他验证在这里加一些逻辑，成功之后调用websocket
        this.isRecording = true
        // 调用录音方法
        this.recStart()
        this.asrWebSocket()
      }).catch(error => {
        this.$message.error('麦克风未打开！')
        // 麦克风未打开
        switch (error.message || error.name) {
          case 'PERMISSION_DENIED':
          case 'PermissionDeniedError':
            console.info('用户拒绝提供信息。')
            break
          case 'NOT_SUPPORTED_ERROR':
          case 'NotSupportedError':
            console.info('浏览器不支持硬件设备。')
            break
          case 'MANDATORY_UNSATISFIED_ERROR':
          case 'MandatoryUnsatisfiedError':
            console.info('无法发现指定的硬件设备。')
            break
          default:
            console.info('无法打开麦克风。异常信息:' + (error.code || error.name))
            break
        }
      })
    },
    asrWebSocket() {
      // 使用后端提供的地址
      const url = 'ws://127.0.0.1:18000/webSocket/1/1'
      // new 一个websocket
      this.websocket = new WebSocket(url)
      console.log(this.websocket, 'new websocket')
      this.websocket.onopen = () => {
        console.log('连接成功')
        // 链接成功之后发送websocket请求参数
        this.sendStart()
      }
      // 客户端接收服务端返回的数据
      this.websocket.onmessage = (evt) => {
        this.text += evt.data
        // if (evt.data) {
        //   const obj = JSON.parse(evt.data)
        //   console.log('websocket-asr返回的数据：', obj)
        //   // 返回的数据看后端返回的是怎么样的，这是我的一些举例
        //   if (obj.type === 'server_error') {
        //     if (obj.error_msg.code === '10002') {
        //       // 参数缺失
        //     } else if (obj.error_msg.code === '10003') {
        //       // 鉴权失败，包括非法的appkey，余额不足等情况
        //     }
        //   } else if (obj.type === 'partial_result') {
        //     // 实时结果返回 转成文字
        //     this.text = obj.content + ' '
        //   } else if (obj.type === 'onebox_header') {
        //     // 服务端发送对话结果前，会发送onebox_header通知消息。收到消息后，客户端需要准备对后续收到的websocket binary数据进行gzip解压得到字符串，并解析为json，为本轮对话结果
        //   } else if (obj.type === 'slience') {
        //     // slience server端监测到静音后
        //   } else if (obj.type === 'speech_end') {
        //     // 服务端在解码结束后，会发送speech_end，并将最终结果存放在content字段。
        //     // 监测到end后调用停止方法
        //     this.closeWebsocket()
        //   } else if (obj.type === 'result_end') {
        //     // 服务端在本轮结束时，会发送result_end通知消息，客户端close websocket连接
        //     // 非连续对话在这返回 continuous_decoding
        //   } else if (obj.type === 'server_error') {
        //     // 当发生异常或输入不合法时，服务器会发送server error消息
        //   }
        // }
      }
      this.websocket.onerror = (evt) => {
        console.error('websocket-asr错误：', evt)
        // todo 重连机制触发
      }
      // 关闭连接
      this.websocket.onclose = (evt) => {
        console.log('websocket-asr关闭：', evt)
      }
    },
    // 请求参数 =====看后端提供的参数信息========
    sendStart() {
      this.websocket.send(JSON.stringify({
        signal: 'start',
        contentType: 'audio/x-wav;codec=pcm;bit=16;rate=16000', // 音频格式,支持pcm、wav
        partial_result: 'enable', // 是否需要解码中间结果，通常只在实时语音识别场景中使用。
        silence_detection: 'disable' // 是否开启服务端静音监测，一般建议开启。
      }))
    },
    // 关闭websocket
    closeWebsocket() {
      // 关闭录音
      this.recStop()
      this.isRecording = false
      // websocket关闭参数
      this.websocket.send(
        JSON.stringify({
          signal: 'end'
        })
      )
    }
  }
}
</script>
<style  scoped>
.sound {
  width: 100%;
  height: 140px;
  textarea {
    width: 90%;
    resize: none;
    outline: none;
    border-radius: 8px;
    padding: 0 32px;
    padding-top: 28px;
  }
  .btn{
    display: flex;
  }
  button {
    width: 226px;
    height: 42px;
    background: #3583FB;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-family: PingFang-SC-Regular, PingFang-SC;
    font-weight: 400;
    color: #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    cursor: pointer;

  }
}
</style>
