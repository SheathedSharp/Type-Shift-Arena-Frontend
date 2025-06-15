/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-31 12:00:00
 */

import axios from '@/plugins/axios'

/**
 * 获取所有模式-语言关系
 * @returns {Promise<Object>}
 */
export const fetchModeLanguageRelations = async () => {
  try {
    const response = await axios.get('/game-config/relations/mode-language')
    return response.data
  } catch (error) {
    console.error('Failed to fetch mode-language relations:', error)
    throw error
  }
}

/**
 * 获取所有语言-类型关系
 * @returns {Promise<Object>}
 */
export const fetchLanguageCategoryRelations = async () => {
  try {
    const response = await axios.get('/game-config/relations/language-category')
    return response.data
  } catch (error) {
    console.error('Failed to fetch language-category relations:', error)
    throw error
  }
}

/**
 * 获取所有类型-难度关系
 * @returns {Promise<Object>}
 */
export const fetchCategoryDifficultyRelations = async () => {
  try {
    const response = await axios.get('/game-config/relations/category-difficulty')
    return response.data
  } catch (error) {
    console.error('Failed to fetch category-difficulty relations:', error)
    throw error
  }
}

/**
 * 获取完整的关系矩阵
 * @returns {Promise<Object>}
 */
export const fetchCompleteRelationMatrix = async () => {
  try {
    const response = await axios.get('/game-config/relations/matrix')
    return response.data
  } catch (error) {
    console.error('Failed to fetch complete relation matrix:', error)
    throw error
  }
}

/**
 * 获取指定模式的详细关系
 * @param {string} modeName - 模式名称
 * @returns {Promise<Object>}
 */
export const fetchModeDetails = async (modeName) => {
  try {
    const response = await axios.get(`/game-config/relations/mode/${modeName}/details`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch mode details:', error)
    throw error
  }
} 