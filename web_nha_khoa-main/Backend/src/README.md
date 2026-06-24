# 🏥 Clinic Backend API

Hệ thống backend quản lý phòng khám — Node.js + Express + MySQL + Redis + Socket.io

---

## 📋 Tính năng

- **Auth**: JWT (access + refresh token), blacklist, forgot/reset password, verify email OTP
- **RBAC**: 4 roles — Admin, Doctor, Receptionist, Patient
- **Đặt lịch**: Book, confirm, check-in, complete, cancel, no-show; tự động sinh slot
- **Hồ sơ bệnh án**: Medical record + đơn thuốc (Prescription)
- **Thanh toán**: Tiền mặt + VNPay gateway
- **Đánh giá**: Rating bác sĩ, doctor reply, ẩn/hiện review
- **Thông báo**: In-app + Email, BullMQ queue, Socket.io push realtime
- **Chat**: Private & group room, typing indicator, thu hồi tin nhắn
- **Blog/CMS**: Bài viết, danh mục, SEO fields, thumbnail
- **Dashboard**: Thống kê theo từng role, doanh thu chart, top doctors
- **Upload**: Cloudinary (avatar, ảnh blog, tài liệu y tế PDF)

---

## 🚀 Khởi động nhanh

### Yêu cầu
- Node.js >= 18
- MySQL 8.0
- Redis 7

### Cài đặt
```bash
# Clone và cài deps
npm install

# Copy env
cp .env.example .env
# → Điền đầy đủ giá trị vào .env

# Tạo DB schema
npm run migrate

# Seed dữ liệu mẫu
npm run seed

# Chạy dev
npm run dev
```

### Docker (khuyến nghị)
```bash
cp .env.example .env
# Điền .env

docker-compose up -d
# API: http://localhost/api/v1
# Health: http://localhost/health
```

---

## 📁 Cấu trúc

```
src/
├── config/          # database, jwt, redis, mailer, cloudinary, associations
├── database/        # migrate.js, seed.js
├── middlewares/     # auth, role, error, validate, logger, rateLimiter
├── modules/
│   ├── auth/        # register, login, refresh, logout, forgot/reset password
│   ├── user/        # profile, CRUD users
│   ├── doctor/      # doctor profile, working schedule, available slots
│   ├── service/     # specialty, service (dịch vụ khám)
│   ├── appointment/ # book, confirm, check-in, complete, cancel
│   ├── medical/     # medical record + prescription
│   ├── notification/# in-app + email notifications
│   ├── payment/     # cash + VNPay
│   ├── review/      # rating, doctor reply
│   ├── media/       # upload Cloudinary
│   ├── chat/        # realtime chat rooms
│   ├── blog/        # CMS bài viết
│   ├── contact/     # form liên hệ
│   └── dashboard/   # thống kê theo role
├── queues/          # BullMQ: notification + appointment reminder cron
├── socket/          # Socket.io: chat + notification handlers
├── permissions/     # RBAC permissions map
└── utils/           # logger, response, constants, helpers, emailTemplates
```

---

## 🔑 API Endpoints

### Auth `POST /api/v1/auth`
| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | `/register` | Đăng ký | ❌ |
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/verify-email` | Xác thực email OTP | ❌ |
| POST | `/resend-verify` | Gửi lại OTP | ❌ |
| POST | `/refresh-token` | Làm mới access token | ❌ |
| POST | `/forgot-password` | Quên mật khẩu | ❌ |
| POST | `/reset-password` | Đặt lại mật khẩu | ❌ |
| GET  | `/me` | Lấy thông tin bản thân | ✅ |
| POST | `/logout` | Đăng xuất | ✅ |
| POST | `/logout-all` | Đăng xuất tất cả thiết bị | ✅ |
| PUT  | `/change-password` | Đổi mật khẩu | ✅ |

### Users `GET /api/v1/users`
| Method | Path | Role |
|--------|------|------|
| GET | `/profile` | All |
| PUT | `/profile` | All |
| PUT | `/profile/avatar` | All |
| GET | `/` | Admin |
| POST | `/` | Admin |
| GET | `/patients` | Admin, Receptionist |
| GET `PUT` `PATCH` `DELETE` | `/:id` | Admin |

### Doctors `GET /api/v1/doctors`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| GET | `/:id/slots?date=YYYY-MM-DD` | Public |
| GET | `/me/profile` | Doctor |
| PUT | `/me/profile` | Doctor |
| POST | `/` | Admin |
| PUT | `/:id` | Admin, Doctor |
| PATCH | `/:id/availability` | Admin, Doctor |

### Appointments `POST /api/v1/appointments`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | All (filtered by role) |
| POST | `/` | Patient, Receptionist, Admin |
| GET | `/code/:code` | All |
| GET | `/:id` | All |
| PATCH | `/:id/confirm` | Receptionist, Admin |
| PATCH | `/:id/check-in` | Receptionist, Admin |
| PATCH | `/:id/complete` | Doctor, Admin |
| PATCH | `/:id/cancel` | All |
| PATCH | `/:id/no-show` | Receptionist, Admin |

### Medical Records `GET /api/v1/medical-records`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | All (filtered) |
| GET | `/appointment/:id` | All |
| GET | `/:id` | All |
| POST | `/` | Doctor, Admin |
| PUT | `/:id` | Doctor, Admin |

### Payments `GET /api/v1/payments`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | All (filtered) |
| POST | `/cash` | Receptionist, Admin |
| POST | `/vnpay` | Patient |
| GET | `/vnpay-return` | Public (VNPay callback) |
| PATCH | `/:id/refund` | Admin |

### Reviews `GET /api/v1/reviews`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | Public |
| GET | `/doctor/:id/summary` | Public |
| POST | `/` | Patient |
| PUT | `/:id` | Patient, Admin |
| DELETE | `/:id` | Patient, Admin |
| POST | `/:id/reply` | Doctor |
| PATCH | `/:id/visibility` | Admin |

### Chat `GET /api/v1/chat`
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Danh sách rooms |
| GET | `/unread` | Tổng chưa đọc |
| POST | `/private` | Mở/tạo private room |
| POST | `/group` | Tạo group (Staff) |
| GET | `/appointment/:id` | Room theo lịch hẹn |
| GET | `/:roomId/messages` | Lịch sử tin nhắn |
| POST | `/:roomId/messages` | Gửi tin nhắn (REST) |
| DELETE | `/messages/:id` | Thu hồi tin nhắn |

### Dashboard `GET /api/v1/dashboard`
| Path | Role |
|------|------|
| `/` | All (auto-route by role) |
| `/admin?startDate=&endDate=` | Admin |
| `/doctor` | Doctor |
| `/receptionist` | Receptionist |
| `/patient` | Patient |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Mô tả |
|-------|---------|-------|
| `chat:join` | `{ roomId }` | Vào phòng chat |
| `chat:send_message` | `{ roomId, content, type, mediaUrl }` | Gửi tin nhắn |
| `chat:typing` | `{ roomId, isTyping }` | Đang gõ |
| `chat:read` | `{ roomId }` | Đánh dấu đã đọc |
| `chat:leave` | `{ roomId }` | Rời phòng |
| `users:online` | - | Lấy danh sách online |

### Server → Client
| Event | Payload | Mô tả |
|-------|---------|-------|
| `chat:new_message` | message object | Tin nhắn mới |
| `chat:message_deleted` | `{ messageId, roomId }` | Thu hồi tin nhắn |
| `chat:typing` | `{ userId, isTyping }` | Typing indicator |
| `chat:user_joined` | `{ userId, roomId }` | User vào room |
| `notification` | notification object | Thông báo realtime |
| `user:online` | `{ userId }` | User online |
| `user:offline` | `{ userId }` | User offline |

---

## 👤 Tài khoản mặc định (sau khi seed)

| Role | Email | Mật khẩu |
|------|-------|----------|
| Admin | admin@phongkham.vn | Password@123 |
| Lễ tân | letan@phongkham.vn | Password@123 |
| Bác sĩ 1 | bs.minh@phongkham.vn | Password@123 |
| Bác sĩ 2 | bs.hoa@phongkham.vn | Password@123 |
| Bệnh nhân 1 | benhnhan1@gmail.com | Password@123 |
| Bệnh nhân 2 | benhnhan2@gmail.com | Password@123 |

---

## 🛠 Scripts

```bash
npm run dev          # Chạy development (nodemon)
npm start            # Chạy production
npm run migrate      # Tạo/sync DB schema (safe)
npm run migrate -- --alter   # Cập nhật schema
npm run migrate -- --force   # Xóa & tạo lại toàn bộ DB
npm run seed         # Seed dữ liệu mẫu
```

---

## ⚙️ Environment Variables

Xem file `.env.example` để biết tất cả biến môi trường cần thiết.

**Bắt buộc phải cấu hình:**
- `DB_*` — MySQL connection
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `REDIS_HOST`
- `CLOUDINARY_*` — Upload ảnh
- `SMTP_*` — Gửi email
- `VNPAY_*` — Thanh toán online (nếu dùng VNPay)
