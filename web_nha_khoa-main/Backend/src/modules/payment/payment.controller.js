const paymentService = require('./payment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const paymentController = {
  async getAll(req, res, next) {
    try {
      const { payments, total } = await paymentService.getAll(req.query, req.user);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: payments, total, page, limit });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await paymentService.getById(req.params.id, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getByAppointment(req, res, next) {
    try {
      const data = await paymentService.getByAppointment(req.params.appointmentId);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async createMockOnlinePayment(req, res, next) {
    try {
      const { appointmentId, medicalRecordId, method } = req.body;
      const data = await paymentService.createCashPayment(appointmentId, req.user.id, `Giả lập thanh toán trực tuyến qua ${method}`, medicalRecordId, method);
      return createdResponse(res, { message: 'Giả lập thanh toán trực tuyến thành công', data });
    } catch (error) { 
      console.error('ERROR IN MOCK ONLINE PAYMENT:', error);
      next(error); 
    }
  },

  async createCashPayment(req, res, next) {
    try {
      const { appointmentId, notes, medicalRecordId, method } = req.body;
      const data = await paymentService.createCashPayment(appointmentId, req.user.id, notes, medicalRecordId, method || 'cash');
      return createdResponse(res, { message: 'Thanh toán tiền mặt thành công', data });
    } catch (error) { next(error); }
  },

  async confirmPayment(req, res, next) {
    try {
      const data = await paymentService.confirmPayment(req.params.id, req.user.id);
      return successResponse(res, { message: 'Xác nhận thanh toán thành công', data });
    } catch (error) { next(error); }
  },

  async createVnpayPayment(req, res, next) {
    try {
      const { appointmentId, medicalRecordId } = req.body;
      const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const data = await paymentService.createVnpayPayment(appointmentId, req.user.id, ipAddr, medicalRecordId);
      return successResponse(res, { message: 'Tạo link thanh toán thành công', data });
    } catch (error) { next(error); }
  },

  async vnpayReturn(req, res, next) {
    try {
      const result = await paymentService.handleVnpayReturn(req.query);
      const redirectUrl = result.success
        ? `${process.env.CLIENT_URL}/payment/success?txCode=${result.payment.transaction_code}`
        : `${process.env.CLIENT_URL}/payment/failed?txCode=${result.payment?.transaction_code}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }
  },

  async refund(req, res, next) {
    try {
      const data = await paymentService.refund(req.params.id, req.body.reason);
      return successResponse(res, { message: 'Hoàn tiền thành công', data });
    } catch (error) { next(error); }
  },

  async verifyVnpay(req, res, next) {
    try {
      const result = await paymentService.handleVnpayReturn(req.query);
      return successResponse(res, { data: result });
    } catch (error) { next(error); }
  },

  // --- MOCK PAYMENT (dev / bài tập) ---
  async createMockVnpayPayment(req, res, next) {
    try {
      const { appointmentId, medicalRecordId } = req.body;
      const data = await paymentService.createMockVnpayPayment(appointmentId, req.user.id, medicalRecordId);
      return successResponse(res, { message: 'Tạo link thanh toán giả thành công', data });
    } catch (error) { next(error); }
  },

  async mockPaymentPage(req, res) {
    const { txCode, amount, orderInfo } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const backendUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const successUrl = `${backendUrl}/api/v1/payment/mock-success?txCode=${txCode}&clientUrl=${encodeURIComponent(clientUrl)}`;
    const cancelUrl  = `${clientUrl}/payment/failed?txCode=${txCode}`;
    const amountFmt  = Number(amount).toLocaleString('vi-VN') + ' đ';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VNPAY - Thanh toán (Demo)</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);width:420px;overflow:hidden}
    .header{background:linear-gradient(135deg,#003087,#0055b3);padding:24px;text-align:center;color:#fff}
    .header img{height:40px;margin-bottom:8px}
    .header h2{font-size:1.1rem;font-weight:500;opacity:.9}
    .logo-text{font-size:1.8rem;font-weight:900;letter-spacing:2px;color:#fff}
    .logo-text span{color:#f5a623}
    .body{padding:28px}
    .info-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:.92rem}
    .info-row .label{color:#666}
    .info-row .value{font-weight:600;color:#222;text-align:right;max-width:55%}
    .amount-row .value{font-size:1.2rem;color:#d0021b;font-weight:700}
    .qr-wrap{text-align:center;margin:22px 0 10px}
    .qr-box{display:inline-block;padding:14px;border:2px dashed #0055b3;border-radius:12px;background:#f8faff}
    .qr-grid{display:grid;grid-template-columns:repeat(10,18px);grid-template-rows:repeat(10,18px);gap:2px}
    .qr-grid .b{background:#003087;border-radius:2px}
    .qr-grid .w{background:#fff;border-radius:2px}
    .qr-label{font-size:.78rem;color:#888;margin-top:8px}
    .demo-badge{display:inline-block;background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:20px;font-size:.72rem;padding:3px 12px;margin-bottom:16px}
    .btn-pay{width:100%;padding:14px;background:linear-gradient(135deg,#d0021b,#ff3b5c);color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;margin-top:18px;transition:opacity .2s}
    .btn-pay:hover{opacity:.88}
    .btn-pay:disabled{opacity:.5;cursor:not-allowed}
    .btn-cancel{width:100%;padding:10px;background:none;border:1.5px solid #ccc;border-radius:10px;font-size:.9rem;color:#555;cursor:pointer;margin-top:10px;transition:background .2s}
    .btn-cancel:hover{background:#f5f5f5}
    .spinner{display:none;width:20px;height:20px;border:3px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto}
    @keyframes spin{to{transform:rotate(360deg)}}
    .footer{text-align:center;font-size:.75rem;color:#aaa;padding:14px;border-top:1px solid #f0f0f0}
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="logo-text">VN<span>PAY</span></div>
    <h2>Cổng thanh toán VNPAY</h2>
  </div>
  <div class="body">
    <div style="text-align:center;margin-bottom:16px">
      <span class="demo-badge">⚠️ CHẾ ĐỘ DEMO — Không phải giao dịch thật</span>
    </div>
    <div class="info-row"><span class="label">Mã giao dịch</span><span class="value">${txCode}</span></div>
    <div class="info-row"><span class="label">Nội dung</span><span class="value">${orderInfo || 'Thanh toán liịch khám'}</span></div>
    <div class="info-row amount-row"><span class="label">Số tiền</span><span class="value">${amountFmt}</span></div>
    <div class="qr-wrap">
      <div class="qr-box">
        <!-- QR giả dạng lưới -->
        <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="140" fill="white"/>
          <!-- Top-left finder -->
          <rect x="10" y="10" width="35" height="35" rx="3" fill="#003087"/>
          <rect x="16" y="16" width="23" height="23" rx="2" fill="white"/>
          <rect x="21" y="21" width="13" height="13" rx="1" fill="#003087"/>
          <!-- Top-right finder -->
          <rect x="95" y="10" width="35" height="35" rx="3" fill="#003087"/>
          <rect x="101" y="16" width="23" height="23" rx="2" fill="white"/>
          <rect x="106" y="21" width="13" height="13" rx="1" fill="#003087"/>
          <!-- Bottom-left finder -->
          <rect x="10" y="95" width="35" height="35" rx="3" fill="#003087"/>
          <rect x="16" y="101" width="23" height="23" rx="2" fill="white"/>
          <rect x="21" y="106" width="13" height="13" rx="1" fill="#003087"/>
          <!-- Random data modules -->
          <rect x="55" y="10" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="10" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="75" y="10" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="20" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="75" y="20" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="30" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="10" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="20" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="10" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="30" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="10" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="20" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="30" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="75" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="85" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="75" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="85" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="95" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="105" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="125" y="55" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="95" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="115" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="125" y="65" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="105" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="115" y="75" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="85" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="55" y="105" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="75" y="105" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="85" y="105" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="65" y="115" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="85" y="115" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="95" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="115" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="125" y="95" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="105" y="105" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="125" y="105" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="95" y="115" width="7" height="7" rx="1" fill="#003087"/>
          <rect x="115" y="115" width="7" height="7" rx="1" fill="#003087"/>
        </svg>
      </div>
      <p class="qr-label">📱 Quét mã bằng ứng dụng ngân hàng để thanh toán</p>
    </div>
    <button class="btn-pay" id="btnPay" onclick="doPayment()">Xác nhận Thanh toán</button>
    <button class="btn-cancel" onclick="location.href='${cancelUrl}'">Hủy giao dịch</button>
  </div>
  <div class="footer">Phát triển bởi VNPAY &copy; 2026 &nbsp;•&nbsp; Demo Mode</div>
</div>
<script>
function doPayment() {
  const btn = document.getElementById('btnPay');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="display:inline-block"></div>';
  fetch('${successUrl}').then(r => r.json()).then(d => {
    if (d.success) location.href = d.redirectUrl;
    else { btn.disabled=false; btn.textContent='Xác nhận Thanh toán'; alert('Lỗi: ' + (d.message||'Thử lại')); }
  }).catch(() => { btn.disabled=false; btn.textContent='Xác nhận Thanh toán'; });
}
</script>
</body></html>`);
  },

  async mockPaymentSuccess(req, res) {
    try {
      const { txCode, clientUrl } = req.query;
      const redirectUrl = `${clientUrl || process.env.CLIENT_URL}/payment/success?txCode=${txCode}`;
      await paymentService.completeMockPayment(txCode);
      return res.json({ success: true, redirectUrl });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },
};

module.exports = paymentController;
