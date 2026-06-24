/**
 * Tập trung tất cả email HTML templates
 * Dùng trong mailer.js và notification.service.js
 */

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Phòng Khám</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">🏥 Phòng Khám</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Chăm sóc sức khỏe toàn diện</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Phòng Khám. Đây là email tự động, vui lòng không reply.<br/>
                Nếu bạn cần hỗ trợ, liên hệ: <a href="mailto:${process.env.SMTP_USER}" style="color:#2563eb;">${process.env.SMTP_USER}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const btnPrimary = (text, url) =>
  `<a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:20px 0;">${text}</a>`;

const infoBox = (content) =>
  `<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;color:#1e40af;">${content}</div>`;

const warningBox = (content) =>
  `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;color:#92400e;">${content}</div>`;

// ========================
// TEMPLATES
// ========================
const emailTemplates = {
  // Xác thực email
  verifyEmail: ({ fullName, otp }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">Xin chào ${fullName}! 👋</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email bằng mã OTP bên dưới:</p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#f0f7ff;border:2px dashed #2563eb;border-radius:12px;padding:20px 40px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Mã xác thực của bạn</p>
        <p style="margin:0;color:#1d4ed8;font-size:36px;font-weight:800;letter-spacing:12px;">${otp}</p>
      </div>
    </div>
    ${warningBox('⏱️ Mã có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này với bất kỳ ai.')}
    <p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
  `),

  // Đặt lại mật khẩu
  resetPassword: ({ fullName, resetUrl }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">Đặt lại mật khẩu</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>,</p>
    <p style="color:#374151;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục:</p>
    <div style="text-align:center;">
      ${btnPrimary('🔐 Đặt lại mật khẩu', resetUrl)}
    </div>
    ${warningBox('⏱️ Link có hiệu lực trong <strong>30 phút</strong>.')}
    <p style="color:#9ca3af;font-size:13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
  `),

  // Xác nhận đặt lịch
  appointmentBooked: ({ fullName, bookingCode, doctorName, date, time, serviceName }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">✅ Đặt lịch thành công!</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>, lịch khám của bạn đã được tạo thành công.</p>
    ${infoBox(`
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;width:140px;">Mã đặt lịch</td><td style="padding:4px 0;font-size:16px;font-weight:700;">${bookingCode}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Bác sĩ</td><td style="padding:4px 0;">${doctorName}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Dịch vụ</td><td style="padding:4px 0;">${serviceName || 'Khám tổng quát'}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Ngày khám</td><td style="padding:4px 0;">${date}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Giờ khám</td><td style="padding:4px 0;">${time}</td></tr>
      </table>
    `)}
    <p style="color:#374151;font-size:14px;">📍 Vui lòng đến trước giờ hẹn <strong>15 phút</strong> để làm thủ tục. Mang theo CCCD/Hộ chiếu.</p>
    ${warningBox('⚠️ Nếu cần hủy lịch, vui lòng thực hiện trước ít nhất <strong>2 giờ</strong> so với giờ hẹn.')}
  `),

  // Xác nhận lịch hẹn
  appointmentConfirmed: ({ fullName, bookingCode, doctorName, date, time, queueNumber }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">🎉 Lịch hẹn đã được xác nhận!</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>, phòng khám đã xác nhận lịch hẹn của bạn.</p>
    ${infoBox(`
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;width:140px;">Mã đặt lịch</td><td style="padding:4px 0;">${bookingCode}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Bác sĩ</td><td style="padding:4px 0;">${doctorName}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Ngày & Giờ</td><td style="padding:4px 0;font-weight:700;">${date} — ${time}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Số thứ tự</td><td style="padding:4px 0;font-size:20px;font-weight:800;color:#1d4ed8;">#${queueNumber}</td></tr>
      </table>
    `)}
  `),

  // Nhắc lịch hẹn
  appointmentReminder: ({ fullName, doctorName, date, time, bookingCode }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">🔔 Nhắc nhở lịch khám ngày mai</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>, bạn có lịch khám <strong>vào ngày mai</strong>.</p>
    ${infoBox(`
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;width:140px;">Bác sĩ</td><td style="padding:4px 0;">${doctorName}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Ngày khám</td><td style="padding:4px 0;font-weight:700;">${date}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Giờ khám</td><td style="padding:4px 0;font-weight:700;">${time}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Mã đặt lịch</td><td style="padding:4px 0;">${bookingCode}</td></tr>
      </table>
    `)}
    <p style="color:#374151;font-size:14px;">📍 Vui lòng đến <strong>15 phút trước</strong> giờ hẹn. Mang theo CCCD và các giấy tờ y tế liên quan.</p>
  `),

  // Hủy lịch hẹn
  appointmentCancelled: ({ fullName, bookingCode, date, time, reason }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">❌ Lịch hẹn đã bị hủy</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>, lịch hẹn sau đây đã bị hủy.</p>
    ${infoBox(`
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;width:140px;">Mã đặt lịch</td><td style="padding:4px 0;">${bookingCode}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Ngày & Giờ</td><td style="padding:4px 0;">${date} — ${time}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Lý do hủy</td><td style="padding:4px 0;">${reason || 'Không có lý do'}</td></tr>
      </table>
    `)}
    <p style="color:#374151;font-size:14px;">Bạn có thể đặt lịch hẹn mới bất cứ lúc nào trên hệ thống.</p>
  `),

  // Thanh toán thành công
  paymentSuccess: ({ fullName, amount, transactionCode, method, date }) => baseLayout(`
    <h2 style="color:#111827;margin:0 0 8px;">💳 Thanh toán thành công!</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Xin chào <strong>${fullName}</strong>, chúng tôi đã nhận được thanh toán của bạn.</p>
    ${infoBox(`
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;width:160px;">Mã giao dịch</td><td style="padding:4px 0;">${transactionCode}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Số tiền</td><td style="padding:4px 0;font-size:18px;font-weight:800;color:#059669;">${Number(amount).toLocaleString('vi-VN')}đ</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Phương thức</td><td style="padding:4px 0;">${method}</td></tr>
        <tr><td style="padding:4px 0;color:#1e40af;font-weight:600;">Thời gian</td><td style="padding:4px 0;">${date}</td></tr>
      </table>
    `)}
    <p style="color:#9ca3af;font-size:13px;">Vui lòng lưu thông tin giao dịch này để đối chiếu khi cần.</p>
  `),
};

module.exports = emailTemplates;
