import { useState, useEffect, useCallback } from 'react';
import salaryApi from '../../../api/salary.api';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

export default function PatientComplexityTable() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState(null);

  // ── Load doctors ──
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await salaryApi.getDoctors();
        setDoctors(data.data || data || []);
      } catch {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Load appointments ──
  const fetchAppointments = useCallback(async () => {
    if (!selectedDoctor) return;
    try {
      setLoading(true);
      const { data } = await salaryApi.getAppointments({
        doctorProfileId: selectedDoctor,
        month,
        year,
      });
      const list = data.data || data || [];
      setAppointments(list.map((a) => ({ ...a, _complexity: a.complexity_level ?? 0 })));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, month, year]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Update complexity ──
  const handleComplexityChange = (id, value) => {
    const num = Math.min(0.5, Math.max(0, parseFloat(value) || 0));
    setAppointments((prev) =>
      prev.map((a) => (a._id === id || a.id === id ? { ...a, _complexity: num } : a))
    );
  };

  const handleSaveOne = async (appt) => {
    const id = appt._id || appt.id;
    try {
      setSaving((prev) => ({ ...prev, [id]: true }));
      await salaryApi.updateComplexity(id, { complexity_level: appt._complexity });
      setToast({ type: 'success', msg: `Đã cập nhật độ khó cho ca ${appt.patient_name || 'bệnh nhân'}` });
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving({ _all: true });
      const promises = appointments.map((a) => {
        const id = a._id || a.id;
        return salaryApi.updateComplexity(id, { complexity_level: a._complexity });
      });
      await Promise.all(promises);
      setToast({ type: 'success', msg: `Đã cập nhật ${appointments.length} ca bệnh!` });
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving({});
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {toast && (
        <div className={`salary-toast salary-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">🔍</span>
          Bộ lọc
        </div>
        <div className="salary-form-row-3">
          <div className="salary-form-group">
            <label>Bác sĩ</label>
            <select
              className="salary-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.user?.full_name || d.full_name || d.name || `BS #${d._id || d.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="salary-form-group">
            <label>Tháng</label>
            <select
              className="salary-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="salary-form-group">
            <label>Năm</label>
            <select
              className="salary-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ── Appointments Table ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">📋</span>
          Danh sách ca khám — Tháng {month}/{year}
        </div>

        {!selectedDoctor ? (
          <div className="salary-empty">
            <div className="empty-icon">👨‍⚕️</div>
            <p>Vui lòng chọn bác sĩ để xem danh sách ca khám</p>
          </div>
        ) : loading ? (
          <div className="salary-loading">
            <span className="spinner" />
            Đang tải danh sách...
          </div>
        ) : appointments.length === 0 ? (
          <div className="salary-empty">
            <div className="empty-icon">📭</div>
            <p>Không có ca khám nào trong tháng {month}/{year}</p>
          </div>
        ) : (
          <>
            <div className="salary-table-wrap">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Bệnh nhân</th>
                    <th>Trạng thái</th>
                    <th className="text-center">Độ khó (0–0.5)</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt, idx) => {
                    const id = appt._id || appt.id;
                    return (
                      <tr key={id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{formatDate(appt.appointment_date || appt.date)}</td>
                        <td>{formatTime(appt.appointment_date || appt.date)}</td>
                        <td style={{ fontWeight: 600 }}>
                          {appt.patient_name || appt.patient?.full_name || '—'}
                        </td>
                        <td>
                          <span className={`salary-badge ${
                            appt.status === 'completed' ? 'salary-badge-success' :
                            appt.status === 'confirmed' ? 'salary-badge-primary' :
                            'salary-badge-warning'
                          }`}>
                            {appt.status === 'completed' ? 'Hoàn thành' :
                             appt.status === 'confirmed' ? 'Đã xác nhận' :
                             appt.status || 'Chờ'}
                          </span>
                        </td>
                        <td style={{ width: 130 }}>
                          <input
                            type="number"
                            className="salary-input salary-input-sm"
                            value={appt._complexity}
                            onChange={(e) => handleComplexityChange(id, e.target.value)}
                            step="0.05"
                            min="0"
                            max="0.5"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            className="salary-btn salary-btn-primary salary-btn-sm"
                            onClick={() => handleSaveOne(appt)}
                            disabled={saving[id]}
                          >
                            {saving[id] ? '...' : '💾'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="salary-btn-group">
              <button
                className="salary-btn salary-btn-success"
                onClick={handleSaveAll}
                disabled={saving._all}
              >
                {saving._all ? '⏳ Đang lưu...' : '💾 Lưu tất cả'}
              </button>
              <button
                className="salary-btn salary-btn-secondary"
                onClick={fetchAppointments}
              >
                🔄 Tải lại
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
