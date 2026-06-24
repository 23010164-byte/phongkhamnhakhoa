import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useServiceStore from '../../store/service.store';
import useAuthStore from '../../store/auth.store';
import {
  Spinner, Alert, PageHeader, Pagination,
  EmptyState, Icon, ConfirmDialog, fmtCurrency,
} from '../doctor/DoctorUI';
import '../doctor/doctor.css';

/* ── Debounce ── */
function useDebounce(val, ms = 400) {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

/* ── Service emoji map (fallback icons) ── */
const CATEGORY_EMOJI = {
  'Nha khoa tổng quát': '🪥',
  'Nha khoa trẻ em': '👶',
  'Chỉnh nha - Niềng răng': '😁',
  'Cấy ghép Implant': '🔩',
  'Nhổ răng - Tiểu phẫu': '💉',
  'default': '🦷',
};

/* ── Service card ── */
function ServiceCard({ service, isAdmin, onView, onEdit, onToggle, onDelete }) {
  const emoji = CATEGORY_EMOJI[service.category] ?? CATEGORY_EMOJI.default;

  return (
    <div className="service-card">
      <div
        className="service-card-icon-wrap"
        onClick={onView}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onView()}
        aria-label={`Xem chi tiết ${service.name}`}
      >
        {service.iconUrl
          ? <img src={service.iconUrl} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          : <span>{emoji}</span>
        }
      </div>
      <div className="service-card-body">
        <div className="service-card-category">{service.category ?? 'Dịch vụ y tế'}</div>
        <div className="service-card-name">{service.name}</div>
        {service.description && (
          <div className="service-card-desc">{service.description}</div>
        )}
      </div>
      <div className="service-card-footer">
        <div>
          {service.price != null && (
            <div className="service-price">{fmtCurrency(service.price)}</div>
          )}
          {service.durationMinutes != null && (
            <div className="service-duration">
              <Icon name="clock" size={12} /> {service.durationMinutes} phút
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isAdmin && (
            <>
              <button
                className="btn-icon-only"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title="Chỉnh sửa"
              >
                <Icon name="edit" size={14} />
              </button>
              <button
                className="btn-icon-only"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                title={service.is_active ? 'Ẩn dịch vụ' : 'Kích hoạt'}
              >
                <Icon name={service.is_active ? 'ban' : 'check'} size={14} />
              </button>
              <button
                className="btn-icon-only"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Xoá"
                style={{ color: 'var(--color-error)' }}
              >
                <Icon name="trash" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      {isAdmin && !service.is_active && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: '#6b7280', color: 'white',
          fontSize: '0.68rem', fontWeight: 600,
          padding: '2px 8px', borderRadius: '99px',
        }}>Ẩn</div>
      )}
    </div>
  );
}

/* ── ServiceList ── */
export default function ServiceList() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const isAdmin   = user?.role === 'admin';

  const {
    services, serviceTotal, servicePage, serviceLimit,
    categories, listLoading, listError,
    fetchServices, fetchCategories, clearListError,
    toggleServiceStatus, deleteService,
  } = useServiceStore();

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, service }
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError]     = useState(null);
  const debouncedSearch = useDebounce(search);

  const load = useCallback((page = 1) => {
    fetchServices({ page, limit: serviceLimit, search: debouncedSearch, category, isActive: isAdmin ? 'all' : true });
  }, [debouncedSearch, category, serviceLimit, isAdmin]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { load(1); }, [debouncedSearch, category]);

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    setConfirmError(null);
    const result = confirm.type === 'delete'
      ? await deleteService(confirm.service.id)
      : await toggleServiceStatus(confirm.service.id);
    setConfirmLoading(false);
    if (result.success) setConfirm(null);
    else setConfirmError(result.message);
  };

  return (
    <div>
      <PageHeader
        title="Dịch vụ y tế"
        subtitle="Tất cả dịch vụ khám chữa bệnh"
        actions={isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/admin/services/new')}>
            <Icon name="plus" size={15} /> Thêm dịch vụ
          </button>
        )}
      />

      {listError   && <Alert type="error" onClose={clearListError}>{listError}</Alert>}
      {confirmError && <Alert type="error" onClose={() => setConfirmError(null)}>{confirmError}</Alert>}

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className="search-input-wrap">
          <Icon name="search" size={15} />
          <input
            className="search-input"
            placeholder="Tìm dịch vụ…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id || c.value || JSON.stringify(c)} value={c.id || c.value || ''}>{c.name || c.label || 'Không tên'}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {listLoading && !services.length
        ? <Spinner label="Đang tải dịch vụ…" />
        : services.length === 0
          ? <EmptyState icon="stethoscope" message="Không tìm thấy dịch vụ nào." />
          : (
            <>
              <div className="service-grid" style={{ position: 'relative' }}>
                {services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    isAdmin={isAdmin}
                    onView={() => navigate(isAdmin ? `/admin/services/${s.id}/edit` : `/services/${s.id}`)}
                    onEdit={() => navigate(`/admin/services/${s.id}/edit`)}
                    onToggle={() => setConfirm({ type: 'toggle', service: s })}
                    onDelete={() => setConfirm({ type: 'delete', service: s })}
                  />
                ))}
              </div>

              {serviceTotal > serviceLimit && (
                <div style={{ marginTop: 28 }}>
                  <Pagination
                    page={servicePage}
                    limit={serviceLimit}
                    total={serviceTotal}
                    onPageChange={load}
                  />
                </div>
              )}
            </>
          )
      }

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'delete' ? 'Xoá dịch vụ?' : 'Thay đổi trạng thái?'}
          desc={
            confirm.type === 'delete'
              ? `Bạn chắc chắn muốn xoá dịch vụ "${confirm.service.name}"? Hành động này không thể hoàn tác.`
              : `Bạn muốn ${confirm.service.is_active ? 'ẩn' : 'hiển thị lại'} dịch vụ "${confirm.service.name}"?`
          }
          onConfirm={handleConfirm}
          onCancel={() => { setConfirm(null); setConfirmError(null); }}
          loading={confirmLoading}
        />
      )}
    </div>
  );
}
