/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-25 05:39:56
 */

import { store } from '@/stores/store'

/**
 * 权限级别定义
 */
export const PERMISSIONS = {
  USER: 'user',
  ADMIN: 'admin'
}

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS = {
  user: ['user'],
  admin: ['user', 'admin'], // 管理员包含用户权限
}

/**
 * 根据角色获取权限列表
 * @param {string} role - 用户角色
 * @returns {string[]} 权限列表
 */
export const getPermissionsByRole = (role) => {
  return ROLE_PERMISSIONS[role] || ['user']
}

/**
 * 获取当前用户的权限列表
 * @returns {string[]} 权限列表
 */
export const getCurrentUserPermissions = () => {
  return getPermissionsByRole(store.userRole)
}

/**
 * 检查用户是否有指定权限
 * @param {string} permission - 需要检查的权限
 * @returns {boolean} 是否有权限
 */
export const hasPermission = (permission) => {
  const userPermissions = getCurrentUserPermissions()
  return userPermissions.includes(permission)
}

/**
 * 检查用户是否是管理员
 * @returns {boolean} 是否是管理员
 */
export const isAdmin = () => {
  return store.userRole === 'admin'
}

/**
 * 检查用户是否是普通用户
 * @returns {boolean} 是否是普通用户
 */
export const isUser = () => {
  return store.userRole === 'user'
}

/**
 * 设置用户角色
 * @param {string} role - 用户角色
 */
export const setUserRole = (role) => {
  store.userRole = role
  localStorage.setItem('userRole', role)
}

/**
 * 清除用户权限
 */
export const clearUserPermissions = () => {
  store.userRole = 'user'
  localStorage.removeItem('userRole')
}

/**
 * 从 JWT token 中解析用户权限
 * @param {string} token - JWT token
 * @returns {object} 解析出的用户信息
 */
export const parseUserPermissionsFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      role: payload.role || 'user'
    }
  } catch (error) {
    console.error('解析 token 失败:', error)
    return {
      role: 'user'
    }
  }
} 