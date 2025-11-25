# Bookora - Triển khai dự án với Docker Compose

## Cấu trúc thư mục

- backend/
- frontend/
- mail-service/
- upload-service/
- docker-compose.yml

Các file `.env.pro` riêng cho từng service đặt tại:

- ./backend/.env.pro
- ./frontend/.env.pro
- ./mail-service/.env.pro
- ./upload-service/.env.pro

## Các biến môi trường tối thiểu

- backend:
  - `MONGODB_URI` (vd: mongodb://mongo:27017/bookora)
  - `REDIS_HOST` (vd: redis)
  - `PORT` (mặc định 4000)
  - Elasticsearch (tùy chọn nếu bật tìm kiếm):
    - `ELASTIC_NODE` (vd: http://elasticsearch:9200)
    - `ELASTIC_INDEX` (vd: books)
    - `ELASTIC_USERNAME` / `ELASTIC_PASSWORD` (nếu bật security)
    - `ES_AUTO_SETUP=true|false` (tự tạo index khi khởi động)
    - `ES_REINDEX_ON_STARTUP=true|false`
    - `ES_REINDEX_BACKGROUND=true|false`
- frontend:
  - `NEXT_PUBLIC_API_URL` (vd `http://localhost:4000`)
  - `PORT` (mặc định 3000)
- mail-service: `REDIS_HOST`, `PORT` (mặc định 4001)
- upload-service: `PORT` (VD 4002)

## Yêu cầu hệ thống

- Docker Desktop hoặc Docker Engine 20.10+
- Docker Compose V2 (có sẵn trong Docker Desktop mới)

---

## Hướng dẫn triển khai dự án

### Thành phần

- mongo (database): MongoDB 6, volume `mongo_data`, cổng host 27018 → container 27017
- redis (message broker đơn giản)
- elasticsearch (search engine hỗ trợ full-text)
- backend (Node.js / NestJS module tìm kiếm tích hợp Elasticsearch + fallback Mongo)
- mail-service (Node.js, consumer từ Redis)
- upload-service (NestJS, xử lý upload)
- frontend (NextJS)
- Mạng: tất cả cùng `bookora-network` (bridge)

### Chạy lần đầu (khuyến nghị luôn build)

```bash
docker compose up -d --build
```

### Chạy lại các lần sau (khi image đã có)

```bash
docker compose up -d
```

### Dừng và xóa containers, network (giữ dữ liệu Mongo nếu không xóa volume):

```bash
docker compose down
```

### Xóa kèm volume (mất dữ liệu Mongo & ES):

```bash
docker compose down -v
```

### Truy cập các service

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://locahost:4000/api/docs
- Mail service: http://localhost:4001
- Upload service: http://localhost:4002
- MongoDB: localhost:27018
- Redis: localhost:6380
- Elasticsearch: http://localhost:9200

### Kiểm tra logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mail-service
docker compose logs -f upload-service
docker compose logs -f elasticsearch
```

---

## Elasticsearch tích hợp tìm kiếm sách

Backend đã hỗ trợ:

- Index sách mới sau khi tạo (`indexBook`)
- Xóa document khi xóa sách (`removeFromIndex`)
- Reindex toàn bộ dữ liệu Mongo → Elasticsearch (`reindexAll`)
- Tìm kiếm qua ES với `searchKey`, fallback Mongo nếu ES lỗi.

### Bật/tắt tự động

Trong `./backend/.env.pro`:

```env
ELASTIC_NODE=http://elasticsearch:9200
ELASTIC_INDEX=books
ES_AUTO_SETUP=true
ES_REINDEX_ON_STARTUP=false
ES_REINDEX_BACKGROUND=true
```

Nếu muốn reindex ngay khi start:

```env
ES_REINDEX_ON_STARTUP=true
ES_REINDEX_BACKGROUND=false   # block đến khi xong
```

### Truy vấn tìm kiếm (ví dụ REST)

```
GET /books?search=harry&page=1&limit=10
```

- Nếu có `search` → dùng Elasticsearch.
- Nếu không → dùng MongoDB mặc định.

---

## Import dữ liệu có sẵn vào MongoDB

Sau khi khởi động hệ thống bằng Docker Compose thành công, bạn có thể import dữ liệu mẫu (tài khoản admin và user, …) như sau:

### 1. Kết nối đến MongoDB (localhost:27018)

```bash
mongosh "mongodb://localhost:27018/bookora"
# hoặc
mongo --host localhost --port 27018
```

### 2. Tải file dữ liệu mẫu

Tải dữ liệu:

- [Link tải dữ liệu mẫu MongoDB](LINK_DATA_MONGO_DB)

### 3. Import dữ liệu vào các collection

Dùng MongoDB Compass để import các JSON collection vào tương ứng.

### 4. Kiểm tra lại dữ liệu

```bash
mongosh "mongodb://localhost:27018/bookora"
db.users.find({})
db.books.find({})
```

### 5. Tài khoản mẫu có sẵn

- Admin: `admin@gmail.com` / `123456`
- User: `dukelewis2004@gmail.com` / `123456`

---

## FAQ

**1. Khi nào cần sử dụng `--build`?**

- Khi chạy lần đầu, hoặc vừa sửa Dockerfile/source code của bất cứ service nào.

**2. Làm sao reset/xóa sạch dữ liệu MongoDB để khởi động lại từ đầu?**

```bash
docker compose down -v
```

**3. Lỗi cổng đang bận?**

- Kiểm tra các cổng 3000, 4000, 4001, 4002, 27018, 6380, 9200.
- Có thể chỉnh trong `docker-compose.yml` hoặc `.env.pro`.

**4. Frontend không gọi được API?**

- Kiểm tra `NEXT_PUBLIC_API_URL` = `http://localhost:4000`.

**5. Elasticsearch không phản hồi / lỗi tìm kiếm?**

- Kiểm tra container `elasticsearch` đã chạy.
- Nếu ES hỏng → Backend tự fallback Mongo (regex search).

---

## Lệnh nhanh

```bash
# Khởi động (build)
docker compose up -d --build

# Khởi động lại (không build)
docker compose up -d

# Dừng
docker compose down

# Dừng & xóa dữ liệu (Mongo + ES)
docker compose down -v
```

---

## Code tích hợp Elasticsearch

Chi tiết xem folder Bonus/52100844_52200038_52200244_PlusPoint
