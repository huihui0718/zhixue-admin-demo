import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/chatRoom1',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/chatRoom1/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/chatRoom1',
    method: 'put',
    data
  })
}

export function addImage(data, params) {
  return request({
    url: 'api/newChatRoomMessage/addImage',
    method: 'post',
    data,
    params
  })
}

export default { add, edit, del }
