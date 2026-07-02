<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <span>个人设置</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="头像">
          <el-avatar :size="80" :src="form.avatar">
            {{ form.nickname?.charAt(0) || userStore.userInfo?.username?.charAt(0) }}
          </el-avatar>
          <el-upload
            class="avatar-upload"
            :show-file-list="false"
            :auto-upload="false"
            accept="image/*"
            :on-change="handleAvatarChange"
          >
            <el-button size="small">更换头像</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="20" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关注/粉丝列表 -->
    <el-card class="follow-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="关注" name="following">
          <div class="user-list">
            <div v-for="user in followingList" :key="user.id" class="user-item" @click="goToUser(user.id)">
              <el-avatar :size="50" :src="user.avatar">
                {{ user.nickname?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="nickname">{{ user.nickname }}</div>
              </div>
            </div>
            <el-empty v-if="followingList.length === 0" description="暂无关注" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="粉丝" name="followers">
          <div class="user-list">
            <div v-for="user in followerList" :key="user.id" class="user-item" @click="goToUser(user.id)">
              <el-avatar :size="50" :src="user.avatar">
                {{ user.nickname?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="nickname">{{ user.nickname }}</div>
              </div>
            </div>
            <el-empty v-if="followerList.length === 0" description="暂无粉丝" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const form = ref({
  nickname: '',
  avatar: '',
  phone: '',
  email: ''
})
const rules = {
  nickname: [{ max: 100, message: '昵称最长100个字符', trigger: 'blur' }],
  phone: [{ max: 20, message: '手机号最长20个字符', trigger: 'blur' }],
  email: [
    { max: 100, message: '邮箱最长100个字符', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}
const saving = ref(false)
const activeTab = ref('following')
const followingList = ref([])
const followerList = ref([])

onMounted(async () => {
  if (userStore.userInfo) {
    form.value = {
      nickname: userStore.userInfo.nickname || '',
      avatar: userStore.userInfo.avatar || '',
      phone: userStore.userInfo.phone || '',
      email: userStore.userInfo.email || ''
    }
  }
  await loadFollowData()
})

async function loadFollowData() {
  // 这里需要从用户服务获取关注和粉丝列表
  // 简化处理，直接调用API
}

function handleAvatarChange(file) {
  // 处理头像上传，这里简化处理
  form.value.avatar = URL.createObjectURL(file.raw)
}

async function handleSave() {
  await formRef.value.validate()

  saving.value = true
  try {
    await userStore.updateUserInfo(form.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.back()
}

function goToUser(userId) {
  router.push(`/user/${userId}`)
}
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .avatar-upload {
    margin-left: 20px;
  }

  .follow-card {
    margin-top: 20px;

    .user-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .user-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.3s;

        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }
}
</style>