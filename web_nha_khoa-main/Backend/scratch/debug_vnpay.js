/**
 * Debug script: chạy bằng `node scratch/debug_vnpay.js` từ thư mục Backend
 * In ra URL và params gửi lên VNPAY để kiểm tra
 */
require('dotenv').config();
const crypto = require('crypto');
const querystring = require('querystring');

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'F5DZKW5R',
  hashSecret: process.env.VNPAY_HASH_SECRET || 'FNIKCLMXJHBOBDODGDNMRISRHXSFRHDQ',
  url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/result`,
};

const sortObject = (obj) => {
  const sorted = {};
  Object.keys(obj).sort().forEach((key) => { sorted[key] = obj[key]; });
  return sorted;
};

const formatVNTime = (d) => {
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
};

// Test với giá trị cố định
const date = new Date();
const createDate = formatVNTime(date);
const expireDate = formatVNTime(new Date(date.getTime() + 15 * 60 * 1000));
const txCode = `VNP${Date.now()}`;

// TEST AMOUNT: thử với 500000 VND
const amount = 500000;

const orderInfo = 'Thanh toan lich kham BOOK001';

let params = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: vnpayConfig.tmnCode,
  vnp_Locale: 'vn',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: txCode,
  vnp_OrderInfo: orderInfo,
  vnp_OrderType: 'other',
  vnp_Amount: Math.round(amount) * 100,
  vnp_ReturnUrl: vnpayConfig.returnUrl,
  vnp_IpAddr: '127.0.0.1',
  vnp_CreateDate: createDate,
  vnp_ExpireDate: expireDate,
};

params = sortObject(params);

console.log('\n=== PARAMS GỬI LÊN VNPAY ===');
Object.entries(params).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});

const signData = querystring.stringify(params, '&', '=', { encodeURIComponent: (v) => v });
console.log('\n=== CHUỖI KÝ (signData) ===');
console.log(signData);

const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
const hash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
console.log('\n=== HASH ===');
console.log(hash);

params.vnp_SecureHash = hash;
const finalUrl = `${vnpayConfig.url}?${querystring.stringify(params)}`;

console.log('\n=== URL CUỐI ===');
console.log(finalUrl);

console.log('\n=== KIỂM TRA ===');
console.log('TMN Code:', vnpayConfig.tmnCode);
console.log('Return URL:', vnpayConfig.returnUrl);
console.log('Amount (vnp_Amount):', Math.round(amount) * 100);
console.log('CreateDate:', createDate);
console.log('ExpireDate:', expireDate);
console.log('TxnRef:', txCode);
