import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useServiceStore from '../../store/service.store';
import { BackBtn, PageHeader, Card, CardBody, Alert, Spinner } from '../doctor/DoctorUI';

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const {
    categories, fetchCategories,
    selectedService, selectedServiceLoading, fetchServiceById, clearSelectedService,
    createService, updateService
  } = useServiceStore();

  const [formData, setFormData] = useState({
    name: '',
    specialtyId: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    preparationNote: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchServiceById(id);
    }
    return () => clearSelectedService();
  }, [id]);

  useEffect(() => {
    if (isEdit && selectedService) {
      setFormData({
        name: selectedService.name || '',
        specialtyId: selectedService.specialtyId || selectedService.specialty_id || '',
        description: selectedService.description || '',
        price: selectedService.price || 0,
        durationMinutes: selectedService.durationMinutes || selectedService.duration_minutes || 30,
        preparationNote: selectedService.preparationNote || selectedService.preparation_note || '',
        isActive: selectedService.is_active ?? true,
      });
    }
  }, [isEdit, selectedService]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Vui lòng nhập tên dịch vụ');
      return;
    }
    setLoading(true);
    setError('');

    let res;
    if (isEdit) {
      res = await updateService(id, formData);
    } else {
      res = await createService(formData);
    }

    setLoading(false);
    if (res.success) {
      navigate('/admin/services');
    } else {
      setError(res.message);
    }
  };

  if (isEdit && selectedServiceLoading) return <Spinner label="Đang tải dữ liệu..." />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <BackBtn onClick={() => navigate('/admin/services')}>Quay lại danh sách</BackBtn>
      <PageHeader title={isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'} />

      {error && <Alert type="error">{error}</Alert>}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Tên dịch vụ <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="Khám tổng quát, Lấy cao răng..."
                required
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Danh mục / Chuyên khoa</label>
                <select
                  name="specialtyId"
                  className="form-control"
                  value={formData.specialtyId}
                  onChange={handleChange}
                >
                  <option value="">-- Không chọn --</option>
                  {categories.map((c) => (
                    <option key={c.id || c.value || JSON.stringify(c)} value={c.id || c.value || ''}>
                      {c.name || c.label || 'Không tên'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Giá tiền (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  className="form-control"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  min="5"
                  step="5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả dịch vụ</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Hướng dẫn chuẩn bị trước khi khám (nếu có)</label>
              <textarea
                name="preparationNote"
                className="form-control"
                rows="3"
                value={formData.preparationNote}
                onChange={handleChange}
                placeholder="Ví dụ: Nhịn ăn sáng, mang theo sổ khám bệnh..."
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive" style={{ margin: 0 }}>Đang hoạt động</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/services')}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu dịch vụ'}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
