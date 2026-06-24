import axiosClient from './axiosClient'

const chatApi = {
  /**
   * Lấy danh sách rooms của user hiện tại
   */
  getRooms: () => {
    return axiosClient.get('/chat/rooms')
  },

  /**
   * Lấy hoặc tạo room chat 1-1
   * @param {string} userId - ID của người dùng muốn chat
   */
  getOrCreateRoom: (userId) => {
    return axiosClient.post('/chat/rooms/direct', { userId })
  },

  /**
   * Lấy thông tin chi tiết của một room
   * @param {string} roomId
   */
  getRoomById: (roomId) => {
    return axiosClient.get(`/chat/rooms/${roomId}`)
  },

  /**
   * Lấy lịch sử tin nhắn trong room
   * @param {string} roomId
   * @param {{ page?: number, limit?: number, before?: string }} params
   */
  getMessages: (roomId, params = {}) => {
    const { page = 1, limit = 30, before } = params
    return axiosClient.get(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit, ...(before && { before }) },
    })
  },

  /**
   * Gửi tin nhắn (fallback nếu socket không available)
   * @param {string} roomId
   * @param {{ content: string, type?: string }} payload
   */
  sendMessage: (roomId, payload) => {
    return axiosClient.post(`/chat/rooms/${roomId}/messages`, payload)
  },

  /**
   * Đánh dấu đã đọc tất cả tin nhắn trong room
   * @param {string} roomId
   */
  markAsRead: (roomId) => {
    return axiosClient.put(`/chat/rooms/${roomId}/read`)
  },

  /**
   * Xoá tin nhắn
   * @param {string} roomId
   * @param {string} messageId
   */
  deleteMessage: (roomId, messageId) => {
    return axiosClient.delete(`/chat/rooms/${roomId}/messages/${messageId}`)
  },

  /**
   * Upload file/ảnh trong chat
   * @param {string} roomId
   * @param {FormData} formData
   */
  uploadMedia: (roomId, formData) => {
    return axiosClient.post(`/chat/rooms/${roomId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default chatApi
