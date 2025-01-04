import axios from '@/plugins/axios'

// 获取好友列表
export const getFriends = async (userId) => {
  const response = await axios.get(`/friends/${userId}`)
  return response.data
}

// 搜索潜在好友
export const searchFriend = async (username, currentUserId) => {
  const response = await axios.get(`/friends/search`, {
    params: {
      username,
      currentUserId
    }
  })
  return response.data
}

// 发送好友请求
export const sendFriendRequest = async (senderId, receiverId) => {
  const response = await axios.post(`/friends/request`, null, {
    params: {
      senderId,
      receiverId
    }
  })
  return response.data
}

// 删除好友
export const removeFriend = async (userId, friendId) => {
  const response = await axios.delete(`/friends/${userId}/${friendId}`)
  return response.data
}

// 获取在线好友列表
export const getOnlineFriends = async (userId) => {
  const response = await axios.get(`/friends/${userId}/online`)
  return response.data
}
