import React, { useEffect, useState } from 'react';
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
  const uniqueDoctors = Array.from(doctorsMap.entries()).map(([id, name], idx) => ({ id, name, room: `Phòng ${idx+1}` }));
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
    conicStr = `
      #f59e0b 0% ${pWait}%, 
      #3b82f6 ${pWait}% ${pWait + pProg}%, 
      #22c55e ${pWait + pProg}% ${pWait + pProg + pComp}%, 
      #ef4444 ${pWait + pProg + pComp}% 100%
    `;
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
                          <div key={a.id} className={`appt-card status-${a.status} ${a._changed ? 'row-changed' : ''}`}>
                            <div className="appt-name">
                              {a.status === 'completed' && <svg width="12" height="12" style={{color: '#22c55e'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              {a.patient?.full_name}
                            </div>
                            <div className="appt-phone">{a.patient?.phone || '0901 234 567'}</div>
                            <div className={`appt-status`}>{getStatusName(a.status)}</div>
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
            <div className="pie-chart" style={{background: `conic-gradient(${conicStr})`}}>
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

export default AppointmentMonitor;