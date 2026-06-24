import React, { useEffect, useState } from 'react';
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
        return <span className={`badge badge-${val}`}>{lbls[val]}</span>;
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

export default RosterManagement;