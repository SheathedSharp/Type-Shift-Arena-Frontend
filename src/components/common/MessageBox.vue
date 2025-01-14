<!--
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2025-01-05 11:25:47
-->
<template>
  <div class="message-box-container">
    <!-- 消息盒子触发器 -->
    <div class="message-trigger" @click="toggleExpand">
      <div class="icon-wrapper">
        <i class="material-icons">mail</i>
        <span class="message-badge" v-if="unreadCount">{{ unreadCount }}</span>
      </div>
    </div>

    <!-- 消息面板 -->
    <transition name="slide">
      <div
        class="message-panel"
        v-if="isExpanded"
        v-click-outside="closeDropdown"
      >
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
          <MessageItem
            v-for="message in filteredMessages"
            :key="message.id"
            :message="message"
            @accept="handleAcceptFriend"
            @reject="handleRejectFriend"
          />
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
import { ref, computed, onMounted } from "vue";
import { getMessages } from "@/api/modules/user/message";
import { handleFriendRequest } from "@/api/modules/friends/friends";
import MessageItem from "./MessageItem.vue";

const isExpanded = ref(false);
const currentTab = ref("all");
const messages = ref([]);
const unreadCount = ref(0);

const tabs = [
  { id: "all", name: "全部" },
  { id: "system", name: "系统" },
  { id: "friend", name: "好友" },
  { id: "game", name: "游戏" },
];

// 点击外部关闭消息面板
const closeDropdown = () => {
  isExpanded.value = false;
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const filteredMessages = computed(() => {
  if (currentTab.value === "all") return messages.value;
  return messages.value.filter((msg) =>
    msg.type.toLowerCase().includes(currentTab.value)
  );
});

// 更新未读消息计数
const updateUnreadCount = () => {
  unreadCount.value = messages.value.filter(
    (msg) => msg.status === "UNREAD"
  ).length;
};

// 获取消息
const fetchMessages = async (userId) => {
  try {
    const response = await getMessages(userId);
    messages.value = response.data;
    updateUnreadCount();
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
};

// 通过好友申请
const handleAcceptFriend = async (message) => {
  try {
    console.log("handleAcceptFriend", message);
    await handleFriendRequest(message, "ACCEPTED")
    .then(() => {
      // 更新消息列表
      const userId = localStorage.getItem("userId");
      fetchMessages(userId)
    })
  } catch (error) {
    console.error('Failed to accept friend request:', error)
  }
}

// 拒绝好友申请
const handleRejectFriend = async (message) => {
  try {
    await handleFriendRequest(message, "REJECTED")
    .then(() => {
      // 更新消息列表
      const userId = localStorage.getItem("userId");
      fetchMessages(userId)
    })
  } catch (error) {
    console.error('Failed to reject friend request:', error)
  }
}

// 组件挂载时获取消息
onMounted(() => {
  const userId = localStorage.getItem("userId");
  fetchMessages(userId);
});

// 需要暴露的方法
defineExpose({
  addMessage: (message) => {
    messages.value.unshift(message);
    if (!message.read) {
      unreadCount.value++;
    }
  },
  clearMessages: () => {
    messages.value = [];
    unreadCount.value = 0;
  },
});
</script>

<style lang="scss" scoped>
.message-box-container {
  display: flex;
  align-items: center;
}

.message-trigger {
  position: relative;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;

  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .material-icons {
    font-size: 24px;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  .message-badge {
    position: absolute;
    top: -3px;
    right: -6px;
    background: var(--accent-color);
    color: white;
    border-radius: 5px;
    font-size: 8px;
    min-width: 14px;
    text-align: center;
  }

  &:hover {
    background: var(--accent-dark);

    .material-icons {
      color: var(--accent-color);
    }
  }
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
