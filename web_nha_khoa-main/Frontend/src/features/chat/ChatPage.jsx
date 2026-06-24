import React, { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useChatStore from '../../store/chat.store'
import useChat from '../../hooks/useChat'
import ChatRoom from './ChatRoom'
import './ChatPage.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatLastTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d

  if (diff < 60 * 1000) return 'vừa xong'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}p`
  if (diff < 24 * 60 * 60 * 1000)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

// Mock current user (thực tế lấy từ auth store)
const user = useAuthStore(s => s.user);

// ─── RoomItem ─────────────────────────────────────────────────────────────────
const RoomItem = ({ room, isActive, isOnline, onClick }) => {
  const hasUnread = room.unreadCount > 0

  return (
    <button
      className={`room-item ${isActive ? 'room-item-active' : ''}`}
      onClick={() => onClick(room._id)}
    >
      <div className="room-item-avatar">
        {room.avatar ? (
          <img src={room.avatar} alt={room.name} />
        ) : (
          <div className="room-avatar-placeholder">
            {(room.name || '?')[0].toUpperCase()}
          </div>
        )}
        {isOnline && <span className="online-badge" />}
      </div>

      <div className="room-item-info">
        <div className="room-item-top">
          <span className={`room-item-name ${hasUnread ? 'name-unread' : ''}`}>
            {room.name}
          </span>
          <span className="room-item-time">
            {formatLastTime(room.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="room-item-bottom">
          <span className={`room-item-preview ${hasUnread ? 'preview-unread' : ''}`}>
            {room.lastMessage?.content || 'Chưa có tin nhắn'}
          </span>
          {hasUnread && (
            <span className="unread-badge">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────
const ChatPage = () => {
  const navigate = useNavigate()

  const rooms = useChatStore((s) => s.rooms)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const roomsLoading = useChatStore((s) => s.roomsLoading)
  const roomsError = useChatStore((s) => s.roomsError)
  const socketConnected = useChatStore((s) => s.socketConnected)
  const isUserOnline = useChatStore((s) => s.isUserOnline)

  const {
    loadRooms,
    enterRoom,
    exitRoom,
    sendMessage,
    handleTyping,
    loadMoreMessages,
    deleteMessage,
  } = useChat(user._id)

  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleRoomClick = useCallback(
    (roomId) => {
      enterRoom(roomId)
      // Mobile: đóng sidebar khi chọn room
      if (window.innerWidth < 768) setSidebarOpen(false)
    },
    [enterRoom]
  )

  const handleSend = useCallback(
    (roomId, content) => sendMessage(roomId, content),
    [sendMessage]
  )

  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar header */}
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <h2 className="sidebar-title">Tin nhắn</h2>
            <div className="sidebar-actions">
              <span
                className={`connection-dot ${socketConnected ? 'dot-connected' : 'dot-disconnected'}`}
                title={socketConnected ? 'Đã kết nối' : 'Mất kết nối'}
              />
              <button className="sidebar-action-btn" title="Tạo nhóm chat">✏️</button>
            </div>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Room list */}
        <div className="room-list">
          {roomsLoading && (
            <div className="rooms-loading">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-room">
                  <div className="skeleton-room-avatar" />
                  <div className="skeleton-room-info">
                    <div className="skeleton-line" style={{ width: '60%' }} />
                    <div className="skeleton-line" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {roomsError && (
            <div className="rooms-error">
              <p>⚠️ {roomsError}</p>
              <button className="retry-btn" onClick={loadRooms}>
                Thử lại
              </button>
            </div>
          )}

          {!roomsLoading && !roomsError && filteredRooms.length === 0 && (
            <div className="rooms-empty">
              <p>{searchQuery ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}</p>
            </div>
          )}

          {filteredRooms.map((room) => (
            <RoomItem
              key={room._id}
              room={room}
              isActive={room._id === activeRoomId}
              isOnline={isUserOnline(room.partnerId || '')}
              onClick={handleRoomClick}
            />
          ))}
        </div>
      </aside>

      {/* Mobile overlay */}
      {!sidebarOpen && (
        <button
          className="sidebar-toggle-mobile"
          onClick={() => setSidebarOpen(true)}
        >
          ←
        </button>
      )}

      {/* Chat area */}
      <main className="chat-main">
        <ChatRoom
          roomId={activeRoomId}
          currentUserId={MOCK_USER._id}
          onSendMessage={handleSend}
          onTyping={handleTyping}
          onLoadMore={loadMoreMessages}
          onDeleteMessage={deleteMessage}
        />
      </main>
    </div>
  )
}

export default ChatPage
