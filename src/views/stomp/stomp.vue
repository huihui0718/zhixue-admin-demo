<template>
  <div class="app-container">
    <button @click="connectStomp">测试</button>
  </div>
</template>

<script>
import { Test1 } from '@/api/room'
export default {
  data() {
    return {
    }
  },
  beforeUnmount() {
    this.disconnect()
  },
  methods: {
    connectStomp() {
      const data = {
        page: '0',
        size: '10',
        sort: 'id,desc'
      }
      Test1(data).then(res => {
        console.log(res)
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
