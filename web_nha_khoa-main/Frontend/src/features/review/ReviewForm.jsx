import { useState, useEffect } from 'react';
import StarRating from '../../components/StarRating';
import { validateReviewForm } from '../../utils/validators';
import './ReviewForm.css';

const INITIAL_VALUES = {
  title: '',
  content: '',
  rating: 0,
  subject: '',
};

function ReviewForm({ initialData, onSubmit, onCancel, loading }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setValues({
        title: initialData.title || '',
        content: initialData.content || '',
        rating: initialData.rating || 0,
        subject: initialData.subject || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRatingChange = (rating) => {
    setValues((prev) => ({ ...prev, rating }));
    setTouched((prev) => ({ ...prev, rating: true }));
    setErrors((prev) => ({ ...prev, rating: undefined }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validateReviewForm(values);
    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateReviewForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit(values);
  };

  const isEditing = !!initialData;

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">{isEditing ? 'Chỉnh sửa Review' : 'Viết Review mới'}</h2>

      <div className="form-group">
        <label htmlFor="subject">Đối tượng đánh giá</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={values.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="VD: iPhone 15 Pro, Nhà hàng ABC..."
          className={touched.subject && errors.subject ? 'input--error' : ''}
        />
        {touched.subject && errors.subject && (
          <span className="field-error">{errors.subject}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Tiêu đề review..."
          className={touched.title && errors.title ? 'input--error' : ''}
        />
        {touched.title && errors.title && (
          <span className="field-error">{errors.title}</span>
        )}
      </div>

      <div className="form-group">
        <label>Đánh giá <span className="required">*</span></label>
        <StarRating value={values.rating} onChange={handleRatingChange} size="lg" />
        {touched.rating && errors.rating && (
          <span className="field-error">{errors.rating}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="content">Nội dung <span className="required">*</span></label>
        <textarea
          id="content"
          name="content"
          value={values.content}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={6}
          className={touched.content && errors.content ? 'input--error' : ''}
        />
        <div className="char-count">{values.content.length} ký tự</div>
        {touched.content && errors.content && (
          <span className="field-error">{errors.content}</span>
        )}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Đăng Review'}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
