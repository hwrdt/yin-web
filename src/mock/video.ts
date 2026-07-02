import Mock from 'mockjs'

// 示例视频数据 - 使用数组便于动态添加
const videoList = [
  {
    id: 1,
    userId: 101,
    username: '创意达人',
    userAvatar: 'https://picsum.photos/100/100?random=1',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    coverUrl: 'https://picsum.photos/400/700?random=1',
    title: '创意短视频分享',
    description: '记录生活中的美好瞬间 #创意 #生活',
    likeCount: 1234,
    commentCount: 89,
    collectCount: 56,
    shareCount: 12,
    isLiked: false,
    isCollected: false,
    isFollowed: false,
    musicName: '原创音乐-美好生活',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 102,
    username: '旅行摄影师',
    userAvatar: 'https://picsum.photos/100/100?random=2',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    coverUrl: 'https://picsum.photos/400/700?random=2',
    title: '环游世界第100天',
    description: '今天来到了美丽的海边，阳光正好 #旅行 #摄影',
    likeCount: 5678,
    commentCount: 234,
    collectCount: 189,
    shareCount: 45,
    isLiked: true,
    isCollected: false,
    isFollowed: true,
    musicName: '旅行之歌',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    userId: 103,
    username: '美食博主',
    userAvatar: 'https://picsum.photos/100/100?random=3',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    coverUrl: 'https://picsum.photos/400/700?random=3',
    title: '今日美食分享',
    description: '自制创意蛋糕教程，简单又好吃 #美食 #烘焙',
    likeCount: 9999,
    commentCount: 567,
    collectCount: 888,
    shareCount: 123,
    isLiked: false,
    isCollected: true,
    isFollowed: false,
    musicName: '快乐的烹饪时光',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    userId: 104,
    username: '健身教练',
    userAvatar: 'https://picsum.photos/100/100?random=4',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    coverUrl: 'https://picsum.photos/400/700?random=4',
    title: '每天10分钟练出马甲线',
    description: '坚持就是胜利 #健身 #运动',
    likeCount: 23456,
    commentCount: 1234,
    collectCount: 999,
    shareCount: 234,
    isLiked: false,
    isCollected: false,
    isFollowed: false,
    musicName: '动感健身音乐',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 5,
    userId: 105,
    username: '萌宠日记',
    userAvatar: 'https://picsum.photos/100/100?random=5',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    coverUrl: 'https://picsum.photos/400/700?random=5',
    title: '我家猫咪又搞怪了',
    description: '每天都被它萌到 #萌宠 #猫咪',
    likeCount: 45678,
    commentCount: 2345,
    collectCount: 1234,
    shareCount: 567,
    isLiked: true,
    isCollected: true,
    isFollowed: true,
    musicName: '可爱猫咪主题曲',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
]

// 用户上传的视频存储
let userVideos = []
let nextId = 100

function mockCoverUrl(id, title = 'YIN') {
  const hue = (id * 47) % 360
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue}, 72%, 45%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 80) % 360}, 70%, 32%)"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#bg)"/>
      <circle cx="360" cy="520" r="96" fill="rgba(255,255,255,0.18)"/>
      <path d="M330 465 L430 520 L330 575 Z" fill="white" opacity="0.92"/>
      <text x="360" y="760" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="700" text-anchor="middle">${title}</text>
      <text x="360" y="835" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">YIN VIDEO</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

// 评论数据
const comments = [
  {
    id: 1,
    userId: 201,
    username: '热心网友',
    userAvatar: 'https://picsum.photos/100/100?random=10',
    content: '太棒了！学到了很多',
    createdAt: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 2,
    userId: 202,
    username: '创意小白',
    userAvatar: 'https://picsum.photos/100/100?random=11',
    content: '请问这个是怎么做的呀？',
    createdAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 3,
    userId: 203,
    username: '资深达人',
    userAvatar: 'https://picsum.photos/100/100?random=12',
    content: '我也想做类似的，有教程吗？',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
]

export default [
  // 获取视频Feed流 - 包含用户上传的视频
  {
    url: '/api/video/feed',
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query.page) || 1
      const size = parseInt(query.size) || 10
      // 合并系统视频和用户上传的视频，用户视频优先显示
      const allVideos = [...userVideos, ...videoList]
      const start = (page - 1) * size
      const records = allVideos.slice(start, start + size)
      return {
        code: 200,
        message: 'success',
        data: {
          records,
          total: allVideos.length,
          page,
          size
        }
      }
    }
  },
  // 上传视频
  {
    url: '/api/video/upload',
    method: 'post',
    response: ({ body }) => {
      const id = nextId++
      const title = body.title || '我的新视频'
      // 创建新的视频记录
      const newVideo = {
        id,
        userId: 1,
        username: '测试用户',
        userAvatar: 'https://picsum.photos/100/100?random=100',
        // 由于是 mock，使用示例视频 URL
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        coverUrl: mockCoverUrl(id, title),
        title,
        description: body.description || '',
        likeCount: 0,
        commentCount: 0,
        collectCount: 0,
        shareCount: 0,
        viewCount: 0,
        isLiked: false,
        isCollected: false,
        isFollowed: false,
        musicName: null,
        createdAt: new Date().toISOString()
      }
      // 添加到用户视频列表
      userVideos.unshift(newVideo)
      return {
        code: 200,
        message: '上传成功',
        data: newVideo
      }
    }
  },
  // 获取用户视频列表
  {
    url: '/api/video/user/:id',
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query.page) || 1
      const size = parseInt(query.size) || 10
      const userId = parseInt(query.id)
      const allVideos = [...userVideos, ...videoList].filter(video => video.userId === userId)
      const start = (page - 1) * size
      const records = allVideos.slice(start, start + size)
      return {
        code: 200,
        message: 'success',
        data: {
          records,
          total: allVideos.length,
          page,
          size
        }
      }
    }
  },
  // 获取视频详情
  {
    url: '/api/video/:id',
    method: 'get',
    response: ({ query }) => {
      const video = videoList.find(v => v.id === parseInt(query.id))
      return {
        code: 200,
        message: 'success',
        data: video || null
      }
    }
  },
  // 点赞视频
  {
    url: '/api/video/:id/like',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '点赞成功'
      }
    }
  },
  // 取消点赞
  {
    url: '/api/video/:id/like',
    method: 'delete',
    response: () => {
      return {
        code: 200,
        message: '取消点赞成功'
      }
    }
  },
  // 收藏视频
  {
    url: '/api/video/:id/collect',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '收藏成功'
      }
    }
  },
  // 取消收藏
  {
    url: '/api/video/:id/collect',
    method: 'delete',
    response: () => {
      return {
        code: 200,
        message: '取消收藏成功'
      }
    }
  },
  // 获取评论列表
  {
    url: '/api/video/:id/comments',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          records: comments,
          total: comments.length
        }
      }
    }
  },
  // 发表评论
  {
    url: '/api/video/:id/comment',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '评论成功'
      }
    }
  },
  // 关注用户 - 修复路径匹配
  {
    url: '/api/user/follow/:id',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '关注成功'
      }
    }
  },
  // 取消关注 - 修复路径匹配
  {
    url: '/api/user/follow/:id',
    method: 'delete',
    response: () => {
      return {
        code: 200,
        message: '取消关注成功'
      }
    }
  },
  // 用户登录
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 200,
        message: 'success',
        data: {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            id: 1,
            nickname: '测试用户',
            avatar: 'https://picsum.photos/100/100?random=100',
            email: body.email || 'test@example.com'
          }
        }
      }
    }
  },
  // 获取用户信息
  {
    url: '/api/user/info/:id',
    method: 'get',
    response: ({ query }) => {
      return {
        code: 200,
        message: 'success',
        data: {
          id: parseInt(query.id) || 1,
          nickname: '测试用户',
          username: 'testuser',
          avatar: 'https://picsum.photos/100/100?random=100',
          email: 'test@example.com',
          followCount: 12,
          followerCount: 34
        }
      }
    }
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          id: 1,
          nickname: '测试用户',
          avatar: 'https://picsum.photos/100/100?random=100',
          email: 'test@example.com'
        }
      }
    }
  }
]
