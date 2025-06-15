<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  fetchModeLanguageRelations,
  fetchLanguageCategoryRelations,
  fetchCategoryDifficultyRelations,
  fetchCompleteRelationMatrix,
  fetchModeDetails
} from '@/api/modules/game/gameConfigRelations'
import { fetchActiveModes } from '@/api/modules/game/gameModes'
import IconSvg from '@/assets/icons/IconSvg.vue'
import ConfigFlowChart from '@/components/config/ConfigFlowChart.vue'

const { t } = useI18n()

// 响应式数据
const loading = ref(false)
const activeView = ref('overview') // 'overview', 'matrix', 'details', 'tree'
const selectedMode = ref('')

// 关系数据
const modeLanguageData = ref({})
const languageCategoryData = ref({})
const categoryDifficultyData = ref({})
const matrixData = ref({})
const modeDetailsData = ref({})
const modesOptions = ref([])

// 视图类型定义
const viewTypes = [
  {
    key: 'overview',
    label: '关系概览',
    icon: 'material-symbols:overview',
    color: '#409EFF'
  },
  {
    key: 'matrix',
    label: '关系矩阵',
    icon: 'material-symbols:grid-view',
    color: '#67C23A'
  },
  {
    key: 'details',
    label: '详细关系',
    icon: 'material-symbols:account-tree',
    color: '#E6A23C'
  },
  {
    key: 'tree',
    label: '层级树图',
    icon: 'material-symbols:device-hub',
    color: '#F56C6C'
  },
  {
    key: 'flow',
    label: '流程图',
    icon: 'material-symbols:route',
    color: '#9C27B0'
  }
]

// 统计数据计算
const relationStats = computed(() => {
  const stats = {
    totalConnections: 0,
    modeLanguageConnections: 0,
    languageCategoryConnections: 0,
    categoryDifficultyConnections: 0
  }

  // 计算模式-语言连接数
  if (matrixData.value.matrix?.modeLanguage) {
    Object.values(matrixData.value.matrix.modeLanguage).forEach(langMap => {
      stats.modeLanguageConnections += Object.values(langMap).filter(Boolean).length
    })
  }

  // 计算语言-类型连接数
  if (matrixData.value.matrix?.languageCategory) {
    Object.values(matrixData.value.matrix.languageCategory).forEach(catMap => {
      stats.languageCategoryConnections += Object.values(catMap).filter(Boolean).length
    })
  }

  // 计算类型-难度连接数
  if (matrixData.value.matrix?.categoryDifficulty) {
    Object.values(matrixData.value.matrix.categoryDifficulty).forEach(diffMap => {
      stats.categoryDifficultyConnections += Object.values(diffMap).filter(Boolean).length
    })
  }

  stats.totalConnections = stats.modeLanguageConnections + 
                          stats.languageCategoryConnections + 
                          stats.categoryDifficultyConnections

  return stats
})

// 获取所有关系数据
const fetchAllRelations = async () => {
  loading.value = true
  try {
    const [
      modeLanguageRes,
      languageCategoryRes,
      categoryDifficultyRes,
      matrixRes,
      modesRes
    ] = await Promise.all([
      fetchModeLanguageRelations(),
      fetchLanguageCategoryRelations(),
      fetchCategoryDifficultyRelations(),
      fetchCompleteRelationMatrix(),
      fetchActiveModes()
    ])

    modeLanguageData.value = modeLanguageRes
    languageCategoryData.value = languageCategoryRes
    categoryDifficultyData.value = categoryDifficultyRes
    matrixData.value = matrixRes
    modesOptions.value = modesRes
  } catch (error) {
    ElMessage.error('获取关系数据失败')
    console.error('Failed to fetch relations:', error)
  } finally {
    loading.value = false
  }
}

// 获取模式详细信息
const fetchModeDetailData = async (modeName) => {
  if (!modeName) return
  
  try {
    const res = await fetchModeDetails(modeName)
    modeDetailsData.value = res
  } catch (error) {
    ElMessage.error('获取模式详细信息失败')
    console.error('Failed to fetch mode details:', error)
  }
}

// 监听选中模式变化
const onModeChange = (modeName) => {
  selectedMode.value = modeName
  if (modeName) {
    fetchModeDetailData(modeName)
  }
}

// 构建树形数据
const buildTreeData = () => {
  if (!modeDetailsData.value.details) return []

  const treeData = []
  Object.entries(modeDetailsData.value.details).forEach(([langName, langInfo]) => {
    const languageNode = {
      id: `lang-${langInfo.name}`,
      label: `${langInfo.displayName} (${langInfo.code})`,
      type: 'language',
      children: []
    }

    if (langInfo.supportedCategories) {
      Object.entries(langInfo.supportedCategories).forEach(([catName, catInfo]) => {
        const categoryNode = {
          id: `cat-${catInfo.name}`,
          label: catInfo.displayName,
          type: 'category',
          children: []
        }

        if (catInfo.supportedDifficulties) {
          catInfo.supportedDifficulties.forEach(difficulty => {
            categoryNode.children.push({
              id: `diff-${difficulty.name}`,
              label: difficulty.displayName,
              type: 'difficulty'
            })
          })
        }

        languageNode.children.push(categoryNode)
      })
    }

    treeData.push(languageNode)
  })

  return treeData
}

// 获取关系矩阵表格数据
const getMatrixTableData = (type) => {
  if (!matrixData.value.matrix) return { headers: [], rows: [] }

  const matrix = matrixData.value.matrix[type]
  if (!matrix) return { headers: [], rows: [] }

  const keys = Object.keys(matrix)
  const subKeys = keys.length > 0 ? Object.keys(matrix[keys[0]]) : []

  return {
    headers: ['', ...subKeys],
    rows: keys.map(key => ({
      name: key,
      ...matrix[key]
    }))
  }
}

// 生命周期
onMounted(() => {
  fetchAllRelations()
})
</script>

<template>
  <div class="relations-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <IconSvg name="material-symbols:hub" />
            配置关系可视化
          </h1>
          <p class="page-description">查看和分析游戏配置项之间的多对多关联关系</p>
        </div>
        <div class="header-actions">
          <el-button 
            type="primary" 
            :icon="'Setting'"
            @click="$router.push('/game-config')"
          >
            配置管理
          </el-button>
          <el-button 
            type="warning" 
            :icon="'Connection'"
            @click="$router.push('/game-config-relation-management')"
          >
            关系管理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 视图切换卡片 -->
    <div class="view-selector">
      <div 
        v-for="viewType in viewTypes" 
        :key="viewType.key"
        class="view-card"
        :style="{ '--card-color': viewType.color }"
        @click="activeView = viewType.key"
        :class="{ active: activeView === viewType.key }"
      >
        <div class="view-card-icon">
          <IconSvg :name="viewType.icon" />
        </div>
        <div class="view-card-content">
          <h3>{{ viewType.label }}</h3>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-overview" v-if="matrixData.summary">
      <el-card class="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ relationStats.totalConnections }}</div>
            <div class="stat-label">总连接数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ matrixData.summary.totalModes }}</div>
            <div class="stat-label">游戏模式</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ matrixData.summary.totalLanguages }}</div>
            <div class="stat-label">游戏语言</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ matrixData.summary.totalCategories }}</div>
            <div class="stat-label">游戏类型</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ matrixData.summary.totalDifficulties }}</div>
            <div class="stat-label">游戏难度</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" v-loading="loading">
      <!-- 关系概览视图 -->
      <div v-if="activeView === 'overview'" class="overview-view">
        <div class="relation-cards">
          <!-- 模式-语言关系卡片 -->
          <el-card class="relation-card">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:play-circle-outline" />
                <span>模式 → 语言关系</span>
                <el-tag type="primary">{{ relationStats.modeLanguageConnections }} 个连接</el-tag>
              </div>
            </template>
            <div class="relation-content">
              <div 
                v-for="(modeInfo, modeName) in modeLanguageData.relations" 
                :key="modeName"
                class="relation-item"
              >
                <div class="relation-source">
                  <el-tag type="primary">{{ modeInfo.displayName }}</el-tag>
                </div>
                <div class="relation-arrow">→</div>
                <div class="relation-targets">
                  <el-tag 
                    v-for="lang in modeInfo.supportedLanguages" 
                    :key="lang.id"
                    size="small"
                    type="success"
                  >
                    {{ lang.displayName }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 语言-类型关系卡片 -->
          <el-card class="relation-card">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:language" />
                <span>语言 → 类型关系</span>
                <el-tag type="success">{{ relationStats.languageCategoryConnections }} 个连接</el-tag>
              </div>
            </template>
            <div class="relation-content">
              <div 
                v-for="(langInfo, langName) in languageCategoryData.relations" 
                :key="langName"
                class="relation-item"
              >
                <div class="relation-source">
                  <el-tag type="success">{{ langInfo.displayName }}</el-tag>
                </div>
                <div class="relation-arrow">→</div>
                <div class="relation-targets">
                  <el-tag 
                    v-for="cat in langInfo.supportedCategories" 
                    :key="cat.id"
                    size="small"
                    type="warning"
                  >
                    {{ cat.displayName }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 类型-难度关系卡片 -->
          <el-card class="relation-card">
            <template #header>
              <div class="card-header">
                <IconSvg name="material-symbols:category" />
                <span>类型 → 难度关系</span>
                <el-tag type="warning">{{ relationStats.categoryDifficultyConnections }} 个连接</el-tag>
              </div>
            </template>
            <div class="relation-content">
              <div 
                v-for="(catInfo, catName) in categoryDifficultyData.relations" 
                :key="catName"
                class="relation-item"
              >
                <div class="relation-source">
                  <el-tag type="warning">{{ catInfo.displayName }}</el-tag>
                </div>
                <div class="relation-arrow">→</div>
                <div class="relation-targets">
                  <el-tag 
                    v-for="diff in catInfo.supportedDifficulties" 
                    :key="diff.id"
                    size="small"
                    type="danger"
                  >
                    {{ diff.displayName }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 关系矩阵视图 -->
      <div v-if="activeView === 'matrix'" class="matrix-view">
        <el-tabs type="border-card">
          <!-- 模式-语言矩阵 -->
          <el-tab-pane label="模式-语言矩阵">
            <div class="matrix-container">
              <el-table 
                :data="getMatrixTableData('modeLanguage').rows" 
                border
                class="matrix-table"
              >
                <el-table-column prop="name" label="模式" width="150" fixed="left">
                  <template #default="{ row }">
                    <el-tag type="primary">{{ row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="header in getMatrixTableData('modeLanguage').headers.slice(1)"
                  :key="header"
                  :prop="header"
                  :label="header"
                  width="120"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-icon 
                      :style="{ color: row[header] ? '#67C23A' : '#DCDFE6' }"
                      size="20"
                    >
                      <IconSvg :name="row[header] ? 'material-symbols:check-circle' : 'material-symbols:cancel'" />
                    </el-icon>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 语言-类型矩阵 -->
          <el-tab-pane label="语言-类型矩阵">
            <div class="matrix-container">
              <el-table 
                :data="getMatrixTableData('languageCategory').rows" 
                border
                class="matrix-table"
              >
                <el-table-column prop="name" label="语言" width="150" fixed="left">
                  <template #default="{ row }">
                    <el-tag type="success">{{ row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="header in getMatrixTableData('languageCategory').headers.slice(1)"
                  :key="header"
                  :prop="header"
                  :label="header"
                  width="120"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-icon 
                      :style="{ color: row[header] ? '#E6A23C' : '#DCDFE6' }"
                      size="20"
                    >
                      <IconSvg :name="row[header] ? 'material-symbols:check-circle' : 'material-symbols:cancel'" />
                    </el-icon>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 类型-难度矩阵 -->
          <el-tab-pane label="类型-难度矩阵">
            <div class="matrix-container">
              <el-table 
                :data="getMatrixTableData('categoryDifficulty').rows" 
                border
                class="matrix-table"
              >
                <el-table-column prop="name" label="类型" width="150" fixed="left">
                  <template #default="{ row }">
                    <el-tag type="warning">{{ row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column 
                  v-for="header in getMatrixTableData('categoryDifficulty').headers.slice(1)"
                  :key="header"
                  :prop="header"
                  :label="header"
                  width="120"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-icon 
                      :style="{ color: row[header] ? '#F56C6C' : '#DCDFE6' }"
                      size="20"
                    >
                      <IconSvg :name="row[header] ? 'material-symbols:check-circle' : 'material-symbols:cancel'" />
                    </el-icon>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 详细关系视图 -->
      <div v-if="activeView === 'details'" class="details-view">
        <div class="mode-selector">
          <el-select
            v-model="selectedMode"
            placeholder="选择游戏模式查看详细关系"
            @change="onModeChange"
            style="width: 300px"
          >
            <el-option
              v-for="mode in modesOptions"
              :key="mode.name"
              :label="mode.displayName"
              :value="mode.name"
            />
          </el-select>
        </div>

        <div v-if="modeDetailsData.details" class="mode-details">
          <el-card>
            <template #header>
              <div class="details-header">
                <IconSvg name="material-symbols:account-tree" />
                <span>{{ selectedMode }} 模式详细关系</span>
                <el-tag type="info">{{ modeDetailsData.totalLanguages }} 种语言</el-tag>
              </div>
            </template>

            <div class="details-content">
              <div 
                v-for="(langInfo, langName) in modeDetailsData.details" 
                :key="langName"
                class="language-section"
              >
                <div class="language-header">
                  <el-tag type="success" size="large">
                    {{ langInfo.displayName }} ({{ langInfo.code }})
                  </el-tag>
                </div>
                
                <div class="categories-grid">
                  <div 
                    v-for="(catInfo, catName) in langInfo.supportedCategories" 
                    :key="catName"
                    class="category-item"
                  >
                    <div class="category-header">
                      <el-tag type="warning">{{ catInfo.displayName }}</el-tag>
                    </div>
                    <div class="difficulties-list">
                      <el-tag 
                        v-for="diff in catInfo.supportedDifficulties" 
                        :key="diff.id"
                        type="danger"
                        size="small"
                      >
                        {{ diff.displayName }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 层级树图视图 -->
      <div v-if="activeView === 'tree'" class="tree-view">
        <div class="mode-selector">
          <el-select
            v-model="selectedMode"
            placeholder="选择游戏模式查看层级树图"
            @change="onModeChange"
            style="width: 300px"
          >
            <el-option
              v-for="mode in modesOptions"
              :key="mode.name"
              :label="mode.displayName"
              :value="mode.name"
            />
          </el-select>
        </div>

        <div v-if="modeDetailsData.details" class="tree-container">
          <el-card>
            <template #header>
              <div class="tree-header">
                <IconSvg name="material-symbols:device-hub" />
                <span>{{ selectedMode }} 模式层级树图</span>
              </div>
            </template>

            <el-tree
              :data="buildTreeData()"
              :props="{ children: 'children', label: 'label' }"
              default-expand-all
              class="config-tree"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <IconSvg 
                    :name="data.type === 'language' ? 'material-symbols:language' : 
                           data.type === 'category' ? 'material-symbols:category' : 
                           'material-symbols:stars'" 
                  />
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </el-card>
        </div>
      </div>

      <!-- 流程图视图 -->
      <div v-if="activeView === 'flow'" class="flow-view">
        <div class="mode-selector">
          <el-select
            v-model="selectedMode"
            placeholder="选择游戏模式查看流程图"
            @change="onModeChange"
            style="width: 300px"
          >
            <el-option
              v-for="mode in modesOptions"
              :key="mode.name"
              :label="mode.displayName"
              :value="mode.name"
            />
          </el-select>
        </div>

        <div class="flow-container">
          <el-card>
            <template #header>
              <div class="flow-header">
                <IconSvg name="material-symbols:route" />
                <span>{{ selectedMode ? `${selectedMode} 模式` : '游戏配置' }}流程图</span>
              </div>
            </template>

            <ConfigFlowChart
              :mode-data="modeLanguageData"
              :language-data="languageCategoryData"
              :category-data="categoryDifficultyData"
              :selected-mode="selectedMode"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.relations-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
    }
  }
  
  .title-section {
    flex: 1;
  }
  
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
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }
  }
}

.view-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.view-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: var(--card-color);
  }
  
  &.active {
    border-color: var(--card-color);
    background: linear-gradient(135deg, var(--card-color)10, white);
  }
  
  .view-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--card-color);
    display: flex;
    align-items: center;
    justify-content: center;
    
    :deep(.icon-svg) {
      width: 20px;
      height: 20px;
      color: white;
    }
  }
  
  .view-card-content {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
  }
}

.stats-overview {
  margin-bottom: 24px;
  
  .stats-card {
    border-radius: 12px;
    
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
  }
}

.main-content {
  .relation-cards {
    display: grid;
    gap: 24px;
  }
  
  .relation-card {
    border-radius: 12px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      
      :deep(.icon-svg) {
        width: 20px;
        height: 20px;
        color: #3b82f6;
      }
    }
    
    .relation-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .relation-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      
      .relation-arrow {
        font-size: 18px;
        font-weight: bold;
        color: #6b7280;
      }
      
      .relation-targets {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }
  }
}

.matrix-view {
  .matrix-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .matrix-table {
    :deep(.el-table__header) {
      background: #fafafa;
    }
  }
}

.details-view, .tree-view, .flow-view {
  .mode-selector {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
  }
  
  .details-header, .tree-header, .flow-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    
    :deep(.icon-svg) {
      width: 20px;
      height: 20px;
      color: #3b82f6;
    }
  }
  
  .language-section {
    margin-bottom: 32px;
    
    .language-header {
      margin-bottom: 16px;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .category-item {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      
      .category-header {
        margin-bottom: 12px;
      }
      
      .difficulties-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }
  }
}

.tree-container {
  .config-tree {
    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      
      :deep(.icon-svg) {
        width: 16px;
        height: 16px;
      }
    }
  }
}

:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-tabs__item) {
  font-weight: 500;
}
</style>