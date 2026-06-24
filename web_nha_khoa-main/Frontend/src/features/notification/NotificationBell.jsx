import { useEffect, useRef, useState } from 'react';
import useNotificationStore from '../../store/notification.store';
import NotificationList from './NotificationList';
import './NotificationBell.css';

const NotificationBell = () => {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  return (
    <div className="notification-bell-container">
      <button
        ref={bellRef}
        className={`bell-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg
          className={`bell-icon ${unreadCount > 0 ? 'has-unread' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="bell-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="notification-panel"
          role="dialog"
          aria-label="Thông báo"
          aria-modal="false"
        >
          <NotificationList />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
