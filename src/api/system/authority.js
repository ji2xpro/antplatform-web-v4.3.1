import request from '@/utils/request'

export function getList(param) {
  return request({
    url: '/authority/list',
    method: 'get',
    data: param
  })
}

export function queryRoleAuth(roleId) {
  return request({
    url: '/authority/role/' + roleId,
    method: 'get'
  })
}

export function save(data) {
  return request({
    url: '/authority/save',
    method: 'post',
    data
  })
}

export function drop(id) {
  return request({
    url: '/authority/delete/' + id,
    method: 'post'
  })
}
