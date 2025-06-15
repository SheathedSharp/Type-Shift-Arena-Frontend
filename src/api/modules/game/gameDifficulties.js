/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-27 04:26:31
 */
import axios from '@/plugins/axios'

/**
 * @typedef {Object} GameDifficulty
 * @property {string} name - Difficulty name in uppercase (e.g., 'EASY', 'MEDIUM', 'HARD')
 */

/**
 * Fetches available difficulties for a specific language and category
 * @param {string} language - Language code (e.g., 'CHINESE', 'ENGLISH')
 * @param {string} category - Category code (e.g., 'DAILY_CHAT', 'BUSINESS')
 * @returns {Promise<GameDifficulty[]>}
 */
export const fetchDifficultiesByLanguageAndCategory = async (language, category) => {
  try {
    const response = await axios.get(`/game/metadata/difficulties/${language}/${category}`)
    // console.log('Difficulties Response:', response)
    return response.data
  } catch (error) {
    console.error('Failed to fetch difficulties:', error)
    throw error
  }
}

/**
 * 获取所有激活的游戏难度 (新API)
 * @returns {Promise<GameDifficulty[]>}
 */
export const fetchActiveDifficulties = async () => {
  try {
    const response = await axios.get('/config/difficulties')
    return response.data
  } catch (error) {
    console.error('Failed to fetch active difficulties:', error)
    throw error
  }
}

/**
 * 根据名称获取游戏难度
 * @param {string} name - Difficulty name
 * @returns {Promise<GameDifficulty>}
 */
export const fetchDifficultyByName = async (name) => {
  try {
    const response = await axios.get(`/config/difficulties/${name}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch difficulty by name:', error)
    throw error
  }
}

/**
 * 创建新的游戏难度
 * @param {Object} difficultyData - Difficulty data
 * @returns {Promise<GameDifficulty>}
 */
export const createDifficulty = async (difficultyData) => {
  try {
    const response = await axios.post('/config/difficulties', difficultyData)
    return response.data
  } catch (error) {
    console.error('Failed to create difficulty:', error)
    throw error
  }
}

/**
 * 更新游戏难度
 * @param {number} id - Difficulty ID
 * @param {Object} difficultyData - Updated difficulty data
 * @returns {Promise<GameDifficulty>}
 */
export const updateDifficulty = async (id, difficultyData) => {
  try {
    const response = await axios.put(`/config/difficulties/${id}`, difficultyData)
    return response.data
  } catch (error) {
    console.error('Failed to update difficulty:', error)
    throw error
  }
}

/**
 * 删除游戏难度
 * @param {number} id - Difficulty ID
 * @returns {Promise<void>}
 */
export const deleteDifficulty = async (id) => {
  try {
    await axios.delete(`/config/difficulties/${id}`)
  } catch (error) {
    console.error('Failed to delete difficulty:', error)
    throw error
  }
}

/**
 * Converts API difficulty data to game room options format
 * @param {string[]} difficulties 
 * @returns {Object} Formatted difficulty options
 */
export const convertToGameOptions = (difficulties) => {
  // 定义难度的顺序
  const difficultyOrder = ['EASY', 'MEDIUM', 'HARD']
  
  // 先按预定义顺序排序
  const sortedDifficulties = difficulties.sort((a, b) => {
    return difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b)
  })
  
  const options = {}
  sortedDifficulties.forEach(difficulty => {
    options[difficulty.toLowerCase()] = {
      label: getDifficultyLabel(difficulty),
      value: difficulty,
      icon: getDifficultyIcon(difficulty),
      availableIn: ['matchmaking', 'custom'],
      order: difficultyOrder.indexOf(difficulty) // 添加顺序属性
    }
  })
  return options
}

// 辅助函数：获取难度显示文本
const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难'
  }
  return labelMap[difficulty] || difficulty
}

// 辅助函数：获取难度图标
const getDifficultyIcon = (difficulty) => {
  const iconMap = {
    EASY: 'material-symbols:sentiment-satisfied-outline',
    MEDIUM: 'material-symbols:sentiment-neutral-outline',
    HARD: 'material-symbols:sentiment-stressed-outline',
  }
  return iconMap[difficulty] || 'material-symbols:help-outline'
} 