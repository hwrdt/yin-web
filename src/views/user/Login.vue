<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span class="logo">瘾</span>
          <span class="title">登录</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" block>
            登录
          </el-button>
        </el-form-item>

        <!-- 快速登录按钮（测试用） -->
        <el-form-item>
          <el-button type="success" @click="quickLogin" block plain>
            快速登录（测试账号）
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const form = ref({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const loading = ref(false)

async function handleLogin() {
  await formRef.value.validate()

  loading.value = true
  try {
    await userStore.login(form.value)
    ElMessage.success('登录成功')

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

// 快速登录（测试用）
function quickLogin() {
  // 直接设置 token 和用户信息
  const mockToken = 'mock_token_' + Date.now()
  userStore.token = mockToken
  userStore.userInfo = {
    id: 1,
    nickname: '测试用户',
    avatar: 'https://picsum.photos/100/100?random=100',
    email: 'test@example.com'
  }
  localStorage.setItem('token', mockToken)
  ElMessage.success('快速登录成功')

  // 跳转到之前的页面或首页
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

function goToRegister() {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;
    border-radius: 12px;

    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      .logo {
        font-size: 36px;
        font-weight: bold;
        color: #667eea;
      }

      .title {
        font-size: 20px;
        color: #333;
      }
    }

    .login-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 20px;
      color: #999;
    }
  }
}
</style>