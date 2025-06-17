/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-12-25 05:39:56
 */
/**
 * 导航菜单配置
 * @typedef {Object} NavigatorItem
 * @property {string} path - 路由路径
 * @property {string} label - 显示文本
 * @property {string} icon - Material Icon 名称
 * @property {boolean} [hidden] - 是否在菜单中隐藏
 * @property {string} [permission] - 访问所需权限
 */

export const NAVIGATOR_ASSETS = {
  quickStart: {
    path: '/quick-start',
    label: '快速开始',
    icon: 'star',
    permission: 'user'
  },
  gamelobby: {
    path: '/game-lobby',
    label: '游戏大厅',
    icon: 'sports_esports',
    permission: 'user'
  },
  personal: {
    path: '/personal',
    label: '个人中心',
    icon: 'person',
    permission: 'user'
  },
  settings: {
    path: '/settings',
    label: '设置',
    icon: 'settings',
    permission: 'user'
  },
  matchMakelobby: {
    path: '/macth-make-lobby',
    label: '匹配大厅',
    icon: 'military_tech',
    permission: 'user'
  },
  typingPractice: {
    path: '/typing-practice',
    label: '个人练习',
    icon: 'sports_soccer',
    permission: 'user'
  },
  gameConfigManagement: {
    path: '/game-config',
    label: '配置管理',
    icon: 'material-symbols:settings-outline',
    permission: 'admin'
  },
  gameConfigRelations: {
    path: '/game-config-relations',
    label: '关系查看',
    icon: 'material-symbols:account-tree',
    permission: 'admin'
  },
  gameConfigRelationManagement: {
    path: '/game-config-relation-management',
    label: '关系管理',
    icon: 'material-symbols:link',
    permission: 'admin'
  },
};

/**
 * 获取可见的导航菜单项
 * @param {string[]} [userPermissions=[]] - 用户权限列表
 * @returns {NavigatorItem[]} 过滤后的导航项数组
 */
export const getVisibleNavigators = (userPermissions = []) => {
  return Object.values(NAVIGATOR_ASSETS)
    .filter(item => {
      // 如果项目被标记为隐藏，则不显示
      if (item.hidden) return false;
      // 如果需要权限且用户没有对应权限，则不显示
      if (item.permission && !userPermissions.includes(item.permission)) return false;
      return true;
    });
};