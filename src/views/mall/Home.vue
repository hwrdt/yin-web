<template>
  <div class="mall-home">
    <!-- 顶部导航 -->
    <div class="mall-header">
      <div class="header-left">
        <span class="logo">瘾商城</span>
      </div>
      <div class="header-center">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-icon @click="handleSearch"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="header-right">
        <el-button @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          购物车
          <el-badge v-if="cartCount > 0" :value="cartCount" />
        </el-button>
        <el-button @click="goToOrders">我的订单</el-button>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :class="{ active: currentCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-list">
      <div class="product-grid">
        <div v-for="product in productList" :key="product.id" class="product-card" @click="goToProduct(product.id)">
          <div class="product-image">
            <img :src="product.mainImage || '/placeholder.jpg'" alt="">
          </div>
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
          </div>
        </div>
      </div>

      <el-empty v-if="productList.length === 0" description="暂无商品" />

      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMallStore } from '@/store/mall'

const router = useRouter()
const mallStore = useMallStore()

const searchKeyword = ref('')
const categories = ref([])
const productList = ref([])
const currentCategoryId = ref(null)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const cartCount = computed(() => mallStore.cartList.length)

onMounted(async () => {
  await loadCategories()
  await loadProducts()
  await mallStore.getCartList()
})

watch(currentCategoryId, async () => {
  currentPage.value = 1
  await loadProducts()
})

async function loadCategories() {
  categories.value = await mallStore.getCategories()
  // 添加"全部"选项
  categories.value.unshift({ id: null, name: '全部' })
}

async function loadProducts() {
  const res = await mallStore.getProductList({
    categoryId: currentCategoryId.value,
    page: currentPage.value,
    size: pageSize.value
  })
  productList.value = res.records
  total.value = res.total
}

function selectCategory(categoryId) {
  currentCategoryId.value = categoryId
}

function handleSearch() {
  if (searchKeyword.value) {
    router.push(`/mall?search=${searchKeyword.value}`)
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadProducts()
}

function goToProduct(productId) {
  router.push(`/mall/product/${productId}`)
}

function goToCart() {
  router.push('/mall/cart')
}

function goToOrders() {
  router.push('/mall/order')
}
</script>

<style lang="scss" scoped>
.mall-home {
  min-height: 100vh;
  background: #f5f5f5;

  .mall-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: #fff;
    border-bottom: 1px solid #eee;

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }

    .search-input {
      width: 400px;
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }

  .category-nav {
    display: flex;
    gap: 20px;
    padding: 15px 20px;
    background: #fff;
    margin-bottom: 20px;

    .category-item {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f5f5;
      }

      &.active {
        background: #667eea;
        color: #fff;
      }
    }
  }

  .product-list {
    padding: 20px;

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .product-card {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .product-image {
          aspect-ratio: 1;
          background: #f5f5f5;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .product-info {
          padding: 15px;

          .product-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .product-desc {
            font-size: 14px;
            color: #999;
            margin-bottom: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .product-price {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .current-price {
              font-size: 18px;
              font-weight: bold;
              color: #ff6b6b;
            }

            .original-price {
              font-size: 14px;
              color: #999;
              text-decoration: line-through;
            }
          }

          .product-stats {
            display: flex;
            gap: 20px;
            font-size: 12px;
            color: #999;
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
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>