import React, { useEffect, useState } from 'react';
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
    { title: 'Mô tả', key: 'desc', render: (_, row) => `Ca làm việc buổi ${row.name.toLowerCase().replace('ca ', '')}` },
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

export default ShiftManagement;