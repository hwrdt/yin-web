<template>
  <div class="order-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的订单</span>
        </div>
      </template>

      <!-- 状态筛选 -->
      <div class="status-tabs">
        <el-radio-group v-model="currentStatus" @change="handleStatusChange">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button :value="0">待支付</el-radio-button>
          <el-radio-button :value="1">已支付</el-radio-button>
          <el-radio-button :value="2">已发货</el-radio-button>
          <el-radio-button :value="3">已完成</el-radio-button>
        </el-radio-group>
      </div>

      <div class="order-list" v-if="orderList.length > 0">
        <div v-for="order in orderList" :key="order.id" class="order-item" @click="goToOrder(order.id)">
          <div class="order-header">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            <el-tag :type="getStatusType(order.status)">{{ order.statusDesc }}</el-tag>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <img :src="item.productImage || '/placeholder.jpg'" alt="" class="item-image">
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <span class="order-total">共 {{ order.items?.length || 0 }} 件商品，合计: ¥{{ order.totalAmount }}</span>
            <div class="order-actions">
              <el-button v-if="order.status === 0" type="primary" size="small" @click.stop="payOrder(order.id)">
                支付
              </el-button>
              <el-button v-if="order.status === 0" size="small" @click.stop="cancelOrder(order.id)">
                取消
              </el-button>
              <el-button v-if="order.status === 2" type="primary" size="small" @click.stop="confirmReceipt(order.id)">
                确认收货
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无订单" />

      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMallStore } from '@/store/mall'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const mallStore = useMallStore()

const orderList = computed(() => mallStore.orderList)
const currentStatus = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

import { computed } from 'vue'

onMounted(async () => {
  await loadOrders()
})

watch(currentStatus, async () => {
  currentPage.value = 1
  await loadOrders()
})

async function loadOrders() {
  const res = await mallStore.getOrderList(currentStatus.value, currentPage.value, pageSize.value)
  total.value = res.total
}

function handleStatusChange() {
  loadOrders()
}

function handlePageChange(page) {
  currentPage.value = page
  loadOrders()
}

function goToOrder(orderId) {
  router.push(`/mall/order/${orderId}`)
}

async function payOrder(orderId) {
  try {
    await mallStore.payOrder(orderId)
    ElMessage.success('支付成功')
    await loadOrders()
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

async function cancelOrder(orderId) {
  await ElMessageBox.confirm('确定取消订单吗？', '提示')
  try {
    await mallStore.cancelOrder(orderId)
    ElMessage.success('已取消')
    await loadOrders()
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

async function confirmReceipt(orderId) {
  await ElMessageBox.confirm('确定确认收货吗？', '提示')
  try {
    await mallStore.confirmReceipt(orderId)
    ElMessage.success('已确认收货')
    await loadOrders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
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
.order-list-page {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;

  .status-tabs {
    margin-bottom: 20px;
  }

  .order-list {
    .order-item {
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 15px;
      cursor: pointer;

      .order-header {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px 8px 0 0;

        .order-no {
          font-weight: 500;
        }

        .order-time {
          color: #999;
        }
      }

      .order-items {
        padding: 15px;

        .item-row {
          display: flex;
          gap: 15px;
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
        }
      }

      .order-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px;
        border-top: 1px solid #eee;

        .order-total {
          color: #666;
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
  }
}
</style>