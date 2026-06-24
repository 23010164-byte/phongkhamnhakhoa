import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import blogApi from '../../api/blog.api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmModal from '../../components/ConfirmModal';
import useAuthStore from '../../stores/authStore';
import './BlogDetail.css';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, loading: false });

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await blogApi.getById(id);
        setBlog(res);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await blogApi.remove(id);
      navigate('/blogs');
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa bài viết');
      setDeleteModal({ open: false, loading: false });
    }
  };

  const isAuthor = user && blog && (blog.author?._id === user._id || blog.author === user._id);

  if (loading) return <div className="container"><Spinner /></div>;
  if (error) return (
    <div className="container">
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    </div>
  );
  if (!blog) return null;

  return (
    <div className="blog-detail-page container">
      <div className="blog-detail-breadcrumb">
        <Link to="/blogs">← Quay lại Blog</Link>
      </div>

      <article className="blog-detail">
        {blog.coverImage && (
          <div className="blog-detail-cover">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        <header className="blog-detail-header">
          <div className="blog-detail-meta">
            <span className="blog-category">{blog.category}</span>
            <span className="blog-date">
              {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="blog-detail-title">{blog.title}</h1>
          <p className="blog-detail-summary">{blog.summary}</p>

          <div className="blog-detail-author">
            <div className="author-avatar">
              {(blog.author?.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="author-name">{blog.author?.name || 'Ẩn danh'}</p>
              <p className="author-meta">Tác giả</p>
            </div>

            {isAuthor && (
              <div className="blog-detail-actions">
                <Link to={`/blogs/${id}/edit`} className="btn btn--sm btn--outline">
                  Chỉnh sửa
                </Link>
                <button
                  className="btn btn--sm btn--danger"
                  onClick={() => setDeleteModal({ open: true, loading: false })}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </header>

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
        />
      </article>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Xóa bài viết"
        message="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, loading: false })}
        loading={deleteModal.loading}
      />
    </div>
  );
}

export default BlogDetail;
