/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-26 22:06:40
 */

import axios from '@/plugins/axios'

/**
 * 验证配置组合是否有效
 * @param {string} mode - 游戏模式
 * @param {string} language - 游戏语言
 * @param {string} category - 游戏类型
 * @param {string} difficulty - 游戏难度
 * @returns {Promise<boolean>}
 */
export const validateConfigCombination = async (mode, language, category, difficulty) => {
  try {
    const response = await axios.get('/config/combinations/validate', {
      params: { mode, language, category, difficulty }
    })
    return response.data.valid
  } catch (error) {
    console.error('Failed to validate config combination:', error)
    throw error
  }
}

/**
 * 获取指定模式支持的语言
 * @param {string} modeName - 模式名称
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
 * 获取指定语言支持的类型
 * @param {string} languageName - 语言名称
 * @returns {Promise<GameCategory[]>}
 */
export const fetchCategoriesByLanguage = async (languageName) => {
  try {
    const response = await axios.get(`/config/languages/${languageName}/categories`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch categories by language:', error)
    throw error
  }
}

/**
 * 获取指定类型支持的难度
 * @param {string} categoryName - 类型名称
 * @returns {Promise<GameDifficulty[]>}
 */
export const fetchDifficultiesByCategory = async (categoryName) => {
  try {
    const response = await axios.get(`/config/categories/${categoryName}/difficulties`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch difficulties by category:', error)
    throw error
  }
}