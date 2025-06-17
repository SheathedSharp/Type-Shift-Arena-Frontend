<template>
  <div class="idiom-guess-game">
    <!-- 游戏头部信息栏 -->
    <div class="game-header">
      <div class="game-info">
        <div class="round-info">
          <span class="round-text">第 {{ currentRound }} 轮</span>
          <span class="divider">|</span>
          <span class="timer">{{ formatTime(timeLeft) }}</span>
        </div>
        <div class="teams-score">
          <div class="team" :class="{ active: currentTeam === 1 }">
            <span class="team-name">队伍一</span>
            <span class="score">{{ team1Score }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team" :class="{ active: currentTeam === 2 }">
            <span class="team-name">队伍二</span>
            <span class="score">{{ team2Score }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-content">
      <!-- 游戏准备阶段 -->
      <div v-if="gamePhase === 'preparation'" class="preparation-phase">
        <div class="player-setup">
          <h2>看图识成语</h2>
          <p class="game-description">两队玩家轮流猜测成语，看图识成语，挑战你的文化底蕴！</p>
          
          <div class="team-assignment">
            <div class="team-section">
              <h3>{{ teams.team1.name }}</h3>
              <div class="player-list">
                <div 
                  v-for="player in team1Players" 
                  :key="player.id"
                  class="player-item"
                >
                  {{ player.name }}
                </div>
                <div v-if="team1Players.length === 0" class="empty-team">
                  等待玩家加入...
                </div>
              </div>
            </div>
            
            <div class="team-section">
              <h3>{{ teams.team2.name }}</h3>
              <div class="player-list">
                <div 
                  v-for="player in team2Players" 
                  :key="player.id"
                  class="player-item"
                >
                  {{ player.name }}
                </div>
                <div v-if="team2Players.length === 0" class="empty-team">
                  等待玩家加入...
                </div>
              </div>
            </div>
          </div>

          <div class="ready-section">
            <div class="ready-players">
              准备就绪: {{ playersReady.size }} / {{ totalPlayers }}
            </div>
            <button 
              @click="toggleReady" 
              :class="['ready-btn', { ready: isCurrentPlayerReady }]"
            >
              {{ isCurrentPlayerReady ? '取消准备' : '准备' }}
            </button>
          </div>

          <button 
            v-if="allPlayersReady && isHost && totalPlayers >= 2" 
            @click="startGame" 
            class="start-game-btn"
          >
            开始游戏
          </button>
          
          <div v-if="totalPlayers < 2" class="waiting-message">
            等待更多玩家加入房间（至少需要2人）
          </div>
        </div>
      </div>

      <!-- 倒计时阶段 -->
      <div v-if="gamePhase === 'countdown'" class="countdown-phase">
        <div class="countdown-display">
          <div class="countdown-number">{{ countdown }}</div>
          <div class="countdown-text">游戏即将开始</div>
        </div>
      </div>

      <!-- 游戏进行阶段 -->
      <div v-if="gamePhase === 'playing'" class="playing-phase">
        <div class="image-container">
          <!-- 成语图片 -->
          <div class="image-wrapper">
            <img 
              :src="currentImage.url" 
              :alt="currentImage.idiom"
              class="idiom-image"
              @load="onImageLoad"
            />
            <!-- 遮罩层 -->
            <div 
              class="mask-overlay"
              :style="maskStyle"
              v-if="showMask"
            ></div>
          </div>

          <!-- 成语描述（15秒后显示） -->
          <div v-if="showDescription" class="description-container">
            <h3>成语含义</h3>
            <p>{{ currentImage.description }}</p>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="guess-input">
            <input 
              v-model="currentGuess"
              @keyup.enter="submitGuess"
              :placeholder="`轮到队伍${currentTeam}猜测...`"
              :disabled="!isCurrentTeamTurn"
              maxlength="4"
              class="guess-field"
            />
            <button 
              @click="submitGuess" 
              :disabled="!currentGuess.trim() || !isCurrentTeamTurn"
              class="submit-btn"
            >
              提交
            </button>
          </div>

          <!-- 猜测历史 -->
          <div class="guess-history">
            <div 
              v-for="(guess, index) in currentRoundGuesses" 
              :key="index"
              :class="['guess-item', { correct: guess.isCorrect, wrong: !guess.isCorrect }]"
            >
              <span class="team-indicator">队伍{{ guess.team }}</span>
              <span class="guess-text">{{ guess.text }}</span>
              <span class="result-icon">{{ guess.isCorrect ? '✓' : '✗' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 回合结束阶段 -->
      <div v-if="gamePhase === 'roundEnd'" class="round-end-phase">
        <div class="round-result">
          <h2>回合结束</h2>
          <div class="correct-answer">
            <p>正确答案：<strong>{{ currentImage.idiom }}</strong></p>
            <p class="answer-description">{{ currentImage.description }}</p>
          </div>
          
          <div v-if="roundWinner" class="winner-announcement">
            <p>恭喜队伍{{ roundWinner }}获得本轮胜利！</p>
          </div>
          
          <div v-else class="no-winner">
            <p>本轮无人答对</p>
          </div>

          <button @click="nextRound" class="next-round-btn">
            {{ isGameOver ? '查看最终结果' : '下一轮' }}
          </button>
        </div>
      </div>

      <!-- 游戏结束阶段 -->
      <div v-if="gamePhase === 'gameEnd'" class="game-end-phase">
        <div class="final-result">
          <h2>游戏结束</h2>
          <div class="final-scores">
            <div class="team-final-score">
              <h3>队伍一</h3>
              <div class="score">{{ team1Score }}</div>
            </div>
            <div class="team-final-score">
              <h3>队伍二</h3>
              <div class="score">{{ team2Score }}</div>
            </div>
          </div>
          
          <div class="game-winner">
            <h3>
              {{ finalWinner === 'tie' ? '平局！' : `队伍${finalWinner}获胜！` }}
            </h3>
          </div>

          <div class="game-actions">
            <button @click="restartGame" class="restart-btn">再来一局</button>
            <button @click="backToLobby" class="back-btn">返回大厅</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import { useIdiomGameState } from '@/composables/useIdiomGameState'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id

// WebSocket 相关
const {
  stompClient,
  connectionStatus,
  connectWebSocket,
  subscribeToRoomBroadcast,
  subscribeToPlayerChannel,
} = useWebSocket(roomId)

// 游戏状态管理
const {
  // 状态
  gamePhase,
  currentRound,
  maxRounds,
  timeLeft,
  teams,
  currentTeam,
  playersReady,
  totalPlayers,
  isHost,
  currentImage,
  guesses,
  roundWinner,
  maskProgress,
  showDescription,
  
  // 计算属性
  allPlayersReady,
  isGameOver,
  finalWinner,
  
  // 方法
  handleGameMessage,
  joinGame,
  leaveGame,
  toggleReady,
  startGame: startGameAction,
  submitGuess: submitGuessAction,
  nextRound,
  restartGame: restartGameAction,
  updateTimer,
  updateMask
} = useIdiomGameState(roomId, stompClient)

// 本地UI状态
const countdown = ref(3)
const gameTimer = ref(null)
const maskTimer = ref(null)
const currentGuess = ref('')

// 计算属性
const team1Players = computed(() => teams.value.team1.players)
const team2Players = computed(() => teams.value.team2.players)
const team1Score = computed(() => teams.value.team1.score)
const team2Score = computed(() => teams.value.team2.score)
const currentRoundGuesses = computed(() => guesses.value)

const isCurrentPlayerReady = computed(() => {
  const playerId = localStorage.getItem('userId')
  return playersReady.value.has(playerId)
})

const isCurrentTeamTurn = computed(() => {
  // 判断当前玩家是否在当前活跃队伍中
  const playerId = localStorage.getItem('userId')
  const activeTeam = teams.value[`team${currentTeam.value}`]
  return activeTeam.players.some(p => p.id === playerId)
})

// 遮罩样式计算
const maskStyle = computed(() => {
  const opacity = maskProgress.value / 100
  return {
    background: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
    opacity: opacity
  }
})

const showMask = computed(() => maskProgress.value > 0)

// 方法
const startGame = () => {
  startGameAction()
  
  // 本地倒计时处理
  gamePhase.value = 'countdown'
  countdown.value = 3
  
  const countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const submitGuess = () => {
  if (!currentGuess.value.trim()) return
  
  submitGuessAction(currentGuess.value.trim())
  currentGuess.value = ''
}

const restartGame = () => {
  restartGameAction()
}

const backToLobby = () => {
  router.push('/game-lobby')
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const onImageLoad = () => {
  console.log('图片加载完成')
}

// 监听游戏阶段变化，启动本地定时器
watch(gamePhase, (newPhase) => {
  if (newPhase === 'playing') {
    // 启动游戏计时器
    if (gameTimer.value) clearInterval(gameTimer.value)
    gameTimer.value = setInterval(() => {
      updateTimer()
    }, 1000)
    
    // 启动遮罩动画计时器
    if (maskTimer.value) clearInterval(maskTimer.value)
    maskTimer.value = setInterval(() => {
      if (timeLeft.value > 15) {
        // 前15秒遮罩逐渐移除
        const elapsed = 30 - timeLeft.value
        const progress = Math.max(0, 100 - (elapsed / 15) * 100)
        updateMask(progress)
      } else {
        // 15秒后完全移除遮罩
        updateMask(0)
      }
    }, 100)
  } else {
    // 其他阶段清理定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value)
      gameTimer.value = null
    }
    if (maskTimer.value) {
      clearInterval(maskTimer.value)
      maskTimer.value = null
    }
  }
})

// 生命周期
onMounted(async () => {
  // 连接WebSocket
  try {
    await connectWebSocket()
    await subscribeToRoomBroadcast(roomId)
    
    const playerId = localStorage.getItem('userId')
    await subscribeToPlayerChannel(playerId)
    
    // 设置WebSocket事件监听
    window.addEventListener('room-broadcast', (event) => {
      handleGameMessage(event.detail)
    })
    
    window.addEventListener('player-channel', (event) => {
      handleGameMessage(event.detail)
    })
    
    // 加入游戏
    joinGame(roomId, playerId)
  } catch (error) {
    console.error('连接失败:', error)
  }
})

onUnmounted(() => {
  // 清理定时器
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  if (maskTimer.value) {
    clearInterval(maskTimer.value)
  }
  
  // 移除事件监听
  window.removeEventListener('room-broadcast', handleGameMessage)
  window.removeEventListener('player-channel', handleGameMessage)
  
  // 离开游戏
  leaveGame()
})
</script>

<style scoped>
.idiom-guess-game {
  min-height: 100vh;
  background: var(--primary-dark);
  color: var(--text-primary);
  padding: 20px;
}

.game-header {
  background: var(--secondary-dark);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.round-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.2rem;
  font-weight: 600;
}

.round-text {
  color: var(--accent-color);
}

.timer {
  color: var(--warning-color);
  font-family: 'Courier New', monospace;
}

.divider {
  color: var(--text-secondary);
}

.teams-score {
  display: flex;
  align-items: center;
  gap: 30px;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 25px;
  background: var(--accent-dark);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.team.active {
  background: var(--accent-color);
  transform: scale(1.05);
}

.team-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-secondary);
}

.game-content {
  background: var(--secondary-dark);
  border-radius: 12px;
  padding: 30px;
  min-height: 600px;
  box-shadow: var(--shadow-lg);
}

/* 准备阶段样式 */
.preparation-phase {
  text-align: center;
}

.player-setup h2 {
  color: var(--accent-color);
  margin-bottom: 30px;
}

.game-description {
  color: var(--text-secondary);
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.empty-team {
  color: var(--text-secondary);
  font-style: italic;
  padding: 10px 15px;
  background: var(--primary-dark);
  border-radius: 6px;
  border: 2px dashed var(--border-color);
}

.waiting-message {
  color: var(--warning-color);
  margin-top: 20px;
  padding: 15px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  border-left: 4px solid var(--warning-color);
}

.team-assignment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.team-section h3 {
  color: var(--accent-color);
  margin-bottom: 20px;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-item {
  padding: 10px 15px;
  background: var(--accent-dark);
  border-radius: 6px;
  color: var(--text-primary);
}

.ready-section {
  margin-bottom: 30px;
}

.ready-players {
  margin-bottom: 15px;
  color: var(--text-secondary);
}

.ready-btn {
  padding: 12px 30px;
  background: var(--secondary-dark);
  color: var(--text-primary);
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ready-btn:hover {
  background: var(--accent-color);
}

.ready-btn.ready {
  background: var(--success-color);
  border-color: var(--success-color);
}

.start-game-btn {
  padding: 15px 40px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.start-game-btn:hover {
  transform: translateY(-2px);
}

/* 倒计时阶段样式 */
.countdown-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.countdown-display {
  text-align: center;
}

.countdown-number {
  font-size: 6rem;
  font-weight: bold;
  color: var(--accent-color);
  animation: countdownPulse 1s infinite;
}

.countdown-text {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-top: 20px;
}

@keyframes countdownPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 游戏进行阶段样式 */
.playing-phase {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  height: 600px;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-wrapper {
  position: relative;
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--accent-dark);
}

.idiom-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mask-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity 0.3s ease;
}

.description-container {
  background: var(--accent-dark);
  padding: 20px;
  border-radius: 8px;
}

.description-container h3 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.guess-input {
  display: flex;
  gap: 10px;
}

.guess-field {
  flex: 1;
  padding: 15px;
  background: var(--accent-dark);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
}

.guess-field:focus {
  border-color: var(--accent-color);
  outline: none;
}

.submit-btn {
  padding: 15px 25px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.guess-history {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guess-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.guess-item.correct {
  background: rgba(52, 211, 153, 0.2);
  border-left: 4px solid var(--success-color);
}

.guess-item.wrong {
  background: rgba(239, 68, 68, 0.2);
  border-left: 4px solid var(--danger-color);
}

.team-indicator {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.guess-text {
  font-weight: 600;
}

.result-icon {
  font-size: 1.2rem;
}

.guess-item.correct .result-icon {
  color: var(--success-color);
}

.guess-item.wrong .result-icon {
  color: var(--danger-color);
}

/* 回合结束和游戏结束样式 */
.round-end-phase,
.game-end-phase {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}

.round-result,
.final-result {
  text-align: center;
  background: var(--accent-dark);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}

.round-result h2,
.final-result h2 {
  color: var(--accent-color);
  margin-bottom: 30px;
}

.correct-answer {
  margin-bottom: 30px;
}

.correct-answer strong {
  color: var(--accent-color);
  font-size: 1.5rem;
}

.answer-description {
  color: var(--text-secondary);
  margin-top: 10px;
}

.winner-announcement {
  color: var(--success-color);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 30px;
}

.no-winner {
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.final-scores {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-bottom: 30px;
}

.team-final-score {
  text-align: center;
}

.team-final-score h3 {
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.team-final-score .score {
  font-size: 3rem;
  font-weight: bold;
  color: var(--accent-color);
}

.game-winner h3 {
  color: var(--success-color);
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.game-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.next-round-btn,
.restart-btn,
.back-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.next-round-btn,
.restart-btn {
  background: var(--accent-color);
  color: white;
}

.back-btn {
  background: var(--secondary-dark);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.next-round-btn:hover,
.restart-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.back-btn:hover {
  border-color: var(--accent-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playing-phase {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .teams-score {
    flex-direction: column;
    gap: 15px;
  }
  
  .team-assignment {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .final-scores {
    flex-direction: column;
    gap: 20px;
  }
  
  .game-actions {
    flex-direction: column;
  }
}
</style>