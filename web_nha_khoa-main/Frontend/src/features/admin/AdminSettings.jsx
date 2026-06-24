import { useState, useEffect, useCallback } from 'react';
import './AdminPages.css';

/* ── ToggleSwitch ── */
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${checked ? 'toggle-switch--on' : ''} ${disabled ? 'toggle-switch--disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
    >
      <span className="toggle-switch__thumb" />
    </button>
  );
}

/* ── SettingRow ── */
function SettingRow({ icon, title, description, children }) {
  return (
    <div className="setting-row">
      <div className="setting-row__left">
        <span className="setting-row__icon">{icon}</span>
        <div>
          <div className="setting-row__title">{title}</div>
          {description && <div className="setting-row__desc">{description}</div>}
        </div>
      </div>
      <div className="setting-row__right">{children}</div>
    </div>
  );
}

/* ── SettingsSection ── */
function SettingsSection({ title, subtitle, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">{title}</h2>
        {subtitle && <p className="settings-section__subtitle">{subtitle}</p>}
      </div>
      <div className="settings-section__body">{children}</div>
    </div>
  );
}

/* ── Default values (persisted in localStorage) ── */
const STORAGE_KEY = 'clinic_admin_settings';
const DEFAULT_SETTINGS = {
  // General
  clinicName: 'Phòng Khám Nha Khoa HealthCare',
  clinicPhone: '1900 1234',
  clinicEmail: 'info@phongkham.vn',
  clinicAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  workingHours: '08:00 - 17:00',
  workingDays: 'Thứ 2 - Thứ 7',

  // Appointment
  slotDuration: 30,
  maxBookingDays: 30,
  allowPatientCancel: true,
  autoConfirm: false,
  reminderBefore: 24,

  // Notification
  emailNotification: true,
  smsNotification: false,
  appointmentReminder: true,
  paymentNotification: true,
  systemAlert: true,

  // Security
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  requireStrongPassword: true,
  twoFactorAuth: false,

  // Display
  language: 'vi',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Ho_Chi_Minh',
  itemsPerPage: 10,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/* ── Main Component ── */
export default function AdminSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (!window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) return;
    setSettings({ ...DEFAULT_SETTINGS });
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  const tabs = [
    { key: 'general',      label: 'Thông tin chung', icon: '🏥' },
    { key: 'appointment',  label: 'Lịch hẹn',       icon: '📅' },
    { key: 'notification', label: 'Thông báo',       icon: '🔔' },
    { key: 'security',     label: 'Bảo mật',         icon: '🔒' },
    { key: 'display',      label: 'Hiển thị',        icon: '🎨' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            <span className="admin-page__title-icon">⚙️</span>
            Cài đặt hệ thống
          </h1>
          <p className="admin-page__subtitle">
            Quản lý và tùy chỉnh cấu hình cho phòng khám
          </p>
        </div>
        <div className="admin-page__actions">
          <button className="btn-outline" onClick={handleReset}>
            Khôi phục mặc định
          </button>
          <button className="btn-primary" onClick={handleSave}>
            💾 Lưu cài đặt
          </button>
        </div>
      </div>

      {/* Save Success */}
      {saved && (
        <div className="admin-alert admin-alert--success">
          ✅ Đã lưu cài đặt thành công!
        </div>
      )}

      {/* Layout: Tabs + Content */}
      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`settings-tab ${activeTab === tab.key ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="settings-tab__icon">{tab.icon}</span>
              <span className="settings-tab__label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* ─── General ─── */}
          {activeTab === 'general' && (
            <SettingsSection title="Thông tin phòng khám" subtitle="Các thông tin cơ bản của phòng khám hiển thị trên hệ thống">
              <SettingRow icon="🏥" title="Tên phòng khám" description="Tên hiển thị trên tiêu đề và các biểu mẫu">
                <input
                  className="setting-input"
                  value={settings.clinicName}
                  onChange={(e) => update('clinicName', e.target.value)}
                />
              </SettingRow>
              <SettingRow icon="📞" title="Số điện thoại" description="Số điện thoại liên hệ cho bệnh nhân">
                <input
                  className="setting-input"
                  value={settings.clinicPhone}
                  onChange={(e) => update('clinicPhone', e.target.value)}
                />
              </SettingRow>
              <SettingRow icon="📧" title="Email liên hệ" description="Email nhận phản hồi và thông báo hệ thống">
                <input
                  className="setting-input"
                  type="email"
                  value={settings.clinicEmail}
                  onChange={(e) => update('clinicEmail', e.target.value)}
                />
              </SettingRow>
              <SettingRow icon="📍" title="Địa chỉ" description="Địa chỉ phòng khám">
                <input
                  className="setting-input setting-input--wide"
                  value={settings.clinicAddress}
                  onChange={(e) => update('clinicAddress', e.target.value)}
                />
              </SettingRow>
              <SettingRow icon="🕐" title="Giờ làm việc" description="Thời gian mở cửa">
                <input
                  className="setting-input"
                  value={settings.workingHours}
                  onChange={(e) => update('workingHours', e.target.value)}
                />
              </SettingRow>
              <SettingRow icon="📆" title="Ngày làm việc" description="Các ngày trong tuần phòng khám mở cửa">
                <input
                  className="setting-input"
                  value={settings.workingDays}
                  onChange={(e) => update('workingDays', e.target.value)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {/* ─── Appointment ─── */}
          {activeTab === 'appointment' && (
            <SettingsSection title="Cấu hình lịch hẹn" subtitle="Thiết lập quy tắc đặt lịch và xác nhận">
              <SettingRow icon="⏱️" title="Thời lượng mỗi slot (phút)" description="Khoảng thời gian cho mỗi ca khám">
                <select
                  className="setting-select"
                  value={settings.slotDuration}
                  onChange={(e) => update('slotDuration', Number(e.target.value))}
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                </select>
              </SettingRow>
              <SettingRow icon="📅" title="Đặt trước tối đa (ngày)" description="Bệnh nhân có thể đặt lịch trước bao nhiêu ngày">
                <input
                  className="setting-input setting-input--sm"
                  type="number"
                  min={1}
                  max={90}
                  value={settings.maxBookingDays}
                  onChange={(e) => update('maxBookingDays', Number(e.target.value))}
                />
              </SettingRow>
              <SettingRow icon="🔄" title="Tự động xác nhận lịch hẹn" description="Lịch hẹn được tự động xác nhận mà không cần lễ tân duyệt">
                <ToggleSwitch
                  checked={settings.autoConfirm}
                  onChange={(v) => update('autoConfirm', v)}
                />
              </SettingRow>
              <SettingRow icon="❌" title="Cho phép bệnh nhân hủy" description="Bệnh nhân có thể tự hủy lịch hẹn đã đặt">
                <ToggleSwitch
                  checked={settings.allowPatientCancel}
                  onChange={(v) => update('allowPatientCancel', v)}
                />
              </SettingRow>
              <SettingRow icon="⏰" title="Nhắc nhở trước (giờ)" description="Gửi thông báo nhắc nhở trước lịch hẹn">
                <select
                  className="setting-select"
                  value={settings.reminderBefore}
                  onChange={(e) => update('reminderBefore', Number(e.target.value))}
                >
                  <option value={1}>1 giờ</option>
                  <option value={2}>2 giờ</option>
                  <option value={6}>6 giờ</option>
                  <option value={12}>12 giờ</option>
                  <option value={24}>24 giờ (1 ngày)</option>
                  <option value={48}>48 giờ (2 ngày)</option>
                </select>
              </SettingRow>
            </SettingsSection>
          )}

          {/* ─── Notification ─── */}
          {activeTab === 'notification' && (
            <SettingsSection title="Cài đặt thông báo" subtitle="Bật/tắt các kênh thông báo của hệ thống">
              <SettingRow icon="📧" title="Thông báo qua Email" description="Gửi email thông báo đến người dùng">
                <ToggleSwitch
                  checked={settings.emailNotification}
                  onChange={(v) => update('emailNotification', v)}
                />
              </SettingRow>
              <SettingRow icon="📱" title="Thông báo qua SMS" description="Gửi tin nhắn SMS (cần cấu hình nhà cung cấp)">
                <ToggleSwitch
                  checked={settings.smsNotification}
                  onChange={(v) => update('smsNotification', v)}
                />
              </SettingRow>
              <SettingRow icon="🔔" title="Nhắc nhở lịch hẹn" description="Tự động gửi nhắc nhở trước ngày khám">
                <ToggleSwitch
                  checked={settings.appointmentReminder}
                  onChange={(v) => update('appointmentReminder', v)}
                />
              </SettingRow>
              <SettingRow icon="💳" title="Thông báo thanh toán" description="Gửi thông báo khi có thanh toán mới">
                <ToggleSwitch
                  checked={settings.paymentNotification}
                  onChange={(v) => update('paymentNotification', v)}
                />
              </SettingRow>
              <SettingRow icon="⚠️" title="Cảnh báo hệ thống" description="Thông báo về các vấn đề kỹ thuật hệ thống">
                <ToggleSwitch
                  checked={settings.systemAlert}
                  onChange={(v) => update('systemAlert', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {/* ─── Security ─── */}
          {activeTab === 'security' && (
            <SettingsSection title="Bảo mật" subtitle="Cấu hình bảo mật tài khoản và phiên đăng nhập">
              <SettingRow icon="⏳" title="Thời gian hết phiên (phút)" description="Tự động đăng xuất sau thời gian không hoạt động">
                <select
                  className="setting-select"
                  value={settings.sessionTimeout}
                  onChange={(e) => update('sessionTimeout', Number(e.target.value))}
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={120}>2 giờ</option>
                  <option value={480}>8 giờ</option>
                </select>
              </SettingRow>
              <SettingRow icon="🚫" title="Số lần đăng nhập sai tối đa" description="Khóa tài khoản tạm thời sau khi nhập sai quá nhiều lần">
                <input
                  className="setting-input setting-input--sm"
                  type="number"
                  min={3}
                  max={10}
                  value={settings.maxLoginAttempts}
                  onChange={(e) => update('maxLoginAttempts', Number(e.target.value))}
                />
              </SettingRow>
              <SettingRow icon="🔐" title="Yêu cầu mật khẩu mạnh" description="Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt">
                <ToggleSwitch
                  checked={settings.requireStrongPassword}
                  onChange={(v) => update('requireStrongPassword', v)}
                />
              </SettingRow>
              <SettingRow icon="🔑" title="Xác thực 2 yếu tố (2FA)" description="Yêu cầu xác thực thêm khi đăng nhập (sẽ triển khai)">
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={(v) => update('twoFactorAuth', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {/* ─── Display ─── */}
          {activeTab === 'display' && (
            <SettingsSection title="Hiển thị" subtitle="Tùy chỉnh ngôn ngữ, định dạng ngày giờ và phân trang">
              <SettingRow icon="🌐" title="Ngôn ngữ" description="Ngôn ngữ giao diện của hệ thống">
                <select
                  className="setting-select"
                  value={settings.language}
                  onChange={(e) => update('language', e.target.value)}
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </SettingRow>
              <SettingRow icon="📆" title="Định dạng ngày" description="Cách hiển thị ngày tháng trên giao diện">
                <select
                  className="setting-select"
                  value={settings.dateFormat}
                  onChange={(e) => update('dateFormat', e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                </select>
              </SettingRow>
              <SettingRow icon="🌏" title="Múi giờ" description="Múi giờ sử dụng cho lịch hẹn và thống kê">
                <select
                  className="setting-select"
                  value={settings.timezone}
                  onChange={(e) => update('timezone', e.target.value)}
                >
                  <option value="Asia/Ho_Chi_Minh">UTC+7 (Hồ Chí Minh)</option>
                  <option value="Asia/Bangkok">UTC+7 (Bangkok)</option>
                  <option value="Asia/Tokyo">UTC+9 (Tokyo)</option>
                </select>
              </SettingRow>
              <SettingRow icon="📃" title="Số dòng mỗi trang" description="Số lượng bản ghi hiển thị trên mỗi trang danh sách">
                <select
                  className="setting-select"
                  value={settings.itemsPerPage}
                  onChange={(e) => update('itemsPerPage', Number(e.target.value))}
                >
                  <option value={5}>5 dòng</option>
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </SettingRow>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
