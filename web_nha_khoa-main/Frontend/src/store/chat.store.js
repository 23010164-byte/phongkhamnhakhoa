import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const MESSAGES_PER_PAGE = 30

const useChatStore = create(
  devtools(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      rooms: [],
      activeRoomId: null,
      messagesByRoom: {}, // { [roomId]: Message[] }
      paginationByRoom: {}, // { [roomId]: { page, hasMore, loading } }
      typingUsers: {}, // { [roomId]: { [userId]: { username, avatar } } }
      onlineUsers: new Set(),
      socketConnected: false,

      roomsLoading: false,
      roomsError: null,
      messagesLoading: false,
      messagesError: null,
      sendingMessage: false,

      // ─── Socket ─────────────────────────────────────────────────────────────
      setSocketConnected: (connected) => set({ socketConnected: connected }),

      // ─── Rooms ──────────────────────────────────────────────────────────────
      setRoomsLoading: (loading) => set({ roomsLoading: loading }),
      setRoomsError: (error) => set({ roomsError: error }),

      setRooms: (rooms) => set({ rooms }),

      addOrUpdateRoom: (room) => {
        set((state) => {
          const exists = state.rooms.findIndex((r) => r._id === room._id)
          if (exists >= 0) {
            const updated = [...state.rooms]
            updated[exists] = { ...updated[exists], ...room }
            // Đưa room có tin nhắn mới lên đầu
            if (room.lastMessage) {
              updated.sort(
                (a, b) =>
                  new Date(b.lastMessage?.createdAt || 0) -
                  new Date(a.lastMessage?.createdAt || 0)
              )
            }
            return { rooms: updated }
          }
          return { rooms: [room, ...state.rooms] }
        })
      },

      setActiveRoom: (roomId) => {
        set({ activeRoomId: roomId, messagesError: null })
      },

      updateUnreadCount: (roomId, count) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r._id === roomId ? { ...r, unreadCount: count } : r
          ),
        }))
      },

      // ─── Messages ───────────────────────────────────────────────────────────
      setMessagesLoading: (loading) => set({ messagesLoading: loading }),
      setMessagesError: (error) => set({ messagesError: error }),

      /**
       * Set lịch sử tin nhắn (khi load lần đầu hoặc refresh)
       */
      setMessages: (roomId, messages, pagination = {}) => {
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: messages,
          },
          paginationByRoom: {
            ...state.paginationByRoom,
            [roomId]: {
              page: pagination.page || 1,
              hasMore: pagination.hasMore ?? messages.length >= MESSAGES_PER_PAGE,
              loading: false,
            },
          },
        }))
      },

      /**
       * Prepend tin nhắn cũ hơn (load more / phân trang)
       */
      prependMessages: (roomId, messages, pagination = {}) => {
        set((state) => {
          const current = state.messagesByRoom[roomId] || []
          return {
            messagesByRoom: {
              ...state.messagesByRoom,
              [roomId]: [...messages, ...current],
            },
            paginationByRoom: {
              ...state.paginationByRoom,
              [roomId]: {
                ...state.paginationByRoom[roomId],
                page: pagination.page || 1,
                hasMore: pagination.hasMore ?? messages.length >= MESSAGES_PER_PAGE,
                loading: false,
              },
            },
          }
        })
      },

      setPaginationLoading: (roomId, loading) => {
        set((state) => ({
          paginationByRoom: {
            ...state.paginationByRoom,
            [roomId]: {
              ...state.paginationByRoom[roomId],
              loading,
            },
          },
        }))
      },

      /**
       * Thêm tin nhắn mới (realtime từ socket)
       */
      addMessage: (roomId, message) => {
        set((state) => {
          const current = state.messagesByRoom[roomId] || []
          // Tránh duplicate
          if (current.some((m) => m._id === message._id)) {
            return {}
          }
          // Replace optimistic message nếu có tempId trùng
          const filtered = current.filter(
            (m) => !message.tempId || m.tempId !== message.tempId
          )
          return {
            messagesByRoom: {
              ...state.messagesByRoom,
              [roomId]: [...filtered, message],
            },
          }
        })

        // Cập nhật lastMessage cho room
        get().addOrUpdateRoom({
          _id: roomId,
          lastMessage: message,
        })
      },

      /**
       * Thêm optimistic message khi gửi
       */
      addOptimisticMessage: (roomId, message) => {
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: [...(state.messagesByRoom[roomId] || []), message],
          },
        }))
      },

      /**
       * Cập nhật message (ví dụ: confirm sau khi server ack)
       */
      updateMessage: (roomId, messageId, updates) => {
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: (state.messagesByRoom[roomId] || []).map((m) =>
              m._id === messageId ? { ...m, ...updates } : m
            ),
          },
        }))
      },

      /**
       * Xoá tin nhắn
       */
      removeMessage: (roomId, messageId) => {
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: (state.messagesByRoom[roomId] || []).filter(
              (m) => m._id !== messageId
            ),
          },
        }))
      },

      // ─── Typing ─────────────────────────────────────────────────────────────
      setUserTyping: (roomId, userId, userInfo) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [roomId]: {
              ...(state.typingUsers[roomId] || {}),
              [userId]: userInfo,
            },
          },
        }))
      },

      removeUserTyping: (roomId, userId) => {
        set((state) => {
          const roomTyping = { ...(state.typingUsers[roomId] || {}) }
          delete roomTyping[userId]
          return {
            typingUsers: {
              ...state.typingUsers,
              [roomId]: roomTyping,
            },
          }
        })
      },

      // ─── Online Status ───────────────────────────────────────────────────────
      setUserOnline: (userId) => {
        set((state) => {
          const updated = new Set(state.onlineUsers)
          updated.add(userId)
          return { onlineUsers: updated }
        })
      },

      setUserOffline: (userId) => {
        set((state) => {
          const updated = new Set(state.onlineUsers)
          updated.delete(userId)
          return { onlineUsers: updated }
        })
      },

      // ─── Selectors ───────────────────────────────────────────────────────────
      getMessages: (roomId) => get().messagesByRoom[roomId] || [],

      getPagination: (roomId) =>
        get().paginationByRoom[roomId] || { page: 1, hasMore: true, loading: false },

      getTypingUsers: (roomId) => {
        const typing = get().typingUsers[roomId] || {}
        return Object.values(typing)
      },

      getActiveRoom: () => {
        const { rooms, activeRoomId } = get()
        return rooms.find((r) => r._id === activeRoomId) || null
      },

      isUserOnline: (userId) => get().onlineUsers.has(userId),

      // ─── Reset ───────────────────────────────────────────────────────────────
      resetChat: () =>
        set({
          rooms: [],
          activeRoomId: null,
          messagesByRoom: {},
          paginationByRoom: {},
          typingUsers: {},
          onlineUsers: new Set(),
          socketConnected: false,
          roomsLoading: false,
          roomsError: null,
          messagesLoading: false,
          messagesError: null,
        }),
    }),
    { name: 'ChatStore' }
  )
)

export default useChatStore
