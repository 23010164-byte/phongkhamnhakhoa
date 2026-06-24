import './NotificationSkeleton.css';

const NotificationSkeleton = () => {
  return (
    <div className="skeleton-item" aria-hidden="true">
      <div className="skeleton-icon" />
      <div className="skeleton-content">
        <div className="skeleton-line title" />
        <div className="skeleton-line message" />
        <div className="skeleton-line time" />
      </div>
    </div>
  );
};

export default NotificationSkeleton;
