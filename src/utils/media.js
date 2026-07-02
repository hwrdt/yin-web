const MEDIA_PATH_PREFIXES = ['/upload/', '/uploads/', '/files/', '/media/', '/static/']
const VIDEO_SERVICE_URL = 'http://localhost:8082'

export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''

  const value = url.trim()
  if (!value) return ''
  // OSS URLs, data URLs, blob URLs - return directly
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  // Local video paths need to be proxied through video service
  if (value.startsWith('/videos/') || value.startsWith('/upload/videos/')) {
    // Use the Vite proxy path for video service
    return '/api/video' + value
  }

  if (value.startsWith('/')) return value

  const normalizedPath = `/${value}`
  if (MEDIA_PATH_PREFIXES.some(prefix => normalizedPath.startsWith(prefix))) {
    return normalizedPath
  }

  return normalizedPath
}

export function getDefaultVideoCover(video = {}) {
  const title = String(video.title || 'YIN').slice(0, 24)
  const seed = Number(video.id || 0)
  const hue = (seed * 47) % 360
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
      <text x="360" y="760" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="700" text-anchor="middle">${escapeSvg(title)}</text>
      <text x="360" y="835" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">YIN VIDEO</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function normalizeVideo(video = {}) {
  const user = video.user || video.author || {}
  const normalized = {
    ...video,
    id: video.id ?? video.videoId ?? video.video_id,
    userId: video.userId ?? video.user_id ?? video.authorId ?? video.author_id ?? user.id,
    username: video.username ?? video.nickname ?? user.nickname ?? user.username ?? '用户',
    userAvatar: normalizeMediaUrl(video.userAvatar ?? video.user_avatar ?? video.avatar ?? user.avatar),
    videoUrl: normalizeMediaUrl(video.videoUrl ?? video.video_url ?? video.url ?? video.fileUrl ?? video.file_url ?? video.playUrl ?? video.play_url ?? video.path),
    coverUrl: normalizeMediaUrl(video.coverUrl ?? video.cover_url ?? video.cover ?? video.thumbnail ?? video.poster ?? video.imageUrl ?? video.image_url),
    title: video.title ?? video.name ?? '',
    description: video.description ?? video.desc ?? '',
    likeCount: Number(video.likeCount ?? video.like_count ?? video.likes ?? 0),
    commentCount: Number(video.commentCount ?? video.comment_count ?? video.comments ?? 0),
    collectCount: Number(video.collectCount ?? video.collect_count ?? video.favorites ?? 0),
    shareCount: Number(video.shareCount ?? video.share_count ?? video.shares ?? 0),
    viewCount: Number(video.viewCount ?? video.view_count ?? video.views ?? video.playCount ?? video.play_count ?? 0),
    isLiked: Boolean(video.isLiked ?? video.liked ?? false),
    isCollected: Boolean(video.isCollected ?? video.collected ?? false),
    isFollowed: Boolean(video.isFollowed ?? video.followed ?? false),
    musicName: video.musicName ?? video.music_name ?? null,
    createdAt: video.createdAt ?? video.created_at ?? video.createTime ?? video.create_time
  }

  if (!normalized.coverUrl) {
    normalized.coverUrl = getDefaultVideoCover(normalized)
  }

  return normalized
}

export function normalizeVideoPage(data = {}) {
  const records = Array.isArray(data)
    ? data
    : data.records || data.list || data.content || data.items || data.videos || []

  return {
    ...data,
    records: records.map(normalizeVideo),
    total: data.total ?? data.totalElements ?? data.count ?? records.length,
    page: data.page ?? data.current ?? data.pageNum,
    size: data.size ?? data.pageSize
  }
}

function escapeSvg(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
