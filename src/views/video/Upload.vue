<template>
  <div class="upload-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上传视频</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="视频文件" prop="video">
          <el-upload
            ref="videoUploadRef"
            class="video-upload"
            drag
            :auto-upload="false"
            :limit="1"
            accept="video/*"
            :on-change="handleVideoChange"
            :on-remove="handleVideoRemove"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽视频文件到这里或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 mp4、mov 等视频格式，文件大小不超过500MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="封面图片">
          <el-upload
            class="cover-upload"
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            :on-change="handleCoverChange"
            :on-remove="handleCoverRemove"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">建议尺寸: 720x1280</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入视频标题" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入视频描述"
            maxlength="2000"
            show-word-limit
            :rows="4"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="uploading">发布</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { ElMessage } from 'element-plus'

const router = useRouter()
const videoStore = useVideoStore()

const formRef = ref(null)
const videoUploadRef = ref(null)
const form = ref({
  title: '',
  description: ''
})
const rules = {
  title: [{ max: 200, message: '标题最长200个字符', trigger: 'blur' }]
}
const videoFile = ref(null)
const coverFile = ref(null)
const uploading = ref(false)

function handleVideoChange(file) {
  videoFile.value = file.raw
}

function handleVideoRemove() {
  videoFile.value = null
}

function handleCoverChange(file) {
  coverFile.value = file.raw
}

function handleCoverRemove() {
  coverFile.value = null
}

async function handleSubmit() {
  if (!videoFile.value) {
    ElMessage.warning('请选择视频文件')
    return
  }

  await formRef.value.validate()

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('video', videoFile.value)
    if (coverFile.value) {
      formData.append('cover', coverFile.value)
    }
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)

    await videoStore.uploadVideo(formData)
    ElMessage.success('发布成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    uploading.value = false
  }
}

function handleCancel() {
  router.back()
}
</script>

<style lang="scss" scoped>
.upload-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .card-header {
    font-size: 18px;
    font-weight: 500;
  }

  .video-upload {
    width: 100%;
  }
}
</style>