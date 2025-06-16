<!--
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-10-28 20:13:49
-->
<script setup>
import { store } from "../stores/store";
import {
  toRef,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  provide,
  computed,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { ElNotification } from "element-plus";
import { getVisibleNavigators } from "@/config/navigatorAssets";
import MessageBox from "@/components/common/MessageBox.vue";
import Friends from "@/components/Friends/Friends.vue";
import { useFriendMessages } from "@/composables/useFriendMessages";
import IconSvg from '@/assets/icons/IconSvg.vue';
import { getCurrentUserPermissions } from '@/utils/permissions';


const router = useRouter();
const route = useRoute();
const isLoggedIn = toRef(store, "isLoggedIn");
const avatarUrl = toRef(store, "avatarUrl");
const nickname = toRef(store, "nickname");
const userInfo = reactive({
  isLoggedIn,
  avatarUrl,
  nickname,
});
const isSidebarExpanded = ref(false);
const showSidebar = ref(false); // 控制侧边栏是否显示
const currentRoute = computed(() => route.path);
const menuItems = computed(() => {
  const userPermissions = getCurrentUserPermissions();
  return getVisibleNavigators(userPermissions);
});
const { handleFriendMessage } = useFriendMessages();
const messageBoxRef = ref(null);

let tokenCheckInterval; // 检查token的定时器

provide("userInfo", userInfo);

// 检查Token有效期
const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // JWT token consists of three parts separated by dots
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds

    if (Date.now() >= expirationTime) {
      logout();
      ElNotification({
        title: "会话过期",
        message: "登录已过期，请重新登录",
        type: "warning",
        duration: 3000,
      });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    logout();
  }
};

// 退出账号
const logout = () => {
  localStorage.removeItem("token");
  delete axios.defaults.headers.common["Authorization"];
  store.isLoggedIn = false;
  ElNotification({
    title: "退出账号",
    message: "你成功的退出的账号",
    type: "success",
    duration: 1500,
  });
  router.push("/auth");
};

// 展开侧边栏
const expandSidebar = () => {
  isSidebarExpanded.value = true;
};

// 收起侧边栏
const collapseSidebar = () => {
  isSidebarExpanded.value = false;
};

onMounted(() => {
  // Initial check
  checkTokenExpiration();
  // Set up periodic checks
  tokenCheckInterval = setInterval(checkTokenExpiration, 60000);
});

onBeforeUnmount(() => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }
});

// 监听登录状态变化
watch(
  () => store.isLoggedIn,
  (newValue) => {
    if (newValue) {
      // 监听好友消息
      window.addEventListener("friend-messages", (event) => {
        if (event.detail?.data?.status === "UNREAD") {
          messageBoxRef.value?.addMessage(event.detail.data);
        }
        handleFriendMessage(event.detail);
      });

      // 登录后，延迟显示侧边栏，配合动画效果
      setTimeout(() => {
        showSidebar.value = true;
      }, 100);
    } else {
      // 登出时立即隐藏侧边栏
      showSidebar.value = false;
      isSidebarExpanded.value = false;
      // 清空消息
      messageBoxRef.value?.clearMessages();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="header">
      <nav>
        <router-link to="/" class="logo" data-text="Type Shi(f)t Arena">
          Type Shi(f)t Arena
        </router-link>
        <div class="nav-links">
          <template v-if="!isLoggedIn">
            <router-link to="/auth">登录/注册</router-link>
          </template>
          <template v-else>
            <div class="user-info">
              <div class="user-avatar">
                <img id="userAvatar" :src="avatarUrl" :alt="nickname" />
              </div>
              <span class="user-nickname">{{ nickname }}</span>
              <div class="actions">
                <MessageBox ref="messageBoxRef" />
                <Friends ref="friendsBox" />
                <button class="logout-btn" @click="logout">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content with Sidebar -->
    <div class="main-container">
      <!-- Collapsible Sidebar -->
      <transition name="sidebar">
        <div
          v-if="showSidebar"
          class="sidebar"
          :class="{ expanded: isSidebarExpanded }"
          @mouseenter="expandSidebar"
          @mouseleave="collapseSidebar"
        >
          <div class="sidebar-content">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: currentRoute === item.path }"
            >
              <IconSvg :name="item.icon" />
              <span class="menu-text">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </transition>

      <!-- Main Content Area -->
      <main class="content" :class="{ 'with-sidebar': showSidebar }">
        <router-view></router-view>
      </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <span class="footer-logo">Type Shift Arena</span>
      <span class="footer-cr">Copyright (c) 2024 Type Shift Arena</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" class="footer-link"
        >粤ICP备2024219097号-3</a
      >
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-dark);
}

/* Header Styles */
.header {
  position: fixed; /* 固定定位 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保在最上层 */
  background-color: var(--secondary-dark);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  padding: 1rem;
  color: var(--text-primary);
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: "Russo One", sans-serif;
  color: transparent;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 200% auto;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    background: var(--gradient-secondary);
    -webkit-background-clip: text;
    background-clip: text;
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.3));
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: white;
}

.nav-links a:hover {
  text-decoration: underline;
}

.logout-btn {
  background: transparent;
  border: none;
  padding: 8px;
  height: 40px;
  width: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;

  svg {
    font-size: 24px;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  &:hover {
    background: var(--accent-dark);

    svg {
      color: var(--accent-color);
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  position: relative;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--accent-color);
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--accent-hover);
  }
}

.user-nickname {
  color: var(--text-primary);
  font-weight: 500;
  margin: 0 8px;
}

.actions {
  display: flex;
  align-items: center; /* 确保垂直居中对齐 */
  gap: 4px; /* 减小间距 */
  height: 40px; /* 固定高度 */

  &:hover {
    background: var(--gradient-primary);
    border-radius: 16px;
  }
}

/* 添加深度选择器来统一 MessageBox 和 Friends 组件的触发器样式 */
:deep(.message-trigger),
:deep(.friends-trigger) {
  height: 40px; /* 固定高度 */
  width: 40px; /* 固定宽度 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  svg {
    font-size: 24px;
  }
}

/* Sidebar Styles */
.main-container {
  display: flex;
  flex: 1;
  position: relative;
}

.sidebar {
  position: fixed;
  height: 80vh;
  top: 90px;
  left: 0;
  width: 70px;
  background-color: var(--secondary-dark);
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  z-index: 100;
  border-right: 1px solid var(--border-color);
  border-radius: 0 12px 12px 0;
}

.sidebar.expanded {
  width: 240px;
}

.sidebar-content {
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  margin: 0.5rem;
  border-radius: 8px;

  &:hover {
    background-color: var(--accent-dark);
  }

  &.active {
    background: var(--gradient-primary);
    box-shadow: var(--shadow-sm);
  }
}

.menu-item svg {
  min-width: 24px;
  width: 24px;
  margin-right: 1rem;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.menu-item:hover svg {
  transform: scale(1.1);
}

.menu-text {
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.expanded .menu-text {
  opacity: 1;
}

/* Content Area */
.content {
  flex: 1;
  transition: all 0.5s ease;
  padding: 2rem;
}

.content.with-sidebar {
  margin-left: 60px; /* 默认侧边栏宽度 */
}

.sidebar.expanded + .content.with-sidebar {
  margin-left: 240px; /* 展开时的侧边栏宽度 */
}

/* Footer Styles */
.footer {
  background-color: var(--secondary-dark);
  border-top: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  padding: 0.3rem;
  color: white;
  text-align: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;

  .footer-logo {
    font-family: "Lobster", cursive;
    color: transparent;
    font-size: 1rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .footer-cr {
    font-size: 0.5rem;
  }

  .footer-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.5rem;
    margin-top: 0.1rem;

    &:hover {
      color: var(--accent-color);
    }
  }
}

/* 添加全局过渡效果 */
* {
  transition: all 0.3s ease;
}

/* 添加毛玻璃效果 */
.header,
.sidebar,
.footer {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}



/* 侧边栏过渡动画 */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.5s ease;
}

.sidebar-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content.with-sidebar {
    margin-left: 0;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.expanded {
    transform: translateX(0);
  }
}
</style>
