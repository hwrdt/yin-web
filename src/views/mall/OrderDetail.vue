<template>
  <div class="order-detail-page">
    <el-card v-if="order">
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-tag :type="getStatusType(order.status)">{{ order.statusDesc }}</el-tag>
        </div>
      </template>

      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-row">
          <span class="label">订单号:</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">创建时间:</span>
          <span class="value">{{ formatTime(order.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="label">收货人:</span>
          <span class="value">{{ order.receiverName }} {{ order.receiverPhone }}</span>
        </div>
        <div class="info-row">
          <span class="label">收货地址:</span>
          <span class="value">{{ order.receiverAddress }}</span>
        </div>
      </div>

      <!-- 订单商品 -->
      <div class="order-items">
        <div class="items-header">商品信息</div>
        <div v-for="item in order.items" :key="item.id" class="item-row">
          <img :src="item.productImage || '/placeholder.jpg'" alt="" class="item-image">
          <div class="item-info">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-price">¥{{ item.price }}</div>
          </div>
          <div class="item-quantity">{{ item.quantity }}件</div>
          <div class="item-total">¥{{ item.totalAmount }}</div>
        </div>
      </div>

      <!-- 订单金额 -->
      <div class="order-amount">
        <div class="amount-row">
          <span>商品总额:</span>
          <span>¥{{ order.totalAmount }}</span>
        </div>
        <div class="amount-row total">
          <span>实付金额:</span>
          <span class="pay-amount">¥{{ order.payAmount }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="order-actions">
        <el-button v-if="order.status === 0" type="primary" size="large" @click="payOrder">
          立即支付
        </el-button>
        <el-button v-if="order.status === 0" size="large" @click="cancelOrder">
          取消订单
        </el-button>
        <el-button v-if="order.status === 2" type="primary" size="large" @click="confirmReceipt">
          确认收货
        </el-button>
        <el-button v-if="order.status === 3" size="large" @click="goToReview">
          评价商品
        </el-button>
      </div>
    </el-card>

    <el-empty v-else description="订单不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMallStore } from '@/store/mall'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const mallStore = useMallStore()

const order = ref(null)

onMounted(async () => {
  await loadOrder()
})

async function loadOrder() {
  try {
    order.value = await mallStore.getOrderDetail(Number(route.params.id))
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  }
}

async function payOrder() {
  try {
    await mallStore.payOrder(order.value.id)
    ElMessage.success('支付成功')
    await loadOrder()
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

async function cancelOrder() {
  await ElMessageBox.confirm('确定取消订单吗？', '提示')
  try {
    await mallStore.cancelOrder(order.value.id)
    ElMessage.success('已取消')
    await loadOrder()
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

async function confirmReceipt() {
  await ElMessageBox.confirm('确定确认收货吗？', '提示')
  try {
    await mallStore.confirmReceipt(order.value.id)
    ElMessage.success('已确认收货')
    await loadOrder()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

function goToReview() {
  // 跳转到评价页面
}

function getStatusType(status) {
  const types = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'info'
  }
  return types[status] || 'info'
}

function formatTime(time) {
  return new Date(time).toLocaleString()
}
</script>

<style lang="scss" scoped>
.order-detail-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-info {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;

      .label {
        color: #666;
        width: 100px;
      }
    }
  }

  .order-items {
    .items-header {
      font-weight: 500;
      margin-bottom: 15px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 10px;

      .item-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        object-fit: cover;
      }

      .item-info {
        flex: 1;

        .item-name {
          margin-bottom: 5px;
        }

        .item-price {
          color: #ff6b6b;
        }
      }

      .item-quantity {
        color: #666;
      }

      .item-total {
        font-weight: bold;
        color: #ff6b6b;
      }
    }
  }

  .order-amount {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 20px;

    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      &.total {
        font-size: 18px;
        font-weight: bold;

        .pay-amount {
          color: #ff6b6b;
        }
      }
    }
  }

  .order-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>