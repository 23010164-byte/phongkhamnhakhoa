import './StarRating.css';

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating star-rating--${size} ${readonly ? 'star-rating--readonly' : ''}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= value ? 'star--filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          aria-label={`${star} sao`}
        >
          ★
        </button>
      ))}
      {!readonly && <span className="star-label">{value ? `${value}/5` : 'Chọn số sao'}</span>}
    </div>
  );
}

export default StarRating;
