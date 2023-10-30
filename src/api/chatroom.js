import request from '@/utils/request'

export function adduser(roomId) {
  return request({
    url: 'api/newChatRoom/addUser/' + roomId,
    method: 'get'
  })
}

export function findByRoomId(roomId) {
  return request({
    url: 'api/newChatRoomMessage/findByRoomId/' + roomId,
    method: 'get'
  })
}

export function addMessage(data) {
  return request({
    url: 'api/newChatRoomMessage/',
    method: 'post',
    data
  })
}

export function addComment(data) {
  return request({
    url: 'api/newChatRoomComment/',
    method: 'post',
    data
  })
}

export function addImage(data, roomId) {
  return request({
    url: 'api/newChatRoomMessage/addImage/' + roomId,
    method: 'post',
    data
  })
}

export function getOnlineUsersNum(roomId) {
  return request({
    url: 'api/newChatRoom/getOnlineUsers/' + roomId,
    method: 'get'
  })
}

