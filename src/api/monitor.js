import request from '@/utils/request'
import qs from 'qs'

export function getServerData() {
  return request({
    url: 'server/monitor',
    method: 'get'
  })
}

export function getCacheData() {
  return request({
    url: 'cache/monitor',
    method: 'get'
  })
}

export function download(url, params) {
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method: 'get',
    responseType: 'blob'
  })
}
