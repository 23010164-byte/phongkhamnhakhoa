import { useState, useEffect, useCallback } from 'react';
import reviewApi from '../../api/review.api';
import ReviewForm from './ReviewForm';
import StarRating from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmModal from '../../components/ConfirmModal';
import './ReviewList.css';

function ReviewCard({ review, onEdit, onDelete }) {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <div>
          <h3 className="review-card-title">{review.title}</h3>
          {review.subject && (
            <span className="review-subject-tag">{review.subject}</span>
          )}
        </div>
        <div className="review-card-actions">
          <button className="btn btn--sm btn--outline" onClick={() => onEdit(review)}>
            Sửa
          </button>
          <button className="btn btn--sm btn--danger" onClick={() => onDelete(review)}>
            Xóa
          </button>
        </div>
      </div>

      <StarRating value={review.rating} readonly size="sm" />

      <p className="review-card-content">{review.content}</p>

      <div className="review-card-meta">
        <span>{review.author?.name || 'Ẩn danh'}</span>
        <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
    </article>
  );
}

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, review: null, loading: false });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewApi.getAll({ page, limit: 10 });
      setReviews(res.data || res);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách review');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      if (editingReview) {
        const updated = await reviewApi.update(editingReview._id, values);
        setReviews((prev) =>
          prev.map((r) => (r._id === editingReview._id ? updated : r))
        );
      } else {
        const created = await reviewApi.create(values);
        setReviews((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingReview(null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await reviewApi.remove(deleteModal.review._id);
      setReviews((prev) => prev.filter((r) => r._id !== deleteModal.review._id));
      setDeleteModal({ open: false, review: null, loading: false });
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa review');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  return (
    <div className="review-list-page container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Đánh giá chân thật từ cộng đồng</p>
        </div>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => { setEditingReview(null); setShowForm(true); }}
          >
            + Viết Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-section">
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitLoading}
          />
        </div>
      )}

      {loading && <Spinner />}
      {error && !loading && <ErrorMessage message={error} onRetry={fetchReviews} />}

      {!loading && !error && (
        <>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có review nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={handleEdit}
                  onDelete={(r) => setDeleteModal({ open: true, review: r, loading: false })}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn--outline btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="pagination-info">Trang {page} / {totalPages}</span>
              <button
                className="btn btn--outline btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Tiếp →
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Xóa Review"
        message={`Bạn có chắc muốn xóa review "${deleteModal.review?.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, review: null, loading: false })}
        loading={deleteModal.loading}
      />
    </div>
  );
}

export default ReviewList;
