# Hệ Thống Quản Lý Phòng Khám Nha Khoa (HealthCare Portal)

Đây là hệ thống phần mềm quản lý phòng khám nha khoa toàn diện, bao gồm cả Frontend (ứng dụng cho người dùng) và Backend (máy chủ cung cấp API). Hệ thống cung cấp giải pháp chuyển đổi số cho các phòng khám với đa dạng phân quyền: Quản trị viên (Admin), Bác sĩ (Doctor), Lễ tân (Receptionist) và Bệnh nhân (Patient).

---

## 🚀 Công Nghệ Sử Dụng

### Frontend (Ứng dụng giao diện người dùng)
Được xây dựng theo mô hình Single Page Application (SPA) với giao diện hiện đại, tốc độ phản hồi nhanh chóng.
- **Framework:** React 18
- **Build tool:** Vite (cho tốc độ build và Hot Module Replacement cực nhanh)
- **Quản lý trạng thái (State Management):** Zustand
- **Routing:** React Router DOM (Hỗ trợ lazy loading và phân quyền theo Role-based Route)
- **HTTP Client:** Axios (Tích hợp interceptors để quản lý token tự động)
- **Real-time:** Socket.io-client
- **Xử lý giao diện:** Vanilla CSS (CSS Variables, Flexbox, CSS Grid) mang lại giao diện độc đáo, không phụ thuộc framework UI bên ngoài.

### Backend (Hệ thống máy chủ API)
Cung cấp RESTful API hiệu suất cao, bảo mật và dễ mở rộng.
- **Môi trường chạy:** Node.js (>=18.0.0)
- **Web Framework:** Express.js
- **Cơ sở dữ liệu:** MySQL
- **ORM:** Sequelize
- **Bảo mật & Xác thực:** JWT (JSON Web Tokens), bcryptjs, helmet, express-rate-limit
- **Real-time:** Socket.io
- **Caching & Queue:** Redis, BullMQ
- **Upload File:** Multer, Cloudinary
- **Logging:** Winston, Morgan

---

## 📂 Cấu Trúc Thư Mục Dự Án

Dự án được chia thành hai phần chính:

```
Nha khoa/
├── Frontend/           # Mã nguồn giao diện (React + Vite)
│   ├── src/
│   │   ├── api/        # Cấu hình Axios & các hàm gọi API
│   │   ├── components/ # Các UI components dùng chung (Sidebar, Navbar...)
│   │   ├── features/   # Các chức năng chính (Auth, Dashboard, Admin, Doctor...)
│   │   ├── layouts/    # Các bộ khung giao diện theo Role
│   │   ├── routes/     # Cấu hình Route bảo vệ và chuyển hướng
│   │   ├── store/      # Zustand stores quản lý state toàn cục
│   │   ├── utils/      # Các hàm tiện ích
│   │   └── App.jsx     # Điểm vào chính của giao diện
│   └── package.json
│
└── Backend/            # Mã nguồn máy chủ API (Node.js + Express)
    ├── src/
    │   ├── config/     # Cấu hình hệ thống (Database, Redis, Cloudinary...)
    │   ├── database/   # Các script Migrate và Seed dữ liệu mẫu
    │   ├── middlewares/# Các middleware (Auth, Error handling, Rate limit...)
    │   ├── modules/    # Các module tính năng (Auth, User, Dashboard, Appointment...)
    │   │   ├── *.controller.js
    │   │   ├── *.service.js
    │   │   ├── *.repository.js
    │   │   ├── *.model.js
    │   │   └── *.routes.js
    │   ├── utils/      # Các tiện ích (Logger, Format response...)
    │   └── server.js   # Điểm khởi chạy server
    └── package.json
```

---

## 🛠️ Hướng Dẫn Cài Đặt Và Chạy Cục Bộ

### 1. Yêu Cầu Hệ Thống
- Node.js (>= 18.0.0)
- MySQL Server
- Redis Server (Khuyên dùng để chạy hàng đợi và caching)

### 2. Cài Đặt Backend
1. Mở terminal, di chuyển vào thư mục Backend:
   ```bash
   cd Backend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ file `.env.example` (hoặc thiết lập các biến môi trường cần thiết như cấu hình Database, JWT Secret, Redis URL...).
4. Chạy migration và seed dữ liệu mẫu (nếu cần):
   ```bash
   npm run migrate
   npm run seed
   ```
5. Khởi chạy máy chủ (Môi trường phát triển):
   ```bash
   npm run dev
   ```
   *Máy chủ Backend mặc định sẽ chạy ở `http://localhost:5000`.*

### 3. Cài Đặt Frontend
1. Mở một terminal mới, di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng web:
   ```bash
   npm run dev
   ```
   *Giao diện Frontend mặc định sẽ chạy ở `http://localhost:3000`.*

---

## 🌟 Chức Năng Chính Phân Theo Quyền (Roles)

Hệ thống cung cấp trải nghiệm chuyên biệt cho từng đối tượng người dùng:

1. **Quản trị viên (Admin):**
   - Xem tổng quan báo cáo doanh thu, số lượng lịch hẹn, danh sách bác sĩ xuất sắc.
   - Quản lý tất cả người dùng (Bác sĩ, Lễ tân, Bệnh nhân).
   - Kiểm tra **Nhật ký hệ thống (Audit Logs)**.
   - Cấu hình **Cài đặt hệ thống** (Thời gian làm việc, cấu hình thông báo, bảo mật).

2. **Bác sĩ (Doctor):**
   - Quản lý lịch hẹn khám chữa bệnh.
   - Cập nhật hồ sơ bệnh án, kê đơn thuốc.
   - Xem lịch làm việc cá nhân.

3. **Lễ tân (Receptionist):**
   - Quản lý lịch hẹn tổng thể, duyệt lịch hẹn trực tuyến.
   - Thực hiện quy trình Check-in cho bệnh nhân.
   - Quản lý hóa đơn và thanh toán viện phí.

4. **Bệnh nhân (Patient):**
   - Tạo tài khoản, cập nhật hồ sơ cá nhân.
   - Đặt lịch khám trực tuyến với bác sĩ mong muốn.
   - Xem lại lịch sử khám bệnh, hồ sơ bệnh án và hóa đơn.

---

## 📝 Quy Ước Viết Mã (Coding Convention)

- **Frontend:**
  - Component React sử dụng Functional Component & Hooks.
  - Sử dụng cấu trúc thư mục dạng `features` (Feature-Sliced Design cơ bản).
  - CSS thuần túy sử dụng BEM (Block Element Modifier) kết hợp với CSS Variables.
  
- **Backend:**
  - Áp dụng kiến trúc `Controller - Service - Repository` để phân tách logic nghiệp vụ và thao tác CSDL.
  - Xử lý lỗi tập trung qua middleware.
  - Tên bảng và cột CSDL dùng `snake_case`, trong khi biến JavaScript dùng `camelCase` (chuyển đổi tại Repository/Model).
