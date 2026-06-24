const fs = require('fs');
const path = require('path');

const baseDir = 'g:\\Nha khoa\\Frontend\\src';

const files = {
  // ================= CSS =================
  'features/clinic/ClinicManagement.css': `
.clinic-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.clinic-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.clinic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.clinic-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover { background: #f8fafc; }

.clinic-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.clinic-filters {
  display: flex;
  gap: 12px;
  flex: 1;
}

.filter-input-wrap {
  position: relative;
  display: inline-block;
}
.filter-input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 180px;
  background-color: white;
  color: #334155;
  transition: border-color 0.2s;
}
.filter-input:focus, .filter-select:focus { outline: none; border-color: #3b82f6; }

.btn-primary {
  background-color: #0052cc;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover { background-color: #0043a6; }

.btn-secondary {
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-secondary:hover { background-color: #eff6ff; }

.btn-action {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-action:hover { background: #eff6ff; }
.btn-action.delete { color: #ef4444; }
.btn-action.delete:hover { background: #fef2f2; }

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.badge::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; }

.badge-active { background: #dcfce7; color: #166534; }
.badge-active::before { background: #22c55e; }
.badge-inactive { background: #f1f5f9; color: #475569; }
.badge-inactive::before { background: #94a3b8; }

.badge-pending { background: #fef3c7; color: #b45309; }
.badge-pending::before { background: #f59e0b; }
.badge-approved { background: #dcfce7; color: #166534; }
.badge-approved::before { background: #22c55e; }
.badge-rejected { background: #fee2e2; color: #b91c1c; }
.badge-rejected::before { background: #ef4444; }

.badge-national { background: #fee2e2; color: #b91c1c; }
.badge-clinic { background: #e0e7ff; color: #3730a3; }
.badge-emergency { background: #ffedd5; color: #c2410c; }

/* Forms */
.form-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}
.form-group label span { color: #ef4444; }

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #0f172a;
}
.form-control:focus { outline: none; border-color: #3b82f6; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
  height: 40px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.doctor-avatar-name {
  display: flex;
  align-items: center;
  gap: 12px;
}
.doctor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: #e2e8f0;
}

/* Timeline Monitor */
.monitor-top-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.stat-info p { margin: 0; font-size: 0.875rem; color: #64748b; font-weight: 500; }

.stat-blue { background: #eff6ff; color: #3b82f6; }
.stat-yellow { background: #fefce8; color: #eab308; }
.stat-purple { background: #f5f3ff; color: #8b5cf6; }
.stat-green { background: #f0fdf4; color: #22c55e; }
.stat-red { background: #fef2f2; color: #ef4444; }

.monitor-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.monitor-grid-wrap {
  flex: 1;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.monitor-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.sidebar-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin-top: 0;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.legend-list { display: flex; flex-direction: column; gap: 12px; }
.legend-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.legend-label { display: flex; align-items: center; gap: 8px; }

/* Timeline Grid */
.timeline-header {
  display: grid;
  grid-template-columns: 80px repeat(auto-fit, minmax(150px, 1fr));
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.th-cell {
  padding: 12px;
  text-align: center;
  border-right: 1px solid #e2e8f0;
}
.th-cell:last-child { border-right: none; }
.th-name { font-weight: 700; font-size: 0.875rem; color: #0f172a; margin-bottom: 4px; text-transform: uppercase;}
.th-room { font-size: 0.75rem; color: #64748b; }

.timeline-body {
  display: flex;
  flex-direction: column;
}
.timeline-row {
  display: grid;
  grid-template-columns: 80px repeat(auto-fit, minmax(150px, 1fr));
  border-bottom: 1px solid #f1f5f9;
  min-height: 80px;
}
.time-cell {
  padding: 16px 0;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  border-right: 1px solid #e2e8f0;
  background: #fdfdfd;
}
.slot-cell {
  padding: 8px;
  border-right: 1px solid #f1f5f9;
  position: relative;
}
.slot-cell:last-child { border-right: none; }

.appt-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.75rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  position: relative;
  transition: all 0.2s;
}
.appt-card.status-pending { border-left-color: #f59e0b; }
.appt-card.status-checked_in { border-left-color: #3b82f6; }
.appt-card.status-in_progress { border-left-color: #8b5cf6; }
.appt-card.status-completed { border-left-color: #22c55e; }
.appt-card.status-cancelled { border-left-color: #ef4444; }

.appt-name { font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 4px; }
.appt-phone { color: #64748b; }
.appt-status { align-self: flex-end; font-weight: 500; font-size: 0.7rem; }
.appt-menu { position: absolute; right: 4px; top: 4px; color: #cbd5e1; cursor: pointer; }

/* Custom Pie Chart CSS */
.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 16px auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pie-inner {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.pie-inner h4 { margin: 0; font-size: 1.25rem; color: #0f172a; }
.pie-inner p { margin: 0; font-size: 0.7rem; color: #64748b; }

.quick-action-btn {
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  color: #3b82f6;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-action-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
`,

  // ================= HOLIDAY =================
  'features/clinic/HolidayManagement.jsx': `import React, { useEffect, useState } from 'react';
import useClinicStore from '../../store/clinic.store';
import DataTable from '../../components/common/DataTable';
import ErrorAlert from '../../components/common/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';
import './ClinicManagement.css';

const TYPE_LABELS = {
  national: 'Nghỉ lễ',
  clinic: 'Nghỉ phòng khám',
  emergency: 'Nghỉ đột xuất',
};

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

const HolidayManagement = () => {
  const { holidays, holidayLoading, holidayError, holidayPagination, holidayFilters, fetchHolidays, setHolidayFilters, createHoliday, updateHoliday, deleteHoliday } = useClinicStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  const [formData, setFormData] = useState({ holiday_date: '', holiday_type: 'clinic', note: '', is_active: true });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenForm = (holiday = null) => {
    setSelectedHoliday(holiday);
    if (holiday) {
      setFormData({
        holiday_date: holiday.holiday_date,
        holiday_type: holiday.holiday_type,
        note: holiday.note || '',
        is_active: holiday.is_active
      });
    } else {
      setFormData({ holiday_date: '', holiday_type: 'clinic', note: '', is_active: true });
    }
    setIsAdding(true);
  };

  const handleSave = async () => {
    let res;
    if (selectedHoliday) {
      res = await updateHoliday(selectedHoliday.id, formData);
    } else {
      res = await createHoliday(formData);
    }
    if (res.success) {
      setIsAdding(false);
    } else {
      alert(res.message);
    }
  };

  const handleDeleteClick = (holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedHoliday) {
      await deleteHoliday(selectedHoliday.id);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { title: 'STT', key: 'stt', render: (_, __, index) => (holidayFilters.page - 1) * holidayFilters.limit + index + 1 },
    { title: 'Ngày nghỉ', key: 'holiday_date', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
    { title: 'Loại nghỉ', key: 'holiday_type', render: (val) => TYPE_LABELS[val] || val },
    { title: 'Ghi chú', key: 'note' },
    { title: 'Trạng thái', key: 'is_active', render: (val) => <span className={\`badge badge-\${val ? 'active' : 'inactive'}\`}>{val ? 'Hoạt động' : 'Không hoạt động'}</span> },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
          <button className="btn-action" onClick={() => handleOpenForm(row)}><EditIcon /></button>
          <button className="btn-action delete" onClick={() => handleDeleteClick(row)}><TrashIcon /></button>
        </div>
      )
    }
  ];

  if (isAdding) {
    return (
      <div className="clinic-page">
        <div className="clinic-card">
          <div className="clinic-header" style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px'}}>
            <h1 className="clinic-title">
              <button className="back-btn" onClick={() => setIsAdding(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              {selectedHoliday ? "Sửa ngày nghỉ" : "Thêm ngày nghỉ"}
            </h1>
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label>Ngày nghỉ <span>*</span></label>
              <input type="date" className="form-control" value={formData.holiday_date} onChange={(e) => setFormData({...formData, holiday_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="is_active" checked={formData.is_active === true} onChange={() => setFormData({...formData, is_active: true})} /> Hoạt động
                </label>
                <label className="radio-label">
                  <input type="radio" name="is_active" checked={formData.is_active === false} onChange={() => setFormData({...formData, is_active: false})} /> Không hoạt động
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Loại nghỉ <span>*</span></label>
              <select className="form-control" value={formData.holiday_type} onChange={(e) => setFormData({...formData, holiday_type: e.target.value})}>
                <option value="clinic">Nghỉ phòng khám</option>
                <option value="national">Nghỉ lễ</option>
                <option value="emergency">Nghỉ đột xuất</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn: '1 / span 2'}}>
              <label>Ghi chú</label>
              <textarea className="form-control" rows="4" placeholder="Nhập ghi chú..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSave} disabled={holidayLoading}>{holidayLoading ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clinic-page">
      <div className="clinic-card">
        <div className="clinic-header">
          <h1 className="clinic-title">Danh sách ngày nghỉ</h1>
          <button className="btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Thêm ngày nghỉ
          </button>
        </div>

        <div className="clinic-toolbar">
          <div className="clinic-filters">
            <div className="filter-input-wrap" style={{flex: 1, maxWidth: '400px'}}>
              <input type="text" placeholder="Tìm kiếm theo ngày, loại nghỉ, ghi chú..." className="filter-input" style={{width: '100%'}} />
              <div className="filter-input-icon"><CalendarIcon /></div>
            </div>
            <button className="btn-secondary">Xem lịch</button>
          </div>
        </div>

        {holidayError && <ErrorAlert message={holidayError} onRetry={fetchHolidays} />}

        <DataTable
          columns={columns}
          data={holidays}
          loading={holidayLoading}
          pagination={{
            currentPage: holidayFilters.page,
            totalPages: Math.ceil(holidayPagination.total / holidayPagination.limit) || 1,
            onPageChange: (page) => setHolidayFilters({ page })
          }}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa ngày nghỉ"
        message="Bạn có chắc chắn muốn xóa ngày nghỉ này không?"
      />
    </div>
  );
};

export default HolidayManagement;`,

  // ================= SHIFT =================
  'features/clinic/ShiftManagement.jsx': `import React, { useEffect, useState } from 'react';
import useClinicStore from '../../store/clinic.store';
import DataTable from '../../components/common/DataTable';
import ErrorAlert from '../../components/common/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';
import './ClinicManagement.css';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const ShiftManagement = () => {
  const { shifts, shiftLoading, shiftError, shiftPagination, shiftFilters, fetchShifts, setShiftFilters, createShift, updateShift, deleteShift } = useClinicStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', start_time: '', end_time: '', is_active: true });

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpenForm = (shift = null) => {
    setSelectedShift(shift);
    if (shift) {
      setFormData({ name: shift.name, start_time: shift.start_time, end_time: shift.end_time, is_active: shift.is_active });
    } else {
      setFormData({ name: '', start_time: '', end_time: '', is_active: true });
    }
    setIsAdding(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSave = async () => {
    let res;
    if (selectedShift) {
      res = await updateShift(selectedShift.id, formData);
    } else {
      res = await createShift(formData);
    }
    if (res.success) {
      setIsAdding(false);
    } else {
      alert(res.message);
    }
  };

  const handleDeleteClick = (shift) => {
    setSelectedShift(shift);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedShift) {
      await deleteShift(selectedShift.id);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { title: 'STT', key: 'stt', render: (_, __, index) => (shiftFilters.page - 1) * shiftFilters.limit + index + 1 },
    { title: 'Tên ca', key: 'name' },
    { title: 'Giờ bắt đầu', key: 'start_time' },
    { title: 'Giờ kết thúc', key: 'end_time' },
    { title: 'Mô tả', key: 'desc', render: (_, row) => \`Ca làm việc buổi \${row.name.toLowerCase().replace('ca ', '')}\` },
    { title: 'Trạng thái', key: 'is_active', render: (val) => <span className={\`badge badge-\${val ? 'active' : 'inactive'}\`}>{val ? 'Hoạt động' : 'Không hoạt động'}</span> },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
          <button className="btn-action" onClick={() => handleOpenForm(row)}><EditIcon /></button>
          <button className="btn-action delete" onClick={() => handleDeleteClick(row)}><TrashIcon /></button>
        </div>
      )
    }
  ];

  return (
    <div className="clinic-page">
      <div className="clinic-card">
        <div className="clinic-header">
          <h1 className="clinic-title">Danh sách ca làm việc</h1>
          <button className="btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Thêm ca làm việc
          </button>
        </div>

        <div className="clinic-toolbar">
          <div className="clinic-filters">
            <div className="filter-input-wrap" style={{flex: 1, maxWidth: '300px'}}>
              <input type="text" placeholder="Tìm kiếm theo tên ca..." className="filter-input" style={{width: '100%'}} 
                value={shiftFilters.search} onChange={(e) => setShiftFilters({ search: e.target.value, page: 1 })} />
              <div className="filter-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
            </div>
            <button className="btn-secondary" style={{padding: '8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Lọc
            </button>
          </div>
        </div>

        {shiftError && <ErrorAlert message={shiftError} onRetry={fetchShifts} />}

        <DataTable columns={columns} data={shifts} loading={shiftLoading} pagination={{ currentPage: shiftFilters.page, totalPages: Math.ceil(shiftPagination.total / shiftPagination.limit) || 1, onPageChange: (page) => setShiftFilters({ page }) }} />
      </div>

      {isAdding && (
        <div className="clinic-card" style={{marginTop: '24px'}}>
          <div className="clinic-header" style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px'}}>
            <h1 className="clinic-title">{selectedShift ? "Sửa ca làm việc" : "Thêm ca làm việc"}</h1>
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label>Tên ca <span>*</span></label>
              <input type="text" className="form-control" placeholder="Nhập tên ca làm việc" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group" style={{display: 'flex', gap: '16px'}}>
              <div style={{flex: 1}}>
                <label>Giờ bắt đầu <span>*</span></label>
                <div className="filter-input-wrap" style={{width: '100%'}}>
                  <input type="time" className="form-control" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
              </div>
              <div style={{flex: 1}}>
                <label>Giờ kết thúc <span>*</span></label>
                <div className="filter-input-wrap" style={{width: '100%'}}>
                  <input type="time" className="form-control" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea className="form-control" rows="3" placeholder="Nhập mô tả (nếu có)" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <div className="radio-group">
                <label className="radio-label"><input type="radio" checked={formData.is_active === true} onChange={() => setFormData({...formData, is_active: true})} /> Hoạt động</label>
                <label className="radio-label"><input type="radio" checked={formData.is_active === false} onChange={() => setFormData({...formData, is_active: false})} /> Không hoạt động</label>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSave} disabled={shiftLoading}>{shiftLoading ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa ca làm việc" message="Bạn có chắc muốn xóa ca này?" />
    </div>
  );
};

export default ShiftManagement;`,

  // ================= ROSTER =================
  'features/clinic/RosterManagement.jsx': `import React, { useEffect, useState } from 'react';
import useClinicStore from '../../store/clinic.store';
import useAuth from '../../hooks/useAuth';
import useDoctorStore from '../../store/doctor.store';
import DataTable from '../../components/common/DataTable';
import ErrorAlert from '../../components/common/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';
import './ClinicManagement.css';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const RosterManagement = () => {
  const { isAdmin, isDoctor } = useAuth();
  const { rosters, rosterLoading, rosterError, rosterPagination, rosterFilters, fetchRosters, setRosterFilters, createRoster, approveRoster, rejectRoster, deleteRoster, shifts, fetchShifts } = useClinicStore();
  const { doctors, fetchDoctors } = useDoctorStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState(null);
  
  const [formData, setFormData] = useState({ doctor_profile_id: '', shift_id: '', roster_date: '', note: '' });

  useEffect(() => {
    fetchRosters();
    fetchShifts();
    if (isAdmin) fetchDoctors();
  }, []);

  const handleOpenForm = () => {
    setFormData({ doctor_profile_id: '', shift_id: '', roster_date: '', note: '' });
    setIsAdding(true);
  };

  const handleSave = async () => {
    const res = await createRoster(formData);
    if (res.success) setIsAdding(false);
    else alert(res.message);
  };

  const handleDeleteClick = (roster) => {
    setSelectedRoster(roster);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRoster) {
      await deleteRoster(selectedRoster.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleApprove = async (id) => { if (window.confirm('Duyệt lịch trực này?')) await approveRoster(id); };
  const handleReject = async (id) => { if (window.confirm('Từ chối lịch trực này?')) await rejectRoster(id); };

  const columns = [
    { title: 'STT', key: 'stt', render: (_, __, index) => (rosterFilters.page - 1) * rosterFilters.limit + index + 1 },
    { 
      title: 'Bác sĩ', key: 'doctor', 
      render: (val) => (
        <div className="doctor-avatar-name">
          <img className="doctor-avatar" src={val?.user?.avatar || 'https://ui-avatars.com/api/?name=' + (val?.user?.full_name || 'BS') + '&background=e2e8f0&color=334155'} alt="avatar" />
          <span>BS. {val?.user?.full_name || '---'}</span>
        </div>
      ) 
    },
    { title: 'Ngày trực', key: 'roster_date', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
    { title: 'Ca trực', key: 'shift', render: (val) => val?.name || '---' },
    { title: 'Giờ bắt đầu', key: 'shift_start', render: (_, row) => row.shift?.start_time },
    { title: 'Giờ kết thúc', key: 'shift_end', render: (_, row) => row.shift?.end_time },
    { 
      title: 'Trạng thái', key: 'status', 
      render: (val) => {
        const lbls = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
        return <span className={\`badge badge-\${val}\`}>{lbls[val]}</span>;
      } 
    },
    { title: 'Ghi chú', key: 'note', render: (val) => val || '—' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
          {isAdmin && row.status === 'pending' && (
            <>
              <button className="btn-action" style={{color: '#22c55e'}} onClick={() => handleApprove(row.id)}>Duyệt</button>
              <button className="btn-action delete" onClick={() => handleReject(row.id)}>Từ chối</button>
            </>
          )}
          <button className="btn-action"><EditIcon /></button>
          <button className="btn-action delete" onClick={() => handleDeleteClick(row)}><TrashIcon /></button>
        </div>
      )
    }
  ];

  if (isAdding && isDoctor) {
    return (
      <div className="clinic-page">
        <div className="clinic-card">
          <div className="clinic-header" style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px'}}>
            <h1 className="clinic-title">
              <button className="back-btn" onClick={() => setIsAdding(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              Đăng ký lịch trực
            </h1>
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label>Bác sĩ <span>*</span></label>
              <div className="form-control" style={{background: '#f8fafc', color: '#64748b'}}>BS. {useAuth().user?.full_name || 'Tôi'}</div>
            </div>
            <div className="form-group">
              <label>Ngày trực <span>*</span></label>
              <input type="date" className="form-control" value={formData.roster_date} onChange={(e) => setFormData({...formData, roster_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Ca trực <span>*</span></label>
              <select className="form-control" value={formData.shift_id} onChange={(e) => setFormData({...formData, shift_id: e.target.value})}>
                <option value="">Chọn ca làm việc</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>)}
              </select>
            </div>
            <div className="form-group" style={{gridColumn: '1 / span 2'}}>
              <label>Ghi chú</label>
              <textarea className="form-control" rows="4" placeholder="Nhập ghi chú (nếu có)..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
            </div>
          </div>
          
          <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '16px', marginBottom: '24px'}}>
            <p style={{margin: '0 0 8px 0', fontWeight: 600, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Lưu ý:
            </p>
            <ul style={{margin: 0, paddingLeft: '24px', color: '#1e3a8a', fontSize: '0.875rem'}}>
              <li>Lịch trực của bác sĩ sẽ được gửi đến quản lý để phê duyệt.</li>
              <li>Vui lòng kiểm tra lịch cá nhân trước khi đăng ký để tránh trùng lịch.</li>
            </ul>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSave} disabled={rosterLoading}>{rosterLoading ? 'Đang gửi...' : 'Đăng ký'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clinic-page">
      <div className="clinic-card">
        <div className="clinic-header">
          <h1 className="clinic-title">Danh sách lịch trực bác sĩ</h1>
          {isDoctor && (
            <button className="btn-primary" onClick={() => handleOpenForm()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Đăng ký lịch trực
            </button>
          )}
        </div>

        <div className="clinic-toolbar" style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
          <input type="date" className="filter-input" value={rosterFilters.startDate} onChange={(e) => setRosterFilters({ startDate: e.target.value, page: 1 })} />
          {isAdmin && (
            <select className="filter-select" onChange={(e) => setRosterFilters({ doctorProfileId: e.target.value, page: 1 })}>
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>BS. {d.user?.full_name}</option>)}
            </select>
          )}
          <select className="filter-select" value={rosterFilters.shiftId} onChange={(e) => setRosterFilters({ shiftId: e.target.value, page: 1 })}>
            <option value="">-- Chọn ca làm việc --</option>
            {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="filter-select" value={rosterFilters.status} onChange={(e) => setRosterFilters({ status: e.target.value, page: 1 })}>
            <option value="">-- Tất cả trạng thái --</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <div className="filter-input-wrap" style={{flex: 1, minWidth: '200px'}}>
            <input type="text" placeholder="Tìm kiếm..." className="filter-input" style={{width: '100%'}} />
            <div className="filter-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
          </div>
          <button className="btn-secondary" style={{padding: '8px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Lọc
          </button>
        </div>

        {rosterError && <ErrorAlert message={rosterError} onRetry={fetchRosters} />}

        <DataTable columns={columns} data={rosters} loading={rosterLoading} pagination={{ currentPage: rosterFilters.page, totalPages: Math.ceil(rosterPagination.total / rosterPagination.limit) || 1, onPageChange: (page) => setRosterFilters({ page }) }} />
      </div>
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa lịch trực" message="Bạn có chắc chắn muốn xóa lịch này?" />
    </div>
  );
};

export default RosterManagement;`,

  // ================= MONITOR =================
  'features/clinic/AppointmentMonitor.jsx': `import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import appointmentApi from '../../api/appointment.api';
import { io } from 'socket.io-client';
import './ClinicManagement.css';

const AppointmentMonitor = () => {
  const { token, isReceptionist } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getAppointments({ date, limit: 100 });
      setAppointments(res.data?.data?.items || res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch monitor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, { auth: { token } });
    newSocket.on('connect', () => { newSocket.emit('appointment:subscribe_monitor', date); });
    newSocket.on('appointment:status_changed', (payload) => {
      setAppointments(prev => {
        const idx = prev.findIndex(a => a.id === payload.id);
        if (idx !== -1) {
          const newArr = [...prev];
          newArr[idx] = { ...newArr[idx], ...payload, _changed: true };
          return newArr;
        } else if (payload.appointment_date === date) {
          return [payload, ...prev];
        }
        return prev;
      });
      setTimeout(() => { setAppointments(prev => prev.map(a => a.id === payload.id ? { ...a, _changed: false } : a)); }, 2000);
    });
    setSocket(newSocket);
    return () => { newSocket.emit('appointment:unsubscribe_monitor', date); newSocket.disconnect(); };
  }, [date]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'check-in') await appointmentApi.checkInAppointment(id);
      if (action === 'complete') await appointmentApi.completeAppointment(id, '');
    } catch (err) { alert(err.response?.data?.message || 'Lỗi xử lý'); }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    waiting: appointments.filter(a => a.status === 'checked_in').length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length,
  };

  // Extract unique doctors and timeslots for grid
  const doctorsMap = new Map();
  appointments.forEach(a => {
    if (a.doctor?.id) doctorsMap.set(a.doctor.id, a.doctor.user?.full_name);
  });
  const uniqueDoctors = Array.from(doctorsMap.entries()).map(([id, name], idx) => ({ id, name, room: \`Phòng \${idx+1}\` }));
  const timeslots = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getAppointmentsForCell = (time, docId) => appointments.filter(a => a.appointment_time?.startsWith(time.substring(0, 2)) && a.doctor_profile_id === docId);

  const getStatusName = (st) => {
    const map = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', checked_in: 'Chờ khám', in_progress: 'Đang khám', completed: 'Hoàn thành', cancelled: 'Đã hủy', no_show: 'Vắng' };
    return map[st] || st;
  };

  // Calculate pie chart gradient
  const totalValid = stats.waiting + stats.inProgress + stats.completed + stats.cancelled;
  const cWaiting = stats.waiting;
  const cInProgress = stats.inProgress;
  const cCompleted = stats.completed;
  const cCancelled = stats.cancelled;
  
  let conicStr = '#e2e8f0 0% 100%';
  if (totalValid > 0) {
    const pWait = (cWaiting / totalValid) * 100;
    const pProg = (cInProgress / totalValid) * 100;
    const pComp = (cCompleted / totalValid) * 100;
    const pCanc = (cCancelled / totalValid) * 100;
    conicStr = \`
      #f59e0b 0% \${pWait}%, 
      #3b82f6 \${pWait}% \${pWait + pProg}%, 
      #22c55e \${pWait + pProg}% \${pWait + pProg + pComp}%, 
      #ef4444 \${pWait + pProg + pComp}% 100%
    \`;
  }

  return (
    <div className="clinic-page" style={{padding: '16px', maxWidth: '100%'}}>
      <div className="clinic-header" style={{marginBottom: '16px'}}>
        <h1 className="clinic-title">2.5. Theo dõi lịch khám (Real-time)</h1>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <span style={{fontSize: '0.8rem', color: '#22c55e', fontWeight: 600}}>● Real-time</span>
          <span style={{fontSize: '0.8rem', color: '#64748b'}}>Cập nhật lúc: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="clinic-toolbar" style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
        <div className="form-group" style={{margin: 0}}>
          <label style={{fontSize: '0.75rem', color: '#64748b'}}>Ngày</label>
          <input type="date" className="filter-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group" style={{margin: 0}}>
          <label style={{fontSize: '0.75rem', color: '#64748b'}}>Bác sĩ</label>
          <select className="filter-select"><option>Tất cả bác sĩ</option></select>
        </div>
        <div className="form-group" style={{margin: 0}}>
          <label style={{fontSize: '0.75rem', color: '#64748b'}}>Trạng thái</label>
          <select className="filter-select"><option>Tất cả trạng thái</option></select>
        </div>
        <div className="form-group" style={{margin: 0, flex: 1}}>
          <label style={{fontSize: '0.75rem', color: '#64748b'}}>&nbsp;</label>
          <div className="filter-input-wrap" style={{width: '100%'}}>
            <input type="text" placeholder="Tìm kiếm bệnh nhân, SĐT..." className="filter-input" style={{width: '100%'}} />
          </div>
        </div>
      </div>

      <div className="monitor-top-stats">
        <div className="stat-box stat-blue">
          <div className="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
          <div className="stat-info"><h3>{stats.total}</h3><p>Tổng lịch khám</p></div>
        </div>
        <div className="stat-box stat-yellow">
          <div className="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div className="stat-info"><h3>{stats.waiting}</h3><p>Chờ khám</p></div>
        </div>
        <div className="stat-box stat-purple">
          <div className="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
          <div className="stat-info"><h3>{stats.inProgress}</h3><p>Đang khám</p></div>
        </div>
        <div className="stat-box stat-green">
          <div className="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
          <div className="stat-info"><h3>{stats.completed}</h3><p>Hoàn thành</p></div>
        </div>
        <div className="stat-box stat-red">
          <div className="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>
          <div className="stat-info"><h3>{stats.cancelled}</h3><p>Đã hủy</p></div>
        </div>
      </div>

      <div className="monitor-main">
        <div className="monitor-grid-wrap">
          <div className="timeline-header">
            <div className="th-cell" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span className="th-room">THỜI GIAN</span></div>
            {uniqueDoctors.map(d => (
              <div key={d.id} className="th-cell">
                <div className="th-name">BS. {d.name?.toUpperCase()}</div>
                <div className="th-room">{d.room}</div>
              </div>
            ))}
            {uniqueDoctors.length === 0 && <div className="th-cell">Không có lịch bác sĩ</div>}
          </div>
          <div className="timeline-body">
            {timeslots.map((time, tIdx) => (
              <React.Fragment key={time}>
                {tIdx === 5 && <div style={{textAlign: 'center', padding: '8px', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b'}}>--- Nghỉ trưa ---</div>}
                <div className="timeline-row">
                  <div className="time-cell">{time}</div>
                  {uniqueDoctors.map(doc => {
                    const apps = getAppointmentsForCell(time, doc.id);
                    return (
                      <div key={doc.id} className="slot-cell">
                        {apps.length === 0 && <span style={{color: '#cbd5e1', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>-</span>}
                        {apps.map(a => (
                          <div key={a.id} className={\`appt-card status-\${a.status} \${a._changed ? 'row-changed' : ''}\`}>
                            <div className="appt-name">
                              {a.status === 'completed' && <svg width="12" height="12" style={{color: '#22c55e'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              {a.patient?.full_name}
                            </div>
                            <div className="appt-phone">{a.patient?.phone || '0901 234 567'}</div>
                            <div className={\`appt-status\`}>{getStatusName(a.status)}</div>
                            <div className="appt-menu">⋮</div>
                            {isReceptionist && a.status === 'confirmed' && <button onClick={() => handleAction(a.id, 'check-in')} style={{fontSize: '0.7rem', padding: '2px', marginTop: '4px'}}>Check-in</button>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {uniqueDoctors.length === 0 && <div className="slot-cell"></div>}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="monitor-sidebar">
          <div className="sidebar-box">
            <h4 className="sidebar-title">CHÚ THÍCH TRẠNG THÁI</h4>
            <div className="legend-list">
              <div className="legend-item"><div className="legend-label"><span style={{color: '#f59e0b'}}>🕒</span> Chờ khám</div> <span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>{stats.waiting}</span></div>
              <div className="legend-item"><div className="legend-label"><span style={{color: '#3b82f6'}}>🩺</span> Đang khám</div> <span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>{stats.inProgress}</span></div>
              <div className="legend-item"><div className="legend-label"><span style={{color: '#22c55e'}}>✓</span> Hoàn thành</div> <span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>{stats.completed}</span></div>
              <div className="legend-item"><div className="legend-label"><span style={{color: '#ef4444'}}>✕</span> Đã hủy</div> <span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>{stats.cancelled}</span></div>
              <div className="legend-item"><div className="legend-label"><span style={{color: '#cbd5e1'}}>—</span> Không có lịch</div> <span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>--</span></div>
            </div>
          </div>

          <div className="sidebar-box">
            <h4 className="sidebar-title">LỊCH TRONG NGÀY</h4>
            <div className="pie-chart" style={{background: \`conic-gradient(\${conicStr})\`}}>
              <div className="pie-inner">
                <h4>{stats.total}</h4>
                <p>Tổng lịch</p>
              </div>
            </div>
            <div className="legend-list" style={{marginTop: '16px'}}>
              <div className="legend-item"><div className="legend-label"><div style={{width: 8, height: 8, borderRadius: '50%', background: '#f59e0b'}}></div> Chờ khám: {stats.waiting} ({totalValid ? Math.round(stats.waiting/totalValid*100) : 0}%)</div></div>
              <div className="legend-item"><div className="legend-label"><div style={{width: 8, height: 8, borderRadius: '50%', background: '#3b82f6'}}></div> Đang khám: {stats.inProgress} ({totalValid ? Math.round(stats.inProgress/totalValid*100) : 0}%)</div></div>
              <div className="legend-item"><div className="legend-label"><div style={{width: 8, height: 8, borderRadius: '50%', background: '#22c55e'}}></div> Hoàn thành: {stats.completed} ({totalValid ? Math.round(stats.completed/totalValid*100) : 0}%)</div></div>
              <div className="legend-item"><div className="legend-label"><div style={{width: 8, height: 8, borderRadius: '50%', background: '#ef4444'}}></div> Đã hủy: {stats.cancelled} ({totalValid ? Math.round(stats.cancelled/totalValid*100) : 0}%)</div></div>
            </div>
          </div>

          <div className="sidebar-box">
            <h4 className="sidebar-title">THAO TÁC NHANH</h4>
            <button className="quick-action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Đăng ký lịch khám</button>
            <button className="quick-action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> In danh sách lịch</button>
            <button className="quick-action-btn" style={{color: '#16a34a'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Xuất Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentMonitor;`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('UI files successfully written.');
