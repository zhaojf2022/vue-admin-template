import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建一个axios 实例
const service = axios.create({
  // 定义基础地址，实际访问url = baseUrl + requestUrl
  // 使用环境变量 ‘VUE_APP_BASE_API’ 定义基础访问地址，部署时需要在服务器上进行配置
  baseURL: process.env.VUE_APP_BASE_API,
  // 跨域请求时发送cookie
  // withCredentials: true, 
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前做的事情
    if (store.getters.token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /*
   * 如果你希望获取携带header和status的http响应信息，
   * 请直接返回：return  response => response
   * 使用了自定义的状态码来做判断，仅作为示例，可以使用标准Http状态码
   */
  response => {
    const res = response.data

    // 自定义的正常返回状态码为20000（可调整）
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: 非法token; 50012: 已在其他客户端登录; 50014: token过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('你已经登出，请退出当前页面重新登录', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },

  error => {
    console.log('err' + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
