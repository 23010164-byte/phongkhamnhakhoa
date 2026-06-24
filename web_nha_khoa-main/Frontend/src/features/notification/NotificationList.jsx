import { useEffect, useCallback, useState } from 'react';
import useNotificationStore from '../../store/notification.store';
import useNotificationSocket from '../../hooks/useNotificationSocket';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import EmptyState from './EmptyState';
import './NotificationList.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
];

const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    loadingMore,
    error,
    markingAll,
    fetchNotifications,
    loadMoreNotifications,
    markAllAsRead,
    fetchUnreadCount,
    clearError,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState('all');

  // Initialize socket connection
  useNotificationSocket();

  // Initial data fetch
  useEffect(() => {
    fetchNotifications({ unreadOnly: activeFilter === 'unread' });
    fetchUnreadCount();
  }, [activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll sentinel
  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && pagination.page < pagination.totalPages) {
      loadMoreNotifications();
    }
  }, [loading, loadingMore, pagination, loadMoreNotifications]);

  const sentinelRef = useIntersectionObserver(handleLoadMore);

  const handleFilterChange = (value) => {
    if (value === activeFilter) return;
    setActiveFilter(value);
  };

  const handleRetry = () => {
    clearError();
    fetchNotifications({ unreadOnly: activeFilter === 'unread' });
  };

  const hasMore = pagination.page < pagination.totalPages;
  const showMarkAll = notifications.some((n) => !n.isRead);

  return (
    <div className="notification-list-wrapper">
      {/* Header */}
      <header className="notification-header">
        <div className="header-title-row">
          <h2 className="header-title">
            Thông báo
            {unreadCount > 0 && (
              <span className="header-badge" aria-label={`${unreadCount} thông báo chưa đọc`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h2>

          {showMarkAll && (
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
              disabled={markingAll}
              aria-label="Đánh dấu tất cả đã đọc"
            >
              {markingAll ? (
                <>
                  <span className="btn-spinner-sm" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1 8l4 4 4-4M5 12V3M9 5l6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Đọc tất cả
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs" role="tablist" aria-label="Lọc thông báo">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-tab ${activeFilter === opt.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(opt.value)}
              role="tab"
              aria-selected={activeFilter === opt.value}
            >
              {opt.label}
              {opt.value === 'unread' && unreadCount > 0 && (
                <span className="filter-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
          <button className="error-retry-btn" onClick={handleRetry}>
            Thử lại
          </button>
          <button className="error-close-btn" onClick={clearError} aria-label="Đóng lỗi">
            ✕
          </button>
        </div>
      )}

      {/* List body */}
      <div className="notification-body" role="feed" aria-busy={loading} aria-label="Danh sách thông báo">
        {/* Initial loading skeleton */}
        {loading && notifications.length === 0 && (
          <div className="skeleton-list">
            {Array.from({ length: 6 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && !error && (
          <EmptyState filter={activeFilter} />
        )}

        {/* Notification items */}
        {notifications.length > 0 && (
          <>
            {notifications.map((notification) => (
              <NotificationItem key={notification._id} notification={notification} />
            ))}

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="load-more-sentinel" aria-hidden="true">
                {loadingMore && (
                  <div className="load-more-indicator">
                    <span className="spinner" />
                    <span>Đang tải thêm...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of list */}
            {!hasMore && notifications.length >= 3 && (
              <p className="end-of-list">Đã xem hết thông báo</p>
            )}
          </>
        )}
      </div>

      {/* Footer summary */}
      {notifications.length > 0 && (
        <footer className="notification-footer">
          <span className="footer-count">
            Hiển thị {notifications.length}/{pagination.total} thông báo
          </span>
        </footer>
      )}
    </div>
  );
};

export default NotificationList;
