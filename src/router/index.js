import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/video/Feed.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/video/upload',
    name: 'VideoUpload',
    component: () => import('@/views/video/Upload.vue'),
    meta: { title: '上传视频', requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { title: '用户主页' }
  },
  {
    path: '/user/settings',
    name: 'UserSettings',
    component: () => import('@/views/user/Settings.vue'),
    meta: { title: '个人设置', requiresAuth: true }
  },
  {
    path: '/mall',
    name: 'MallHome',
    component: () => import('@/views/mall/Home.vue'),
    meta: { title: '商城首页' }
  },
  {
    path: '/mall/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/mall/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/mall/cart',
    name: 'Cart',
    component: () => import('@/views/mall/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/mall/order',
    name: 'OrderList',
    component: () => import('@/views/mall/OrderList.vue'),
    meta: { title: '订单列表', requiresAuth: true }
  },
  {
    path: '/mall/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/mall/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/mall/address',
    name: 'AddressList',
    component: () => import('@/views/mall/AddressList.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 瘾` : '瘾 - 短视频与电商平台'

  // 检查登录状态
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router