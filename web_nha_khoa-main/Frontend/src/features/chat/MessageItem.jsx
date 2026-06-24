import React, { memo, useState } from 'react'
import './MessageItem.css'

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const MessageStatus = ({ status }) => {
  if (!status || status === 'sent') return <span className="msg-status sent">✓✓</span>
  if (status === 'sending') return <span className="msg-status sending">⏳</span>
  if (status === 'failed') return <span className="msg-status failed">!</span>
  if (status === 'read') return <span className="msg-status read">✓✓</span>
  return null
}

const MessageItem = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
  currentUserId,
}) => {
  const [showMenu, setShowMenu] = useState(false)

  const handleContextMenu = (e) => {
    e.preventDefault()
    setShowMenu(true)
  }

  const handleDelete = () => {
    setShowMenu(false)
    onDelete?.(message._id)
  }

  const isDeleted = message.deleted

  return (
    <div
      className={`msg-wrapper ${isOwn ? 'msg-own' : 'msg-other'}`}
      onClick={() => showMenu && setShowMenu(false)}
    >
      {!isOwn && showAvatar && (
        <div className="msg-avatar">
          {message.sender?.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="avatar-img"
            />
          ) : (
            <div className="avatar-placeholder">
              {(message.sender?.username || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="msg-avatar-spacer" />}

      <div className="msg-content-wrap">
        {!isOwn && showAvatar && (
          <span className="msg-sender-name">{message.sender?.username}</span>
        )}

        <div
          className={`msg-bubble ${isOwn ? 'bubble-own' : 'bubble-other'} ${
            isDeleted ? 'bubble-deleted' : ''
          } ${message.status === 'failed' ? 'bubble-failed' : ''}`}
          onContextMenu={isOwn && !isDeleted ? handleContextMenu : undefined}
        >
          {isDeleted ? (
            <span className="msg-deleted-text">Tin nhắn đã bị xoá</span>
          ) : message.type === 'image' ? (
            <img
              src={message.content}
              alt="img"
              className="msg-image"
              loading="lazy"
            />
          ) : (
            <p className="msg-text">{message.content}</p>
          )}
        </div>

        <div className={`msg-meta ${isOwn ? 'meta-own' : 'meta-other'}`}>
          <span className="msg-time">{formatTime(message.createdAt)}</span>
          {isOwn && <MessageStatus status={message.status} />}
        </div>

        {showMenu && (
          <div className="msg-context-menu">
            <button className="menu-item menu-delete" onClick={handleDelete}>
              🗑 Xoá tin nhắn
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigator.clipboard.writeText(message.content)
                setShowMenu(false)
              }}
            >
              📋 Sao chép
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(MessageItem)
