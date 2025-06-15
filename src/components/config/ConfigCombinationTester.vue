<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchActiveModes } from '@/api/modules/game/gameModes'
import { fetchActiveLanguages } from '@/api/modules/game/gameLanguages'
import { fetchActiveCategories } from '@/api/modules/game/gameCategories'
import { fetchActiveDifficulties } from '@/api/modules/game/gameDifficulties'
import { 
  validateConfigCombination,
  fetchLanguagesByMode,
  fetchCategoriesByLanguage,
  fetchDifficultiesByCategory
} from '@/api/modules/game/gameConfig'
import IconSvg from '@/assets/icons/IconSvg.vue'

// 响应式数据
const loading = ref(false)
const validating = ref(false)
const isValidCombination = ref(null)

// 配置选项
const modesOptions = ref([])
const languagesOptions = ref([])
const categoriesOptions = ref([])
const difficultiesOptions = ref([])

// 当前选择的配置
const selectedConfig = ref({
  mode: '',
  language: '',
  category: '',
  difficulty: ''
})

// 可用选项（基于层级关系）
const availableLanguages = ref([])
const availableCategories = ref([])
const availableDifficulties = ref([])

// 获取所有配置选项
const fetchConfigOptions = async () => {
  loading.value = true
  try {
    const [modes, languages, categories, difficulties] = await Promise.all([
      fetchActiveModes(),
      fetchActiveLanguages(),
      fetchActiveCategories(),
      fetchActiveDifficulties()
    ])
    
    modesOptions.value = modes
    languagesOptions.value = languages
    categoriesOptions.value = categories
    difficultiesOptions.value = difficulties
  } catch (error) {
    ElMessage.error('获取配置选项失败')
    console.error('Failed to fetch config options:', error)
  } finally {
    loading.value = false
  }
}

// 更新可用语言
const updateAvailableLanguages = async () => {
  if (!selectedConfig.value.mode) {
    availableLanguages.value = languagesOptions.value
    return
  }
  
  try {
    const languages = await fetchLanguagesByMode(selectedConfig.value.mode)
    availableLanguages.value = languages
  } catch (error) {
    console.error('Failed to fetch languages by mode:', error)
    availableLanguages.value = languagesOptions.value
  }
}

// 更新可用类型
const updateAvailableCategories = async () => {
  if (!selectedConfig.value.language) {
    availableCategories.value = categoriesOptions.value
    return
  }
  
  try {
    const categories = await fetchCategoriesByLanguage(selectedConfig.value.language)
    availableCategories.value = categories
  } catch (error) {
    console.error('Failed to fetch categories by language:', error)
    availableCategories.value = categoriesOptions.value
  }
}

// 更新可用难度
const updateAvailableDifficulties = async () => {
  if (!selectedConfig.value.category) {
    availableDifficulties.value = difficultiesOptions.value
    return
  }
  
  try {
    const difficulties = await fetchDifficultiesByCategory(selectedConfig.value.category)
    availableDifficulties.value = difficulties
  } catch (error) {
    console.error('Failed to fetch difficulties by category:', error)
    availableDifficulties.value = difficultiesOptions.value
  }
}

// 验证配置组合
const validateConfiguration = async () => {
  const { mode, language, category, difficulty } = selectedConfig.value
  
  if (!mode || !language || !category || !difficulty) {
    isValidCombination.value = null
    return
  }
  
  validating.value = true
  try {
    const isValid = await validateConfigCombination(mode, language, category, difficulty)
    isValidCombination.value = isValid
    
    if (isValid) {
      ElMessage.success('配置组合有效！')
    } else {
      ElMessage.warning('配置组合无效')
    }
  } catch (error) {
    ElMessage.error('验证失败')
    console.error('Failed to validate configuration:', error)
    isValidCombination.value = false
  } finally {
    validating.value = false
  }
}

// 重置选择
const resetConfiguration = () => {
  selectedConfig.value = {
    mode: '',
    language: '',
    category: '',
    difficulty: ''
  }
  isValidCombination.value = null
}

// 监听配置变化
watch(() => selectedConfig.value.mode, async (newMode) => {
  if (newMode) {
    selectedConfig.value.language = ''
    selectedConfig.value.category = ''
    selectedConfig.value.difficulty = ''
    await updateAvailableLanguages()
  }
  isValidCombination.value = null
})

watch(() => selectedConfig.value.language, async (newLanguage) => {
  if (newLanguage) {
    selectedConfig.value.category = ''
    selectedConfig.value.difficulty = ''
    await updateAvailableCategories()
  }
  isValidCombination.value = null
})

watch(() => selectedConfig.value.category, async (newCategory) => {
  if (newCategory) {
    selectedConfig.value.difficulty = ''
    await updateAvailableDifficulties()
  }
  isValidCombination.value = null
})

watch(() => selectedConfig.value.difficulty, () => {
  isValidCombination.value = null
})

// 生命周期
onMounted(() => {
  fetchConfigOptions()
})
</script>

<template>
  <div class="config-tester-container">
    <el-card class="tester-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <IconSvg name="material-symbols:bug-report" />
            <span class="header-title">配置组合测试器</span>
          </div>
          <el-button 
            size="small" 
            @click="resetConfiguration"
            :icon="'Refresh'"
          >
            重置
          </el-button>
        </div>
      </template>

      <div class="tester-content" v-loading="loading">
        <!-- 配置选择区域 -->
        <div class="config-selectors">
          <div class="selector-row">
            <div class="selector-item">
              <label class="selector-label">
                <IconSvg name="material-symbols:play-circle-outline" />
                游戏模式
              </label>
              <el-select
                v-model="selectedConfig.mode"
                placeholder="选择游戏模式"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="mode in modesOptions"
                  :key="mode.id"
                  :label="mode.displayName"
                  :value="mode.name"
                />
              </el-select>
            </div>

            <div class="selector-item">
              <label class="selector-label">
                <IconSvg name="material-symbols:language" />
                游戏语言
              </label>
              <el-select
                v-model="selectedConfig.language"
                placeholder="选择游戏语言"
                clearable
                style="width: 100%"
                :disabled="!selectedConfig.mode"
              >
                <el-option
                  v-for="language in availableLanguages"
                  :key="language.id"
                  :label="language.displayName"
                  :value="language.name"
                />
              </el-select>
            </div>
          </div>

          <div class="selector-row">
            <div class="selector-item">
              <label class="selector-label">
                <IconSvg name="material-symbols:category" />
                游戏类型
              </label>
              <el-select
                v-model="selectedConfig.category"
                placeholder="选择游戏类型"
                clearable
                style="width: 100%"
                :disabled="!selectedConfig.language"
              >
                <el-option
                  v-for="category in availableCategories"
                  :key="category.id"
                  :label="category.displayName"
                  :value="category.name"
                />
              </el-select>
            </div>

            <div class="selector-item">
              <label class="selector-label">
                <IconSvg name="material-symbols:stars" />
                游戏难度
              </label>
              <el-select
                v-model="selectedConfig.difficulty"
                placeholder="选择游戏难度"
                clearable
                style="width: 100%"
                :disabled="!selectedConfig.category"
              >
                <el-option
                  v-for="difficulty in availableDifficulties"
                  :key="difficulty.id"
                  :label="difficulty.displayName"
                  :value="difficulty.name"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 验证按钮和结果 -->
        <div class="validation-section">
          <el-button
            type="primary"
            size="large"
            @click="validateConfiguration"
            :loading="validating"
            :disabled="!selectedConfig.mode || !selectedConfig.language || !selectedConfig.category || !selectedConfig.difficulty"
            style="width: 200px"
          >
            <IconSvg name="material-symbols:check-circle" />
            验证配置组合
          </el-button>

          <!-- 验证结果 -->
          <div class="validation-result" v-if="isValidCombination !== null">
            <div 
              class="result-badge"
              :class="{
                'result-valid': isValidCombination,
                'result-invalid': !isValidCombination
              }"
            >
              <IconSvg 
                :name="isValidCombination ? 'material-symbols:check-circle' : 'material-symbols:cancel'" 
              />
              <span>{{ isValidCombination ? '配置组合有效' : '配置组合无效' }}</span>
            </div>
          </div>
        </div>

        <!-- 当前配置显示 -->
        <div class="current-config" v-if="selectedConfig.mode">
          <h4>当前配置</h4>
          <div class="config-display">
            <div class="config-item" v-if="selectedConfig.mode">
              <span class="config-label">模式:</span>
              <el-tag type="primary">{{ selectedConfig.mode }}</el-tag>
            </div>
            <div class="config-item" v-if="selectedConfig.language">
              <span class="config-label">语言:</span>
              <el-tag type="success">{{ selectedConfig.language }}</el-tag>
            </div>
            <div class="config-item" v-if="selectedConfig.category">
              <span class="config-label">类型:</span>
              <el-tag type="warning">{{ selectedConfig.category }}</el-tag>
            </div>
            <div class="config-item" v-if="selectedConfig.difficulty">
              <span class="config-label">难度:</span>
              <el-tag type="danger">{{ selectedConfig.difficulty }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.config-tester-container {
  .tester-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    :deep(.el-card__body) {
      padding: 24px;
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
}

.tester-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-selectors {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
  
  :deep(.icon-svg) {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
}

.validation-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.validation-result {
  .result-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;
    
    :deep(.icon-svg) {
      width: 20px;
      height: 20px;
    }
    
    &.result-valid {
      background: #f0f9ff;
      color: #0c7a4c;
      border: 1px solid #bef264;
      
      :deep(.icon-svg) {
        color: #0c7a4c;
      }
    }
    
    &.result-invalid {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fca5a5;
      
      :deep(.icon-svg) {
        color: #dc2626;
      }
    }
  }
}

.current-config {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  
  h4 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-weight: 600;
  }
}

.config-display {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .config-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  
  .icon-svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}
</style> 