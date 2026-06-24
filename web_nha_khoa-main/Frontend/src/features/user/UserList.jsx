import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/user.store';
import useAuthStore from '../../store/auth.store';
import {
  Spinner, Alert, AvatarPlaceholder,
  RoleBadge, StatusBadge, Pagination,
  ConfirmDialog, Icon,
} from './UserUI';
import './user.css';

/* ── Debounce hook ── */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── Create Patient Modal (Receptionist) ── */
function CreatePatientModal({ onClose, onCreated }) {
  const { createPatient } = useUserStore();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', gender: '', dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createPatient(form);
    setLoading(false);
    if (result.success) {
      onCreated?.();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-box" style={{ maxWidth: 480, width: '90vw' }}>
        <div className="confirm-title">Tạo tài khoản bệnh nhân</div>
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

          <div className="form-group">
            <label className="form-label">Họ và tên <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              className="form-control"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0901234567"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Tối thiểu 8 ký tự"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                <option value="">— Chọn —</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input
                className="form-control"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="confirm-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Huỷ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo…' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Row actions ── */
function UserRow({ user, onView, onToggle, onDelete, isAdmin }) {
  const fullName = user.full_name || 'Người dùng';
  const email = user.email || '—';
  const avatarUrl = user.avatar;
  const role = user.role || 'patient';
  const phone = user.phone;
  const status = user.is_active ? 'active' : 'inactive';
  const createdAt = user.created_at;

  return (
    <tr>
      {/* Avatar + name */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AvatarPlaceholder name={fullName} size="sm" src={avatarUrl} />
          <div>
            <div style={{ fontWeight: 500, lineHeight: 1.2 }}>{fullName}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{email}</div>
          </div>
        </div>
      </td>
      <td><RoleBadge role={role} /></td>
      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{phone ?? '—'}</td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
        {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : '—'}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button
            className="btn-icon-only"
            onClick={() => onView(user.id)}
            title="Xem chi tiết"
          >
            <Icon name="eye" size={15} />
          </button>
          {isAdmin && (
            <>
              <button
                className="btn-icon-only"
                onClick={() => onToggle({ ...user, fullName, status })}
                title={status === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt'}
              >
                <Icon name="ban" size={15} />
              </button>
              <button
                className="btn-icon-only"
                onClick={() => onDelete({ ...user, fullName })}
                title="Xoá"
                style={{ color: 'var(--color-error)' }}
              >
                <Icon name="trash" size={15} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── UserList ── */
export default function UserList() {
  const navigate = useNavigate();
  const {
    users, userTotal, userPage, userLimit,
    usersLoading, usersError,
    fetchUsers, fetchPatients, toggleUserStatus, deleteUser, clearUsersError,
  } = useUserStore();

  const currentUser = useAuthStore((s) => s.user);
  const currentRole = currentUser?.role;
  const isReceptionist = currentRole === 'receptionist';
  const isAdmin = currentRole === 'admin';

  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('');
  const [status, setStatus]     = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadUsers = useCallback((page = 1) => {
    if (isReceptionist) {
      // Lễ tân chỉ xem danh sách bệnh nhân qua GET /users/patients
      fetchPatients({ page, limit: userLimit, search: debouncedSearch });
    } else {
      // Admin xem tất cả qua GET /users
      fetchUsers({ page, limit: userLimit, search: debouncedSearch, role, status });
    }
  }, [isReceptionist, debouncedSearch, role, status, userLimit]);

  // Re-fetch when filters change
  useEffect(() => { loadUsers(1); }, [loadUsers]);

  const handlePageChange = (page) => loadUsers(page);

  const handleView = (id) => {
    if (isAdmin) {
      navigate(`/admin/users/${id}`);
    }
    // Lễ tân không có trang chi tiết user riêng
  };

  const handleToggle = (user) => setConfirmAction({ type: 'toggle', user });
  const handleDelete = (user) => setConfirmAction({ type: 'delete', user });

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    setActionError(null);
    const { type, user } = confirmAction;
    const result = type === 'delete'
      ? await deleteUser(user.id)
      : await toggleUserStatus(user.id);
    setActionLoading(false);
    if (result.success) {
      setConfirmAction(null);
    } else {
      setActionError(result.message);
    }
  };

  const pageTitle = isReceptionist ? 'Danh sách bệnh nhân' : 'Danh sách người dùng';
  const pageSubtitle = isReceptionist
    ? 'Quản lý tài khoản bệnh nhân trong hệ thống'
    : 'Quản lý tất cả tài khoản trong hệ thống';

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">{pageTitle}</div>
          <div className="page-subtitle">{pageSubtitle}</div>
        </div>
        {isReceptionist && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Icon name="plus" size={15} /> Thêm bệnh nhân
          </button>
        )}
      </div>

      {/* Alerts */}
      {usersError && (
        <Alert type="error" onClose={clearUsersError}>{usersError}</Alert>
      )}
      {actionError && (
        <Alert type="error" onClose={() => setActionError(null)}>{actionError}</Alert>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Icon name="search" size={15} />
          <input
            className="search-input"
            placeholder="Tìm tên, email, SĐT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Chỉ admin mới thấy bộ lọc vai trò (lễ tân chỉ xem bệnh nhân) */}
        {isAdmin && (
          <select className="filter-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="doctor">Bác sĩ</option>
            <option value="receptionist">Lễ tân</option>
            <option value="patient">Bệnh nhân</option>
          </select>
        )}

        {/* Chỉ admin mới thấy bộ lọc trạng thái */}
        {isAdmin && (
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {usersLoading && !users.length
          ? <Spinner label="Đang tải danh sách…" />
          : (
            <>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isReceptionist ? 'Bệnh nhân' : 'Người dùng'}</th>
                      <th>Vai trò</th>
                      <th>Điện thoại</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <Icon name="user" size={36} />
                            <p>{isReceptionist ? 'Không tìm thấy bệnh nhân nào.' : 'Không tìm thấy người dùng nào.'}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isAdmin={isAdmin}
                          onView={handleView}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {userTotal > 0 && (
                <Pagination
                  page={userPage}
                  limit={userLimit}
                  total={userTotal}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )
        }
      </div>

      {/* Confirm dialog (admin only) */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === 'delete' ? 'Xoá người dùng?' : 'Thay đổi trạng thái?'}
          desc={
            confirmAction.type === 'delete'
              ? `Bạn chắc chắn muốn xoá tài khoản "${confirmAction.user.fullName}"? Hành động này không thể hoàn tác.`
              : `Bạn muốn ${confirmAction.user.status === 'active' ? 'vô hiệu hoá' : 'kích hoạt'} tài khoản "${confirmAction.user.fullName}"?`
          }
          onConfirm={handleConfirm}
          onCancel={() => { setConfirmAction(null); setActionError(null); }}
          loading={actionLoading}
        />
      )}

      {/* Create patient modal (receptionist only) */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => loadUsers(1)}
        />
      )}
    </div>
  );
}
