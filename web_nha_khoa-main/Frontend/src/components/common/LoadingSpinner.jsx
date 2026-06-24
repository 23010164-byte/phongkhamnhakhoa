import './LoadingSpinner.css';

function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className="loading-spinner-wrap">
      <div className="loading-spinner" />
      <span className="loading-spinner-text">{text}</span>
    </div>
  );
}

export default LoadingSpinner;
