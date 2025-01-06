/*
 * @Author: hiddenSharp429 z404878860@163.com
 * @Date: 2025-01-04 17:34:28
 */
import { onMounted, onUnmounted } from "vue";
import { useWebSocket } from "./useWebSocket";
import { ElMessage } from "element-plus";

export function useFriendMessages() {
  const {
    stompClient,
    connectWebSocket,
    subscribeToFriendMessages,
    hasSubscription,
    subscribeToFriendStatus
  } = useWebSocket();

  const initializeFriendMessages = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      // 添加token检查
      if (!userId || !token) {
        console.log("[FriendMessages] 用户未登录，跳过WebSocket初始化");
        return;
      }

      // 确保 WebSocket 连接已建立
      if (!stompClient.value?.connected) {
        await connectWebSocket();
      }

      // 订阅好友消息
      if (!hasSubscription(`/queue/messages/${userId}`)) {
        await subscribeToFriendMessages(userId, (message) => {
          const messageData = JSON.parse(message.body);
          handleFriendMessage(messageData);
        });
      }

      // 订阅好友状态
      if (!hasSubscription(`/user/${userId}/queue/friends/status`)) {
        await subscribeToFriendStatus(userId, (message) => {
          const messageData = JSON.parse(message.body);
          handleFriendStatus(messageData);
        });
      }
    } catch (error) {
      console.error("初始化好友消息失败:", error);
    }
  };

  const handleFriendMessage = (message) => {
    console.log("[FriendMessages] 收到好友消息:", message);
    
    if (!message?.data?.type) {
      console.error("[FriendMessages] 无效的消息格式:", message);
      return;
    }

    switch (message.data.type) {
      case "FRIEND_REQUEST":
        switch (message.data.status) {
          case "UNREAD":
            ElMessage({
              message: `${message.data.senderName} 请求添加您为好友`,
              type: "info",
              duration: 5000,
              showClose: true,
            });
            break;
          case "ACCEPTED":
            ElMessage({
              message: `${message.data.receiverName} 接受了您的好友请求`,
              type: "success",
              duration: 3000,
            });
            break;
          case "REJECTED":
            ElMessage({
              message: `${message.data.receiverName} 拒绝了您的好友请求`,
              type: "info",
              duration: 3000,
            });
            break;
          default:
            console.warn("[FriendMessages] 未知的好友请求状态:", message.data.status);
            break;
        }
        break;

      case "GAME_INVITE":
        window.dispatchEvent(new CustomEvent('game-invite', {
          detail: message
        }));
        break;

      default:
        console.warn("[FriendMessages] 未知的消息类型:", message.data.type);
        break;
    }
  };

  const handleFriendStatus = (message) => {
    console.log("[FriendMessages] 收到好友状态:", message);
  };

  onMounted(() => {
    // 只在用户已登录时初始化
    if (localStorage.getItem("token")) {
      initializeFriendMessages();
    }
  });

  onUnmounted(() => {
    // 可以在这里处理清理工作
  });

  return {
    initializeFriendMessages,
    handleFriendMessage
  };
}
