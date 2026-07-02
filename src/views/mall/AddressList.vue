<template>
  <div class="address-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收货地址管理</span>
          <el-button type="primary" @click="showAddDialog">添加地址</el-button>
        </div>
      </template>

      <div class="address-list" v-if="addresses.length > 0">
        <div v-for="address in addresses" :key="address.id" class="address-item">
          <div class="address-info">
            <div class="receiver-row">
              <span class="receiver-name">{{ address.receiverName }}</span>
              <span class="receiver-phone">{{ address.receiverPhone }}</span>
              <el-tag v-if="address.isDefault" type="primary" size="small">默认</el-tag>
            </div>
            <div class="address-detail">{{ address.fullAddress }}</div>
          </div>

          <div class="address-actions">
            <el-button size="small" @click="setDefault(address.id)" v-if="!address.isDefault">
              设为默认
            </el-button>
            <el-button size="small" @click="editAddress(address)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteAddress(address.id)">删除</el-button>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无收货地址" />
    </el-card>

    <!-- 添加/编辑地址弹窗 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑地址' : '添加地址'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收货人姓名" />
        </el-form-item>

        <el-form-item label="手机号" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="省份">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>

        <el-form-item label="城市">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>

        <el-form-item label="区/县">
          <el-input v-model="form.district" placeholder="请输入区/县" />
        </el-form-item>

        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="form.detailAddress" type="textarea" placeholder="请输入详细地址" :rows="3" />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMallStore } from '@/store/mall'
import { ElMessage, ElMessageBox } from 'element-plus'

const mallStore = useMallStore()

const addresses = computed(() => mallStore.addresses)

const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editAddressId = ref(null)

const form = ref({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0
})

const rules = {
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

onMounted(async () => {
  await mallStore.getAddressList()
})

function showAddDialog() {
  isEdit.value = false
  editAddressId.value = null
  form.value = {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: 0
  }
  showDialog.value = true
}

function editAddress(address) {
  isEdit.value = true
  editAddressId.value = address.id
  form.value = {
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    province: address.province || '',
    city: address.city || '',
    district: address.district || '',
    detailAddress: address.detailAddress,
    isDefault: address.isDefault
  }
  showDialog.value = true
}

async function saveAddress() {
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await mallStore.updateAddress(editAddressId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await mallStore.addAddress(form.value)
      ElMessage.success('添加成功')
    }
    showDialog.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function setDefault(addressId) {
  await mallStore.setDefaultAddress(addressId)
  ElMessage.success('已设为默认')
}

async function deleteAddress(addressId) {
  await ElMessageBox.confirm('确定删除该地址吗？', '提示')
  await mallStore.deleteAddress(addressId)
  ElMessage.success('删除成功')
}
</script>

<style lang="scss" scoped>
.address-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .address-list {
    .address-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 15px;

      .address-info {
        .receiver-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;

          .receiver-name {
            font-weight: 500;
          }

          .receiver-phone {
            color: #666;
          }
        }

        .address-detail {
          color: #666;
        }
      }

      .address-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>