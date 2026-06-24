import './ErrorAlert.css';

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="error-alert">
      <span className="error-alert__icon">⚠️</span>
      <span className="error-alert__message">{message || 'Lỗi không xác định'}</span>
      {onRetry && (
        <button className="error-alert__retry" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
