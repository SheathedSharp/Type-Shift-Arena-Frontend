/*
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2025-01-05 12:28:14
 */
import axios from '@/plugins/axios'

// 获取消息
export const getMessages = async (userId) => {
  const response = await axios.get(`/messages/unread/${userId}`)
  console.log("获取消息", response.data)
  return response.data
}