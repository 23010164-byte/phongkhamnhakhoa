import React, { useState, useEffect } from 'react';
import appointmentApi from '../../api/appointment.api';
import useAppointmentStore from '../../store/appointment.store';
import './ReceptionistCheckin.css';

export default function ReceptionistCheckin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingToday, setLoadingToday] = useState(false);
  
  const { performAction } = useAppointmentStore(); // We can still use this for the checkin action

  const loadTodayList = async () => {
    setLoadingToday(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await appointmentApi.getAppointments({ 
        status: 'confirmed', 
        date: todayStr,
        limit: 100 
      });
      const data = res.data?.data?.items || res.data?.data || res.data || [];
      setTodayAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching today appointments', err);
    } finally {
      setLoadingToday(false);
    }
  };

  useEffect(() => {
    loadTodayList();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!searchTerm.trim()) return;

    try {
      const term = searchTerm.trim().toLowerCase();
      
      // Fetch directly from API using search param
      const res = await appointmentApi.getAppointments({ search: term, limit: 10 });
      const data = res.data?.data?.items || res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      
      // Look for match by booking code or phone
      const found = list.find(a => 
        (a.booking_code && a.booking_code.toLowerCase() === term) ||
        (a.patient?.phone && a.patient.phone === term)
      );

      if (found) {
        if (found.status === 'checked_in' || found.status === 'completed') {
          setSearchError('Bệnh nhân này đã check-in hoặc khám xong rồi.');
          return;
        }
        if (found.status !== 'confirmed') {
          setSearchError(`Lịch hẹn này đang ở trạng thái "${found.status}", chưa thể check-in. Vui lòng xác nhận lịch trước.`);
          return;
        }
        setSearchResult(found);
      } else {
        setSearchError('Không tìm thấy lịch hẹn hợp lệ nào với mã hoặc SĐT này.');
      }
    } catch (err) {
      setSearchError('Có lỗi xảy ra khi tìm kiếm.');
    }
  };

  const handleCheckin = async (id) => {
    if (!id) return;
    if (!window.confirm('Xác nhận bệnh nhân đã có mặt?')) return;
    const res = await performAction('checkin', id);
    if (res.success) {
      alert('Check-in thành công!');
      setSearchResult(null);
      setSearchTerm('');
      loadTodayList();
    } else {
      alert('Lỗi: ' + res.error);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h1>Check-in Bệnh nhân</h1>
        <p>Tra cứu và điểm danh bệnh nhân đến khám</p>
      </div>

      <div className="checkin-content">
        <div className="checkin-left">
          <Card title="Tra cứu nhanh">
            <form onSubmit={handleSearch} className="search-form">
              <input 
                type="text" 
                placeholder="Nhập Mã lịch hẹn hoặc Số điện thoại..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-primary search-btn">Tra cứu</button>
            </form>

            {searchError && <div className="alert alert-error mt-16">{searchError}</div>}

            {searchResult && (
              <div className="result-card">
                <h3>Thông tin lịch hẹn</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Bệnh nhân</label>
                    <p>{searchResult.patient?.full_name || searchResult.patient?.fullName}</p>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại</label>
                    <p>{searchResult.patient?.phone}</p>
                  </div>
                  <div className="info-item">
                    <label>Bác sĩ khám</label>
                    <p>{searchResult.doctor?.user?.full_name || searchResult.doctor?.fullName}</p>
                  </div>
                  <div className="info-item">
                    <label>Giờ khám</label>
                    <p className="highlight-time">{searchResult.appointment_time || searchResult.slotTime}</p>
                  </div>
                </div>
                <button 
                  className="btn-checkin-large"
                  onClick={() => handleCheckin(searchResult.id || searchResult._id)}
                >
                  Xác nhận Check-in
                </button>
              </div>
            )}
          </Card>
        </div>

        <div className="checkin-right">
          <Card title={`Danh sách chờ hôm nay (${todayAppointments.length})`}>
            {loadingToday ? (
              <p className="empty-text">Đang tải...</p>
            ) : todayAppointments.length === 0 ? (
              <p className="empty-text">Không có bệnh nhân chờ check-in trong hôm nay.</p>
            ) : (
              <div className="today-list">
                {todayAppointments.map(appt => (
                  <div key={appt.id || appt._id} className="today-item">
                    <div className="today-info">
                      <span className="time">{appt.appointment_time || appt.slotTime}</span>
                      <div className="details">
                        <span className="name">{appt.patient?.full_name || appt.patient?.fullName}</span>
                        <span className="sub">BS. {appt.doctor?.user?.full_name || appt.doctor?.fullName}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-checkin-small"
                      onClick={() => handleCheckin(appt.id || appt._id)}
                    >
                      Check-in
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple Card Component
function Card({ title, children }) {
  return (
    <div className="checkin-card">
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}
