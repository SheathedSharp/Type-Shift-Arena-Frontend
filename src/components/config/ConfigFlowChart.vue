<script setup>
import { ref, computed, onMounted } from 'vue'
import IconSvg from '@/assets/icons/IconSvg.vue'

const props = defineProps({
  modeData: {
    type: Object,
    default: () => ({})
  },
  languageData: {
    type: Object,
    default: () => ({})
  },
  categoryData: {
    type: Object,
    default: () => ({})
  },
  selectedMode: {
    type: String,
    default: ''
  }
})

// 构建流程图数据
const flowData = computed(() => {
  if (!props.selectedMode || !props.modeData.relations) return null

  const modeInfo = props.modeData.relations[props.selectedMode]
  if (!modeInfo) return null

  // 构建流程层级
  const flow = {
    mode: {
      name: modeInfo.displayName,
      type: 'mode'
    },
    languages: modeInfo.supportedLanguages || [],
    categoryMap: {},
    difficultyMap: {}
  }

  // 为每个语言构建类型和难度映射
  flow.languages.forEach(lang => {
    const langCategories = props.languageData.relations?.[lang.name]?.supportedCategories || []
    flow.categoryMap[lang.name] = langCategories

    langCategories.forEach(cat => {
      const catDifficulties = props.categoryData.relations?.[cat.name]?.supportedDifficulties || []
      flow.difficultyMap[cat.name] = catDifficulties
    })
  })

  return flow
})

// 获取配置类型的颜色
const getTypeColor = (type) => {
  const colorMap = {
    mode: '#409EFF',
    language: '#67C23A',
    category: '#E6A23C',
    difficulty: '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 获取配置类型的图标
const getTypeIcon = (type) => {
  const iconMap = {
    mode: 'material-symbols:play-circle-outline',
    language: 'material-symbols:language',
    category: 'material-symbols:category',
    difficulty: 'material-symbols:stars'
  }
  return iconMap[type] || 'material-symbols:circle'
}

// 计算连接线路径
const getConnectionPath = (fromElement, toElement) => {
  if (!fromElement || !toElement) return ''
  
  const fromRect = fromElement.getBoundingClientRect()
  const toRect = toElement.getBoundingClientRect()
  
  const startX = fromRect.right
  const startY = fromRect.top + fromRect.height / 2
  const endX = toRect.left
  const endY = toRect.top + toRect.height / 2
  
  const midX = startX + (endX - startX) / 2
  
  return `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${endY} Q ${midX} ${endY} ${endX} ${endY}`
}
</script>

<template>
  <div class="flow-chart-container">
    <div v-if="!flowData" class="no-data">
      <IconSvg name="material-symbols:device-hub" />
      <p>请先选择一个游戏模式</p>
    </div>

    <div v-else class="flow-chart">
      <!-- 模式层 -->
      <div class="flow-level mode-level">
        <div class="level-title">游戏模式</div>
        <div class="flow-nodes">
          <div 
            class="flow-node mode-node"
            :style="{ '--node-color': getTypeColor('mode') }"
          >
            <div class="node-icon">
              <IconSvg :name="getTypeIcon('mode')" />
            </div>
            <div class="node-content">
              <div class="node-title">{{ flowData.mode.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 语言层 -->
      <div class="flow-level language-level">
        <div class="level-title">支持语言</div>
        <div class="flow-nodes">
          <div 
            v-for="language in flowData.languages"
            :key="language.id"
            class="flow-node language-node"
            :style="{ '--node-color': getTypeColor('language') }"
          >
            <div class="node-icon">
              <IconSvg :name="getTypeIcon('language')" />
            </div>
            <div class="node-content">
              <div class="node-title">{{ language.displayName }}</div>
              <div class="node-subtitle">{{ language.code }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 类型层 -->
      <div class="flow-level category-level">
        <div class="level-title">游戏类型</div>
        <div class="flow-nodes">
          <div class="language-groups">
            <div 
              v-for="language in flowData.languages"
              :key="`cat-${language.id}`"
              class="language-group"
            >
              <div class="group-header">
                <el-tag type="success" size="small">{{ language.displayName }}</el-tag>
              </div>
              <div class="group-nodes">
                <div 
                  v-for="category in flowData.categoryMap[language.name] || []"
                  :key="category.id"
                  class="flow-node category-node"
                  :style="{ '--node-color': getTypeColor('category') }"
                >
                  <div class="node-icon">
                    <IconSvg :name="getTypeIcon('category')" />
                  </div>
                  <div class="node-content">
                    <div class="node-title">{{ category.displayName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 难度层 -->
      <div class="flow-level difficulty-level">
        <div class="level-title">游戏难度</div>
        <div class="flow-nodes">
          <div class="category-groups">
            <div 
              v-for="language in flowData.languages"
              :key="`diff-${language.id}`"
              class="language-section"
            >
              <div 
                v-for="category in flowData.categoryMap[language.name] || []"
                :key="`diff-cat-${category.id}`"
                class="category-group"
              >
                <div class="group-header">
                  <el-tag type="warning" size="small">{{ category.displayName }}</el-tag>
                </div>
                <div class="group-nodes">
                  <div 
                    v-for="difficulty in flowData.difficultyMap[category.name] || []"
                    :key="difficulty.id"
                    class="flow-node difficulty-node"
                    :style="{ '--node-color': getTypeColor('difficulty') }"
                  >
                    <div class="node-icon">
                      <IconSvg :name="getTypeIcon('difficulty')" />
                    </div>
                    <div class="node-content">
                      <div class="node-title">{{ difficulty.displayName }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flow-chart-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
  overflow-x: auto;
  overflow-y: auto;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6b7280;
  
  :deep(.icon-svg) {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
}

.flow-chart {
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 1200px;
}

.flow-level {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .level-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    padding: 8px 16px;
    background: white;
    border-radius: 20px;
    border: 2px solid #e5e7eb;
    align-self: center;
  }
}

.flow-nodes {
  display: flex;
  justify-content: center;
  
  &.language-nodes,
  &.category-nodes,
  &.difficulty-nodes {
    flex-wrap: wrap;
    gap: 16px;
  }
}

.flow-node {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--node-color);
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  
  .node-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--node-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    :deep(.icon-svg) {
      width: 18px;
      height: 18px;
      color: white;
    }
  }
  
  .node-content {
    flex: 1;
    
    .node-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .node-subtitle {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

.mode-node {
  min-width: 200px;
  
  .node-icon {
    width: 40px;
    height: 40px;
    
    :deep(.icon-svg) {
      width: 22px;
      height: 22px;
    }
  }
  
  .node-title {
    font-size: 16px;
  }
}

.language-groups,
.category-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.language-group,
.category-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
  
  .group-header {
    text-align: center;
  }
  
  .group-nodes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.language-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-level {
  .flow-nodes {
    .language-groups {
      width: 100%;
    }
  }
}

.difficulty-level {
  .flow-nodes {
    .category-groups {
      width: 100%;
      flex-direction: column;
      gap: 32px;
    }
    
    .language-section {
      .category-group {
        .group-nodes {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .flow-chart {
    min-width: auto;
  }
  
  .language-groups,
  .category-groups {
    flex-direction: column;
    align-items: center;
  }
  
  .flow-node {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .flow-chart-container {
    padding: 16px;
  }
  
  .flow-node {
    min-width: 140px;
    padding: 12px;
    
    .node-icon {
      width: 28px;
      height: 28px;
      
      :deep(.icon-svg) {
        width: 16px;
        height: 16px;
      }
    }
  }
  
  .mode-node {
    .node-icon {
      width: 36px;
      height: 36px;
      
      :deep(.icon-svg) {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>