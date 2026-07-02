<template>
  <div class="cart-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>购物车</span>
          <el-button v-if="cartList.length > 0" @click="clearCart">清空购物车</el-button>
        </div>
      </template>

      <div class="cart-list" v-if="cartList.length > 0">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <el-checkbox
            v-model="item.selected"
            :true-value="1"
            :false-value="0"
            @change="handleSelectChange(item)"
          />

          <div class="product-image" @click="goToProduct(item.productId)">
            <img :src="item.productImage || '/placeholder.jpg'" alt="">
          </div>

          <div class="product-info" @click="goToProduct(item.productId)">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-price">¥{{ item.price }}</div>
          </div>

          <div class="quantity-control">
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="item.stock"
              size="small"
              @change="handleQuantityChange(item)"
            />
          </div>

          <div class="item-total">
            ¥{{ item.totalAmount }}
          </div>

          <el-button type="text" @click="deleteItem(item.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <el-empty v-else description="购物车为空" />

      <!-- 结算区域 -->
      <div class="cart-footer" v-if="cartList.length > 0">
        <div class="select-all">
          <el-checkbox
            v-model="allSelected"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
        </div>

        <div class="total-info">
          <span>已选 {{ selectedCount }} 件商品</span>
          <span class="total-price">合计: ¥{{ totalPrice.toFixed(2) }}</span>
        </div>

        <el-button type="primary" size="large" :disabled="selectedCount === 0" @click="handleCheckout">
          结算
        </el-button>
      </div>
    </el-card>

    <!-- 选择地址弹窗 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="500px">
      <div class="address-list">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          :class="{ active: selectedAddress?.id === address.id }"
          @click="selectedAddress = address"
        >
          <div class="address-info">
            <div class="receiver">{{ address.receiverName }} {{ address.receiverPhone }}</div>
            <div class="address-detail">{{ address.fullAddress }}</div>
          </div>
          <el-tag v-if="address.isDefault" type="primary" size="small">默认</el-tag>
        </div>
        <el-empty v-if="addresses.length === 0" description="暂无收货地址" />
      </div>
      <template #footer>
        <el-button @click="goToAddress">管理地址</el-button>
        <el-button type="primary" @click="createOrder" :disabled="!selectedAddress">
          确认下单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMallStore } from '@/store/mall'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const mallStore = useMallStore()

const cartList = computed(() => mallStore.cartList)
const selectedCount = computed(() => mallStore.getSelectedCartItems().length)
const totalPrice = computed(() => mallStore.getCartTotal())
const allSelected = computed({
  get: () => cartList.value.length > 0 && cartList.value.every(item => item.selected === 1),
  set: (val) => cartList.value.forEach(item => item.selected = val ? 1 : 0)
})

const showAddressDialog = ref(false)
const addresses = computed(() => mallStore.addresses)
const selectedAddress = ref(null)

onMounted(async () => {
  await mallStore.getCartList()
})

async function handleSelectChange(item) {
  await mallStore.updateCartSelected(item.id, item.selected)
}

async function handleSelectAll(val) {
  for (const item of cartList.value) {
    await mallStore.updateCartSelected(item.id, val ? 1 : 0)
  }
}

async function handleQuantityChange(item) {
  await mallStore.updateCartQuantity(item.id, item.quantity)
}

async function deleteItem(cartId) {
  await ElMessageBox.confirm('确定删除该商品吗？', '提示')
  await mallStore.deleteCartItem(cartId)
  ElMessage.success('删除成功')
}

async function clearCart() {
  await ElMessageBox.confirm('确定清空购物车吗？', '提示')
  await mallStore.clearCart()
  ElMessage.success('已清空')
}

async function handleCheckout() {
  await mallStore.getAddressList()
  if (mallStore.addresses.length === 0) {
    ElMessage.warning('请先添加收货地址')
    router.push('/mall/address')
    return
  }
  selectedAddress.value = mallStore.addresses.find(a => a.isDefault === 1) || mallStore.addresses[0]
  showAddressDialog.value = true
}

async function createOrder() {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  try {
    const cartIds = mallStore.getSelectedCartItems().map(item => item.id)
    await mallStore.createOrder(selectedAddress.value.id, cartIds)
    ElMessage.success('下单成功')
    showAddressDialog.value = false
    router.push('/mall/order')
  } catch (error) {
    ElMessage.error('下单失败')
  }
}

function goToProduct(productId) {
  router.push(`/mall/product/${productId}`)
}

function goToAddress() {
  showAddressDialog.value = false
  router.push('/mall/address')
}
</script>

<style lang="scss" scoped>
.cart-page {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cart-list {
    .cart-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border-bottom: 1px solid #eee;

      .product-image {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .product-info {
        flex: 1;
        cursor: pointer;

        .product-name {
          font-size: 16px;
          margin-bottom: 10px;
        }

        .product-price {
          color: #ff6b6b;
        }
      }

      .item-total {
        font-size: 18px;
        font-weight: bold;
        color: #ff6b6b;
        width: 100px;
        text-align: right;
      }
    }
  }

  .cart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 20px;

    .total-info {
      display: flex;
      gap: 20px;
      align-items: center;

      .total-price {
        font-size: 20px;
        font-weight: bold;
        color: #ff6b6b;
      }
    }
  }

  .address-list {
    .address-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;

      &.active {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .address-info {
        .receiver {
          font-weight: 500;
          margin-bottom: 5px;
        }

        .address-detail {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
}
</style>