import request from '@/utils/request'

export function add(data, module) {
  return request({
    url: 'api/chat?module=' + module,
    method: 'post',
    data
  })
}

export function getHistory(roomId, data) {
  return request({
    url: 'api/chat/page/' + roomId,
    method: 'get',
    params: data
  })
}

export function del(ids) {
  return request({
    url: 'api/chat/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/chat',
    method: 'put',
    data
  })
}

export default { add, edit, del }
