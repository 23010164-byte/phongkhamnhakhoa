import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import medicalApi from '../../api/medical.api';
import useAuthStore from '../../store/auth.store';
import { validate, validators } from '../../utils/helpers';
import './Prescription.css';

const EMPTY_ITEM = {
  medicineId: '',
  medicineName: '',
  dosage: '',
  quantity: '',
  unit: 'viên',
  frequency: '',
  duration: '',
  instruction: '',
};

function buildItemErrors(item) {
  const errors = {};
  const req = validators.required;
  if (validate(item.medicineName, [req])) errors.medicineName = validate(item.medicineName, [req]);
  if (validate(item.dosage, [req])) errors.dosage = validate(item.dosage, [req]);
  if (validate(item.quantity, [req])) errors.quantity = validate(item.quantity, [req]);
  if (validate(item.frequency, [req])) errors.frequency = validate(item.frequency, [req]);
  return errors;
}

export default function Prescription() {
  const { id: recordId } = useParams();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'doctor';
  const role = user?.role;

  const [prescription, setPrescription] = useState(null);
  const [items, setItems] = useState([{ ...EMPTY_ITEM, _key: Date.now() }]);
  const [notes, setNotes] = useState('');
  const [itemErrors, setItemErrors] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [medSearch, setMedSearch] = useState('');

  const fetchPrescription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalApi.getPrescriptionByRecord(recordId);
      const data = res.data?.data || res.data;
      if (data) {
        setPrescription(data);
        setItems(
          (data.items || []).map((item, i) => ({
            ...item,
            medicineName: item.medicine_name || item.medicineName || '',
            _key: i
          }))
        );
        setNotes(data.notes || '');
      } else {
        setPrescription(null);
        if (isDoctor) setEditMode(true);
      }
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setPrescription(null);
        if (isDoctor) setEditMode(true);
      } else {
        setError(err?.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [recordId, isDoctor]);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await medicalApi.getMedicines({ search: medSearch, limit: 20 });
      setMedicines(res.data?.medicines || res.data?.data || []);
    } catch {
      // silently fail — user can type manually
    }
  }, [medSearch]);

  useEffect(() => { fetchPrescription(); }, [fetchPrescription]);
  useEffect(() => {
    if (editMode) fetchMedicines();
  }, [editMode, fetchMedicines]);

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM, _key: Date.now() }]);
    setItemErrors((prev) => [...prev, {}]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setItemErrors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
    if (itemErrors[idx]?.[field]) {
      setItemErrors((prev) =>
        prev.map((e, i) =>
          i === idx ? { ...e, [field]: null } : e
        )
      );
    }
  };

  const selectMedicine = (idx, med) => {
    handleItemChange(idx, 'medicineId', med._id || med.id);
    handleItemChange(idx, 'medicineName', med.name);
    handleItemChange(idx, 'unit', med.unit || 'viên');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = items.map((item) => buildItemErrors(item));
    setItemErrors(newErrors);
    if (newErrors.some((e) => Object.keys(e).length > 0)) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        items: items.map(({ _key, ...rest }) => ({
          medicine_id: rest.medicineId,
          medicine_name: rest.medicineName,
          dosage: rest.dosage,
          quantity: Number(rest.quantity),
          unit: rest.unit,
          frequency: rest.frequency,
          duration: rest.duration,
          instruction: rest.instruction,
        })),
        notes,
      };

      let res;
      if (prescription) {
        res = await medicalApi.updatePrescription(prescription.id || prescription._id, payload);
      } else {
        res = await medicalApi.createPrescription(recordId, payload);
      }

      setPrescription(res.data?.data || res.data);
      setEditMode(false);
      setSuccessMsg('Lưu đơn thuốc thành công!');
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
      Đang tải đơn thuốc...
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <nav className="breadcrumb" style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link to={`/${role}/records`} style={{ color: '#2563eb', textDecoration: 'none' }}>Hồ sơ bệnh án</Link>
        <span>›</span>
        <Link to={`/${role}/records/${recordId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>Chi tiết bệnh án</Link>
        <span>›</span>
        <span>Đơn thuốc</span>
      </nav>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Đơn thuốc</h1>
          {prescription && (
            <p className="page-subtitle" style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
              Cập nhật lần cuối: {new Date(prescription.updated_at || prescription.updatedAt || prescription.created_at).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        {isDoctor && !editMode && prescription && (
          <button className="btn btn-primary" style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditMode(true)}>
            Chỉnh sửa đơn thuốc
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '0.88rem' }}>
          <span>⚠️ {error}</span>
          <button style={{ border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', background: 'transparent', color: 'inherit', cursor: 'pointer' }} onClick={fetchPrescription}>Thử lại</button>
        </div>
      )}
      
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#15803d', fontSize: '0.88rem' }}>
          ✅ {successMsg}
        </div>
      )}

      {!prescription && !isDoctor && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <span className="empty-icon" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>💊</span>
          <p>Chưa có đơn thuốc cho bệnh án này</p>
        </div>
      )}

      {editMode && isDoctor ? (
        <form onSubmit={handleSubmit} noValidate>
          {/* Medicine search */}
          {medicines.length > 0 && (
            <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Tra cứu thuốc</h2>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm tên thuốc..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', marginBottom: 12 }}
              />
              <div className="medicine-list" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {medicines.map((med) => (
                  <div key={med.id || med._id} className="medicine-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <strong>{med.name}</strong>
                      <span className="muted" style={{ color: '#6b7280' }}> — {med.active_ingredient || med.activeIngredient}</span>
                      <div className="medicine-meta" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {med.unit} · {med.concentration}
                      </div>
                    </div>
                    <div className="medicine-actions" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {items.map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          className="btn btn-sm btn-outline"
                          onClick={() => selectMedicine(idx, med)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          +{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item rows */}
          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Danh sách thuốc</h2>

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
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Tên thuốc <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: `1px solid ${itemErrors[idx]?.medicineName ? '#ef4444' : '#e5e7eb'}`, borderRadius: 8 }}
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                      placeholder="VD: Paracetamol 500mg"
                    />
                    {itemErrors[idx]?.medicineName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{itemErrors[idx].medicineName}</span>}
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Liều lượng <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: `1px solid ${itemErrors[idx]?.dosage ? '#ef4444' : '#e5e7eb'}`, borderRadius: 8 }}
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      placeholder="VD: 1 viên x 3 lần/ngày"
                    />
                    {itemErrors[idx]?.dosage && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{itemErrors[idx].dosage}</span>}
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Số lượng <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number"
                        style={{ padding: '8px 12px', border: `1px solid ${itemErrors[idx]?.quantity ? '#ef4444' : '#e5e7eb'}`, borderRadius: 8, width: 80 }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="30"
                        min={1}
                      />
                      <select
                        style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      >
                        {['viên', 'gói', 'ống', 'lọ', 'chai', 'tuýp', 'hộp'].map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    {itemErrors[idx]?.quantity && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{itemErrors[idx].quantity}</span>}
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Tần suất <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: `1px solid ${itemErrors[idx]?.frequency ? '#ef4444' : '#e5e7eb'}`, borderRadius: 8 }}
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      placeholder="VD: 3 lần/ngày"
                    />
                    {itemErrors[idx]?.frequency && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{itemErrors[idx].frequency}</span>}
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Thời gian dùng</label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      value={item.duration}
                      onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                      placeholder="VD: 7 ngày"
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>Hướng dẫn sử dụng</label>
                    <input
                      type="text"
                      style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      value={item.instruction}
                      onChange={(e) => handleItemChange(idx, 'instruction', e.target.value)}
                      placeholder="VD: Uống sau ăn, tránh rượu bia"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" style={{ padding: '8px 16px', background: 'transparent', border: '1px dashed #2563eb', color: '#2563eb', borderRadius: 8, cursor: 'pointer', fontWeight: 500, width: '100%' }} onClick={addItem}>
              + Thêm thuốc
            </button>
          </div>

          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Ghi chú đơn thuốc</h2>
            <textarea
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', resize: 'vertical' }}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dặn dò thêm cho bệnh nhân..."
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {prescription && (
              <button
                type="button"
                style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Huỷ
              </button>
            )}
            <button type="submit" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu đơn thuốc'}
            </button>
          </div>
        </form>
      ) : (
        prescription && (
          <div className="info-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="card-title" style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: 16 }}>Danh sách thuốc</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>#</th>
                    <th style={{ padding: '12px 8px' }}>Tên thuốc</th>
                    <th style={{ padding: '12px 8px' }}>Liều lượng</th>
                    <th style={{ padding: '12px 8px' }}>Số lượng</th>
                    <th style={{ padding: '12px 8px' }}>Tần suất</th>
                    <th style={{ padding: '12px 8px' }}>Thời gian</th>
                    <th style={{ padding: '12px 8px' }}>Hướng dẫn</th>
                  </tr>
                </thead>
                <tbody>
                  {(prescription.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 8px' }}><strong>{item.medicine_name || item.medicineName}</strong></td>
                      <td style={{ padding: '12px 8px' }}>{item.dosage}</td>
                      <td style={{ padding: '12px 8px' }}>{item.quantity} {item.unit}</td>
                      <td style={{ padding: '12px 8px' }}>{item.frequency}</td>
                      <td style={{ padding: '12px 8px' }}>{item.duration || '—'}</td>
                      <td style={{ padding: '12px 8px' }}>{item.instruction || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {prescription.notes && (
              <div style={{ marginTop: 20, padding: 16, background: '#fef3c7', borderRadius: 8, color: '#92400e', fontSize: '0.9rem' }}>
                <strong>Ghi chú từ bác sĩ:</strong> {prescription.notes}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
