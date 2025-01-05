<!--
 * @Author: hiddenSharp429 z404878860@163.com
 * @Date: 2025-01-05 11:25:47
-->

<template>
  <div class="message-box-container">
    <!-- 消息盒子触发器 -->
    <div class="message-trigger" @click="toggleExpand">
      <i class="material-icons">mail</i>
      <span class="message-badge" v-if="unreadCount">{{ unreadCount }}</span>
    </div>

    <!-- 消息面板 -->
    <transition name="slide">
      <div class="message-panel" v-if="isExpanded" v-click-outside="closeDropdown">
        <div class="panel-header">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="{ active: currentTab === tab.id }"
              @click="currentTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>
        </div>

        <div class="message-list" v-if="filteredMessages.length">
          <router-link
            v-for="message in filteredMessages"
            :key="message.id"
            :to="`/messages/${message.id}`"
            class="message-item"
            :class="{ unread: !message.read }"
          >
            <div class="message-content">
              <div class="message-header">
                <h4>{{ message.title }}</h4>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <p class="message-preview">{{ message.content }}</p>
            </div>
          </router-link>
        </div>
        
        <div class="empty-state" v-else>
          <i class="material-icons">inbox</i>
          <p>暂无消息</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isExpanded = ref(false)
const currentTab = ref('all')
const messages = ref([])
const unreadCount = ref(0)

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'system', name: '系统' },
  { id: 'friend', name: '好友' },
  { id: 'game', name: '游戏' }
]

// 点击外部关闭下拉框
const closeDropdown = () => {
  isExpanded.value = false
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const filteredMessages = computed(() => {
  if (currentTab.value === 'all') return messages.value
  return messages.value.filter(msg => msg.type === currentTab.value)
})

// 需要暴露的方法
defineExpose({
  addMessage: (message) => {
    messages.value.unshift(message)
    if (!message.read) {
      unreadCount.value++
    }
  },
  clearMessages: () => {
    messages.value = []
    unreadCount.value = 0
  }
})
</script>

<style lang="scss" scoped>
.message-box-container {
  display: flex;
  align-items: center;
}

.message-trigger {
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

.message-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--accent-color);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.message-panel {
  position: fixed;
  top: 80px;
  right: 0;
  left: auto;
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

// 滑动动画
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  
  .tabs {
    display: flex;
    gap: 8px;
    
    button {
      padding: 6px 12px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--accent-dark);
        color: var(--text-primary);
      }
      
      &.active {
        background: var(--accent-color);
        color: white;
      }
    }
  }
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  display: block;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-dark);
  }
  
  &.unread {
    background: rgba(var(--accent-color-rgb), 0.1);
  }
}

.message-content {
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    
    h4 {
      color: var(--text-primary);
      margin: 0;
      font-size: 14px;
    }
    
    .message-time {
      color: var(--text-secondary);
      font-size: 12px;
    }
  }
  
  .message-preview {
    color: var(--text-secondary);
    font-size: 13px;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
  
  .material-icons {
    font-size: 48px;
    margin-bottom: 8px;
    opacity: 0.5;
  }
}
</style>
