import request from '@/utils/request'

export function getList(param) {
  return request({
    url: '/menu/list',
    method: 'get',
    data: param
  })
}

export function save(data) {
  return request({
    url: '/menu/save',
    method: 'post',
    data
  })
}

export function drop(id) {
  return request({
    url: '/menu/delete/' + id,
    method: 'post'
  })
}
