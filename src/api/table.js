import request from '@/utils/request'

// 获取后台报表数据
export function getList(params) {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}
