<template>
  <div class="add">
    <div class="search-header">
      <h3>添加好友</h3>
      <a-input-search
        class="search-input"
        v-model:value="fname"
        placeholder="输入用户名搜索"
        @search="searchFriends"
      >
        <template #prefix>
          <search-outlined style="color: rgba(255, 255, 255, 0.45)" />
        </template>
      </a-input-search>
    </div>

    <div class="search-list" v-if="searchList.length > 0">
      <div class="list-container">
        <div
          class="user-card"
          v-for="item in searchList"
          :key="item.id"
          :class="{ sending: sendingRequests[item.id] }"
        >
          <div class="user-info">
            <a-avatar class="user-avatar" :src="item.imgUrl" :size="50">
              <template #icon><user-outlined /></template>
            </a-avatar>
            <div class="user-details">
              <span class="username">{{ item.name }}</span>
              <span class="user-id">ID: {{ item.id.slice(0, 8) }}</span>
            </div>
          </div>
          <button
            class="add-btn"
            @click="handleAdd(item.id)"
            :disabled="sendingRequests[item.id]"
          >
            <usergroup-add-outlined />
            <span>{{
              sendingRequests[item.id] ? "发送中..." : "添加好友"
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else-if="hasSearched">
      <inbox-outlined style="font-size: 48px; opacity: 0.5" />
      <p>未找到匹配的用户</p>
    </div>

    <div class="empty-state" v-else>
      <search-outlined style="font-size: 48px; opacity: 0.5" />
      <p>搜索用户开始添加好友</p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { searchFriend, sendFriendRequest } from "@/api/modules/friends/friends";
import { ElMessage } from "element-plus";
import { SearchOutlined, InboxOutlined } from "@ant-design/icons-vue";

const searchList = ref([]); // 搜索结果列表
const fname = ref(""); // 搜索框输入的值
const userId = localStorage.getItem("userId"); // 当前用户id
const getFriendsList = inject("getFriendsList"); // 获取好友列表
const hasSearched = ref(false);
const sendingRequests = ref({});

const searchFriends = async (fname) => {
  try {
    const res = await searchFriend(fname, userId);
    if (res.status == 200) {
      console.log(res);
      searchList.value = res.data.map((user) => ({
        id: user.id,
        name: user.username,
        imgUrl: user.imgSrc,
      }));

      if (searchList.value.length === 0) {
        ElMessage.info("未找到匹配的用户");
      }
    } else {
      ElMessage.error(res.message || "搜索失败");
    }
  } catch (error) {
    console.error("搜索用户错误:", error);
    ElMessage.error("搜索失败");
  }
};

const handleAdd = async (friendId) => {
  sendingRequests.value[friendId] = true;
  try {
    const res = await sendFriendRequest(userId, friendId);
    if (res.success) {
      ElMessage.success(res.message || "好友请求已发送");
      getFriendsList(userId);
    } else {
      ElMessage.error(res.message || "发送好友请求失败");
    }
  } catch (error) {
    console.error("发送好友请求错误:", error);
    ElMessage.error("发送好友请求失败");
  } finally {
    sendingRequests.value[friendId] = false;
  }
};
</script>

<style lang="scss" scoped>
.add {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: rgba(17, 17, 17, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: white;
  overflow: hidden;

  .search-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);

    h3 {
      margin: 0 0 15px;
      font-size: 18px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    .search-input {
      width: 100%; // 让输入框占满容器宽度

      :deep(.ant-input-affix-wrapper) {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;

        &:hover,
        &:focus {
          border-color: rgba(79, 70, 229, 0.6);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .ant-input {
          background: transparent;
          color: white;
          font-size: 14px;

          &::placeholder {
            color: rgba(255, 255, 255, 0.3);
          }
        }
      }
      :deep(.ant-input-group-addon) {
        background: transparent;
        border: none;

        .ant-input-search-button {
          background: rgba(79, 70, 229, 0.2);
          border-color: rgba(79, 70, 229, 0.3);
          color: white;
          height: 32px;
          border-radius: 8px;
          margin-left: 8px;

          &:hover {
            background: rgba(79, 70, 229, 0.3);
            border-color: rgba(79, 70, 229, 0.4);
          }

          &:active {
            background: rgba(79, 70, 229, 0.4);
          }
        }
      }
    }
  }

  .search-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(5px);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-avatar {
          border: 2px solid rgba(79, 70, 229, 0.3);
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.1);
          }
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .username {
            font-size: 16px;
            font-weight: 500;
          }

          .user-id {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(79, 70, 229, 0.2);
        border: 1px solid rgba(79, 70, 229, 0.3);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: rgba(79, 70, 229, 0.3);
          transform: translateY(-2px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.sending {
        opacity: 0.7;
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: rgba(255, 255, 255, 0.5);
    gap: 16px;

    p {
      font-size: 14px;
      margin: 0;
    }
  }
}

/* 自定义滚动条 */
.search-list::-webkit-scrollbar {
  width: 4px;
}

.search-list::-webkit-scrollbar-track {
  background: transparent;
}

.search-list::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.3);
  border-radius: 2px;

  &:hover {
    background: rgba(79, 70, 229, 0.5);
  }
}
</style>
