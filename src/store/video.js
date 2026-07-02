import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useVideoStore = defineStore('video', () => {
  const feedList = ref([])
  const currentIndex = ref(0)
  const currentVideo = computed(() => feedList.value[currentIndex.value] || null)

  // 获取视频Feed流
  async function getFeedList(page = 1, size = 10) {
    const res = await request.get('/video/feed', { params: { page, size } })
    if (page === 1) {
      feedList.value = res.data.records
    } else {
      feedList.value.push(...res.data.records)
    }
    return res.data
  }

  // 上传视频
  async function uploadVideo(formData) {
    const res = await request.post('/video/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }

  // 获取视频详情
  async function getVideoDetail(videoId) {
    const res = await request.get(`/video/${videoId}`)
    return res.data
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
    return res.data
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

  return {
    feedList,
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