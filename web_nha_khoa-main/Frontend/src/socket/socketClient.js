import { io } from 'socket.io-client'
import { ACCESS_TOKEN } from '../utils/constants'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

// ─── Singleton Socket Instance ────────────────────────────────────────────────
let socket = null

/**
 * Khởi tạo kết nối socket với JWT token
 * @returns {import('socket.io-client').Socket}
 */
export const initSocket = () => {
  if (socket?.connected) return socket

  const token = localStorage.getItem(ACCESS_TOKEN)

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })

  socket.on('connect', () => {})

  socket.on('disconnect', (reason) => {})

  socket.on('connect_error', (err) => {})

  socket.on('reconnect', (attempt) => {})

  return socket
}

/**
 * Lấy instance socket hiện tại
 * @returns {import('socket.io-client').Socket | null}
 */
export const getSocket = () => socket

/**
 * Ngắt kết nối và xoá instance
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// ─── Chat Events ──────────────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_ROOM: 'chat:join',
  LEAVE_ROOM: 'chat:leave',
  SEND_MESSAGE: 'chat:send_message',
  TYPING_START: 'chat:typing_start',
  TYPING_STOP: 'chat:typing_stop',
  MARK_READ: 'chat:mark_read',

  // Server → Client
  NEW_MESSAGE: 'chat:new_message',
  MESSAGE_UPDATED: 'chat:message_updated',
  MESSAGE_DELETED: 'chat:message_deleted',
  USER_TYPING: 'chat:user_typing',
  USER_STOP_TYPING: 'chat:user_stop_typing',
  USER_ONLINE: 'chat:user_online',
  USER_OFFLINE: 'chat:user_offline',
  ROOM_UPDATED: 'chat:room_updated',
  ERROR: 'chat:error',
}

/**
 * Join vào một phòng chat
 * @param {string} roomId
 */
export const joinRoom = (roomId) => {
  if (!socket?.connected) {
    return
  }
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId })
}

/**
 * Rời khỏi phòng chat
 * @param {string} roomId
 */
export const leaveRoom = (roomId) => {
  if (!socket?.connected) return
  socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId })
}

/**
 * Gửi tin nhắn qua socket
 * @param {string} roomId
 * @param {{ content: string, type?: 'text' | 'image' | 'file', tempId?: string }} payload
 */
export const emitSendMessage = (roomId, payload) => {
  if (!socket?.connected) return false
  socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, ...payload })
  return true
}

/**
 * Phát sự kiện đang gõ
 * @param {string} roomId
 */
export const emitTypingStart = (roomId) => {
  if (!socket?.connected) return
  socket.emit(SOCKET_EVENTS.TYPING_START, { roomId })
}

/**
 * Phát sự kiện dừng gõ
 * @param {string} roomId
 */
export const emitTypingStop = (roomId) => {
  if (!socket?.connected) return
  socket.emit(SOCKET_EVENTS.TYPING_STOP, { roomId })
}

/**
 * Đánh dấu đã đọc
 * @param {string} roomId
 */
export const emitMarkRead = (roomId) => {
  if (!socket?.connected) return
  socket.emit(SOCKET_EVENTS.MARK_READ, { roomId })
}

/**
 * Subscribe một event socket, trả về hàm unsubscribe
 * @param {string} event
 * @param {Function} handler
 * @returns {Function} unsubscribe
 */
export const onSocketEvent = (event, handler) => {
  if (!socket) return () => {}
  socket.on(event, handler)
  return () => socket.off(event, handler)
}
