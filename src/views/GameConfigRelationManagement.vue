<template>
  <div class="relation-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <IconSvg name="material-symbols:settings-outline" class="title-icon" />
          <h1 class="page-title">游戏配置关系管理</h1>
        </div>
        <div class="action-buttons">
          <el-button 
            type="success" 
            @click="rebuildCombinationsHandler"
            :loading="systemLoading"
            icon="el-icon-refresh">
            重建配置组合
          </el-button>
          <el-button 
            type="warning" 
            @click="refreshCacheHandler"
            :loading="systemLoading"
            icon="el-icon-delete">
            刷新缓存
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-section" v-if="statistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <IconSvg name="material-symbols:link" class="stat-icon mode-color" />
              <div class="stat-info">
                <div class="stat-number">{{ statistics.modeLanguageCount || 0 }}</div>
                <div class="stat-label">模式-语言关系</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <IconSvg name="material-symbols:link" class="stat-icon language-color" />
              <div class="stat-info">
                <div class="stat-number">{{ statistics.languageCategoryCount || 0 }}</div>
                <div class="stat-label">语言-分类关系</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <IconSvg name="material-symbols:link" class="stat-icon category-color" />
              <div class="stat-info">
                <div class="stat-number">{{ statistics.categoryDifficultyCount || 0 }}</div>
                <div class="stat-label">分类-难度关系</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <IconSvg name="material-symbols:auto-awesome" class="stat-icon difficulty-color" />
              <div class="stat-info">
                <div class="stat-number">{{ statistics.totalCombinations || 0 }}</div>
                <div class="stat-label">有效配置组合</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 关系管理标签页 -->
    <el-tabs v-model="activeTab" class="relation-tabs">
      <!-- 模式-语言关系 -->
      <el-tab-pane label="模式-语言关系" name="mode-language">
        <div class="relation-section">
          <!-- 添加关系 -->
          <el-card class="add-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:add-circle-outline" />
                <span>添加模式-语言关系</span>
              </div>
            </template>
            <div class="add-relation-form">
              <el-form :model="newModeLanguageRelation" inline>
                <el-form-item label="游戏模式">
                  <el-select 
                    v-model="newModeLanguageRelation.modeName" 
                    placeholder="请选择游戏模式"
                    style="width: 200px">
                    <el-option 
                      v-for="mode in modesData" 
                      :key="mode.name" 
                      :label="mode.displayName" 
                      :value="mode.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="游戏语言">
                  <el-select 
                    v-model="newModeLanguageRelation.languageName" 
                    placeholder="请选择游戏语言"
                    style="width: 200px">
                    <el-option 
                      v-for="language in languagesData" 
                      :key="language.name" 
                      :label="language.displayName" 
                      :value="language.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="addModeLanguageRelationHandler"
                    :loading="operationLoading">
                    添加关系
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 关系矩阵 -->
          <el-card class="matrix-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:grid-view" />
                <span>模式-语言关系矩阵</span>
              </div>
            </template>
            <div class="matrix-container">
              <el-table 
                :data="modesData" 
                style="width: 100%"
                border
                stripe>
                <el-table-column prop="displayName" label="游戏模式" width="150" fixed="left">
                  <template #default="{ row }">
                    <div class="mode-cell">
                      <IconSvg name="material-symbols:play-circle-outline" class="mode-color" />
                      {{ row.displayName }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="language in languagesData" 
                  :key="language.name"
                  :label="language.displayName"
                  width="120"
                  align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="getModeLanguageRelationStatus(row.name, language.name)"
                      @change="toggleModeLanguageRelation(row.name, language.name, $event)"
                      active-color="#67C23A"
                      inactive-color="#DCDFE6">
                    </el-switch>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <!-- 批量设置 -->
          <el-card class="batch-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:batch-prediction" />
                <span>批量设置模式语言</span>
              </div>
            </template>
            <div class="batch-form">
              <el-form :model="batchModeLanguage" inline>
                <el-form-item label="选择模式">
                  <el-select 
                    v-model="batchModeLanguage.modeName" 
                    placeholder="请选择游戏模式"
                    style="width: 200px">
                    <el-option 
                      v-for="mode in modesData" 
                      :key="mode.name" 
                      :label="mode.displayName" 
                      :value="mode.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="支持语言">
                  <el-select 
                    v-model="batchModeLanguage.languageNames" 
                    multiple 
                    placeholder="请选择支持的语言"
                    style="width: 300px">
                    <el-option 
                      v-for="language in languagesData" 
                      :key="language.name" 
                      :label="language.displayName" 
                      :value="language.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="success" 
                    @click="setBatchModeLanguagesHandler"
                    :loading="operationLoading">
                    批量设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 语言-分类关系 -->
      <el-tab-pane label="语言-分类关系" name="language-category">
        <div class="relation-section">
          <!-- 添加关系 -->
          <el-card class="add-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:add-circle-outline" />
                <span>添加语言-分类关系</span>
              </div>
            </template>
            <div class="add-relation-form">
              <el-form :model="newLanguageCategoryRelation" inline>
                <el-form-item label="游戏语言">
                  <el-select 
                    v-model="newLanguageCategoryRelation.languageName" 
                    placeholder="请选择游戏语言"
                    style="width: 200px">
                    <el-option 
                      v-for="language in languagesData" 
                      :key="language.name" 
                      :label="language.displayName" 
                      :value="language.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="游戏分类">
                  <el-select 
                    v-model="newLanguageCategoryRelation.categoryName" 
                    placeholder="请选择游戏分类"
                    style="width: 200px">
                    <el-option 
                      v-for="category in categoriesData" 
                      :key="category.name" 
                      :label="category.displayName" 
                      :value="category.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="addLanguageCategoryRelationHandler"
                    :loading="operationLoading">
                    添加关系
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 关系矩阵 -->
          <el-card class="matrix-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:grid-view" />
                <span>语言-分类关系矩阵</span>
              </div>
            </template>
            <div class="matrix-container">
              <el-table 
                :data="languagesData" 
                style="width: 100%"
                border
                stripe>
                <el-table-column prop="displayName" label="游戏语言" width="150" fixed="left">
                  <template #default="{ row }">
                    <div class="language-cell">
                      <IconSvg name="material-symbols:language" class="language-color" />
                      {{ row.displayName }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="category in categoriesData" 
                  :key="category.name"
                  :label="category.displayName"
                  width="120"
                  align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="getLanguageCategoryRelationStatus(row.name, category.name)"
                      @change="toggleLanguageCategoryRelation(row.name, category.name, $event)"
                      active-color="#67C23A"
                      inactive-color="#DCDFE6">
                    </el-switch>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <!-- 批量设置 -->
          <el-card class="batch-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:batch-prediction" />
                <span>批量设置语言分类</span>
              </div>
            </template>
            <div class="batch-form">
              <el-form :model="batchLanguageCategory" inline>
                <el-form-item label="选择语言">
                  <el-select 
                    v-model="batchLanguageCategory.languageName" 
                    placeholder="请选择游戏语言"
                    style="width: 200px">
                    <el-option 
                      v-for="language in languagesData" 
                      :key="language.name" 
                      :label="language.displayName" 
                      :value="language.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="支持分类">
                  <el-select 
                    v-model="batchLanguageCategory.categoryNames" 
                    multiple 
                    placeholder="请选择支持的分类"
                    style="width: 300px">
                    <el-option 
                      v-for="category in categoriesData" 
                      :key="category.name" 
                      :label="category.displayName" 
                      :value="category.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="success" 
                    @click="setBatchLanguageCategoriesHandler"
                    :loading="operationLoading">
                    批量设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 分类-难度关系 -->
      <el-tab-pane label="分类-难度关系" name="category-difficulty">
        <div class="relation-section">
          <!-- 添加关系 -->
          <el-card class="add-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:add-circle-outline" />
                <span>添加分类-难度关系</span>
              </div>
            </template>
            <div class="add-relation-form">
              <el-form :model="newCategoryDifficultyRelation" inline>
                <el-form-item label="游戏分类">
                  <el-select 
                    v-model="newCategoryDifficultyRelation.categoryName" 
                    placeholder="请选择游戏分类"
                    style="width: 200px">
                    <el-option 
                      v-for="category in categoriesData" 
                      :key="category.name" 
                      :label="category.displayName" 
                      :value="category.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="游戏难度">
                  <el-select 
                    v-model="newCategoryDifficultyRelation.difficultyName" 
                    placeholder="请选择游戏难度"
                    style="width: 200px">
                    <el-option 
                      v-for="difficulty in difficultiesData" 
                      :key="difficulty.name" 
                      :label="difficulty.displayName" 
                      :value="difficulty.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="addCategoryDifficultyRelationHandler"
                    :loading="operationLoading">
                    添加关系
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 关系矩阵 -->
          <el-card class="matrix-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:grid-view" />
                <span>分类-难度关系矩阵</span>
              </div>
            </template>
            <div class="matrix-container">
              <el-table 
                :data="categoriesData" 
                style="width: 100%"
                border
                stripe>
                <el-table-column prop="displayName" label="游戏分类" width="150" fixed="left">
                  <template #default="{ row }">
                    <div class="category-cell">
                      <IconSvg name="material-symbols:category" class="category-color" />
                      {{ row.displayName }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="difficulty in difficultiesData" 
                  :key="difficulty.name"
                  :label="difficulty.displayName"
                  width="120"
                  align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="getCategoryDifficultyRelationStatus(row.name, difficulty.name)"
                      @change="toggleCategoryDifficultyRelation(row.name, difficulty.name, $event)"
                      active-color="#67C23A"
                      inactive-color="#DCDFE6">
                    </el-switch>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <!-- 批量设置 -->
          <el-card class="batch-section">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:batch-prediction" />
                <span>批量设置分类难度</span>
              </div>
            </template>
            <div class="batch-form">
              <el-form :model="batchCategoryDifficulty" inline>
                <el-form-item label="选择分类">
                  <el-select 
                    v-model="batchCategoryDifficulty.categoryName" 
                    placeholder="请选择游戏分类"
                    style="width: 200px">
                    <el-option 
                      v-for="category in categoriesData" 
                      :key="category.name" 
                      :label="category.displayName" 
                      :value="category.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="支持难度">
                  <el-select 
                    v-model="batchCategoryDifficulty.difficultyNames" 
                    multiple 
                    placeholder="请选择支持的难度"
                    style="width: 300px">
                    <el-option 
                      v-for="difficulty in difficultiesData" 
                      :key="difficulty.name" 
                      :label="difficulty.displayName" 
                      :value="difficulty.name">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="success" 
                    @click="setBatchCategoryDifficultiesHandler"
                    :loading="operationLoading">
                    批量设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  fetchActiveModes 
} from '@/api/modules/game/gameModes'
import { 
  fetchActiveLanguages
} from '@/api/modules/game/gameLanguages'
import {
  fetchActiveCategories
} from '@/api/modules/game/gameCategories'
import {
  fetchActiveDifficulties
} from '@/api/modules/game/gameDifficulties'
import {
  fetchCompleteRelationMatrix
} from '@/api/modules/game/gameConfigRelations'
import {
  addModeLanguageRelation,
  deleteModeLanguageRelation,
  setBatchModeLanguages,
  addLanguageCategoryRelation,
  deleteLanguageCategoryRelation,
  setBatchLanguageCategories,
  addCategoryDifficultyRelation,
  deleteCategoryDifficultyRelation,
  setBatchCategoryDifficulties,
  rebuildCombinations,
  refreshCache,
  getRelationStatistics
} from '@/api/modules/game/gameConfigRelationManagement'
import IconSvg from '@/assets/icons/IconSvg.vue'

const { t } = useI18n()

// 响应式数据
const loading = ref(false)
const operationLoading = ref(false)
const systemLoading = ref(false)
const activeTab = ref('mode-language')

// 配置数据
const modesData = ref([])
const languagesData = ref([])
const categoriesData = ref([])
const difficultiesData = ref([])

// 关系矩阵数据
const relationMatrix = ref({
  modeLanguageMatrix: {},
  languageCategoryMatrix: {},
  categoryDifficultyMatrix: {}
})

// 统计信息
const statistics = ref(null)

// 表单数据
const newModeLanguageRelation = ref({
  modeName: '',
  languageName: ''
})

const newLanguageCategoryRelation = ref({
  languageName: '',
  categoryName: ''
})

const newCategoryDifficultyRelation = ref({
  categoryName: '',
  difficultyName: ''
})

// 批量设置表单数据
const batchModeLanguage = ref({
  modeName: '',
  languageNames: []
})

const batchLanguageCategory = ref({
  languageName: '',
  categoryNames: []
})

const batchCategoryDifficulty = ref({
  categoryName: '',
  difficultyNames: []
})

// 生命周期钩子
onMounted(async () => {
  await loadConfigData()
  await loadRelationMatrix()
  await loadStatistics()
})

// 方法
const loadConfigData = async () => {
  loading.value = true
  try {
    const [modes, languages, categories, difficulties] = await Promise.all([
      fetchActiveModes(),
      fetchActiveLanguages(),
      fetchActiveCategories(),
      fetchActiveDifficulties()
    ])
    
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

const loadRelationMatrix = async () => {
  try {
    const response = await fetchCompleteRelationMatrix()
    relationMatrix.value = response.data || {}
  } catch (error) {
    ElMessage.error('获取关系矩阵失败')
    console.error('Failed to fetch relation matrix:', error)
  }
}

const loadStatistics = async () => {
  try {
    const response = await getRelationStatistics()
    statistics.value = response.data || {}
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// 获取关系状态的方法
const getModeLanguageRelationStatus = (modeName, languageName) => {
  return relationMatrix.value.modeLanguageMatrix?.[modeName]?.[languageName] || false
}

const getLanguageCategoryRelationStatus = (languageName, categoryName) => {
  return relationMatrix.value.languageCategoryMatrix?.[languageName]?.[categoryName] || false
}

const getCategoryDifficultyRelationStatus = (categoryName, difficultyName) => {
  return relationMatrix.value.categoryDifficultyMatrix?.[categoryName]?.[difficultyName] || false
}

// 模式-语言关系管理
const addModeLanguageRelationHandler = async () => {
  if (!newModeLanguageRelation.value.modeName || !newModeLanguageRelation.value.languageName) {
    ElMessage.warning('请选择游戏模式和语言')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await addModeLanguageRelation(
      newModeLanguageRelation.value.modeName,
      newModeLanguageRelation.value.languageName
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      newModeLanguageRelation.value = { modeName: '', languageName: '' }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('添加关系失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

const toggleModeLanguageRelation = async (modeName, languageName, enabled) => {
  try {
    let response
    
    if (enabled) {
      response = await addModeLanguageRelation(modeName, languageName)
    } else {
      response = await deleteModeLanguageRelation(modeName, languageName)
    }
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const setBatchModeLanguagesHandler = async () => {
  if (!batchModeLanguage.value.modeName || !batchModeLanguage.value.languageNames.length) {
    ElMessage.warning('请选择游戏模式和语言')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await setBatchModeLanguages(
      batchModeLanguage.value.modeName,
      batchModeLanguage.value.languageNames
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      batchModeLanguage.value = { modeName: '', languageNames: [] }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('批量设置失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

// 语言-分类关系管理
const addLanguageCategoryRelationHandler = async () => {
  if (!newLanguageCategoryRelation.value.languageName || !newLanguageCategoryRelation.value.categoryName) {
    ElMessage.warning('请选择游戏语言和分类')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await addLanguageCategoryRelation(
      newLanguageCategoryRelation.value.languageName,
      newLanguageCategoryRelation.value.categoryName
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      newLanguageCategoryRelation.value = { languageName: '', categoryName: '' }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('添加关系失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

const toggleLanguageCategoryRelation = async (languageName, categoryName, enabled) => {
  try {
    let response
    
    if (enabled) {
      response = await addLanguageCategoryRelation(languageName, categoryName)
    } else {
      response = await deleteLanguageCategoryRelation(languageName, categoryName)
    }
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const setBatchLanguageCategoriesHandler = async () => {
  if (!batchLanguageCategory.value.languageName || !batchLanguageCategory.value.categoryNames.length) {
    ElMessage.warning('请选择游戏语言和分类')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await setBatchLanguageCategories(
      batchLanguageCategory.value.languageName,
      batchLanguageCategory.value.categoryNames
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      batchLanguageCategory.value = { languageName: '', categoryNames: [] }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('批量设置失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

// 分类-难度关系管理
const addCategoryDifficultyRelationHandler = async () => {
  if (!newCategoryDifficultyRelation.value.categoryName || !newCategoryDifficultyRelation.value.difficultyName) {
    ElMessage.warning('请选择游戏分类和难度')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await addCategoryDifficultyRelation(
      newCategoryDifficultyRelation.value.categoryName,
      newCategoryDifficultyRelation.value.difficultyName
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      newCategoryDifficultyRelation.value = { categoryName: '', difficultyName: '' }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('添加关系失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

const toggleCategoryDifficultyRelation = async (categoryName, difficultyName, enabled) => {
  try {
    let response
    
    if (enabled) {
      response = await addCategoryDifficultyRelation(categoryName, difficultyName)
    } else {
      response = await deleteCategoryDifficultyRelation(categoryName, difficultyName)
    }
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const setBatchCategoryDifficultiesHandler = async () => {
  if (!batchCategoryDifficulty.value.categoryName || !batchCategoryDifficulty.value.difficultyNames.length) {
    ElMessage.warning('请选择游戏分类和难度')
    return
  }
  
  operationLoading.value = true
  try {
    const response = await setBatchCategoryDifficulties(
      batchCategoryDifficulty.value.categoryName,
      batchCategoryDifficulty.value.difficultyNames
    )
    
    if (response.success) {
      ElMessage.success(response.message)
      await loadRelationMatrix()
      await loadStatistics()
      batchCategoryDifficulty.value = { categoryName: '', difficultyNames: [] }
    } else {
      ElMessage.warning(response.message)
    }
  } catch (error) {
    ElMessage.error('批量设置失败')
    console.error(error)
  } finally {
    operationLoading.value = false
  }
}

// 系统管理操作
const rebuildCombinationsHandler = async () => {
  try {
    await ElMessageBox.confirm(
      '重建配置组合将清空现有组合并重新生成，确定要继续吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    systemLoading.value = true
    const response = await rebuildCombinations()
    
    if (response.success) {
      ElMessage.success(`${response.message}，生成了 ${response.generatedCombinations || 0} 个有效组合`)
      await loadStatistics()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重建配置组合失败')
      console.error(error)
    }
  } finally {
    systemLoading.value = false
  }
}

const refreshCacheHandler = async () => {
  try {
    await ElMessageBox.confirm(
      '刷新缓存将清空所有缓存数据，确定要继续吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    systemLoading.value = true
    const response = await refreshCache()
    
    if (response.success) {
      ElMessage.success(response.message)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刷新缓存失败')
      console.error(error)
    }
  } finally {
    systemLoading.value = false
  }
}
</script>

<style scoped>
.relation-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
  color: #409EFF;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.statistics-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.mode-color { color: #409EFF; }
.language-color { color: #67C23A; }
.category-color { color: #E6A23C; }
.difficulty-color { color: #F56C6C; }

.relation-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.relation-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.relation-tabs :deep(.el-tabs__content) {
  padding: 24px;
}

.relation-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.add-section,
.matrix-section,
.batch-section {
  border-radius: 8px;
  overflow: hidden;
}

.add-relation-form,
.batch-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.matrix-container {
  overflow-x: auto;
}

.mode-cell,
.language-cell,
.category-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.mode-cell .mode-color,
.language-cell .language-color,
.category-cell .category-color {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .relation-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .add-relation-form,
  .batch-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-relation-form .el-form-item,
  .batch-form .el-form-item {
    margin-bottom: 16px;
  }
}
</style>