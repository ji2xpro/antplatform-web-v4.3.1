import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Vue from 'vue'

NProgress.configure({ showSpinner: false }) // NProgress Configuration / 禁止右侧加载时转圈的动画

const whiteList = ['/login', '/auth-redirect', '/register'] // no redirect whitelist / 白名单

router.beforeEach(async(to, from, next) => {
  // start progress bar / 启动进度条
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)
  // if (Vue.$t) {
  //   document.title = `${getPageTitle(to.meta.title)}-${Vue.$t('platform.title')}`
  // }

  // determine whether the user has logged in / 从 Cookie 获取 Token
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page / 如果当前路径为 login 则直接重定向至首页即/dashboard
      next({ path: '/' }) // 再次触发 beforeEach，to.path === '/dashboard'，执行下面的else
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo / 判断用户的角色是否存在
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) { // 如果用户角色存在，则直接访问
        next()
      } else {
        try {
          // get user info / 异步获取用户的角色
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor'] / 角色是一个对象中的数组，如:'xxtoken': { roles: ['admin','editor']}, 所以通过 { roles } 获取角色
          const { roles, menus, auth } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles / 根据用户角色，动态生成路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes / 调用 router.addRoutes 动态添加路由，把不符合条件的路由清除，最后和原来的路由合并形成新的路由表
          router.addRoutes(accessRoutes)
          
          const accessResourcesRoutes = await store.dispatch('permission/generateResourcesRoutes', menus)
          router.addRoutes(accessResourcesRoutes)

          //缓存权限
          await store.dispatch('permission/generateAuth', auth)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record / 使用 replace 访问路由，不会在 history 中留下记录，这样回退不会回到 login 页面
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login / 错误处理, 清除 Token 数据，回到登录页重新登录
          await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          Message.error({
            type: 'error',
            message: error || "出现错误，请稍后再试"
          })
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // has no token / 没有token的情况

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly / 如果访问的 URL 在白名单中，则直接访问
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page. / 如果访问的 URL 不在白名单中，则直接重定向到登录页面，并将访问的 URL 添加到 redirect 参数中
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar / 设置进度条动画完成
  NProgress.done()
})
