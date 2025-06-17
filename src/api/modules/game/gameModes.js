/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-26 22:06:40
 */

import axios from '@/plugins/axios'

/**
 * @typedef {Object} GameMode
 * @property {number} id - Mode ID
 * @property {string} name - Mode name in uppercase (e.g., 'STANDARD', 'BLITZ')
 * @property {string} displayName - Localized display name
 * @property {string} description - Mode description
 * @property {boolean} isActive - Whether the mode is active
 * @property {number} sortOrder - Sort order
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * 获取所有激活的游戏模式
 * @returns {Promise<GameMode[]>}
 */
export const fetchActiveModes = async () => {
  try {
    const response = await axios.get('/config/modes')
    return response.data
  } catch (error) {
    console.error('Failed to fetch active modes:', error)
    throw error
  }
}

/**
 * 获取所有游戏模式（包括禁用的）
 * @returns {Promise<GameMode[]>}
 */
export const fetchAllModes = async () => {
  try {
    const response = await axios.get('/config/modes?includeInactive=true')
    return response.data
  } catch (error) {
    console.error('Failed to fetch all modes:', error)
    throw error
  }
}

/**
 * 根据名称获取游戏模式
 * @param {string} name - Mode name
 * @returns {Promise<GameMode>}
 */
export const fetchModeByName = async (name) => {
  try {
    const response = await axios.get(`/config/modes/${name}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch mode by name:', error)
    throw error
  }
}

/**
 * 创建新的游戏模式
 * @param {Object} modeData - Mode data
 * @returns {Promise<GameMode>}
 */
export const createMode = async (modeData) => {
  try {
    const response = await axios.post('/config/modes', modeData)
    return response.data
  } catch (error) {
    console.error('Failed to create mode:', error)
    throw error
  }
}

/**
 * 更新游戏模式
 * @param {number} id - Mode ID
 * @param {Object} modeData - Updated mode data
 * @returns {Promise<GameMode>}
 */
export const updateMode = async (id, modeData) => {
  try {
    const response = await axios.put(`/config/modes/${id}`, modeData)
    return response.data
  } catch (error) {
    console.error('Failed to update mode:', error)
    throw error
  }
}

/**
 * 删除游戏模式
 * @param {number} id - Mode ID
 * @returns {Promise<void>}
 */
export const deleteMode = async (id) => {
  try {
    await axios.delete(`/config/modes/${id}`)
  } catch (error) {
    console.error('Failed to delete mode:', error)
    throw error
  }
}

/**
 * 获取指定模式支持的语言
 * @param {string} modeName - Mode name
 * @returns {Promise<GameLanguage[]>}
 */
export const fetchLanguagesByMode = async (modeName) => {
  try {
    const response = await axios.get(`/config/modes/${modeName}/languages`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch languages by mode:', error)
    throw error
  }
}

/**
 * 转换为游戏选项格式
 * @param {GameMode[]} modes 
 * @returns {Object} Formatted mode options
 */
export const convertToGameOptions = (modes) => {
  const options = {}
  modes.forEach(mode => {
    options[mode.name.toLowerCase()] = {
      label: mode.displayName,
      value: mode.name,
      icon: getModeIcon(mode.name),
      availableIn: ['matchmaking', 'custom'],
      disabled: !mode.isActive
    }
  })
  return options
}

// 辅助函数来获取模式图标
const getModeIcon = (name) => {
  const iconMap = {
    STANDARD: 'material-symbols:play-circle-outline',
    BLITZ: 'material-symbols:flash-on',
    TOURNAMENT: 'material-symbols:emoji-events-outline',
    PRACTICE: 'material-symbols:school-outline',
    CUSTOM: 'material-symbols:tune'
  }
  return iconMap[name] || 'material-symbols:play-circle-outline'
} 