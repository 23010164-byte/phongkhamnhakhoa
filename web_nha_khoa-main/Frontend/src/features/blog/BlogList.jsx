import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import blogApi from '../../api/blog.api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import './BlogList.css';

const CATEGORIES = ['Tất cả', 'Công nghệ', 'Ẩm thực', 'Du lịch', 'Sức khỏe', 'Khác'];

function BlogCard({ blog }) {
  return (
    <article className="blog-card">
      {blog.coverImage && (
        <div className="blog-card-image">
          <img src={blog.coverImage} alt={blog.title} loading="lazy" />
        </div>
      )}
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span className="blog-category">{blog.category}</span>
          <span className="blog-date">
            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <h2 className="blog-card-title">
          <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
        </h2>
        <p className="blog-card-summary">{blog.summary}</p>
        <div className="blog-card-footer">
          <span className="blog-author">{blog.author?.name || 'Ẩn danh'}</span>
          <Link to={`/blogs/${blog._id}`} className="read-more-link">
            Đọc tiếp →
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 9 };
      if (category !== 'Tất cả') params.category = category;
      if (search) params.search = search;

      const res = await blogApi.getAll(params);
      setBlogs(res.data || res);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="blog-list-page container">
      <div className="blog-list-header">
        <div>
          <h1 className="page-title">Blog</h1>
          <p className="page-subtitle">Những câu chuyện đáng đọc</p>
        </div>
        <Link to="/blogs/new" className="btn btn--primary">
          + Viết bài
        </Link>
      </div>

      <div className="blog-filters">
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="search-input"
          />
          <button type="submit" className="btn btn--outline btn--sm">Tìm</button>
        </form>
      </div>

      {loading && <Spinner />}
      {error && !loading && <ErrorMessage message={error} onRetry={fetchBlogs} />}

      {!loading && !error && (
        <>
          {blogs.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy bài viết nào.</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
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
    </div>
  );
}

export default BlogList;
