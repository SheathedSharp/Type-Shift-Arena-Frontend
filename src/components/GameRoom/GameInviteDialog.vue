<template>
  <div class="game-invite-dialog" v-if="visible">
    <div class="dialog-content">
      <!-- Header -->
      <div class="dialog-header">
        <h3>游戏邀请</h3>
        <button class="close-btn" @click="handleClose">
          <IconSvg name="close" />
        </button>
      </div>

      <!-- Invitation Content -->
      <div class="invitation-content">
        <div class="inviter-info">
          <img
            :src="invitation.data.playerAvatar"
            :alt="invitation.data.playerName"
            class="inviter-avatar"
          />
          <span class="inviter-name">{{ invitation.data.playerName }}</span>
        </div>

        <p class="invitation-text">邀请您加入房间对战</p>

        <div class="game-details">
          <div class="detail-item">
            <IconSvg name="translate" />
            <span>{{ getLanguageLabel(invitation.data.language) }}</span>
          </div>
          <div class="detail-item">
            <IconSvg name="category" />
            <span>{{ getCategoryLabel(invitation.data.category) }}</span>
          </div>
          <div class="detail-item">
            <IconSvg name="signal_cellular_alt" />
            <span>{{ getDifficultyLabel(invitation.data.difficulty) }}</span>
          </div>
        </div>

        <div class="room-info">
          <span class="room-id">房间号: {{ invitation.data.roomId }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="action-btn accept" @click="handleAccept">
          接受邀请
        </button>
        <button class="action-btn reject" @click="handleReject">婉拒</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useWebSocket } from "@/composables/useWebSocket";
import { useGameState } from "@/composables/useGameState";
import { getLanguageLabel, getCategoryLabel, getDifficultyLabel } from '@/utils/labelUtils';
import { ElMessage } from 'element-plus';
import IconSvg from '@/assets/icons/IconSvg.vue';

const router = useRouter();
const { stompClient, connectWebSocket, subscribeToPlayerChannel, subscribeToRoomBroadcast, hasSubscription } = useWebSocket();
const gameState = useGameState(null, stompClient);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  invitation: {
    type: Object,
    required: true,
  },
});

const handleClose = () => {
  // emit("close");
};

const handleAccept = async () => {
  try {
    const playerId = localStorage.getItem('userId');
    const playerName = localStorage.getItem('userName');
    const roomId = props.invitation.data.roomId;
    
    // 1. 确保WebSocket连接
    if (!stompClient?.connected) {
      await connectWebSocket();
      // 添加短暂延迟确保连接完全建立
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 2. 订阅个人频道
    if (!hasSubscription(`player_channel_${playerId}`)) {
      await subscribeToPlayerChannel(playerId);
    }

    // 3. 订阅房间广播频道
    if (!hasSubscription(`room_${roomId}`)) {
      await subscribeToRoomBroadcast(roomId);
    }

    // 4. 等待所有订阅完成
    await new Promise(resolve => setTimeout(resolve, 100));

    // 5. 发送加入房间请求
    await gameState.joinRoom(roomId, playerId, playerName);

    // 6. 发出接受邀请的事件
    // emit("accept");

    // 7. 跳转到房间
    router.push(`/room/${roomId}`);
  } catch (error) {
    console.error('加入房间失败:', error);
    ElMessage.error('加入房间失败: ' + error.message);
  }
};

const handleReject = () => {
  // emit("reject");
};
</script>

<style lang="scss" scoped>
.game-invite-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.dialog-content {
  width: 400px;
  background: rgba(17, 17, 17, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 500;
  }
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s;

  &:hover {
    color: #fff;
  }
}

.invitation-content {
  padding: 24px;
  text-align: center;
}

.inviter-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.inviter-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.inviter-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.invitation-text {
  color: rgba(255, 255, 255, 0.9);
  margin: 16px 0;
  font-size: 1.1rem;
}

.room-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 16px;

  .room-id {
    color: rgba(255, 255, 255, 0.8);
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.dialog-actions {
  display: flex;
  padding: 16px 20px;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;

  &.accept {
    background: #4a90e2;
    color: white;

    &:hover {
      background: #357abd;
    }
  }

  &.reject {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.game-details {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);

  i {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.6);
  }

  span {
    font-size: 0.9rem;
  }
}
</style>
