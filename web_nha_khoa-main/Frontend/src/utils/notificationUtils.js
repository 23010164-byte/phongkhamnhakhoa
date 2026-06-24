/**
 * Map notification type to icon character and theme color class
 * @param {string} type
 * @returns {{ icon: string, colorClass: string, label: string }}
 */
export const getNotificationMeta = (type) => {
  const map = {
    order: { icon: '📦', colorClass: 'type-order', label: 'Đơn hàng' },
    payment: { icon: '💳', colorClass: 'type-payment', label: 'Thanh toán' },
    system: { icon: '⚙️', colorClass: 'type-system', label: 'Hệ thống' },
    alert: { icon: '🔔', colorClass: 'type-alert', label: 'Cảnh báo' },
    message: { icon: '💬', colorClass: 'type-message', label: 'Tin nhắn' },
    promotion: { icon: '🎁', colorClass: 'type-promotion', label: 'Khuyến mãi' },
    info: { icon: 'ℹ️', colorClass: 'type-info', label: 'Thông tin' },
  };

  return map[type] || { icon: '🔔', colorClass: 'type-default', label: 'Thông báo' };
};
