import './DataTable.css';
import LoadingSpinner from './LoadingSpinner';

/**
 * @param {Array} columns - [{ key, label|title, render? }]
 * @param {Array} rows - array of objects
 * @param {Array} data - alias for rows
 * @param {string} [emptyText]
 * @param {boolean} [loading]
 * @param {Object} [pagination] - { currentPage, totalPages, onPageChange }
 * @param {Function} [getRowProps] - row => ({ className: '...', style: {...} })
 */
function DataTable({ columns = [], rows, data, emptyText = 'Không có dữ liệu', loading = false, pagination, getRowProps }) {
  const actualRows = rows || data || [];
  return (
    <div className="data-table-wrap" style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label || col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {actualRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            actualRows.map((row, idx) => {
              const rowProps = getRowProps ? getRowProps(row) : {};
              return (
                <tr key={row.id ?? idx} {...rowProps}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row, idx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', gap: '8px', borderTop: '1px solid var(--color-border)' }}>
          <button 
            disabled={pagination.currentPage <= 1} 
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            style={{ padding: '4px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: pagination.currentPage <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Trang trước
          </button>
          <span style={{ alignSelf: 'center', fontSize: '0.9rem' }}>Trang {pagination.currentPage} / {pagination.totalPages}</span>
          <button 
            disabled={pagination.currentPage >= pagination.totalPages} 
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            style={{ padding: '4px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: pagination.currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
