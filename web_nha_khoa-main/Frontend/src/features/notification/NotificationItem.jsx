import { useCallback } from 'react';
import useNotificationStore from '../../store/notification.store';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/dateUtils';
import { getNotificationMeta } from '../../utils/notificationUtils';
import './NotificationItem.css';

const NotificationItem = ({ notification }) => {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const markingId = useNotificationStore((s) => s.markingId);

  const { _id, title, message, type, isRead, createdAt, link } = notification;
  const meta = getNotificationMeta(type);
  const isMarking = markingId === _id;

  const handleClick = useCallback(() => {
    if (!isRead) {
      markAsRead(_id);
    }
    if (link) {
      window.location.href = link;
    }
  }, [_id, isRead, link, markAsRead]);

  const handleMarkRead = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isRead) markAsRead(_id);
    },
    [_id, isRead, markAsRead]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      deleteNotification(_id);
    },
    [_id, deleteNotification]
  );

  return (
    <div
      className={`notification-item ${!isRead ? 'unread' : ''} ${isMarking ? 'marking' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Thông báo: ${title}`}
    >
      {/* Unread dot indicator */}
      {!isRead && <span className="unread-dot" aria-label="Chưa đọc" />}

      {/* Icon */}
      <div className={`notification-icon ${meta.colorClass}`} aria-hidden="true">
        <span>{meta.icon}</span>
      </div>

      {/* Content */}
      <div className="notification-content">
        <p className="notification-title">{title}</p>
        {message && <p className="notification-message">{message}</p>}
        <time
          className="notification-time"
          dateTime={createdAt}
          title={formatAbsoluteTime(createdAt)}
        >
          {formatRelativeTime(createdAt)}
        </time>
      </div>

      {/* Actions */}
      <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
        {!isRead && (
          <button
            className="action-btn read-btn"
            onClick={handleMarkRead}
            disabled={isMarking}
            title="Đánh dấu đã đọc"
            aria-label="Đánh dấu đã đọc"
          >
            {isMarking ? (
              <span className="btn-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
        <button
          className="action-btn delete-btn"
          onClick={handleDelete}
          title="Xóa thông báo"
          aria-label="Xóa thông báo"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
