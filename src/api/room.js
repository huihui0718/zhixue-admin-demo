import request from '@/utils/request'

export function addRoom(data) {
  return request({
    url: 'api/chatroom/',
    method: 'post',
    data
  })
}

export function getRoomHistory() {
  return request({
    url: 'api/chatroom/',
    method: 'get'
  })
}
export function delRoom(data) {
  return request({
    url: 'api/chatroom/',
    method: 'delete',
    data
  })
}

export function editRoom(data) {
  return request({
    url: 'api/chatroom/',
    method: 'put',
    data
  })
}

export function Test1(data) {
  return request({
    url: 'api/chatmessage/Test/1?search=111&sort=desc',
    method: 'get',
    params: data
  })
}
