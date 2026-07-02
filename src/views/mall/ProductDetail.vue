<template>
  <div class="product-detail-page">
    <el-card v-if="product">
      <div class="product-content">
        <!-- 商品图片 -->
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage || product.mainImage || '/placeholder.jpg'" alt="">
          </div>
          <div class="image-list" v-if="product.images?.length > 0">
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="image-item"
              :class="{ active: currentImage === image }"
              @click="currentImage = image"
            >
              <img :src="image" alt="">
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-desc" v-if="product.description">{{ product.description }}</div>

          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
          </div>

          <div class="product-stats">
            <span>销量 {{ product.sales }}</span>
            <span>库存 {{ product.stock }}</span>
          </div>

          <div class="category-info">
            分类: {{ product.categoryName || '未分类' }}
          </div>

          <div class="quantity-selector">
            <span>数量:</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              size="large"
            />
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" @click="addToCart">
              加入购物车
            </el-button>
            <el-button type="danger" size="large" @click="buyNow">
              立即购买
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="商品不存在" />

    <!-- 商品评价 -->
    <el-card class="review-card" v-if="product">
      <template #header>
        <span>商品评价</span>
      </template>
      <el-empty description="暂无评价" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMallStore } from '@/store/mall'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const mallStore = useMallStore()
const userStore = useUserStore()

const product = ref(null)
const currentImage = ref('')
const quantity = ref(1)

onMounted(async () => {
  await loadProduct()
})

async function loadProduct() {
  try {
    product.value = await mallStore.getProductDetail(Number(route.params.id))
    currentImage.value = product.value.mainImage
  } catch (error) {
    ElMessage.error('获取商品详情失败')
  }
}

async function addToCart() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await mallStore.addToCart(product.value.id, quantity.value)
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  }
}

async function buyNow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await mallStore.addToCart(product.value.id, quantity.value)
    router.push('/mall/cart')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .product-content {
    display: flex;
    gap: 40px;

    .product-gallery {
      width: 500px;

      .main-image {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .image-list {
        display: flex;
        gap: 10px;
        margin-top: 10px;

        .image-item {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;

          &.active {
            border-color: #667eea;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .product-info {
      flex: 1;

      .product-name {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 15px;
      }

      .product-desc {
        font-size: 14px;
        color: #999;
        margin-bottom: 20px;
      }

      .product-price {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;

        .current-price {
          font-size: 32px;
          font-weight: bold;
          color: #ff6b6b;
        }

        .original-price {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
        }
      }

      .product-stats {
        display: flex;
        gap: 30px;
        margin-bottom: 20px;
        color: #999;
      }

      .category-info {
        margin-bottom: 20px;
        color: #666;
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 30px;
      }

      .action-buttons {
        display: flex;
        gap: 20px;
      }
    }
  }

  .review-card {
    margin-top: 20px;
  }
}
</style>