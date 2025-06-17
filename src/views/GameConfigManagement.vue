<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  fetchActiveModes,
  fetchAllModes, 
  createMode, 
  updateMode, 
  deleteMode 
} from '@/api/modules/game/gameModes'
import { 
  fetchActiveLanguages,
  fetchAllLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage
} from '@/api/modules/game/gameLanguages'
import {
  fetchActiveCategories,
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/modules/game/gameCategories'
import {
  fetchActiveDifficulties,
  fetchAllDifficulties,
  createDifficulty,
  updateDifficulty,
  deleteDifficulty
} from '@/api/modules/game/gameDifficulties'
import { validateConfigCombination } from '@/api/modules/game/gameConfig'
import IconSvg from '@/assets/icons/IconSvg.vue'
import ConfigCombinationTester from '@/components/config/ConfigCombinationTester.vue'

const { t } = useI18n()

// 响应式数据
const loading = ref(false)
const activeTab = ref('modes')
const dialogVisible = ref(false)
const dialogType = ref('create') // 'create' or 'edit'
const currentConfigType = ref('modes')
const currentEditItem = ref(null)

// 配置数据
const modesData = ref([])
const languagesData = ref([])
const categoriesData = ref([])
const difficultiesData = ref([])

// 表单数据
const formData = ref({
  name: '',
  displayName: '',
  description: '',
  code: '',
  levelValue: 1,
  isActive: true,
  sortOrder: 1
})

// 表单规则
const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入代码', trigger: 'blur' }
  ]
}

// 配置类型定义
const configTypes = [
  {
    key: 'modes',
    label: '游戏模式',
    icon: 'material-symbols:play-circle-outline',
    data: modesData,
    color: '#409EFF'
  },
  {
    key: 'languages',
    label: '游戏语言',
    icon: 'material-symbols:language',
    data: languagesData,
    color: '#67C23A'
  },
  {
    key: 'categories',
    label: '游戏类型',
    icon: 'material-symbols:category',
    data: categoriesData,
    color: '#E6A23C'
  },
  {
    key: 'difficulties',
    label: '游戏难度',
    icon: 'material-symbols:stars',
    data: difficultiesData,
    color: '#F56C6C'
  }
]

// 计算属性
const currentConfigData = computed(() => {
  return configTypes.find(type => type.key === activeTab.value)?.data || ref([])
})

const currentConfigTypeInfo = computed(() => {
  return configTypes.find(type => type.key === activeTab.value)
})

// 表格列定义
const getTableColumns = (type) => {
  const baseColumns = [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '名称', minWidth: 120 },
    { prop: 'displayName', label: '显示名称', minWidth: 120 },
    { prop: 'isActive', label: '状态', width: 100 },
    { prop: 'sortOrder', label: '排序', width: 80 },
    { prop: 'createdAt', label: '创建时间', width: 180 },
    { prop: 'updatedAt', label: '更新时间', width: 180 }
  ]

  if (type === 'languages') {
    baseColumns.splice(3, 0, { prop: 'code', label: '代码', width: 100 })
  }
  
  if (type === 'difficulties') {
    baseColumns.splice(3, 0, { prop: 'levelValue', label: '难度值', width: 100 })
  }

  if (type !== 'modes') {
    baseColumns.splice(3, 0, { prop: 'description', label: '描述', minWidth: 200 })
  } else {
    baseColumns.splice(4, 0, { prop: 'description', label: '描述', minWidth: 200 })
  }

  return baseColumns
}

// 获取数据的方法
const fetchData = async () => {
  loading.value = true
  try {
    const [modes, languages, categories, difficulties] = await Promise.all([
      fetchAllModes(), // 获取所有模式（包括禁用的）
      fetchAllLanguages(), // 获取所有语言（包括禁用的）
      fetchAllCategories(), // 获取所有类型（包括禁用的）
      fetchAllDifficulties() // 获取所有难度（包括禁用的）
    ])
    console.log('modes', modes)
    modesData.value = modes
    languagesData.value = languages
    categoriesData.value = categories
    difficultiesData.value = difficulties
  } catch (error) {
    ElMessage.error('获取配置数据失败')
    console.error('Failed to fetch config data:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    displayName: '',
    description: '',
    code: '',
    levelValue: 1,
    isActive: true,
    sortOrder: 1
  }
}

// 打开创建对话框
const openCreateDialog = (type) => {
  currentConfigType.value = type
  dialogType.value = 'create'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (item, type) => {
  currentConfigType.value = type
  dialogType.value = 'edit'
  currentEditItem.value = item
  formData.value = { ...item }
  dialogVisible.value = true
}

// 保存配置项
const saveConfigItem = async () => {
  try {
    const apiMap = {
      modes: { create: createMode, update: updateMode },
      languages: { create: createLanguage, update: updateLanguage },
      categories: { create: createCategory, update: updateCategory },
      difficulties: { create: createDifficulty, update: updateDifficulty }
    }

    const api = apiMap[currentConfigType.value]
    
    if (dialogType.value === 'create') {
      await api.create(formData.value)
      ElMessage.success('创建成功')
    } else {
      await api.update(currentEditItem.value.id, formData.value)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    await fetchData()
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('Failed to save config item:', error)
  }
}

// 删除配置项
const deleteConfigItem = async (item, type) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${item.displayName}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const apiMap = {
      modes: deleteMode,
      languages: deleteLanguage,
      categories: deleteCategory,
      difficulties: deleteDifficulty
    }

    await apiMap[type](item.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Failed to delete config item:', error)
    }
  }
}

// 切换状态
const toggleStatus = async (item, type) => {
  try {
    const apiMap = {
      modes: updateMode,
      languages: updateLanguage,
      categories: updateCategory,
      difficulties: updateDifficulty
    }

    await apiMap[type](item.id, { ...item, isActive: !item.isActive })
    ElMessage.success('状态更新成功')
    await fetchData()
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error('Failed to toggle status:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取表单字段配置
const getFormFields = (type) => {
  const baseFields = [
    { key: 'name', label: '名称', type: 'input', required: true },
    { key: 'displayName', label: '显示名称', type: 'input', required: true },
    { key: 'description', label: '描述', type: 'textarea' },
    { key: 'isActive', label: '激活状态', type: 'switch' },
    { key: 'sortOrder', label: '排序', type: 'number' }
  ]

  if (type === 'languages') {
    baseFields.splice(2, 0, { key: 'code', label: '语言代码', type: 'input', required: true })
  }
  
  if (type === 'difficulties') {
    baseFields.splice(3, 0, { key: 'levelValue', label: '难度值', type: 'number' })
  }

  return baseFields
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="config-management-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <IconSvg name="settings" />
        游戏配置管理
      </h1>
      <p class="page-description">管理游戏模式、语言、类型和难度配置</p>
    </div>

    <!-- 配置类型统计卡片 -->
    <div class="stats-cards">
      <div 
        v-for="configType in configTypes" 
        :key="configType.key"
        class="stats-card"
        :style="{ '--card-color': configType.color }"
        @click="activeTab = configType.key"
        :class="{ active: activeTab === configType.key }"
      >
        <div class="stats-card-icon">
          <IconSvg :name="configType.icon" />
        </div>
        <div class="stats-card-content">
          <h3>{{ configType.label }}</h3>
          <p class="stats-number">{{ configType.data.value.length }}</p>
          <p class="stats-label">项配置</p>
        </div>
      </div>
    </div>

    <!-- 配置组合测试器 -->
    <ConfigCombinationTester />

    <!-- 主内容区域 -->
    <div class="main-content">
      <el-card class="config-table-card">
        <!-- 表格头部操作栏 -->
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <IconSvg :name="currentConfigTypeInfo?.icon" />
              <span class="header-title">{{ currentConfigTypeInfo?.label }}</span>
              <el-tag :color="currentConfigTypeInfo?.color" size="small">
                {{ currentConfigData.value.length }} 项
              </el-tag>
            </div>
            <div class="header-actions">
              <el-button 
                type="success" 
                :icon="'Connection'"
                @click="$router.push('/game-config-relations')"
              >
                查看关系
              </el-button>
              <el-button 
                type="warning" 
                :icon="'Setting'"
                @click="$router.push('/game-config-relation-management')"
              >
                管理关系
              </el-button>
              <el-button 
                type="primary" 
                :icon="'Plus'"
                @click="openCreateDialog(activeTab)"
              >
                新增{{ currentConfigTypeInfo?.label }}
              </el-button>
              <el-button 
                :icon="'Refresh'"
                @click="fetchData"
                :loading="loading"
              >
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <!-- 数据表格 -->
        <el-table 
          :data="currentConfigData.value" 
          v-loading="loading"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column 
            v-for="column in getTableColumns(activeTab)"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
          >
            <template #default="{ row }" v-if="column.prop === 'isActive'">
              <el-switch
                :model-value="row.isActive"
                @change="toggleStatus(row, activeTab)"
                active-text="激活"
                inactive-text="禁用"
              />
            </template>
            <template #default="{ row }" v-else-if="column.prop === 'createdAt' || column.prop === 'updatedAt'">
              {{ formatDate(row[column.prop]) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="primary" 
                :icon="'Edit'"
                @click="openEditDialog(row, activeTab)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                :icon="'Delete'"
                @click="deleteConfigItem(row, activeTab)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? `新增${currentConfigTypeInfo?.label}` : `编辑${currentConfigTypeInfo?.label}`"
      v-model="dialogVisible"
      width="500px"
      :before-close="() => { dialogVisible = false }"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        label-width="100px"
        ref="formRef"
      >
        <el-form-item 
          v-for="field in getFormFields(currentConfigType)"
          :key="field.key"
          :label="field.label"
          :prop="field.required ? field.key : ''"
        >
          <el-input
            v-if="field.type === 'input'"
            v-model="formData[field.key]"
            :placeholder="`请输入${field.label}`"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            type="textarea"
            :rows="3"
            :placeholder="`请输入${field.label}`"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.key]"
            :min="1"
          />
          <el-switch
            v-else-if="field.type === 'switch'"
            v-model="formData[field.key]"
            active-text="激活"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConfigItem">
            {{ dialogType === 'create' ? '创建' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.config-management-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
    
    :deep(.icon-svg) {
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }
  }
  
  .page-description {
    color: #6b7280;
    font-size: 16px;
    margin: 0;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: var(--card-color);
  }
  
  &.active {
    border-color: var(--card-color);
    background: linear-gradient(135deg, var(--card-color)10, white);
  }
  
  .stats-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--card-color);
    display: flex;
    align-items: center;
    justify-content: center;
    
    :deep(.icon-svg) {
      width: 24px;
      height: 24px;
      color: white;
    }
  }
  
  .stats-card-content {
    flex: 1;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px 0;
    }
    
    .stats-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--card-color);
      margin: 0;
      line-height: 1;
    }
    
    .stats-label {
      font-size: 14px;
      color: #6b7280;
      margin: 2px 0 0 0;
    }
  }
}

.main-content {
  .config-table-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    :deep(.icon-svg) {
      width: 20px;
      height: 20px;
      color: #3b82f6;
    }
    
    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-table) {
  border-radius: 0 0 12px 12px;
  
  .el-table__header {
    background: #fafafa;
  }
  
  .el-table__row {
    &:hover {
      background: #f8faff !important;
    }
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-switch) {
  --el-switch-on-color: #67c23a;
  --el-switch-off-color: #dcdfe6;
}
</style> 