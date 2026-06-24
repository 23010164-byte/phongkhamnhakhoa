import { useEffect, useState } from 'react';
import useClinicStore from '../../store/clinic.store';
import { Icon, toISODate } from '../doctor/DoctorUI';
import './ClinicManagement.css';

export default function AdminLeaves() {
  const { leaves, fetchLeaves, updateLeaveStatus, leaveLoading } = useClinicStore();
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Bạn có chắc muốn ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn này?`)) return;
    
    let reason = '';
    if (status === 'rejected') {
      reason = window.prompt('Nhập lý do từ chối:');
      if (reason === null) return; // User cancelled
      if (!reason) return alert('Bắt buộc phải nhập lý do từ chối');
    }

    const res = await updateLeaveStatus(id, { status, rejection_reason: reason });
    if (res.success) {
      alert('Đã cập nhật trạng thái');
    } else {
      alert(res.message);
    }
  };

  const filteredLeaves = leaves.filter(l => filter === 'all' || l.status === filter);

  return (
    <div className="clinic-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="clinic-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="clinic-title" style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>Duyệt ngày nghỉ</h1>
        
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        >
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Bị từ chối</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div className="clinic-card" style={{ padding: 0, borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Ngày xin nghỉ</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Bác sĩ</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Lý do</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map(leave => {
              let badgeColor = '#94a3b8', badgeBg = '#f1f5f9', badgeText = 'Không rõ';
              if (leave.status === 'approved') { badgeColor = '#166534'; badgeBg = '#dcfce7'; badgeText = 'Đã duyệt'; }
              if (leave.status === 'pending') { badgeColor = '#b45309'; badgeBg = '#fef3c7'; badgeText = 'Chờ duyệt'; }
              if (leave.status === 'rejected') { badgeColor = '#b91c1c'; badgeBg = '#fee2e2'; badgeText = 'Từ chối'; }

              return (
                <tr key={leave.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(leave.leave_date).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={leave.doctor?.user?.avatar || 'https://ui-avatars.com/api/?name=' + (leave.doctor?.user?.full_name || 'BS') + '&background=e2e8f0&color=334155'} alt="avt" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>BS. {leave.doctor?.user?.full_name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', maxWidth: '300px' }}>
                    <div style={{ color: '#475569', fontSize: '0.9rem' }}>{leave.reason}</div>
                    {leave.rejection_reason && (
                      <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px' }}>Lý do từ chối: {leave.rejection_reason}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ color: badgeColor, background: badgeBg, padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {badgeText}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          disabled={leaveLoading}
                          onClick={() => handleUpdateStatus(leave.id, 'approved')}
                          style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          Duyệt
                        </button>
                        <button 
                          disabled={leaveLoading}
                          onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                          style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredLeaves.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
