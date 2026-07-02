import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'
import { normalizeVideo, normalizeVideoPage } from '@/utils/media'
import { useUserStore } from '@/store/user'

export const useVideoStore = defineStore('video', () => {
  const feedList = ref([])
  const localUploadedVideos = ref([])
  const currentIndex = ref(0)
  const currentVideo = computed(() => feedList.value[currentIndex.value] || null)

  // 获取视频Feed流
  async function getFeedList(page = 1, size = 10) {
    const res = await request.get('/video/feed', { params: { page, size } })
    const pageData = normalizeVideoPage(res.data)
    if (page === 1) {
      feedList.value = mergeVideos(localUploadedVideos.value, pageData.records)
    } else {
      feedList.value = mergeVideos(feedList.value, pageData.records)
    }
    pageData.records = feedList.value
    return pageData
  }

  // 上传视频
  async function uploadVideo(formData) {
    const res = await request.post('/video/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const uploadedVideo = createUploadedVideo(formData, res.data)
    localUploadedVideos.value = mergeVideos([uploadedVideo], localUploadedVideos.value)
    feedList.value = mergeVideos(localUploadedVideos.value, feedList.value)
    return uploadedVideo
  }

  // 获取视频详情
  async function getVideoDetail(videoId) {
    const res = await request.get(`/video/${videoId}`)
    return normalizeVideo(res.data)
  }

  // 点赞视频
  async function likeVideo(videoId) {
    await request.post(`/video/${videoId}/like`)
  }

  // 取消点赞
  async function unlikeVideo(videoId) {
    await request.delete(`/video/${videoId}/like`)
  }

  // 发表评论
  async function addComment(videoId, content) {
    const res = await request.post(`/video/${videoId}/comment`, { videoId, content })
    return res.data
  }

  // 获取评论列表
  async function getComments(videoId, page = 1, size = 10) {
    const res = await request.get(`/video/${videoId}/comments`, { params: { page, size } })
    return res.data
  }

  // 获取用户视频列表
  async function getUserVideos(userId, page = 1, size = 10) {
    const res = await request.get(`/video/user/${userId}`, { params: { page, size } })
    const pageData = normalizeVideoPage(res.data)
    const userUploadedVideos = localUploadedVideos.value.filter(video => String(video.userId) === String(userId))
    pageData.records = page === 1 ? mergeVideos(userUploadedVideos, pageData.records) : pageData.records
    return pageData
  }

  // 下一个视频
  function nextVideo() {
    if (currentIndex.value < feedList.value.length - 1) {
      currentIndex.value++
    } else {
      // 加载更多
      getFeedList(Math.ceil(feedList.value.length / 10) + 1)
    }
  }

  // 上一个视频
  function prevVideo() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  // 重置
  function reset() {
    feedList.value = []
    currentIndex.value = 0
  }

  function createUploadedVideo(formData, data) {
    const userStore = useUserStore()
    const source = data && typeof data === 'object' ? data : {}
    const videoFile = formData.get('video')
    const coverFile = formData.get('cover')
    const videoObjectUrl = getObjectUrl(videoFile)
    const coverObjectUrl = getObjectUrl(coverFile)
    const userInfo = userStore.userInfo || {}

    return normalizeVideo({
      ...source,
      id: source.id ?? source.videoId ?? source.video_id ?? `local-${Date.now()}`,
      userId: source.userId ?? source.user_id ?? userInfo.id,
      username: source.username ?? source.nickname ?? userInfo.nickname ?? userInfo.username ?? '我',
      userAvatar: source.userAvatar ?? source.user_avatar ?? source.avatar ?? userInfo.avatar,
      videoUrl: source.videoUrl ?? source.video_url ?? source.url ?? source.fileUrl ?? source.file_url ?? videoObjectUrl,
      coverUrl: source.coverUrl ?? source.cover_url ?? source.cover ?? source.thumbnail ?? source.poster ?? coverObjectUrl,
      title: source.title ?? formData.get('title') ?? videoFile?.name ?? '我的新视频',
      description: source.description ?? formData.get('description') ?? '',
      likeCount: source.likeCount ?? source.like_count ?? 0,
      commentCount: source.commentCount ?? source.comment_count ?? 0,
      collectCount: source.collectCount ?? source.collect_count ?? 0,
      shareCount: source.shareCount ?? source.share_count ?? 0,
      viewCount: source.viewCount ?? source.view_count ?? 0,
      createdAt: source.createdAt ?? source.created_at ?? new Date().toISOString()
    })
  }

  function getObjectUrl(file) {
    if (!file || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return ''
    if (typeof Blob !== 'undefined' && file instanceof Blob) {
      return URL.createObjectURL(file)
    }
    return ''
  }

  function mergeVideos(primary, secondary) {
    const seen = new Set()
    return [...primary, ...secondary].filter(video => {
      if (!video) return false
      const key = video.id == null ? video.videoUrl : video.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  return {
    feedList,
    localUploadedVideos,
    currentIndex,
    currentVideo,
    getFeedList,
    uploadVideo,
    getVideoDetail,
    likeVideo,
    unlikeVideo,
    addComment,
    getComments,
    getUserVideos,
    nextVideo,
    prevVideo,
    reset
  }
})
