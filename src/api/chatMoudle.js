import request from '@/utils/request'

export function addChatModule(data) {
  return request({
    url: 'api/chatModule',
    method: 'post',
    data
  })
}

export function getChatModule() {
  return request({
    url: 'api/chatModule',
    method: 'get'
  })
}

export function delChatModule(data) {
  return request({
    url: 'api/chatModule',
    method: 'delete',
    data
  })
}

export function editChatModule(data) {
  return request({
    url: 'api/chatModule',
    method: 'put',
    data
  })
}

