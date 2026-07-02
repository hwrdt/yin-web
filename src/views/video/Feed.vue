<template>
  <div class="video-feed">
    <!-- 顶部导航 -->
    <div class="feed-header">
      <div class="header-left">
        <span class="logo">瘾</span>
      </div>
      <div class="header-center">
        <el-menu mode="horizontal" :default-active="activeTab" @select="handleTabSelect">
          <el-menu-item index="video">短视频</el-menu-item>
          <el-menu-item index="mall">商城</el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="goToUpload" v-if="userStore.isLoggedIn">
          <el-icon><Plus /></el-icon>
          发布
        </el-button>
        <el-button @click="goToLogin" v-if="!userStore.isLoggedIn">登录</el-button>
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

    <!-- 视频区域 -->
    <div class="video-container" @wheel="handleWheel" ref="videoContainer">
      <div class="video-wrapper" :style="{ transform: `translateY(-${currentIndex * 100}vh)` }">
        <div v-for="(video, index) in videoStore.feedList" :key="video.id" class="video-item">
          <video
            :src="video.videoUrl"
            :poster="video.coverUrl"
            loop
            playsinline
            ref="videoRefs"
            @click="togglePlay(index)"
          ></video>

          <!-- 视频信息 -->
          <div class="video-info">
            <div class="user-info" @click="goToUser(video.userId)">
              <el-avatar :size="40" :src="video.userAvatar">
                {{ video.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ video.username }}</span>
              <el-button
                size="small"
                :type="video.isFollowed ? 'default' : 'primary'"
                @click.stop="handleFollow(video)"
                v-if="userStore.isLoggedIn && video.userId !== userStore.userInfo?.id"
              >
                {{ video.isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>
            <div class="video-title" v-if="video.title">{{ video.title }}</div>
            <div class="video-desc" v-if="video.description">{{ video.description }}</div>
          </div>

          <!-- 互动按钮 -->
          <div class="video-actions">
            <div class="action-item" @click="handleLike(video)">
              <el-icon :size="32" :color="video.isLiked ? '#ff6b6b' : '#fff'">
                <component :is="video.isLiked ? 'HeartFilled' : 'Heart'" />
              </el-icon>
              <span>{{ formatCount(video.likeCount) }}</span>
            </div>
            <div class="action-item" @click="showComments(video)">
              <el-icon :size="32"><ChatDotRound /></el-icon>
              <span>{{ formatCount(video.commentCount) }}</span>
            </div>
            <div class="action-item">
              <el-icon :size="32"><Share /></el-icon>
              <span>分享</span>
            </div>
          </div>
        </div>
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
        <el-empty v-if="comments.length === 0" description="暂无评论" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useVideoStore } from '@/store/video'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const videoStore = useVideoStore()

const activeTab = ref('video')
const currentIndex = ref(0)
const videoRefs = ref([])
const showCommentDialog = ref(false)
const commentContent = ref('')
const comments = ref([])
const currentVideo = ref(null)

onMounted(async () => {
  await videoStore.getFeedList()
  await nextTick()
  playVideo(0)
})

watch(currentIndex, (newIndex) => {
  playVideo(newIndex)
})

function handleTabSelect(key) {
  if (key === 'mall') {
    router.push('/mall')
  }
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

function handleWheel(e) {
  if (e.deltaY > 0) {
    nextVideo()
  } else {
    prevVideo()
  }
}

function nextVideo() {
  if (currentIndex.value < videoStore.feedList.length - 1) {
    currentIndex.value++
    if (currentIndex.value >= videoStore.feedList.length - 3) {
      videoStore.getFeedList(Math.ceil(videoStore.feedList.length / 10) + 1)
    }
  }
}

function prevVideo() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function playVideo(index) {
  videoRefs.value.forEach((video, i) => {
    if (i === index) {
      video.play()
    } else {
      video.pause()
    }
  })
}

function togglePlay(index) {
  const video = videoRefs.value[index]
  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}

async function handleFollow(video) {
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
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
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
  height: 100vh;
  background: #000;
  position: relative;
}

.feed-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;

  .logo {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
  }

  .header-center {
    .el-menu {
      background: transparent;
      border: none;
      .el-menu-item {
        color: #fff;
        &.is-active {
          color: #fff;
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .header-right {
    display: flex;
    gap: 10px;
  }
}

.video-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.video-wrapper {
  transition: transform 0.3s ease;
}

.video-item {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .video-info {
    position: absolute;
    left: 20px;
    bottom: 80px;
    max-width: 60%;
    color: #fff;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      .username {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .video-title {
      font-size: 16px;
      margin-bottom: 8px;
    }

    .video-desc {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  .video-actions {
    position: absolute;
    right: 20px;
    bottom: 80px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      color: #fff;
      cursor: pointer;

      span {
        font-size: 12px;
      }
    }
  }
}

.comment-dialog {
  .comment-input {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .comment-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .comment-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;

    .comment-content {
      flex: 1;

      .comment-user {
        font-weight: 500;
        margin-bottom: 5px;
      }

      .comment-time {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
      }
    }
  }
}
</style>