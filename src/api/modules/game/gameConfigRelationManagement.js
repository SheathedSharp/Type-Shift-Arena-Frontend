/**
 * 游戏配置关系管理 API
 * 用于管理多对多关系的增删改查操作
 */
import axios from '@/plugins/axios'

// ============= 模式-语言关系管理 =============

/**
 * 添加模式-语言关系
 * @param {string} modeName - 模式名称
 * @param {string} languageName - 语言名称
 * @returns {Promise} API响应
 */
export const addModeLanguageRelation = async (modeName, languageName) => {
  try {
    const response = await axios.post('/game-config/relation-management/mode-language', null, {
      params: { modeName, languageName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to add mode-language relation:', error)
    throw error
  }
}

/**
 * 删除模式-语言关系
 * @param {string} modeName - 模式名称
 * @param {string} languageName - 语言名称
 * @returns {Promise} API响应
 */
export const deleteModeLanguageRelation = async (modeName, languageName) => {
  try {
    const response = await axios.delete('/game-config/relation-management/mode-language', {
      params: { modeName, languageName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to delete mode-language relation:', error)
    throw error
  }
}

/**
 * 批量设置模式支持的语言
 * @param {string} modeName - 模式名称
 * @param {Array} languageNames - 语言名称数组
 * @returns {Promise} API响应
 */
export const setBatchModeLanguages = async (modeName, languageNames) => {
  try {
    const response = await axios.put(
      `/game-config/relation-management/mode/${modeName}/languages`,
      languageNames
    )
    return response.data
  } catch (error) {
    console.error('Failed to set batch mode languages:', error)
    throw error
  }
}

// ============= 语言-分类关系管理 =============

/**
 * 添加语言-分类关系
 * @param {string} languageName - 语言名称
 * @param {string} categoryName - 分类名称
 * @returns {Promise} API响应
 */
export const addLanguageCategoryRelation = async (languageName, categoryName) => {
  try {
    const response = await axios.post('/game-config/relation-management/language-category', null, {
      params: { languageName, categoryName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to add language-category relation:', error)
    throw error
  }
}

/**
 * 删除语言-分类关系
 * @param {string} languageName - 语言名称
 * @param {string} categoryName - 分类名称
 * @returns {Promise} API响应
 */
export const deleteLanguageCategoryRelation = async (languageName, categoryName) => {
  try {
    const response = await axios.delete('/game-config/relation-management/language-category', {
      params: { languageName, categoryName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to delete language-category relation:', error)
    throw error
  }
}

/**
 * 批量设置语言支持的分类
 * @param {string} languageName - 语言名称
 * @param {Array} categoryNames - 分类名称数组
 * @returns {Promise} API响应
 */
export const setBatchLanguageCategories = async (languageName, categoryNames) => {
  try {
    const response = await axios.put(
      `/game-config/relation-management/language/${languageName}/categories`,
      categoryNames
    )
    return response.data
  } catch (error) {
    console.error('Failed to set batch language categories:', error)
    throw error
  }
}

// ============= 分类-难度关系管理 =============

/**
 * 添加分类-难度关系
 * @param {string} categoryName - 分类名称
 * @param {string} difficultyName - 难度名称
 * @returns {Promise} API响应
 */
export const addCategoryDifficultyRelation = async (categoryName, difficultyName) => {
  try {
    const response = await axios.post('/game-config/relation-management/category-difficulty', null, {
      params: { categoryName, difficultyName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to add category-difficulty relation:', error)
    throw error
  }
}

/**
 * 删除分类-难度关系
 * @param {string} categoryName - 分类名称
 * @param {string} difficultyName - 难度名称
 * @returns {Promise} API响应
 */
export const deleteCategoryDifficultyRelation = async (categoryName, difficultyName) => {
  try {
    const response = await axios.delete('/game-config/relation-management/category-difficulty', {
      params: { categoryName, difficultyName }
    })
    return response.data
  } catch (error) {
    console.error('Failed to delete category-difficulty relation:', error)
    throw error
  }
}

/**
 * 批量设置分类支持的难度
 * @param {string} categoryName - 分类名称
 * @param {Array} difficultyNames - 难度名称数组
 * @returns {Promise} API响应
 */
export const setBatchCategoryDifficulties = async (categoryName, difficultyNames) => {
  try {
    const response = await axios.put(
      `/game-config/relation-management/category/${categoryName}/difficulties`,
      difficultyNames
    )
    return response.data
  } catch (error) {
    console.error('Failed to set batch category difficulties:', error)
    throw error
  }
}

// ============= 系统管理操作 =============

/**
 * 重建配置组合
 * @returns {Promise} API响应
 */
export const rebuildCombinations = async () => {
  try {
    const response = await axios.post('/game-config/relation-management/rebuild-combinations')
    return response.data
  } catch (error) {
    console.error('Failed to rebuild combinations:', error)
    throw error
  }
}

/**
 * 刷新缓存
 * @returns {Promise} API响应
 */
export const refreshCache = async () => {
  try {
    const response = await axios.post('/game-config/relation-management/refresh-cache')
    return response.data
  } catch (error) {
    console.error('Failed to refresh cache:', error)
    throw error
  }
}

/**
 * 获取关系统计信息
 * @returns {Promise} API响应
 */
export const getRelationStatistics = async () => {
  try {
    const response = await axios.get('/game-config/relation-management/statistics')
    return response.data
  } catch (error) {
    console.error('Failed to get relation statistics:', error)
    throw error
  }
} 