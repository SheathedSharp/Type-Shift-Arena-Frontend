/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-26 22:06:40
 */

import axios from '@/plugins/axios'

/**
 * @typedef {Object} GameLanguage
 * @property {string} code - Language code (e.g., 'zh', 'en')
 * @property {string} name - Language name in uppercase (e.g., 'CHINESE')
 * @property {string} displayName - Localized display name
 * @property {boolean} available - Whether the language is available
 */

/**
 * Fetches available game languages from the server
 * @returns {Promise<GameLanguage[]>}
 */
export const fetchAvailableLanguages = async () => {
  try {
    const response = await axios.get('/game/metadata/languages')
    // console.log('Response:', response)
    return response.data
  } catch (error) {
    console.error('Failed to fetch available languages:', error)
    throw error
  }
}

/**
 * 获取所有激活的游戏语言 (新API)
 * @returns {Promise<GameLanguage[]>}
 */
export const fetchActiveLanguages = async () => {
  try {
    const response = await axios.get('/config/languages')
    return response.data
  } catch (error) {
    console.error('Failed to fetch active languages:', error)
    throw error
  }
}

/**
 * 根据名称获取游戏语言
 * @param {string} name - Language name
 * @returns {Promise<GameLanguage>}
 */
export const fetchLanguageByName = async (name) => {
  try {
    const response = await axios.get(`/config/languages/${name}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch language by name:', error)
    throw error
  }
}

/**
 * 根据代码获取游戏语言
 * @param {string} code - Language code
 * @returns {Promise<GameLanguage>}
 */
export const fetchLanguageByCode = async (code) => {
  try {
    const response = await axios.get(`/config/languages/code/${code}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch language by code:', error)
    throw error
  }
}

/**
 * 创建新的游戏语言
 * @param {Object} languageData - Language data
 * @returns {Promise<GameLanguage>}
 */
export const createLanguage = async (languageData) => {
  try {
    const response = await axios.post('/config/languages', languageData)
    return response.data
  } catch (error) {
    console.error('Failed to create language:', error)
    throw error
  }
}

/**
 * 更新游戏语言
 * @param {number} id - Language ID
 * @param {Object} languageData - Updated language data
 * @returns {Promise<GameLanguage>}
 */
export const updateLanguage = async (id, languageData) => {
  try {
    const response = await axios.put(`/config/languages/${id}`, languageData)
    return response.data
  } catch (error) {
    console.error('Failed to update language:', error)
    throw error
  }
}

/**
 * 删除游戏语言
 * @param {number} id - Language ID
 * @returns {Promise<void>}
 */
export const deleteLanguage = async (id) => {
  try {
    await axios.delete(`/config/languages/${id}`)
  } catch (error) {
    console.error('Failed to delete language:', error)
    throw error
  }
}

/**
 * Converts API language data to game room options format
 * @param {GameLanguage[]} languages 
 * @returns {Object} Formatted language options
 */
export const convertToGameOptions = (languages) => {
  const options = {}
  languages.forEach(lang => {
    options[lang.code] = {
      label: lang.displayName,
      value: lang.name,
      icon: getLanguageIcon(lang.code),
      availableIn: ['matchmaking', 'custom'],
      disabled: !lang.available
    }
  })
  return options
}

// 辅助函数来获取语言图标
const getLanguageIcon = (code) => {
  // 返回对应的国家/地区代码用于显示国旗
  const flagMap = {
    zh: 'china', // 中国
    en: 'united-states', // 美国
    ja: 'japan', // 日本
    ko: 'south-korea', // 韩国
    fr: 'france', // 法国
    de: 'germany', // 德国
    es: 'spain', // 西班牙
    it: 'italy', // 意大利
    ru: 'russia', // 俄罗斯
    pt: 'portugal'  // 葡萄牙
  }
  return flagMap[code] || 'china'
}