import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/news',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/news/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/news',
    method: 'put',
    data
  })
}

export function test(params) {
  return request({
    url: '/api/news/getNewsByStarRoom',
    method: 'get',
    params
  })
}

export function test2(params) {
  return request({
    url: '/api/news/newsUserLike',
    method: 'post',
    params
  })
}

export function getNewsPost(params) {
  return request({
    url: '/api/newsPost/newsId',
    method: 'get',
    params
  })
}
export default { add, edit, del }
