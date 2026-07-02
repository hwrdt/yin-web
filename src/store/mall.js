import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useMallStore = defineStore('mall', () => {
  const cartList = ref([])
  const categories = ref([])
  const orderList = ref([])
  const addresses = ref([])

  // 获取分类列表
  async function getCategories() {
    const res = await request.get('/mall/categories')
    categories.value = res.data
    return res.data
  }

  // 获取商品列表
  async function getProductList(params) {
    const res = await request.get('/mall/products', { params })
    return res.data
  }

  // 获取商品详情
  async function getProductDetail(productId) {
    const res = await request.get(`/mall/product/${productId}`)
    return res.data
  }

  // 搜索商品
  async function searchProducts(keyword, page = 1, size = 10) {
    const res = await request.get('/mall/products/search', { params: { keyword, page, size } })
    return res.data
  }

  // 添加购物车
  async function addToCart(productId, quantity = 1) {
    const res = await request.post('/mall/cart', { productId, quantity })
    await getCartList()
    return res.data
  }

  // 获取购物车列表
  async function getCartList() {
    const res = await request.get('/mall/cart')
    cartList.value = res.data
    return res.data
  }

  // 更新购物车数量
  async function updateCartQuantity(cartId, quantity) {
    const res = await request.put(`/mall/cart/${cartId}`, null, { params: { quantity } })
    await getCartList()
    return res.data
  }

  // 更新购物车选中状态
  async function updateCartSelected(cartId, selected) {
    await request.put(`/mall/cart/${cartId}/selected`, null, { params: { selected } })
    await getCartList()
  }

  // 删除购物车项
  async function deleteCartItem(cartId) {
    await request.delete(`/mall/cart/${cartId}`)
    await getCartList()
  }

  // 清空购物车
  async function clearCart() {
    await request.delete('/mall/cart')
    cartList.value = []
  }

  // 创建订单
  async function createOrder(addressId, cartIds) {
    const res = await request.post('/mall/order', { addressId, cartIds })
    await getCartList()
    return res.data
  }

  // 获取订单列表
  async function getOrderList(status, page = 1, size = 10) {
    const res = await request.get('/mall/order', { params: { status, page, size } })
    orderList.value = res.data.records
    return res.data
  }

  // 获取订单详情
  async function getOrderDetail(orderId) {
    const res = await request.get(`/mall/order/${orderId}`)
    return res.data
  }

  // 支付订单
  async function payOrder(orderId) {
    await request.put(`/mall/order/${orderId}/pay`)
  }

  // 取消订单
  async function cancelOrder(orderId) {
    await request.put(`/mall/order/${orderId}/cancel`)
  }

  // 确认收货
  async function confirmReceipt(orderId) {
    await request.put(`/mall/order/${orderId}/confirm`)
  }

  // 添加地址
  async function addAddress(data) {
    const res = await request.post('/mall/address', data)
    await getAddressList()
    return res.data
  }

  // 获取地址列表
  async function getAddressList() {
    const res = await request.get('/mall/address')
    addresses.value = res.data
    return res.data
  }

  // 获取地址详情
  async function getAddressDetail(addressId) {
    const res = await request.get(`/mall/address/${addressId}`)
    return res.data
  }

  // 更新地址
  async function updateAddress(addressId, data) {
    const res = await request.put(`/mall/address/${addressId}`, data)
    await getAddressList()
    return res.data
  }

  // 删除地址
  async function deleteAddress(addressId) {
    await request.delete(`/mall/address/${addressId}`)
    await getAddressList()
  }

  // 设置默认地址
  async function setDefaultAddress(addressId) {
    await request.put(`/mall/address/${addressId}/default`)
    await getAddressList()
  }

  // 添加评价
  async function addReview(data) {
    await request.post('/mall/review', data)
  }

  // 计算购物车总价
  function getCartTotal() {
    return cartList.value
      .filter(item => item.selected === 1)
      .reduce((total, item) => total + Number(item.totalAmount), 0)
  }

  // 获取选中的购物车项
  function getSelectedCartItems() {
    return cartList.value.filter(item => item.selected === 1)
  }

  return {
    cartList,
    categories,
    orderList,
    addresses,
    getCategories,
    getProductList,
    getProductDetail,
    searchProducts,
    addToCart,
    getCartList,
    updateCartQuantity,
    updateCartSelected,
    deleteCartItem,
    clearCart,
    createOrder,
    getOrderList,
    getOrderDetail,
    payOrder,
    cancelOrder,
    confirmReceipt,
    addAddress,
    getAddressList,
    getAddressDetail,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addReview,
    getCartTotal,
    getSelectedCartItems
  }
})