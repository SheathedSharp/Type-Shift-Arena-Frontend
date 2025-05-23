<!--
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2025-01-05 16:35:50
-->
<template>
  <div
    class="message-item"
    :class="{ unread: message.status === 'UNREAD' }"
    tabindex="0"
  >
    <div class="message-avatar">
      <img :src="message.senderAvatar" :alt="message.senderName" />
    </div>
    <div class="message-content">
      <div class="message-header">
        <h4>{{ message.senderName }}</h4>
        <span class="message-time">{{ formattedDate }}</span>
      </div>
      <p class="message-preview">{{ message.content }}</p>
    </div>
    <!-- 好友请求的操作按钮 -->
    <div v-if="message.type === 'FRIEND_REQUEST'" class="message-actions">
      <button class="action-btn accept" @click.stop="handleAccept">
        <IconSvg name="check" size="18" />
      </button>
      <button class="action-btn reject" @click.stop="handleReject">
        <IconSvg name="close" size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import IconSvg from '@/assets/icons/IconSvg.vue';

const emit = defineEmits(['accept', 'reject'])

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const handleAccept = () => {
  emit('accept', props.message)
}

const handleReject = () => {
  emit('reject', props.message)
}

const formattedDate = computed(() => {
  const date = new Date(props.message.createdAt);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
});
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none; // 移除默认的焦点轮廓
  
  &:hover, &:focus {
    background: var(--hover-bg, rgba(0, 0, 0, 0.05));
  }
  
  &:focus {
    box-shadow: 0 0 0 2px var(--accent-color, #4a90e2);
  }
  
  &.unread {
    background: rgba(var(--accent-color-rgb), 0.1);
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.message-content {
  flex: 1;

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

.message-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  align-self: center;
  
  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: transparent;
    
    svg {
      font-size: 18px;
    }
    
    &.accept {
      color: var(--success-color, #4caf50);
      &:hover {
        background: rgba(76, 175, 80, 0.1);
      }
    }
    
    &.reject {
      color: var(--error-color, #f44336);
      &:hover {
        background: rgba(244, 67, 54, 0.1);
      }
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--accent-color, #4a90e2);
    }
  }
}
</style>
