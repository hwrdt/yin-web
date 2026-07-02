# 瘾-web - 短视频与电商平台前端

## 项目介绍

"瘾"前端应用，基于 Vue 3 + Vite + Element Plus 构建，提供短视频浏览、发布和商城购物功能。

## 技术栈

- **Vue 3.4.0** - 渐进式JavaScript框架
- **Vite 5.0.0** - 下一代前端构建工具
- **Element Plus 2.4.0** - Vue 3 UI组件库
- **Pinia 2.1.0** - Vue 3 状态管理
- **Vue Router 4.2.0** - Vue.js官方路由
- **Axios 1.6.0** - HTTP请求库
- **Sass 1.69.0** - CSS预处理器

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── main.js                # 应用入口
├── App.vue                # 根组件
├── router/
│   └── index.js           # 路由配置（含权限守卫）
├── store/
│   ├── user.js            # 用户状态管理
│   ├── video.js           # 视频状态管理
│   └── mall.js            # 商城状态管理
├── utils/
│   └── request.js         # Axios封装（请求/响应拦截）
├── assets/
│   └── styles/
│       └── main.scss      # 全局样式
├── components/            # 公共组件
└── views/
    ├── video/
    │   ├── Feed.vue       # 视频Feed流首页
    │   └── Upload.vue     # 视频上传
    ├── user/
    │   ├── Login.vue      # 登录
    │   ├── Register.vue   # 注册
    │   ├── Profile.vue    # 用户主页
    │   └── Settings.vue   # 个人设置
    └── mall/
        ├── Home.vue       # 商城首页
        ├── ProductDetail.vue  # 商品详情
        ├── Cart.vue       # 购物车
        ├── OrderList.vue  # 订单列表
        ├── OrderDetail.vue    # 订单详情
        └── AddressList.vue    # 地址管理
```

## 页面路由

| 路径 | 页面 | 描述 | 需登录 |
|------|------|------|--------|
| `/` | Feed | 短视频Feed流首页 | 否 |
| `/login` | Login | 用户登录 | 否 |
| `/register` | Register | 用户注册 | 否 |
| `/video/upload` | Upload | 视频上传 | 是 |
| `/user/:id` | Profile | 用户主页 | 否 |
| `/user/settings` | Settings | 个人设置 | 是 |
| `/mall` | Home | 商城首页 | 否 |
| `/mall/product/:id` | ProductDetail | 商品详情 | 否 |
| `/mall/cart` | Cart | 购物车 | 是 |
| `/mall/order` | OrderList | 订单列表 | 是 |
| `/mall/order/:id` | OrderDetail | 订单详情 | 是 |
| `/mall/address` | AddressList | 地址管理 | 是 |

## 状态管理

### UserStore
```javascript
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 状态
userStore.token          // JWT Token
userStore.userInfo       // 用户信息对象
userStore.isLoggedIn     // 是否已登录

// 方法
await userStore.login({ username, password })
await userStore.register({ username, password, nickname })
await userStore.getUserInfo(userId)
await userStore.updateUserInfo({ nickname, avatar, phone, email })
await userStore.followUser(userId)
await userStore.unfollowUser(userId)
userStore.logout()
```

### VideoStore
```javascript
import { useVideoStore } from '@/store/video'

const videoStore = useVideoStore()

// 状态
videoStore.feedList      // 视频列表
videoStore.currentIndex  // 当前视频索引
videoStore.currentVideo  // 当前视频对象

// 方法
await videoStore.getFeedList(page, size)
await videoStore.uploadVideo(formData)
await videoStore.getVideoDetail(videoId)
await videoStore.likeVideo(videoId)
await videoStore.unlikeVideo(videoId)
await videoStore.addComment(videoId, content)
await videoStore.getComments(videoId, page, size)
videoStore.nextVideo()
videoStore.prevVideo()
```

### MallStore
```javascript
import { useMallStore } from '@/store/mall'

const mallStore = useMallStore()

// 状态
mallStore.cartList       // 购物车列表
mallStore.categories     // 分类列表
mallStore.orderList      // 订单列表
mallStore.addresses      // 地址列表

// 商品方法
await mallStore.getProductList({ categoryId, page, size })
await mallStore.getProductDetail(productId)
await mallStore.searchProducts(keyword, page, size)

// 购物车方法
await mallStore.addToCart(productId, quantity)
await mallStore.updateCartQuantity(cartId, quantity)
await mallStore.updateCartSelected(cartId, selected)
await mallStore.deleteCartItem(cartId)
mallStore.getCartTotal()    // 计算选中商品总价
mallStore.getSelectedCartItems() // 获取选中商品

// 订单方法
await mallStore.createOrder(addressId, cartIds)
await mallStore.getOrderList(status, page, size)
await mallStore.getOrderDetail(orderId)
await mallStore.payOrder(orderId)
await mallStore.cancelOrder(orderId)
await mallStore.confirmReceipt(orderId)

// 地址方法
await mallStore.addAddress(addressData)
await mallStore.getAddressList()
await mallStore.updateAddress(addressId, addressData)
await mallStore.deleteAddress(addressId)
await mallStore.setDefaultAddress(addressId)

// 评价方法
await mallStore.addReview(reviewData)
```

## API请求

所有API请求通过 `src/utils/request.js` 封装：

```javascript
import request from '@/utils/request'

// 自动携带Token
request.get('/user/info')
request.post('/user/login', { username, password })
request.put('/user/info', { nickname })
request.delete('/user/follow/1')

// 文件上传
request.post('/video/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

**拦截器功能：**
- 请求拦截：自动添加 Authorization Header
- 响应拦截：统一处理错误，401自动跳转登录

## Vite配置

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
```

## 开发说明

### 添加新页面

1. 在 `src/views/` 下创建组件
2. 在 `src/router/index.js` 注册路由
3. 如需权限控制，添加 `meta: { requiresAuth: true }`

### 添加新API

1. 在对应Store中添加方法
2. 使用 `request` 调用后端API

### 添加全局样式

在 `src/assets/styles/main.scss` 中添加

## 注意事项

1. **Token存储**: Token存储在localStorage，刷新页面保持登录状态
2. **路由守卫**: 需登录的页面会自动跳转到登录页
3. **跨域处理**: 开发环境通过Vite proxy解决，生产环境需Nginx配置
4. **视频播放**: 使用原生HTML5 video元素

## 后端服务

- 用户服务: http://localhost:8081
- 视频服务: http://localhost:8082
- 商城服务: http://localhost:8083

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)