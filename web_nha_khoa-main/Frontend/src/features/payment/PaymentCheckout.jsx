import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import paymentApi from '../../api/payment.api';
import medicalApi from '../../api/medical.api';
import useAuthStore from '../../store/auth.store';
import appointmentApi from '../../api/appointment.api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './PaymentCheckout.css';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tiền mặt', desc: 'Thu tiền mặt tại quầy', role: ['receptionist', 'admin'] },
  { id: 'vnpay', label: 'VNPay', desc: 'Chuyển khoản, QR, ATM hoặc thẻ quốc tế', role: ['patient', 'receptionist', 'admin'] },
  { id: 'momo', label: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo', role: ['patient'] },
  { id: 'bank_transfer', label: 'Chuyển khoản', desc: 'Chuyển khoản ngân hàng', role: ['patient'] },
];

const STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  pending_confirmation: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

const getData = (res) => res.data?.data || res.data || null;

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const { id: paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const queryRecordId = searchParams.get('recordId');
  const queryAppointmentId = searchParams.get('appointmentId');
  const { user } = useAuthStore();

  const isPatient = user?.role === 'patient';
  const isStaff = ['doctor', 'receptionist', 'admin'].includes(user?.role);
  const rolePath = user?.role || 'patient';

  const [record, setRecord] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [method, setMethod] = useState(isPatient ? 'vnpay' : 'cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isAppointmentPayment, setIsAppointmentPayment] = useState(false);
  
  const [showQR, setShowQR] = useState(false);
  const [qrMethod, setQrMethod] = useState('');
  const [qrPayload, setQrPayload] = useState(null);

  const mapRecord = (recordData, isApptPayment = false) => {
    const consultationFee = parseFloat(recordData.appointment?.doctor?.consultation_fee || recordData.doctor?.consultation_fee || 0);
    const services = recordData.services || [];
    
    let invoiceItems = [];
    let totalAmount = 0;
    
    if (isApptPayment) {
      invoiceItems = [{ name: 'Phí tư vấn / Tiền công khám', price: consultationFee, quantity: 1 }];
      totalAmount = consultationFee;
    } else {
      invoiceItems = services.map(s => ({
        name: s.service?.name || s.name || 'Dịch vụ',
        price: parseFloat(s.price || 0),
        quantity: parseInt(s.quantity || 1, 10)
      }));
      totalAmount = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      if (totalAmount === 0 && consultationFee > 0) {
        invoiceItems = [{ name: 'Phí tư vấn / Tiền công khám', price: consultationFee, quantity: 1 }];
        totalAmount = consultationFee;
      }
    }

    return {
      ...recordData,
      patientName: recordData.patient?.full_name || recordData.patient?.fullName || '---',
      doctorName: recordData.doctor?.user?.full_name || recordData.doctor?.user?.fullName
        ? `${recordData.doctor?.title || 'BS.'} ${recordData.doctor?.user?.full_name || recordData.doctor?.user?.fullName}`
        : '---',
      visitDate: recordData.appointment?.appointment_date || recordData.created_at || recordData.appointment_date,
      consultationFee,
      totalAmount,
      invoiceItems,
      isAppointmentPayment: isApptPayment,
    };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let recordId = queryRecordId;
      let appointmentId = queryAppointmentId;
      const isNewCheckout = paymentId === 'checkout';

      if (!recordId && !appointmentId && paymentId && !isNewCheckout) {
        const payment = getData(await paymentApi.getPaymentById(paymentId));
        if (payment?.id) {
          setExistingPayment(payment);
        }
        
        if (payment?.medical_record_id || payment?.medicalRecord?.id) {
          recordId = payment.medical_record_id || payment.medicalRecord.id;
        } else if (payment?.appointment_id || payment?.appointment?.id) {
          appointmentId = payment.appointment_id || payment.appointment.id;
        }
      }

      if (recordId) {
        setIsAppointmentPayment(false);
        const recordData = getData(await medicalApi.getRecordById(recordId));
        if (recordData?.id) {
          setRecord(mapRecord(recordData, false));
          const aptId = recordData.appointment_id || recordData.appointment?.id;
          if (aptId && (!paymentId || isNewCheckout)) {
             // Not querying existing payment for record yet if it doesn't exist? Wait, we should query payment for recordId
             // Actually, API needs to support findByMedicalRecordId if needed, but let's just let backend handle it
          }
        } else {
          setRecord(null);
        }
      } else if (appointmentId) {
        setIsAppointmentPayment(true);
        const aptData = getData(await appointmentApi.getAppointmentById(appointmentId));
        if (aptData?.id) {
          setRecord(mapRecord({ appointment: aptData, ...aptData }, true));
        } else {
          setRecord(null);
        }
      } else {
        setRecord(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải thông tin hoá đơn');
    } finally {
      setLoading(false);
    }
  }, [paymentId, queryRecordId, queryAppointmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckout = async () => {
    if (!record) {
      setError('Không tìm thấy thông tin để thanh toán.');
      return;
    }

    const appointmentId = record.appointment_id || record.appointment?.id || record.id;
    if (!appointmentId) {
      setError('Không tìm thấy lịch hẹn liên kết.');
      return;
    }

    setProcessing(true);
    setError(null);

    const payload = {
      appointmentId,
      medicalRecordId: isAppointmentPayment ? null : (queryRecordId || record.id),
      notes: method === 'cash' ? 'Thanh toán tiền mặt tại quầy' : '',
      method,
    };

    try {
      if (method === 'momo' || method === 'bank_transfer') {
        setQrPayload(payload);
        setQrMethod(method);
        setShowQR(true);
        setProcessing(false);
        return;
      }

      if (method === 'cash') {
        const payment = getData(await paymentApi.createCashPayment(payload));
        navigate(`/payment/result?paymentId=${payment?.id || payment?._id}&status=paid`);
        return;
      }

      // vnpay
      const result = getData(await paymentApi.createVnpayPayment(payload));
      if (!result?.paymentUrl) throw new Error('Không lấy được URL thanh toán');
      window.location.href = result.paymentUrl;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      if (msg === 'Giao dịch này đã được thanh toán') {
        setExistingPayment({ status: 'paid' });
        setError('Bệnh án này đã được thanh toán.');
      } else {
        setError(msg || 'Lỗi xử lý thanh toán');
      }
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="checkout-spinner" />
        Đang tải thông tin hoá đơn...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="checkout-page checkout-empty">
        <h1>Không tìm thấy bệnh án</h1>
        <p>Hoá đơn này chưa liên kết được với bệnh án hợp lệ.</p>
        <Link to={`/${rolePath}/billing`} className="checkout-primary-link">Quay lại hoá đơn</Link>
      </div>
    );
  }

  const handleMockQRPayment = async () => {
    try {
      setProcessing(true);
      const payment = getData(await paymentApi.createMockOnlinePayment(qrPayload));
      navigate(`/payment/result?paymentId=${payment?.id || payment?._id}&status=paid`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi xử lý thanh toán QR');
      setProcessing(false);
      setShowQR(false);
    }
  };

  const status = existingPayment?.status;
  const canPay = isStaff || (isPatient && ['vnpay', 'momo', 'bank_transfer'].includes(method));

  return (
    <div className="checkout-page">
      {/* Modal QR Code */}
      {showQR && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-content">
            <h3>{qrMethod === 'momo' ? 'Thanh toán qua Ví MoMo' : 'Chuyển khoản Ngân hàng'}</h3>
            <p>Vui lòng quét mã QR dưới đây để thanh toán</p>
            <div className="qr-image-container">
              <img 
                src={qrMethod === 'momo' 
                  ? 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=momo://pay?amount=' + record.totalAmount 
                  : 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bank://pay?amount=' + record.totalAmount} 
                alt="QR Code" 
              />
            </div>
            <p className="qr-amount">Số tiền: <strong>{formatCurrency(record.totalAmount)}</strong></p>
            <div className="qr-actions">
              <button className="btn btn-primary" onClick={handleMockQRPayment} disabled={processing}>
                {processing ? 'Đang xử lý...' : 'Tôi đã thanh toán thành công'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowQR(false)} disabled={processing}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="checkout-breadcrumb">
        <Link to={`/${rolePath}/billing`}>Hoá đơn</Link>
        <span>/</span>
        <span>Chi tiết thanh toán</span>
      </nav>

      <header className="checkout-heading">
        <div>
          <h1>Thanh toán</h1>
          <p>Kiểm tra thông tin bệnh án và hoá đơn trước khi thanh toán.</p>
        </div>
        {status && (
          <span className={`checkout-status checkout-status--${status}`}>
            {STATUS_LABELS[status] || status}
          </span>
        )}
      </header>

      {error && <div className="checkout-alert checkout-alert--error">{error}</div>}

      <div className="checkout-layout">
        <main className="checkout-main">
          {existingPayment && (
            <div className="checkout-alert checkout-alert--info">
              Hoá đơn hiện tại: <strong>{existingPayment.transaction_code || existingPayment.id}</strong>
            </div>
          )}

          <section className="checkout-card">
            <div className="checkout-card__header">
              <h2>Thông tin bệnh án</h2>
            </div>
            <div className="record-grid">
              <div className="record-field">
                <span>Bệnh nhân</span>
                <strong>{record.patientName}</strong>
              </div>
              <div className="record-field">
                <span>Bác sĩ</span>
                <strong>{record.doctorName}</strong>
              </div>
              <div className="record-field">
                <span>Ngày khám</span>
                <strong>{formatDate(record.visitDate)}</strong>
              </div>
              <div className="record-field record-field--wide">
                <span>Chẩn đoán</span>
                <strong>{record.diagnosis || '---'}</strong>
              </div>
            </div>
          </section>

          {record.invoiceItems.length > 0 && (
            <section className="checkout-card">
              <div className="checkout-card__header">
                <h2>Chi tiết dịch vụ</h2>
              </div>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th>Đơn giá</th>
                    <th>SL</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {record.invoiceItems.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>

        <aside className="checkout-sidebar">
          <section className="checkout-card">
            <div className="checkout-card__header">
              <h2>Hình thức thanh toán</h2>
            </div>
            <div className="method-list">
              {PAYMENT_METHODS.filter(item => item.role.includes(user?.role || 'patient')).map((item) => (
                <label key={item.id} className={`method-option ${method === item.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value={item.id}
                    checked={method === item.id}
                    onChange={() => setMethod(item.id)}
                  />
                  <span className="method-icon">{item.id === 'cash' ? 'TM' : item.id === 'momo' ? 'MM' : item.id === 'bank_transfer' ? 'CK' : 'VP'}</span>
                  <span className="method-info">
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="checkout-card summary-card">
            <div className="checkout-card__header">
              <h2>Tổng cộng</h2>
            </div>
            <div className="summary-rows">
              {isAppointmentPayment && (
                <div className="summary-row">
                  <span>Phí khám bệnh</span>
                  <strong>{formatCurrency(record.consultationFee)}</strong>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(record.totalAmount)}</strong>
              </div>
            </div>

            {record.totalAmount <= 0 ? (
              <div className="checkout-alert checkout-alert--info">
                {isAppointmentPayment ? 'Phí khám bệnh đang là 0đ.' : 'Bệnh án chưa có dịch vụ nào cần thanh toán.'}
              </div>
            ) : canPay ? (
              <button className="checkout-pay-button" onClick={handleCheckout} disabled={processing || status === 'paid'}>
                {processing ? 'Đang xử lý...' : method === 'cash' ? 'Xác nhận tiền mặt' : 'Tiến hành thanh toán'}
              </button>
            ) : (
              <div className="checkout-alert checkout-alert--info">
                Bạn không có quyền sử dụng hình thức thanh toán này.
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
