import './ConfirmModal.css';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title || 'Xác nhận'}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn--outline" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
