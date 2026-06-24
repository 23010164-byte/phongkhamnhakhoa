import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import medicalApi from '../../api/medical.api';
import useAuthStore from '../../store/auth.store';
import { formatCurrency } from '../../utils/helpers';
import './Prescription.css';

const EMPTY_ITEM = {
  serviceId: '',
  name: '',
  price: 0,
  quantity: 1,
  notes: '',
};

export default function MedicalRecordServices() {
  const { id: recordId } = useParams();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'doctor';
  const role = user?.role;

  const [record, setRecord] = useState(null);
  const [items, setItems] = useState([{ ...EMPTY_ITEM, _key: Date.now() }]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalApi.getServices(recordId);
      const data = res.data?.data || res.data;
      if (data) {
        setRecord(data);
        if (data.items && data.items.length > 0) {
          setItems(
            data.items.map((item, i) => ({
              ...item,
              serviceId: item.service_id || item.serviceId,
              name: item.service?.name || item.name || 'Dịch vụ',
              _key: i
            }))
          );
        } else {
          if (isDoctor) setEditMode(true);
          else setItems([]);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [recordId, isDoctor]);

  const fetchAvailableServices = useCallback(async () => {
    try {
      // Import it dynamically using ES modules or just use the pre-imported one if we had it.
      // Actually we don't have it at the top, let's use dynamic import.
      const module = await import('../../api/axiosClient');
      const axiosClient = module.default;
      const res = await axiosClient.get('/services', { params: { search: serviceSearch, limit: 50 } });
      setAvailableServices(res.data?.data || res.data || []);
    } catch (e) {
      console.error('Failed to load services:', e);
    }
  }, [serviceSearch]);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => {
    if (editMode) fetchAvailableServices();
  }, [editMode, fetchAvailableServices]);

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM, _key: Date.now() }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const selectService = (idx, svc) => {
    handleItemChange(idx, 'serviceId', svc.id);
    handleItemChange(idx, 'name', svc.name);
    handleItemChange(idx, 'price', svc.price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate empty services
    if (items.some(i => !i.serviceId)) {
      setError('Vui lòng chọn đầy đủ dịch vụ hoặc xoá các dòng trống.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        items: items.map(({ _key, ...rest }) => ({
          serviceId: rest.serviceId,
          price: Number(rest.price),
          quantity: Number(rest.quantity),
          notes: rest.notes,
        })),
      };

      const res = await medicalApi.saveServices(recordId, payload);
      const data = res.data?.data || res.data;
      setRecord(data);
      if (data.items && data.items.length > 0) {
        setItems(
          data.items.map((item, i) => ({
            ...item,
            serviceId: item.service_id || item.serviceId,
            name: item.service?.name || item.name || 'Dịch vụ',
            _key: i
          }))
        );
      }
      setEditMode(false);
      setSuccessMsg('Lưu chỉ định dịch vụ thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: '#6b7280' }}>
      <div style={{ width: 24, height: 24, border: '2.5px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Đang tải danh sách dịch vụ...
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <nav className="breadcrumb" style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link to={`/${role}/records`} style={{ color: '#2563eb', textDecoration: 'none' }}>Hồ sơ bệnh án</Link>
        <span>›</span>
        <Link to={`/${role}/records/${recordId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>Chi tiết bệnh án</Link>
        <span>›</span>
        <span>Dịch vụ chỉ định</span>
      </nav>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Dịch vụ chỉ định</h1>
        </div>
        {isDoctor && !editMode && record?.items?.length > 0 && (
          <button className="btn btn-primary" style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditMode(true)}>
            Chỉnh sửa dịch vụ
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '0.88rem' }}>
          <span>⚠️ {error}</span>
          <button style={{ border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', background: 'transparent', color: 'inherit', cursor: 'pointer' }} onClick={() => setError(null)}>Đóng</button>
        </div>
      )}
      
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#15803d', fontSize: '0.88rem' }}>
          ✅ {successMsg}
        </div>
      )}

      {(!record?.items || record.items.length === 0) && !isDoctor && !editMode && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <span className="empty-icon" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🦷</span>
          <p>Chưa có dịch vụ nào được chỉ định</p>
        </div>
      )}

      {editMode && isDoctor ? (
        <form onSubmit={handleSubmit} noValidate>
          {/* Service search */}
          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Tra cứu dịch vụ</h2>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm tên dịch vụ..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', marginBottom: 12 }}
            />
            {availableServices.length > 0 ? (
              <div className="medicine-list" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {availableServices.map((svc) => (
                  <div key={svc.id} className="medicine-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <strong>{svc.name}</strong>
                      <div className="medicine-meta" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 500 }}>
                        {formatCurrency(svc.price)}
                      </div>
                    </div>
                    <div className="medicine-actions" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {items.map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          className="btn btn-sm btn-outline"
                          onClick={() => selectService(idx, svc)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          +{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Không tìm thấy dịch vụ nào phù hợp</p>
            )}
          </div>

          {/* Item rows */}
          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Danh sách dịch vụ chỉ định</h2>

            {items.map((item, idx) => (
              <div key={item._key} className="rx-item" style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <div className="rx-item-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="rx-index" style={{ fontWeight: 600, color: '#3b82f6' }}>#{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      style={{ padding: '4px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => removeItem(idx)}
                    >
                      Xoá
                    </button>
                  )}
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Dịch vụ <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f3f4f6' }}
                      value={item.name || ''}
                      readOnly
                      placeholder="Tra cứu và chọn ở trên"
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Đơn giá (VNĐ)</label>
                    <input
                      type="number"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Số lượng <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      min={1}
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Ghi chú / Vị trí răng</label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      value={item.notes || ''}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                      placeholder="VD: Răng số 8 hàm dưới"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" style={{ padding: '8px 16px', background: 'transparent', border: '1px dashed #2563eb', color: '#2563eb', borderRadius: 8, cursor: 'pointer', fontWeight: 500, width: '100%' }} onClick={addItem}>
              + Thêm dịch vụ
            </button>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {record?.items?.length > 0 && (
              <button
                type="button"
                style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => {
                  setEditMode(false);
                  fetchServices(); // reset
                }}
                disabled={saving}
              >
                Huỷ
              </button>
            )}
            <button type="submit" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu chỉ định'}
            </button>
          </div>
        </form>
      ) : (
        record?.items?.length > 0 && (
          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Danh sách dịch vụ chỉ định</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>#</th>
                    <th style={{ padding: '12px 8px' }}>Dịch vụ</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>SL</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Thành tiền</th>
                    <th style={{ padding: '12px 8px' }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {record.items.map((item, idx) => {
                    const total = (item.price || 0) * (item.quantity || 1);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 8px' }}><strong>{item.service?.name || item.name}</strong></td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, color: '#b91c1c' }}>{formatCurrency(total)}</td>
                        <td style={{ padding: '12px 8px' }}>{item.notes || '—'}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={4} style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Tổng tiền:</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#b91c1c', fontSize: '1.05rem' }}>
                      {formatCurrency(record.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
