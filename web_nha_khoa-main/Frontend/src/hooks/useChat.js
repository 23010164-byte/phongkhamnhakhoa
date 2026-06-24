import { useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import chatApi from '../api/chat.api'
import useChatStore from '../store/chat.store'
import {
  initSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  emitSendMessage,
  emitTypingStart,
  emitTypingStop,
  emitMarkRead,
  onSocketEvent,
  SOCKET_EVENTS,
} from '../socket/socketClient'

/**
 * Hook quản lý toàn bộ logic chat
 * @param {string | null} currentUserId - ID của user đang đăng nhập
 */
const useChat = (currentUserId) => {
  const {
    setRooms,
    setRoomsLoading,
    setRoomsError,
    setActiveRoom,
    setMessages,
    prependMessages,
    setPaginationLoading,
    setMessagesLoading,
    setMessagesError,
    addMessage,
    addOptimisticMessage,
    updateMessage,
    removeMessage,
    addOrUpdateRoom,
    setUserTyping,
    removeUserTyping,
    setUserOnline,
    setUserOffline,
    setSocketConnected,
    updateUnreadCount,
    getPagination,
    activeRoomId,
  } = useChatStore()

  const typingTimerRef = useRef(null)
  const activeRoomRef = useRef(activeRoomId)

  useEffect(() => {
    activeRoomRef.current = activeRoomId
  }, [activeRoomId])

  // ─── Init Socket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return

    const socket = initSocket()

    const unsubConnect = onSocketEvent('connect', () => {
      setSocketConnected(true)
    })

    const unsubDisconnect = onSocketEvent('disconnect', () => {
      setSocketConnected(false)
    })

    const unsubNewMessage = onSocketEvent(
      SOCKET_EVENTS.NEW_MESSAGE,
      (data) => {
        const { roomId, message } = data
        addMessage(roomId, message)

        // Nếu không đang ở room đó → tăng unread
        if (activeRoomRef.current !== roomId) {
          useChatStore.getState().addOrUpdateRoom({ _id: roomId })
        } else {
          emitMarkRead(roomId)
        }
      }
    )

    const unsubMsgUpdated = onSocketEvent(
      SOCKET_EVENTS.MESSAGE_UPDATED,
      ({ roomId, message }) => {
        updateMessage(roomId, message._id, message)
      }
    )

    const unsubMsgDeleted = onSocketEvent(
      SOCKET_EVENTS.MESSAGE_DELETED,
      ({ roomId, messageId }) => {
        removeMessage(roomId, messageId)
      }
    )

    const unsubTyping = onSocketEvent(
      SOCKET_EVENTS.USER_TYPING,
      ({ roomId, userId, username, avatar }) => {
        if (userId !== currentUserId) {
          setUserTyping(roomId, userId, { username, avatar })
        }
      }
    )

    const unsubStopTyping = onSocketEvent(
      SOCKET_EVENTS.USER_STOP_TYPING,
      ({ roomId, userId }) => {
        removeUserTyping(roomId, userId)
      }
    )

    const unsubOnline = onSocketEvent(
      SOCKET_EVENTS.USER_ONLINE,
      ({ userId }) => setUserOnline(userId)
    )

    const unsubOffline = onSocketEvent(
      SOCKET_EVENTS.USER_OFFLINE,
      ({ userId }) => setUserOffline(userId)
    )

    const unsubRoomUpdated = onSocketEvent(
      SOCKET_EVENTS.ROOM_UPDATED,
      (room) => addOrUpdateRoom(room)
    )

    return () => {
      unsubConnect()
      unsubDisconnect()
      unsubNewMessage()
      unsubMsgUpdated()
      unsubMsgDeleted()
      unsubTyping()
      unsubStopTyping()
      unsubOnline()
      unsubOffline()
      unsubRoomUpdated()
    }
  }, [currentUserId])

  // ─── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current)
    }
  }, [])

  // ─── Load Rooms ─────────────────────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    setRoomsLoading(true)
    setRoomsError(null)
    try {
      const res = await chatApi.getRooms()
      setRooms(res.data || res)
    } catch (err) {
      setRoomsError(err.message)
    } finally {
      setRoomsLoading(false)
    }
  }, [])

  // ─── Enter Room ─────────────────────────────────────────────────────────────
  const enterRoom = useCallback(
    async (roomId) => {
      // Rời room cũ
      if (activeRoomRef.current && activeRoomRef.current !== roomId) {
        leaveRoom(activeRoomRef.current)
        clearTimeout(typingTimerRef.current)
      }

      setActiveRoom(roomId)
      joinRoom(roomId)
      emitMarkRead(roomId)
      updateUnreadCount(roomId, 0)

      // Load messages nếu chưa có
      const existing = useChatStore.getState().messagesByRoom[roomId]
      if (!existing || existing.length === 0) {
        await loadMessages(roomId, { page: 1 })
      }
    },
    [updateUnreadCount]
  )

  // ─── Leave Room ─────────────────────────────────────────────────────────────
  const exitRoom = useCallback((roomId) => {
    leaveRoom(roomId)
    setActiveRoom(null)
    clearTimeout(typingTimerRef.current)
  }, [])

  // ─── Load Messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (roomId, params = {}) => {
    setMessagesLoading(true)
    setMessagesError(null)
    try {
      const res = await chatApi.getMessages(roomId, params)
      const { messages, pagination } = res.data || res
      setMessages(roomId, messages, pagination)
    } catch (err) {
      setMessagesError(err.message)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  // ─── Load More (older messages) ─────────────────────────────────────────────
  const loadMoreMessages = useCallback(
    async (roomId) => {
      const pagination = getPagination(roomId)
      if (!pagination.hasMore || pagination.loading) return

      setPaginationLoading(roomId, true)
      try {
        const nextPage = pagination.page + 1
        const res = await chatApi.getMessages(roomId, { page: nextPage })
        const { messages, pagination: newPagination } = res.data || res
        prependMessages(roomId, messages, { ...newPagination, page: nextPage })
      } catch (err) {
      } finally {
        setPaginationLoading(roomId, false)
      }
    },
    [getPagination]
  )

  // ─── Send Message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (roomId, content, type = 'text') => {
      if (!content?.trim()) return false

      const tempId = uuidv4()
      const optimisticMsg = {
        _id: tempId,
        tempId,
        content: content.trim(),
        type,
        sender: { _id: currentUserId },
        createdAt: new Date().toISOString(),
        status: 'sending',
      }

      addOptimisticMessage(roomId, optimisticMsg)

      // Stop typing
      handleStopTyping(roomId)

      // Thử gửi qua socket
      const sentViaSocket = emitSendMessage(roomId, {
        content: content.trim(),
        type,
        tempId,
      })

      // Fallback HTTP nếu socket không available
      if (!sentViaSocket) {
        try {
          const res = await chatApi.sendMessage(roomId, {
            content: content.trim(),
            type,
          })
          const message = res.data || res
          // Replace optimistic
          removeMessage(roomId, tempId)
          addMessage(roomId, message)
        } catch (err) {
          updateMessage(roomId, tempId, { status: 'failed' })
          return false
        }
      }

      return true
    },
    [currentUserId]
  )

  // ─── Typing ─────────────────────────────────────────────────────────────────
  const handleTyping = useCallback((roomId) => {
    emitTypingStart(roomId)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      emitTypingStop(roomId)
    }, 2500)
  }, [])

  const handleStopTyping = useCallback((roomId) => {
    clearTimeout(typingTimerRef.current)
    emitTypingStop(roomId)
  }, [])

  // ─── Delete Message ─────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (roomId, messageId) => {
    try {
      await chatApi.deleteMessage(roomId, messageId)
      removeMessage(roomId, messageId)
    } catch (err) {
    }
  }, [])

  return {
    loadRooms,
    enterRoom,
    exitRoom,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    handleTyping,
    handleStopTyping,
    deleteMessage,
  }
}

export default useChat
