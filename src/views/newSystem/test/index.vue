<template>
  <div class="app-container">
    <el-button @click="test">测试</el-button>
    <el-button @click="test2">测试四号推文</el-button>
    <el-button @click="test3">测试五号推文</el-button>
    <el-button @click="getNewsPost">ceshi</el-button>
    <el-button @click="getHistoryByRedis">查看历史信息</el-button>

  </div>
</template>

<script>
import { getHistoryByRedis, getNewsPost, test, test2 } from '@/api/news'
export default {
  name: 'Index',
  data() {
    return {
      query: {
        page: 0,
        size: 10,
        sort: 'news_like',
        order: 'desc',
        type: '',
        search: '知学',
        starRoomId: '1'
      },
      params1: {
        newsId: 4,
        isLiked: true
      },
      params2: {
        newsId: 5,
        isLiked: false
      },
      params3: {
        newsId: 6,
        isLiked: false
      },
      params4: {
        page: 0,
        size: 10,
        newsId: 6
      },
      getHistory: {
        page: 0,
        size: 10
        // start: null,
        // end: null
      }
    }
  },
  methods: {
    test() {
      test(this.query).then(res => {
        console.log(res.records)
      }).catch(err => {
        console.log(err)
      })
    },
    test2() {
      this.params1.isLiked = !this.params1.isLiked
      test2(this.params1).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    test3() {
      this.params2.isLiked = !this.params2.isLiked

      test2(this.params2).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    test4() {
      this.params3.isLiked = !this.params3.isLiked

      test2(this.params3).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    getNewsPost() {
      getNewsPost(this.params4).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    getHistoryByRedis() {
      // 获取当前时间的时间戳
      // this.getHistory.end = Date.now().toString().substring(16, 21)
      // const sevenDaysAgo = new Date()
      // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      // const sevenDaysAgoTimestamp = sevenDaysAgo.toString().substring(16, 21)
      // this.getHistory.start = sevenDaysAgoTimestamp
      getHistoryByRedis(this.getHistory).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
