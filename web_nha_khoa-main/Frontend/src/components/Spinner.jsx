import './Spinner.css';

function Spinner({ size = 'md', text = 'Đang tải...' }) {
  return (
    <div className={`spinner-wrapper spinner--${size}`}>
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export default Spinner;
