import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import blogApi from '../../api/blog.api';
import { validateBlogForm } from '../../utils/validators';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import './BlogEditor.css';

const CATEGORIES = ['Công nghệ', 'Ẩm thực', 'Du lịch', 'Sức khỏe', 'Khác'];

const INITIAL_VALUES = {
  title: '',
  summary: '',
  content: '',
  category: '',
  coverImage: '',
  tags: '',
};

function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [fetchError, setFetchError] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const fetchBlog = async () => {
      setFetchLoading(true);
      try {
        const blog = await blogApi.getById(id);
        setValues({
          title: blog.title || '',
          summary: blog.summary || '',
          content: blog.content || '',
          category: blog.category || '',
          coverImage: blog.coverImage || '',
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
        });
      } catch (err) {
        setFetchError(err?.response?.data?.message || 'Không thể tải bài viết');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchBlog();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateBlogForm(values);
    setErrors(errs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errs = validateBlogForm(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        ...values,
        tags: values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await blogApi.update(id, payload);
        navigate(`/blogs/${id}`);
      } else {
        const created = await blogApi.create(payload);
        navigate(`/blogs/${created._id || created.id}`);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="container"><Spinner /></div>;
  if (fetchError) return (
    <div className="container">
      <ErrorMessage message={fetchError} />
    </div>
  );

  return (
    <div className="blog-editor-page container">
      <div className="editor-toolbar">
        <h1 className="page-title">{isEditing ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
        <div className="editor-toolbar-actions">
          <button
            type="button"
            className={`btn btn--sm ${preview ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? 'Chỉnh sửa' : 'Xem trước'}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--outline"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
        </div>
      </div>

      {preview ? (
        <div className="blog-preview">
          <div className="blog-preview-header">
            {values.category && <span className="blog-category">{values.category}</span>}
            <h1>{values.title || 'Tiêu đề...'}</h1>
            <p className="blog-preview-summary">{values.summary || 'Tóm tắt...'}</p>
          </div>
          <div
            className="blog-detail-content blog-preview-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(values.content || '<p>Nội dung...</p>') }}
          />
        </div>
      ) : (
        <form className="blog-editor-form" onSubmit={handleSubmit} noValidate>
          <div className="editor-main">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
              <input
                id="title"
                name="title"
                type="text"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tiêu đề bài viết..."
                className={`editor-title-input ${touched.title && errors.title ? 'input--error' : ''}`}
              />
              {touched.title && errors.title && (
                <span className="field-error">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="summary">Tóm tắt <span className="required">*</span></label>
              <textarea
                id="summary"
                name="summary"
                value={values.summary}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tóm tắt ngắn về bài viết..."
                rows={2}
                className={touched.summary && errors.summary ? 'input--error' : ''}
              />
              {touched.summary && errors.summary && (
                <span className="field-error">{errors.summary}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Nội dung <span className="required">*</span>
                <span className="label-hint">(HTML được hỗ trợ)</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={values.content}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nội dung bài viết... Hỗ trợ HTML: <h2>, <p>, <strong>, <em>, <ul>, <li>, <blockquote>..."
                rows={18}
                className={`editor-content-textarea ${touched.content && errors.content ? 'input--error' : ''}`}
              />
              <div className="char-count">{values.content.length} ký tự</div>
              {touched.content && errors.content && (
                <span className="field-error">{errors.content}</span>
              )}
            </div>
          </div>

          <aside className="editor-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Thông tin bài viết</h3>

              <div className="form-group">
                <label htmlFor="category">Danh mục <span className="required">*</span></label>
                <select
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.category && errors.category ? 'input--error' : ''}
                >
                  <option value="">Chọn danh mục...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {touched.category && errors.category && (
                  <span className="field-error">{errors.category}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="coverImage">Ảnh bìa (URL)</label>
                <input
                  id="coverImage"
                  name="coverImage"
                  type="url"
                  value={values.coverImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                {values.coverImage && (
                  <div className="cover-preview">
                    <img src={values.coverImage} alt="Cover preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={values.tags}
                  onChange={handleChange}
                  placeholder="react, javascript, web..."
                />
                <small className="field-hint">Phân cách bằng dấu phẩy</small>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật bài viết' : 'Đăng bài'}
              </button>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

export default BlogEditor;
