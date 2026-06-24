import './user.css';

/* ── Spinner ── */
export function Spinner({ small, label }) {
  return (
    <div className="loading-center">
      <div className={`spinner${small ? ' spinner-sm' : ''}`} />
      {label && <span>{label}</span>}
    </div>
  );
}

/* ── Alert ── */
export function Alert({ type = 'error', children, onClose }) {
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: 16 }}>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0, opacity: .6 }}
          aria-label="Đóng"
        >✕</button>
      )}
    </div>
  );
}

/* ── Avatar placeholder ── */
export function AvatarPlaceholder({ name = '', size = 'md', src }) {
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={name} className={`avatar avatar-${size}`} />;
  return <span className={`avatar-placeholder avatar-${size}`}>{initials || '?'}</span>;
}

/* ── Role badge ── */
const ROLE_LABEL = { admin: 'Admin', doctor: 'Bác sĩ', receptionist: 'Lễ tân', patient: 'Bệnh nhân' };
export function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{ROLE_LABEL[role] ?? role}</span>;
}

/* ── Status badge ── */
export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
    </span>
  );
}

/* ── Confirm dialog ── */
export function ConfirmDialog({ title, desc, onConfirm, onCancel, loading }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-title">{title}</div>
        <div className="confirm-desc">{desc}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Huỷ
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý…' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ── */
export function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="pagination">
      <span>Hiển thị {from}–{to} / {total} kết quả</span>
      <div className="pagination-btns">
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >‹</button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e-${i}`} style={{ padding: '0 4px', alignSelf: 'center', color: 'var(--color-text-muted)' }}>…</span>
            : <button
                key={p}
                className={`page-btn${p === page ? ' active' : ''}`}
                onClick={() => onPageChange(p)}
              >{p}</button>
        )}
        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
        >›</button>
      </div>
    </div>
  );
}

/* ── Inline SVG icons ── */
export function Icon({ name, size = 16 }) {
  const paths = {
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-2 4-5 6-9 6s-7-2-9-6c2-4 5-6 9-6s7 2 9 6z',
    back:    'M10 19l-7-7m0 0l7-7m-7 7h18',
    user:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    lock:    'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    check:   'M5 13l4 4L19 7',
    plus:    'M12 4v16m8-8H4',
    filter:  'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z',
    camera:  'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm13 3a4 4 0 11-8 0 4 4 0 018 0z',
    ban:     'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || paths.user} />
    </svg>
  );
}
