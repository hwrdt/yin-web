<template>
  <div class="video-feed">
    <!-- 顶部导航 -->
    <div class="feed-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🔥</span>
          <span class="logo-text">瘾</span>
        </div>
      </div>
      <div class="header-center">
        <div class="tab-switcher">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'video' }"
            @click="activeTab = 'video'"
          >
            短视频
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'mall' }"
            @click="goToMall"
          >
            商城
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" class="upload-btn" @click="goToUpload" v-if="userStore.isLoggedIn">
          <el-icon><Plus /></el-icon>
          发布
        </el-button>
        <el-button class="login-btn" @click="goToLogin" v-if="!userStore.isLoggedIn">登录</el-button>
        <el-dropdown v-else @command="handleCommand">
          <el-avatar :size="36" :src="userStore.userInfo?.avatar">
            {{ userStore.userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人主页</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 视频卡片列表 -->
    <div class="video-list-container" ref="listContainer" @scroll="handleScroll">
      <div class="video-list">
        <div v-for="(video, index) in videoStore.feedList" :key="video.id" class="video-card">
          <!-- 视频区域 -->
          <div class="video-wrapper">
            <video
              :src="video.videoUrl"
              :poster="video.coverUrl"
              loop
              playsinline
              preload="metadata"
              :ref="el => setVideoRef(el, index)"
              @click="togglePlay(index)"
              @loadeddata="onVideoLoaded(index)"
              @error="onVideoError(index, $event)"
            ></video>

            <!-- 播放/暂停指示器 -->
            <div v-show="!playStates[index] && !loadingStates[index]" class="play-overlay" @click="togglePlay(index)">
              <div class="play-btn">
                <el-icon :size="48"><VideoPlay /></el-icon>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loadingStates[index]" class="loading-overlay">
              <el-icon class="loading-icon" :size="36"><Loading /></el-icon>
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-info">
            <!-- 用户信息 -->
            <div class="user-section">
              <div class="user-info" @click="goToUser(video.userId)">
                <el-avatar :size="40" :src="video.userAvatar">
                  {{ video.username?.charAt(0) }}
                </el-avatar>
                <div class="user-text">
                  <span class="username">{{ video.username }}</span>
                </div>
              </div>
              <el-button
                v-if="userStore.isLoggedIn && video.userId !== userStore.userInfo?.id"
                :type="video.isFollowed ? 'default' : 'primary'"
                size="small"
                round
                @click="handleFollow(video)"
              >
                {{ video.isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>

            <!-- 视频标题和描述 -->
            <div class="video-content">
              <div class="video-title" v-if="video.title">{{ video.title }}</div>
              <div class="video-desc" v-if="video.description">{{ video.description }}</div>
            </div>

            <!-- 互动按钮 -->
            <div class="video-actions">
              <div class="action-item" @click="handleLike(video)">
                <div class="action-icon" :class="{ liked: video.isLiked }">
                  <el-icon :size="24">
                    <component :is="video.isLiked ? 'HeartFilled' : 'Heart'" />
                  </el-icon>
                </div>
                <span>{{ formatCount(video.likeCount) }}</span>
              </div>
              <div class="action-item" @click="showComments(video)">
                <div class="action-icon">
                  <el-icon :size="24"><ChatDotRound /></el-icon>
                </div>
                <span>{{ formatCount(video.commentCount) }}</span>
              </div>
              <div class="action-item" @click="handleCollect(video)">
                <div class="action-icon" :class="{ collected: video.isCollected }">
                  <el-icon :size="24">
                    <component :is="video.isCollected ? 'StarFilled' : 'Star'" />
                  </el-icon>
                </div>
                <span>{{ formatCount(video.collectCount) }}</span>
              </div>
              <div class="action-item" @click="handleShare(video)">
                <div class="action-icon">
                  <el-icon :size="24"><Share /></el-icon>
                </div>
                <span>分享</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="loadingMore" class="loading-more">
          <el-icon class="loading-icon" :size="24"><Loading /></el-icon>
          <span>加载更多...</span>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="videoStore.feedList.length === 0 && !loadingMore" description="暂无视频内容">
          <el-button type="primary" @click="goToUpload" v-if="userStore.isLoggedIn">发布第一个视频</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 评论弹窗 -->
    <el-dialog v-model="showCommentDialog" title="评论" width="400px" class="comment-dialog">
      <div class="comment-input">
        <el-input
          v-model="commentContent"
          placeholder="发表评论..."
          @keyup.enter="submitComment"
        />
        <el-button type="primary" @click="submitComment" :disabled="!commentContent">发送</el-button>
      </div>
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <el-avatar :size="36" :src="comment.userAvatar">
            {{ comment.username?.charAt(0) }}
          </el-avatar>
          <div class="comment-content">
            <div class="comment-user">{{ comment.username }}</div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
          </div>
        </div>
        <el-empty v-if="comments.length === 0" description="暂无评论，快来抢沙发吧~" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useVideoStore } from '@/store/video'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const videoStore = useVideoStore()

const activeTab = ref('video')
const videoRefs = ref({})
const playStates = reactive({})
const loadingStates = reactive({})
const showCommentDialog = ref(false)
const commentContent = ref('')
const comments = ref([])
const currentVideo = ref(null)
const listContainer = ref(null)
const loadingMore = ref(false)

// 设置视频ref
function setVideoRef(el, index) {
  if (el) {
    videoRefs.value[index] = el
  }
}

// 视频加载完成
function onVideoLoaded(index) {
  loadingStates[index] = false
}

// 视频加载失败
function onVideoError(index, event) {
  loadingStates[index] = false
  console.error('视频加载失败:', event)
}

// 播放/暂停切换
function togglePlay(index) {
  const video = videoRefs.value[index]
  if (!video) return

  if (video.paused) {
    // 暂停其他视频
    Object.keys(videoRefs.value).forEach((i) => {
      if (parseInt(i) !== index) {
        const v = videoRefs.value[i]
        if (v && !v.paused) {
          v.pause()
          playStates[parseInt(i)] = false
        }
      }
    })

    video.play().then(() => {
      playStates[index] = true
    }).catch(err => {
      console.warn('播放失败:', err)
    })
  } else {
    video.pause()
    playStates[index] = false
  }
}

// 滚动加载更多
async function handleScroll() {
  if (!listContainer.value || loadingMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = listContainer.value
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadingMore.value = true
    try {
      await videoStore.getFeedList(Math.ceil(videoStore.feedList.length / 10) + 1)
    } catch (err) {
      console.error('加载更多失败:', err)
    }
    loadingMore.value = false
  }
}

onMounted(async () => {
  await videoStore.getFeedList()
})

onUnmounted(() => {
  // 清理所有视频播放
  Object.keys(videoRefs.value).forEach((i) => {
    const video = videoRefs.value[i]
    if (video) {
      video.pause()
    }
  })
})

function goToMall() {
  router.push('/mall')
}

function goToUpload() {
  router.push('/video/upload')
}

function goToLogin() {
  router.push('/login')
}

function goToUser(userId) {
  router.push(`/user/${userId}`)
}

function handleCommand(command) {
  if (command === 'profile') {
    router.push(`/user/${userStore.userInfo?.id}`)
  } else if (command === 'settings') {
    router.push('/user/settings')
  } else if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出成功')
  }
}

async function handleFollow(video) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (video.isFollowed) {
    await userStore.unfollowUser(video.userId)
    video.isFollowed = false
    ElMessage.success('取消关注')
  } else {
    await userStore.followUser(video.userId)
    video.isFollowed = true
    ElMessage.success('关注成功')
  }
}

async function handleLike(video) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (video.isLiked) {
    await videoStore.unlikeVideo(video.id)
    video.isLiked = false
    video.likeCount--
  } else {
    await videoStore.likeVideo(video.id)
    video.isLiked = true
    video.likeCount++
  }
}

async function handleCollect(video) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (video.isCollected) {
    video.isCollected = false
    video.collectCount--
    ElMessage.success('已取消收藏')
  } else {
    video.isCollected = true
    video.collectCount++
    ElMessage.success('已收藏')
  }
}

function handleShare(video) {
  if (navigator.share) {
    navigator.share({
      title: video.title || '分享视频',
      text: video.description,
      url: window.location.href
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    }).catch(() => {
      ElMessage.warning('分享功能暂不可用')
    })
  }
}

async function showComments(video) {
  currentVideo.value = video
  showCommentDialog.value = true
  const res = await videoStore.getComments(video.id)
  comments.value = res.records
}

async function submitComment() {
  if (!commentContent.value) return
  await videoStore.addComment(currentVideo.value.id, commentContent.value)
  commentContent.value = ''
  const res = await videoStore.getComments(currentVideo.value.id)
  comments.value = res.records
  currentVideo.value.commentCount++
  ElMessage.success('评论成功')
}

function formatCount(count) {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

function formatTime(time) {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前'
  return date.toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.video-feed {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.feed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 100;

  .logo {
    display: flex;
    align-items: center;
    gap: 4px;

    .logo-icon {
      font-size: 24px;
    }

    .logo-text {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .header-center {
    .tab-switcher {
      display: flex;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 24px;
      padding: 4px;

      .tab-item {
        padding: 8px 24px;
        border-radius: 20px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #666;

        &:hover {
          color: #333;
        }

        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
      }
    }
  }

  .header-right {
    display: flex;
    gap: 10px;

    .upload-btn {
      border-radius: 20px;
      font-weight: 500;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;

      &:hover {
        opacity: 0.9;
      }
    }

    .login-btn {
      border-radius: 20px;
    }
  }
}

.video-list-container {
  padding-top: 60px;
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.video-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.video-card {
  margin-bottom: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .video-wrapper {
    position: relative;
    width: 100%;
    max-height: 400px;
    background: #000;
    border-radius: 12px 12px 0 0;

    video {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      display: block;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);

      .play-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .el-icon {
          color: #fff;
        }
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);

      .loading-icon {
        color: #fff;
        animation: spin 1s linear infinite;
      }
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .video-info {
    padding: 16px;

    .user-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .el-avatar {
          margin-right: 12px;
        }

        .user-text {
          .username {
            font-size: 15px;
            font-weight: 600;
            color: #333;
          }
        }
      }
    }

    .video-content {
      margin-bottom: 16px;

      .video-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .video-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .video-actions {
      display: flex;
      gap: 24px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .action-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:active {
          transform: scale(0.95);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          .el-icon {
            color: #666;
            transition: all 0.3s ease;
          }

          &.liked {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);

            .el-icon {
              color: #fff;
              animation: pulse 0.3s ease;
            }
          }

          &.collected {
            background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);

            .el-icon {
              color: #fff;
            }
          }
        }

        span {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #999;

  .loading-icon {
    animation: spin 1s linear infinite;
  }
}

// 评论弹窗
.comment-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
  }

  :deep(.el-dialog__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-dialog__body) {
    padding: 16px 20px;
  }

  .comment-input {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    .el-input {
      flex: 1;
    }

    .el-button {
      border-radius: 20px;
    }
  }

  .comment-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .comment-content {
      flex: 1;

      .comment-user {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
        color: #333;
      }

      .comment-text {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }

      .comment-time {
        font-size: 12px;
        color: #999;
        margin-top: 6px;
      }
    }
  }
}

// 响应式适配
@media screen and (max-width: 768px) {
  .feed-header {
    padding: 0 12px;

    .logo {
      .logo-text {
        font-size: 24px;
      }
    }

    .header-center {
      .tab-switcher {
        .tab-item {
          padding: 6px 16px;
          font-size: 14px;
        }
      }
    }

    .header-right {
      .upload-btn, .login-btn {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
  }

  .video-list {
    padding: 12px;
  }

  .video-card {
    margin-bottom: 12px;
    border-radius: 8px;

    .video-wrapper {
      max-height: 300px;
      border-radius: 8px 8px 0 0;

      video {
        max-height: 300px;
      }
    }

    .video-info {
      padding: 12px;

      .video-actions {
        gap: 16px;

        .action-item {
          .action-icon {
            width: 36px;
            height: 36px;
          }

          span {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>