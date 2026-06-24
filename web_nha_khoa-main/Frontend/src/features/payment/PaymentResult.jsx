import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import paymentApi from '../../api/payment.api';
import useAuthStore from '../../store/auth.store';
import Spinner from '../../components/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import './PaymentResult.css';

/**
 * PaymentResult handles two scenarios:
 * 1. Direct result: ?paymentId=xxx&status=paid  (cash confirmed)
 * 2. VNPay return:  ?vnp_ResponseCode=00&vnp_TxnRef=xxx&... (all VNPay params present)
 */
export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  // Detect which scenario
  const isVnpayReturn = searchParams.has('vnp_ResponseCode');
  const paymentId = searchParams.get('paymentId');
  const directStatus = searchParams.get('status');

  const verifyRef = useRef(false);

  const verifyVnpay = useCallback(async () => {
    if (verifyRef.current) return;
    verifyRef.current = true;

    try {
      const params = Object.fromEntries(searchParams.entries());
      const res = await paymentApi.verifyVnpay(params);
      setVerifyResult(res.data);
      setPayment(res.data?.payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPayment = useCallback(async () => {
    if (!paymentId) { setLoading(false); return; }
    try {
      const res = await paymentApi.getPaymentById(paymentId);
      setPayment(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (isVnpayReturn) {
      verifyVnpay();
    } else {
      fetchPayment();
    }
  }, [isVnpayReturn, verifyVnpay, fetchPayment]);

  // Determine final status
  const status = (() => {
    if (directStatus) return directStatus;
    if (isVnpayReturn) {
      return (verifyResult?.success === true || searchParams.get('vnp_ResponseCode') === '00') ? 'paid' : 'failed';
    }
    return payment?.status;
  })();

  const isPaid = status === 'paid';
  const isPendingConfirmation = status === 'pending_confirmation';

  if (loading) return <Spinner text="Đang xác nhận thanh toán..." />;

  return (
    <div className="result-page">
      <div className="result-card">
        <div className={`result-icon ${isPaid ? 'success' : isPendingConfirmation ? 'warning' : 'failed'}`}>
          {isPaid ? '✓' : isPendingConfirmation ? '⏳' : '✗'}
        </div>

        <h1 className={`result-title ${isPaid ? 'success' : isPendingConfirmation ? 'warning' : 'failed'}`}>
          {isPaid ? 'Thanh toán thành công!' : isPendingConfirmation ? 'Chờ xác nhận' : 'Thanh toán thất bại'}
        </h1>

        {error && (
          <p className="result-error">{error}</p>
        )}

        {!isPaid && !isPendingConfirmation && !error && (
          <p className="result-desc">
            Giao dịch không được xác nhận. Vui lòng thử lại hoặc chọn hình thức khác.
          </p>
        )}

        {isPendingConfirmation && !error && (
          <p className="result-desc" style={{ color: '#ea580c' }}>
            Thanh toán đã được ghi nhận. Vui lòng chờ lễ tân xác nhận.
          </p>
        )}

        {/* Payment details */}
        {payment && (
          <div className="result-details">
            <div className="detail-row">
              <span className="detail-label">Mã hoá đơn</span>
              <span className="detail-value code">
                {payment.transaction_code || (payment.id ? payment.id.slice(-8).toUpperCase() : '—')}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Bệnh nhân</span>
              <span className="detail-value">{payment.patient?.fullName || payment.user?.full_name || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Hình thức</span>
              <span className="detail-value">
                {payment.method === 'cash' ? 'Tiền mặt' : payment.method === 'momo' ? 'Ví MoMo' : payment.method === 'bank_transfer' ? 'Chuyển khoản' : 'VNPay'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Thời gian</span>
              <span className="detail-value">{formatDateTime(payment.paid_at || payment.paidAt || payment.created_at || payment.createdAt)}</span>
            </div>
            <div className="detail-row total-row">
              <span className="detail-label">Tổng thanh toán</span>
              <span className="detail-value amount">{formatCurrency(payment.amount || payment.totalAmount || 0)}</span>
            </div>
          </div>
        )}

        {/* VNPay transaction ID */}
        {isVnpayReturn && searchParams.get('vnp_TransactionNo') && (
          <div className="result-details" style={{ marginTop: 12 }}>
            <div className="detail-row">
              <span className="detail-label">Mã giao dịch VNPay</span>
              <span className="detail-value code">{searchParams.get('vnp_TransactionNo')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngân hàng</span>
              <span className="detail-value">{searchParams.get('vnp_BankCode') || '—'}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          {isPaid && payment && (
            <button className="btn btn-outline" onClick={() => window.print()}>
              🖨 In hoá đơn
            </button>
          )}

          {!isPaid && payment && (
            <Link
              to={`/${user?.role === 'patient' ? 'patient' : 'receptionist'}/billing/${payment.medical_record_id || payment.appointment_id}?recordId=${payment.medical_record_id || payment.appointment_id}`}
              className="btn btn-primary"
            >
              Thử lại
            </Link>
          )}

          <Link to={`/${user?.role === 'patient' ? 'patient' : 'receptionist'}/billing`} className="btn btn-ghost">
            Danh sách thanh toán
          </Link>

          {(payment?.medical_record_id || payment?.medicalRecord) && (
            <Link
              to={`/${user?.role === 'patient' ? 'patient' : 'doctor'}/records/${payment.medical_record_id || payment.medicalRecord?.id}`}
              className="btn btn-ghost"
            >
              Xem bệnh án
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
