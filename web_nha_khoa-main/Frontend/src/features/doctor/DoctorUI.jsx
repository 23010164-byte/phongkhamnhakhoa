/**
 * DoctorUI.jsx
 * Shared primitives for doctor + service features.
 * Uses CSS from doctor.module.css + layout.css tokens.
 */
import '../user/user.css';
import './doctor.css';

/* ── Spinner ── */
export function Spinner({ label, small }) {
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .6, padding: 0 }}
        >✕</button>
      )}
    </div>
  );
}

/* ── Page header ── */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

/* ── Avatar placeholder ── */
export function AvatarPlaceholder({ name = '', size = 'md', src }) {
  const safeName = typeof name === 'string' ? name : (name ? String(name) : '');
  const initials = safeName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={safeName} className={`avatar avatar-${size}`} />;
  return <span className={`avatar-placeholder avatar-${size}`}>{initials || '?'}</span>;
}

/* ── Badge ── */
export function Badge({ label, type = 'active' }) {
  return <span className={`badge badge-${type}`}>{label}</span>;
}

/* ── Rating stars ── */
export function Stars({ value = 0, max = 5 }) {
  return (
    <div className="stars" aria-label={`${value}/${max} sao`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}>{i < Math.round(value) ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

/* ── Back button ── */
export function BackBtn({ onClick, children = 'Quay lại' }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <Icon name="back" size={15} /> {children}
    </button>
  );
}

/* ── Tab bar ── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          className={`tab-btn${active === t.key ? ' active' : ''}`}
          onClick={() => onChange(t.key)}
          aria-selected={active === t.key}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── Card ── */
export function Card({ children, style }) {
  return <div className="card" style={style}>{children}</div>;
}
export function CardHeader({ title, actions }) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      {actions}
    </div>
  );
}
export function CardBody({ children, style }) {
  return <div className="card-body" style={style}>{children}</div>;
}
export function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}

/* ── Buttons ── */
export function Btn({ variant = 'primary', size, children, ...props }) {
  return (
    <button className={`btn btn-${variant}${size ? ` btn-${size}` : ''}`} {...props}>
      {children}
    </button>
  );
}

/* ── Form primitives ── */
export function FormGroup({ label, htmlFor, error, hint, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {error && <div className="form-error">⚠ {error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
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
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <div className="pagination">
      <span>Hiển thị {from}–{to} / {total} kết quả</span>
      <div className="pagination-btns">
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>‹</button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>…</span>
            : <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        )}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>›</button>
      </div>
    </div>
  );
}

/* ── Confirm dialog ── */
export function ConfirmDialog({ title, desc, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">{title}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>{desc}</div>
        <div className="modal-footer">
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

/* ── Modal ── */
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}
            aria-label="Đóng"
          >✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      {icon && <Icon name={icon} size={36} />}
      <p>{message}</p>
    </div>
  );
}

/* ── Inline SVG icons ── */
export function Icon({ name, size = 16 }) {
  const paths = {
    back:      'M10 19l-7-7m0 0l7-7m-7 7h18',
    search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    edit:      'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:     'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    eye:       'M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-2 4-5 6-9 6s-7-2-9-6c2-4 5-6 9-6s7 2 9 6z',
    calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    plus:      'M12 4v16m8-8H4',
    check:     'M5 13l4 4L19 7',
    star:      'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    user:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    stethoscope: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    info:      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    money:     'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    filter:    'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z',
    camera:    'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm13 3a4 4 0 11-8 0 4 4 0 018 0z',
    ban:       'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    lock:      'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    chevLeft:  'M15 19l-7-7 7-7',
    chevRight: 'M9 5l7 7-7 7',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || paths.user} />
    </svg>
  );
}

/* ── Format helpers (exported for use in page components) ── */
export const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('vi-VN') : '—';

/** Return array of Date objects for a full ISO-week containing `date` */
export function getWeekDates(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon-start
  const mon = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    return dd;
  });
}

export const toISODate = (d) => d.toISOString().slice(0, 10);

export const VN_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
