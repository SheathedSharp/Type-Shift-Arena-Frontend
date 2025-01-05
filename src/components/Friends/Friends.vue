<template>
  <div class="friends-box-container">
    <!-- 好友列表触发器 -->
    <div class="friends-trigger" @click="toggleExpand">
      <i class="material-icons">group</i>
      <span class="online-count" v-if="onlineCount">{{ onlineCount }}</span>
    </div>

    <!-- 好友列表面板 -->
    <transition name="slide">
      <div class="friends-panel" v-if="isExpanded" v-click-outside="closePanel">
        <!-- 用户信息头部 -->
        <div class="panel-header">
          <div class="user-info">
            <a-avatar :src="userInfo.avatarUrl" :size="40">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="nickname">{{ userInfo.nickname }}</span>
          </div>
          <div class="search-btn" @click="isSearch=!isSearch" title="添加好友">
            <i class="material-icons">person_add</i>
          </div>
        </div>

        <!-- 好友列表 -->
        <div class="friends-list">
          <div 
            v-for="friend in friendsList" 
            :key="friend.id" 
            class="friend-item"
            :class="{ 'offline': !friend.online }"
            @click="handleFriendClick(friend)"
          >
            <div class="friend-info">
              <a-avatar 
                :src="friend.imgUrl"
                :size="40"
              >
                <user-outlined />
              </a-avatar>
              <div class="friend-details">
                <span class="friend-name">{{friend.name}}</span>
                <span class="status-text">{{ friend.online ? '在线' : '离线' }}</span>
              </div>
              <div class="status-indicator" :class="{ 'online': friend.online }"></div>
            </div>
            
            <div class="actions" @click.stop>
              <button class="action-btn invite" @click="invToGame(friend.id)" title="邀请游戏">
                <i class="material-icons">sports_esports</i>
              </button>
              <button class="action-btn remove" @click="removeFriendHandler(friend.id)" title="删除好友">
                <i class="material-icons">person_remove</i>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="!friendsList.length">
          <i class="material-icons">group_off</i>
          <p>暂无好友</p>
        </div>
      </div>
    </transition>
  </div>

  <!-- 搜索弹窗 -->
  <teleport to="body">
    <Search v-if="isSearch" @close="isSearch = false"></Search>
  </teleport>
</template>

<script setup>
import { inject, ref, computed, onMounted } from "vue";
import Search from "./Search.vue";
import { getFriends, removeFriend } from "@/api/modules/friends/friends";
import { ElMessage } from 'element-plus';

const isExpanded = ref(false)
const isSearch = ref(false)
const friendsList = ref([])
const userId = localStorage.getItem('userId')
const userInfo = inject('userInfo')

// 计算在线好友数量
const onlineCount = computed(() => {
  return friendsList.value.filter(friend => friend.online).length
})

const closePanel = () => {
  isExpanded.value = false
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 获取好友列表
const getFriendsList = async () => {
  try {
    const res = await getFriends(userId)
    console.log(res)
    if (res.status === 200) {
      friendsList.value = res.data.map(friend => ({
        id: friend.id,
        name: friend.username,
        imgUrl: friend.imgSrc,
        online: friend.online // 如果后端提供在线状态
      }))
    } else {
      ElMessage.error(res.message || '获取好友列表失败')
    }
  } catch (error) {
    console.error('获取好友列表错误:', error)
    ElMessage.error('获取好友列表失败')
  }
}

// 删除好友
const removeFriendHandler = async (friendId) => {
  try {
    const res = await removeFriend(userId, friendId)
    if (res.success) {
      ElMessage.success('删除好友成功')
      getFriendsList() // 刷新好友列表
    } else {
      ElMessage.error(res.message || '删除好友失败')
    }
  } catch (error) {
    console.error('删除好友错误:', error)
    ElMessage.error('删除好友失败')
  }
}

// 邀请好友进入游戏
const invToGame = (friendId) => {
  // TODO: 实现邀请好友进入游戏的逻辑
  console.log('邀请好友:', friendId)
}

// 添加好友点击处理函数
const handleFriendClick = (friend) => {
  console.log('点击好友:', friend)
  // 这里可以添加点击好友后的操作，比如打开聊天窗口等
}

const updateFriendStatus = (event) => {
  const { userId, online } = event.data;
  const friendIndex = friendsList.value.findIndex(friend => friend.id === userId);
  
  if (friendIndex !== -1) {
    friendsList.value[friendIndex] = {
      ...friendsList.value[friendIndex],
      online: online
    };
  }
};

onMounted(() => {
  getFriendsList()
  // 监听好友状态
  window.addEventListener("friend-status", (event) => {
    updateFriendStatus(event.detail);
  });
})
</script>

<style lang="scss" scoped>
.friends-box-container {
  position: relative;
  display: inline-block;
}

.friends-trigger {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  .material-icons {
    font-size: 24px;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
  
  &:hover {
    background: var(--accent-dark);
    
    .material-icons {
      color: var(--accent-color);
    }
  }
}

.online-count {
  position: absolute;
  top: 3px;
  right: 6px;
  background: var(--accent-color);
  color: white;
  border-radius: 5px;
  font-size: 8px;
  min-width: 14px;
  text-align: center;
}

.friends-panel {
  position: fixed;
  top: 80px;
  right: 0;
  width: 320px;
  height: calc(100vh - 140px);
  background: rgba(17, 17, 17, 0.9);
  border-radius: 16px 0 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
}

.panel-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .nickname {
      color: var(--text-primary);
      font-weight: 500;
    }
  }

  .search-btn {
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--accent-dark);
      .material-icons {
        color: var(--accent-color);
      }
    }
  }
}

.friends-list {
  overflow-y: auto;
  height: calc(100% - 73px);
  padding: 8px;
}

.friend-item {
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(79, 70, 229, 0.15);
    transform: translateX(-8px);
  }

  &.offline {
    opacity: 0.6;
  }
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.friend-details {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .friend-name {
    color: var(--text-primary);
    font-weight: 500;
  }

  .status-text {
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  margin-left: 8px;

  &.online {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }
}

.actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.friend-item:hover .actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &.invite {
    background: rgba(79, 70, 229, 0.2);
    color: var(--accent-color);

    &:hover {
      background: rgba(79, 70, 229, 0.3);
      transform: translateY(-2px);
    }
  }

  &.remove {
    background: rgba(239, 68, 68, 0.2);
    color: rgb(239, 68, 68);

    &:hover {
      background: rgba(239, 68, 68, 0.3);
      transform: translateY(-2px);
    }
  }
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  .material-icons {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
}

// 滑动动画
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

// 滚动条样式
.friends-list::-webkit-scrollbar {
  width: 4px;
}

.friends-list::-webkit-scrollbar-track {
  background: transparent;
}

.friends-list::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.3);
  border-radius: 4px;

  &:hover {
    background: rgba(79, 70, 229, 0.5);
  }
}
</style>
