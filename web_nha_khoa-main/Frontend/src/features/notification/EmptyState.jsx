import './EmptyState.css';

const EmptyState = ({ filter }) => {
  const isUnreadFilter = filter === 'unread';

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-icon" aria-hidden="true">
        {isUnreadFilter ? '✅' : '🔔'}
      </div>
      <p className="empty-title">
        {isUnreadFilter ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
      </p>
      <p className="empty-desc">
        {isUnreadFilter
          ? 'Bạn đã đọc hết tất cả thông báo rồi!'
          : 'Các thông báo mới sẽ hiển thị ở đây.'}
      </p>
    </div>
  );
};

export default EmptyState;
