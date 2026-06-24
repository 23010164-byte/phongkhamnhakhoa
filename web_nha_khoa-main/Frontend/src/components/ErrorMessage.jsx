import './ErrorMessage.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <span className="error-icon">⚠</span>
      <p>{message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}</p>
      {onRetry && (
        <button className="btn btn--sm btn--outline" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
