<template>
  <div class="profile-page">
    <!-- 用户信息头部 -->
    <el-card class="profile-header">
      <div class="user-info">
        <el-avatar :size="80" :src="userInfo?.avatar">
          {{ userInfo?.nickname?.charAt(0) }}
        </el-avatar>
        <div class="info-content">
          <div class="nickname">{{ userInfo?.nickname || userInfo?.username }}</div>
          <div class="stats">
            <span class="stat-item">
              <span class="stat-value">{{ userInfo?.followCount || 0 }}</span>
              <span class="stat-label">关注</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">{{ userInfo?.followerCount || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </span>
          </div>
          <div class="actions" v-if="isCurrentUser">
            <el-button type="primary" @click="goToSettings">编辑资料</el-button>
          </div>
          <div class="actions" v-else>
            <el-button
              :type="userInfo?.isFollowed ? 'default' : 'primary'"
              @click="handleFollow"
              :loading="followLoading"
            >
              {{ userInfo?.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 视频列表 -->
    <el-card class="video-list-card">
      <template #header>
        <span>作品</span>
      </template>

      <div class="video-grid" v-if="videoList.length > 0">
        <div v-for="video in videoList" :key="video.id" class="video-card" @click="viewVideo(video)">
          <div class="video-cover">
            <img :src="video.coverUrl || '/placeholder.jpg'" alt="">
            <div class="play-count">
              <el-icon><View /></el-icon>
              {{ formatCount(video.viewCount) }}
            </div>
          </div>
          <div class="video-title">{{ video.title || '无标题' }}</div>
        </div>
      </div>

      <el-empty v-else description="暂无作品" />

      <div class="load-more" v-if="hasMore">
        <el-button @click="loadMore" :loading="loading">加载更多</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useVideoStore } from '@/store/video'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const videoStore = useVideoStore()

const userInfo = ref(null)
const videoList = ref([])
const loading = ref(false)
const followLoading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

const userId = computed(() => Number(route.params.id))
const isCurrentUser = computed(() => userStore.userInfo?.id === userId.value)

onMounted(async () => {
  await loadUserInfo()
  await loadVideos()
})

async function loadUserInfo() {
  try {
    userInfo.value = await userStore.getUserInfo(userId.value)
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

async function loadVideos() {
  loading.value = true
  try {
    const res = await videoStore.getUserVideos(userId.value, currentPage.value, 12)
    videoList.value.push(...res.records)
    hasMore.value = res.records.length === 12
  } catch (error) {
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  currentPage.value++
  await loadVideos()
}

async function handleFollow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  followLoading.value = true
  try {
    if (userInfo.value.isFollowed) {
      await userStore.unfollowUser(userId.value)
      userInfo.value.isFollowed = false
      userInfo.value.followerCount--
      ElMessage.success('取消关注')
    } else {
      await userStore.followUser(userId.value)
      userInfo.value.isFollowed = true
      userInfo.value.followerCount++
      ElMessage.success('关注成功')
    }
  } finally {
    followLoading.value = false
  }
}

function goToSettings() {
  router.push('/user/settings')
}

function viewVideo(video) {
  // 跳转到视频详情页或打开弹窗
  router.push(`/?video=${video.id}`)
}

function formatCount(count) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
}
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .profile-header {
    margin-bottom: 20px;

    .user-info {
      display: flex;
      gap: 30px;

      .info-content {
        flex: 1;

        .nickname {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 15px;
        }

        .stats {
          display: flex;
          gap: 30px;
          margin-bottom: 15px;

          .stat-item {
            display: flex;
            gap: 5px;

            .stat-value {
              font-size: 18px;
              font-weight: 500;
            }

            .stat-label {
              font-size: 14px;
              color: #999;
            }
          }
        }
      }
    }
  }

  .video-list-card {
    .video-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .video-card {
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .video-cover {
          position: relative;
          aspect-ratio: 9/16;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .play-count {
            position: absolute;
            bottom: 10px;
            left: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            color: #fff;
            font-size: 14px;
          }
        }

        .video-title {
          padding: 10px;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .load-more {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
  }
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>