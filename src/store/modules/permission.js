import router, { asyncRoutes, constantRoutes } from '@/router'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * 递归组装路由表，返回符合用户角色权限的路由表（路由表后台配置时使用）
 * @param resources
 */
function assembleAsyncRoutes(resources) {
  const accessedRouters = []

  resources.forEach(resource => {
    var route = {}
    if (resource.url.indexOf('Layout') >= 0) {
      var redirect = '/'
      if (resource.children[0].url.indexOf('nested') >= 0) {
        redirect = resource.children[0].children[0].url
      } else {
        redirect = resource.children[0].url
      }
      route = {
        path: '/' + resource.path,
        component: Layout,
        redirect: '/' + redirect,
        name: resource.name,
        alwaysShow: true,
        meta: {
          title: resource.icon,
          icon: resource.icon
        }
      }
      // console.log(resource.path + '=====++++++' + redirect)
    } else if (resource.url.indexOf('nested') >= 0 && resource.children && resource.children.length) { // 包含子菜单的二级以下菜单
      route = {
        path: resource.path,
        component: (resolve) => require([`@/views/${resource.url}`], resolve),
        redirect: '/' + resource.children[0].url,
        name: resource.name,
        alwaysShow: true,
        meta: {
          title: resource.icon,
          noCache: !resource.isCache,
          icon: resource.icon
        },
        hidden: !!resource.isDelete
      }
      // console.log(resource.path + '=====' + resource.children[0].url)
    } else { // 最后一层菜单
      route = {
        path: resource.path,
        component: (resolve) => require([`@/views/${resource.url}`], resolve),
        name: resource.name,
        meta: {
          title: resource.icon,
          noCache: !resource.isCache,
          icon: resource.icon
        },
        hidden: !!resource.isDelete
      }
    }

    if (resource.children && resource.children.length) {
      route.children = assembleAsyncRoutes(resource.children)
    }
    accessedRouters.push(route)
  })
  return accessedRouters
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表enerator
 * @param {*} routers 
 * @returns 
 */
 export const generator = (routers) => {
  return routers.map(router => {
    const currentRouter = {
      // 如果路由是主目录，则作为默认 /path，否则 路由地址 只是path
      path: router.url.indexOf('Layout') >= 0 && `/${router.path}` || `${router.path}`,
      // 路由名称，建议唯一
      name: router.name || '',
      // 该路由对应页面的组件: (动态加载)
      component: (router.url.indexOf('Layout') >= 0 && Layout) || ((resolve) => require([`@/views/${router.url}`], resolve)),
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: router.icon,
        noCache: !router.isCache,
        icon: router.icon || undefined,
      },
      hidden: !!router.isDelete
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    // if (!currentRouter.path.startsWith('http')) {
    //   currentRouter.path = currentRouter.path.replace('//', '/')
    // }
    // 重定向
    if (router.url.indexOf('Layout') >= 0 || router.url.indexOf('nested') >= 0) {
      currentRouter.redirect = `/`+ getRediret(router)
      currentRouter.alwaysShow = true
    }
    // 是否有子菜单，并递归处理
    if (router.children && router.children.length > 0) {
      // Recursion
      currentRouter.children = generator(router.children)
    }
    return currentRouter
  })
}

/**
 * 递归获取重定向路径
 * 
 * @param {*} resource 
 * @returns 
 */
function getRediret(resource) {
  if (resource.children && resource.children.length > 0) {
    return getRediret(resource.children[0])
  }
  return resource.url
}

const state = {
  routes: [],
  addRoutes: [],
  btns: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_BTNS: (state, btns) => {
    state.btns = btns
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  generateResourcesRoutes({ commit }, resources) {
    return new Promise(resolve => {
      let accessedRoutes
      if (resources && resources.length > 0) {
        // console.log('routers:'+JSON.stringify(generator(resources)))
        accessedRoutes = asyncRoutes.concat(generator(resources))

        // console.log('routers:'+JSON.stringify(assembleAsyncRoutes(resources)))
        // accessedRoutes = asyncRoutes.concat(assembleAsyncRoutes(resources))
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, [])
      }
      accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  generateAuth({commit},auth){
    commit('SET_BTNS', auth)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
