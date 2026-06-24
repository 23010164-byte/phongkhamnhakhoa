import React, { useEffect, useState } from 'react';
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
    { title: 'Trạng thái', key: 'is_active', render: (val) => <span className={`badge badge-${val ? 'active' : 'inactive'}`}>{val ? 'Hoạt động' : 'Không hoạt động'}</span> },
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

export default HolidayManagement;