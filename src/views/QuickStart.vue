<template>
  <div class="quick-start">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <a-icon type="RocketOutlined" />
          快速开始
        </h1>
        <p class="page-subtitle">选择你喜欢的游戏模式，立即开始精彩对战！</p>
      </div>
    </div>

    <!-- 所有游戏区域 -->
    <div class="all-games-section">
      
      <div class="games-grid">
        <game-launcher
          v-for="game in filteredGames"
          :key="game.type"
          :game-config="game"
          :disabled="false"
          @create-room="handleCreateRoom"
        />
      </div>
      
        <!-- 空状态 -->
       <div v-if="filteredGames.length === 0" class="empty-state">
         <a-empty description="没有找到符合条件的游戏">
           <template #description>
             <span>没有找到符合条件的游戏</span>
             <br />
             <span>试试调整筛选条件或</span>
             <a @click="resetFilters">重置筛选</a>
           </template>
         </a-empty>
       </div>
    </div>

    <!-- 游戏统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-content">
            <div class="stat-number">{{ allGames.length }}</div>
            <div class="stat-label">游戏模式</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ maxTotalPlayers }}</div>
            <div class="stat-label">最大支持玩家</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ averageDuration }}分钟</div>
            <div class="stat-label">平均游戏时长</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-number">{{ uniqueGameModes.length }}</div>
            <div class="stat-label">游戏类型</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import GameLauncher from '@/components/common/GameLauncher.vue'
import { getAllGameConfigs, getRecommendedGames } from '@/config/gameConfigs'

const router = useRouter()

// 响应式数据
const selectedPlayerCount = ref(null)
const selectedGameMode = ref(null)
const allGames = ref([])
const recommendedGames = ref([])

// 计算属性
const hasActiveFilters = computed(() => {
  return selectedPlayerCount.value !== null || selectedGameMode.value !== null
})

const filteredGames = computed(() => {
  let games = allGames.value

  // 按人数筛选
  if (selectedPlayerCount.value !== null) {
    games = games.filter(game => 
      selectedPlayerCount.value >= game.minPlayers && 
      selectedPlayerCount.value <= game.maxPlayers
    )
  }

  // 按游戏模式筛选
  if (selectedGameMode.value) {
    games = games.filter(game => game.gameMode === selectedGameMode.value)
  }

  return games
})

const maxTotalPlayers = computed(() => {
  return Math.max(...allGames.value.map(game => game.maxPlayers))
})

const averageDuration = computed(() => {
  const total = allGames.value.reduce((sum, game) => sum + game.duration, 0)
  return Math.round(total / allGames.value.length)
})

const uniqueGameModes = computed(() => {
  const modes = [...new Set(allGames.value.map(game => game.gameMode))]
  return modes
})

// 方法
const initializeGames = () => {
  allGames.value = getAllGameConfigs()
  recommendedGames.value = getRecommendedGames()
}

const handleFilterChange = () => {
  // 筛选条件变化时的处理逻辑
  console.log('筛选条件变化:', {
    playerCount: selectedPlayerCount.value,
    gameMode: selectedGameMode.value
  })
}

const resetFilters = () => {
  selectedPlayerCount.value = null
  selectedGameMode.value = null
}

const handleCreateRoom = async (roomData) => {
  try {
    console.log('创建房间:', roomData)
    
    // 根据游戏类型调用不同的API
    const gameConfig = allGames.value.find(game => game.type === roomData.gameType)
    
    if (!gameConfig) {
      throw new Error('未找到游戏配置')
    }

    // 如果是快速开始
    if (roomData.quickStart) {
      message.success('快速匹配中...')
      // 这里可以跳转到匹配页面或直接进入游戏
      router.push(`${gameConfig.routePath}/quick-match`)
      return
    }

    // 根据不同游戏类型处理房间创建
    switch (roomData.gameType) {
      case 'idiom':
        await createIdiomRoom(roomData)
        break
      case 'classic':
        await createClassicRoom(roomData)
        break
      case 'bubble':
        await createBubbleRoom(roomData)
        break
      case 'shooting':
        await createShootingRoom(roomData)
        break
      case 'puzzle':
        await createPuzzleRoom(roomData)
        break
      default:
        throw new Error('不支持的游戏类型')
    }

  } catch (error) {
    console.error('创建房间失败:', error)
    message.error(error.message || '创建房间失败，请重试')
  }
}

// 各种游戏类型的房间创建方法
const createIdiomRoom = async (roomData) => {
  // 这里调用成语游戏的API
  const { createIdiomGameRoom } = await import('@/api/modules/game/idiomGuess')
  
  const response = await createIdiomGameRoom(roomData)
  
  if (response.data.success) {
    const roomId = response.data.data.roomId
    message.success('房间创建成功！')
    router.push(`/idiom-guess-game/${roomId}`)
  } else {
    throw new Error(response.data.message || '创建房间失败')
  }
}

const createClassicRoom = async (roomData) => {
  // TODO: 实现经典模式房间创建
  message.info('经典模式开发中...')
}

const createBubbleRoom = async (roomData) => {
  // TODO: 实现泡泡模式房间创建
  message.info('泡泡模式开发中...')
}

const createShootingRoom = async (roomData) => {
  // TODO: 实现射击模式房间创建
  message.info('射击模式开发中...')
}

const createPuzzleRoom = async (roomData) => {
  // TODO: 实现拼图模式房间创建
  message.info('拼图模式开发中...')
}

// 生命周期
onMounted(() => {
  initializeGames()
})
</script>

<style scoped>
.quick-start {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
  color: white;
}

.header-content {
  margin-bottom: 24px;
}

.page-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  margin-bottom: 16px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-title .anticon {
  margin-right: 16px;
  color: #ffd700;
}

.page-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.quick-filters {
  display: flex;
  justify-content: center;
}

.recommended-section,
.all-games-section {
  margin-bottom: 48px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  margin-bottom: 8px;
  color: white;
}

.section-title .anticon {
  margin-right: 12px;
  color: #ffd700;
}

.section-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.recommended-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
  max-width: 400px;
  margin: 0 auto;
}

.stats-section {
  margin-top: 64px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-start {
    padding: 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .quick-filters {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
}

/* 深色主题样式 */
:deep(.ant-select) {
  .ant-select-selector {
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: white !important;
  }
  
  .ant-select-selection-placeholder {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}

:deep(.ant-btn) {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

:deep(.ant-btn:hover) {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.ant-empty-description) {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style> 