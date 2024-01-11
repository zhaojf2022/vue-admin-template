import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

// NProgress 进度条显示的配置
NProgress.configure({ showSpinner: false })

// 不需要重定向的白名单
const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  // 启动进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 获取token，判断用户是否已登录
  const hasToken = getToken()

  // 如果已登录（有token）
  if (hasToken) {
    if (to.path === '/login') {
      // 如果访问登录页面，重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断用户是否通过getInof获得了他的角色访问权限
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          // 注意：角色必须是一个对象数组! 例如: ['admin'] 或 ['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // 根据角色生成可访问的路由映射
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // 确保 addRoutes 完成
          // 设置replace=true，这样导航就不会留下历史记录
          next({ ...to, replace: true })
        } catch (error) {
          // 重置token并转到登录页重新登录
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 没有token（未登录）*/

    // 如果是白名单（登录），则直接访问
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 没有权限访问页面，重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
