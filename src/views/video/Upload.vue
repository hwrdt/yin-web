<template>
  <div class="upload-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发布视频</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="视频文件" prop="video">
          <div class="video-upload-wrapper">
            <el-upload
              ref="videoUploadRef"
              class="video-upload"
              drag
              :auto-upload="false"
              :limit="1"
              accept="video/*"
              :on-change="handleVideoChange"
              :on-remove="handleVideoRemove"
              :show-file-list="false"
            >
              <div v-if="!videoPreview" class="upload-area">
                <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
                <div class="upload-text">
                  <p>点击或拖拽视频文件到这里上传</p>
                  <p class="upload-tip">支持 mp4、mov、avi 等格式，最大 500MB</p>
                </div>
              </div>
              <div v-else class="preview-area">
                <video :src="videoPreview" class="video-preview" controls></video>
                <div class="preview-overlay">
                  <el-button type="danger" size="small" @click.stop="removeVideo">
                    <el-icon><Delete /></el-icon>
                    删除视频
                  </el-button>
                </div>
              </div>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="封面图片">
          <div class="cover-upload-wrapper">
            <el-upload
              class="cover-upload"
              :auto-upload="false"
              :limit="1"
              accept="image/*"
              :on-change="handleCoverChange"
              :on-remove="handleCoverRemove"
              :show-file-list="false"
            >
              <div v-if="!coverPreview" class="cover-upload-btn">
                <el-icon :size="32"><Plus /></el-icon>
                <span>添加封面</span>
              </div>
              <div v-else class="cover-preview">
                <img :src="coverPreview" alt="封面预览" />
                <div class="cover-overlay">
                  <el-icon :size="20"><Delete /></el-icon>
                </div>
              </div>
            </el-upload>
            <p class="cover-tip">建议尺寸: 720x1280，不上传则自动截取视频画面</p>
          </div>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="给视频起个吸引人的标题吧"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="添加更多描述，让更多人看到你的内容..."
            maxlength="500"
            show-word-limit
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="话题标签">
          <div class="tags-wrapper">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              effect="plain"
              class="tag-item"
            >
              #{{ tag }}
            </el-tag>
            <el-input
              v-if="showTagInput"
              ref="tagInputRef"
              v-model="newTag"
              size="small"
              class="tag-input"
              @keyup.enter="addTag"
              @blur="addTag"
              placeholder="输入标签"
            />
            <el-button v-else size="small" class="add-tag-btn" @click="showTagInput = true">
              + 添加标签
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="谁可以看">
          <el-radio-group v-model="form.visibility">
            <el-radio value="public">公开 - 所有人可见</el-radio>
            <el-radio value="private">私密 - 仅自己可见</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <div class="submit-actions">
            <el-button type="primary" size="large" @click="handleSubmit" :loading="uploading">
              <el-icon v-if="!uploading"><Check /></el-icon>
              {{ uploading ? '发布中...' : '立即发布' }}
            </el-button>
            <el-button size="large" @click="handleCancel">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const videoStore = useVideoStore()
const userStore = useUserStore()

const formRef = ref(null)
const videoUploadRef = ref(null)
const tagInputRef = ref(null)

const form = ref({
  title: '',
  description: '',
  tags: [],
  visibility: 'public'
})

const rules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { max: 100, message: '标题最长100个字符', trigger: 'blur' }
  ]
}

const videoFile = ref(null)
const coverFile = ref(null)
const videoPreview = ref('')
const coverPreview = ref('')
const uploading = ref(false)
const showTagInput = ref(false)
const newTag = ref('')

function handleVideoChange(file) {
  videoFile.value = file.raw
  // 创建本地预览
  videoPreview.value = URL.createObjectURL(file.raw)
}

function handleVideoRemove() {
  videoFile.value = null
  if (videoPreview.value) {
    URL.revokeObjectURL(videoPreview.value)
    videoPreview.value = ''
  }
}

function removeVideo() {
  handleVideoRemove()
}

function handleCoverChange(file) {
  coverFile.value = file.raw
  coverPreview.value = URL.createObjectURL(file.raw)
}

function handleCoverRemove() {
  coverFile.value = null
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
    coverPreview.value = ''
  }
}

function addTag() {
  if (newTag.value && !form.value.tags.includes(newTag.value)) {
    form.value.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  showTagInput.value = false
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

async function handleSubmit() {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再发布视频')
    router.push('/login')
    return
  }

  // 检查视频文件
  if (!videoFile.value) {
    ElMessage.warning('请选择要上传的视频文件')
    return
  }

  // 验证表单
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('video', videoFile.value)
    if (coverFile.value) {
      formData.append('cover', coverFile.value)
    }
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('tags', JSON.stringify(form.value.tags))
    formData.append('visibility', form.value.visibility)

    await videoStore.uploadVideo(formData)
    ElMessage.success('视频发布成功！')

    // 清理预览 URL
    handleVideoRemove()
    handleCoverRemove()

    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('发布失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

function handleCancel() {
  // 清理预览 URL
  handleVideoRemove()
  handleCoverRemove()
  router.back()
}
</script>

<style lang="scss" scoped>
.upload-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .card-header {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .video-upload-wrapper {
    width: 100%;
    background: #f8f9fa;
    border-radius: 12px;
    overflow: hidden;

    .video-upload {
      width: 100%;

      :deep(.el-upload-dragger) {
        border: none;
        background: transparent;
        width: 100%;
        height: auto;
        min-height: 200px;
      }
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: #e9ecef;
      }

      .upload-icon {
        color: #667eea;
        margin-bottom: 16px;
      }

      .upload-text {
        text-align: center;
        color: #666;

        p {
          margin: 0;
          font-size: 16px;
        }

        .upload-tip {
          font-size: 13px;
          color: #999;
          margin-top: 8px;
        }
      }
    }

    .preview-area {
      position: relative;
      width: 100%;
      max-width: 400px;
      margin: 20px auto;

      .video-preview {
        width: 100%;
        border-radius: 8px;
        background: #000;
      }

      .preview-overlay {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }

  .cover-upload-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .cover-upload {
      :deep(.el-upload) {
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        cursor: pointer;
        transition: border-color 0.3s ease;

        &:hover {
          border-color: #667eea;
        }
      }
    }

    .cover-upload-btn {
      width: 120px;
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #999;

      span {
        font-size: 12px;
      }
    }

    .cover-preview {
      width: 120px;
      height: 160px;
      position: relative;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
        }

        .el-icon {
          color: #fff;
          cursor: pointer;
        }
      }
    }

    .cover-tip {
      font-size: 12px;
      color: #999;
    }
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .tag-item {
      background: #f0f2ff;
      color: #667eea;
      border: none;
    }

    .tag-input {
      width: 100px;
    }

    .add-tag-btn {
      border-color: #dcdfe6;
      color: #666;
    }
  }

  .submit-actions {
    display: flex;
    gap: 16px;
    padding-top: 10px;

    .el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 12px 32px;
      font-size: 16px;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .upload-page {
    margin: 0;
    padding: 10px;

    :deep(.el-form-item__label) {
      width: 80px !important;
    }

    .video-upload-wrapper .upload-area {
      padding: 40px 15px;
    }
  }
}
</style>