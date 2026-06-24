import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import useChatStore from '../../store/chat.store'
import MessageItem from './MessageItem'
import './ChatRoom.css'

const TYPING_DEBOUNCE = 400

const TypingIndicator = ({ users }) => {
  if (!users.length) return null
  const names = users.map((u) => u.username).join(', ')
  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span /><span /><span />
      </span>
      <span className="typing-text">
        {names} đang gõ...
      </span>
    </div>
  )
}

const ChatRoom = ({ roomId, currentUserId, onSendMessage, onLoadMore, onTyping, onDeleteMessage }) => {
  const messages = useChatStore((s) => s.getMessages(roomId))
  const pagination = useChatStore((s) => s.getPagination(roomId))
  const typingUsers = useChatStore((s) => s.getTypingUsers(roomId))
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const messagesError = useChatStore((s) => s.messagesError)
  const activeRoom = useChatStore((s) => s.getActiveRoom())

  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimerRef = useRef(null)
  const isAtBottomRef = useRef(true)
  const prevScrollHeightRef = useRef(0)

  // ─── Auto scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // ─── Preserve scroll khi load more ──────────────────────────────────────
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    if (prevScrollHeightRef.current) {
      const newScrollHeight = container.scrollHeight
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = 0
    }
  }, [pagination.page])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 60

    // Load more khi scroll lên đầu
    if (scrollTop < 80 && !pagination.loading && pagination.hasMore) {
      prevScrollHeightRef.current = scrollHeight
      onLoadMore?.(roomId)
    }
  }, [roomId, pagination, onLoadMore])

  // ─── Typing handler ──────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    clearTimeout(typingTimerRef.current)
    if (e.target.value.trim()) {
      onTyping?.(roomId)
      typingTimerRef.current = setTimeout(() => {}, 2500)
    }
  }

  // ─── Send ────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || isSending) return

    setInputValue('')
    setIsSending(true)
    inputRef.current?.focus()

    try {
      await onSendMessage?.(roomId, content)
    } finally {
      setIsSending(false)
    }
  }, [inputValue, isSending, roomId, onSendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Nhóm messages theo ngày ─────────────────────────────────────────────
  const groupedMessages = useMemo(() => {
    const groups = []
    let currentDate = null

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString('vi-VN')
      if (date !== currentDate) {
        groups.push({ type: 'date-divider', date, key: `divider-${date}` })
        currentDate = date
      }
      groups.push({ type: 'message', message: msg, key: msg._id || msg.tempId })
    })

    return groups
  }, [messages])

  if (!roomId) {
    return (
      <div className="chatroom-empty">
        <div className="chatroom-empty-icon">💬</div>
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className="chatroom">
      {/* Header */}
      <div className="chatroom-header">
        <div className="chatroom-header-info">
          <div className="chatroom-avatar">
            {activeRoom?.avatar ? (
              <img src={activeRoom.avatar} alt={activeRoom.name} />
            ) : (
              <div className="chatroom-avatar-placeholder">
                {(activeRoom?.name || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="chatroom-header-text">
            <h3 className="chatroom-name">{activeRoom?.name || 'Chat'}</h3>
            <span className="chatroom-status">
              {typingUsers.length > 0 ? (
                <span className="status-typing">đang gõ...</span>
              ) : (
                <span className="status-online">Online</span>
              )}
            </span>
          </div>
        </div>
        <div className="chatroom-header-actions">
          <button className="header-btn" title="Tìm kiếm">🔍</button>
          <button className="header-btn" title="Tuỳ chọn">⋮</button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chatroom-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {pagination.loading && (
          <div className="load-more-indicator">
            <div className="spinner-sm" />
          </div>
        )}

        {messagesLoading && messages.length === 0 && (
          <div className="messages-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`skeleton-msg ${i % 2 === 0 ? 'skeleton-own' : ''}`}>
                <div className="skeleton-avatar" />
                <div className="skeleton-bubble" style={{ width: `${120 + i * 30}px` }} />
              </div>
            ))}
          </div>
        )}

        {messagesError && (
          <div className="messages-error">
            <span>⚠️ {messagesError}</span>
          </div>
        )}

        {/* Messages list */}
        {groupedMessages.map((item, index) => {
          if (item.type === 'date-divider') {
            return (
              <div key={item.key} className="date-divider">
                <span>{item.date}</span>
              </div>
            )
          }

          const msg = item.message
          const isOwn = msg.sender?._id === currentUserId
          const prevItem = groupedMessages[index - 1]
          const prevMsg = prevItem?.type === 'message' ? prevItem.message : null
          const showAvatar =
            !isOwn &&
            (!prevMsg || prevMsg.sender?._id !== msg.sender?._id)

          return (
            <MessageItem
              key={item.key}
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              currentUserId={currentUserId}
              onDelete={(msgId) => onDeleteMessage?.(roomId, msgId)}
            />
          )
        })}

        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatroom-input-wrap">
        <button className="input-action-btn" title="Đính kèm file">📎</button>
        <div className="chatroom-input-box">
          <textarea
            ref={inputRef}
            className="chatroom-textarea"
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={4000}
          />
        </div>
        <button
          className={`send-btn ${inputValue.trim() ? 'send-btn-active' : ''}`}
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          title="Gửi (Enter)"
        >
          {isSending ? (
            <div className="spinner-xs" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatRoom
