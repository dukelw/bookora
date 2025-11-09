# Bookora - Hướng dẫn triển khai 3 cấp độ (Docker Compose → LB/Message broker → Docker Swarm)

Dự án Bookora được tổ chức theo 3 cấp độ triển khai tăng dần về độ phức tạp:

- Level 1: Chạy đơn giản bằng Docker Compose (frontend + backend + database + redis).
- Level 2: Mở rộng với scale backend và cân bằng tải qua Nginx; thêm giao tiếp bất đồng bộ qua Redis.
- Level 3: Triển khai trên Docker Swarm (orchestration), scale/rolling-update/rollback.

Hình cấu trúc thư mục:

- backend/
- frontend/
- mail-service/
- docker-compose.yml
- docker-compose.level2.yml
- docker-stack.yml
- nginx.conf
- level1.bash, level2.bash, level3.bash (có thể chạy thay cho lệnh thủ công)

Các file compose/config đã được chuẩn bị sẵn trong repo:

- Level 1: docker-compose.yml
- Level 2: docker-compose.level2.yml
- Level 3: docker-stack.yml
- Nginx config: nginx.conf

Lưu ý: Các file .env.pro cho từng service nằm trong:

- ./backend/.env.pro
- ./frontend/.env.pro
- ./mail-service/.env.pro

Cần kiểm tra các biến môi trường tối thiểu:

- backend: MONGODB_URI, REDIS_HOST, PORT (mặc định 4000)
- frontend: NEXT_PUBLIC_API_URL (ví dụ http://localhost:4000), PORT (mặc định 3000)
- mail-service: REDIS_HOST, PORT (mặc định 4001)

## Yêu cầu hệ thống

- Docker Desktop hoặc Docker Engine 20.10+
- Docker Compose V2 (có sẵn trong Docker Desktop mới)
- Với Level 3: bật/khởi tạo Docker Swarm (single-node cũng được cho mục đích demo)

---

## Level 1 — Docker Compose (cơ bản)

Thành phần:

- mongo (database): MongoDB 6, volume `mongo_data`, map cổng host 27018 → container 27017
- redis (message broker đơn giản)
- backend (Node.js)
- mail-service (dịch vụ gửi mail/consumer từ Redis)
- frontend (NextJS)
- Mạng: tất cả cùng `bookora-network` (bridge)

File: `docker-compose.yml`

Chạy lần đầu (khuyến nghị luôn build để chắc chắn bắt kịp thay đổi Dockerfile/source):

```bash
docker compose up -d --build
```

Chạy lại các lần sau (khi KHÔNG đổi Dockerfile/context và đã có image):

```bash
docker compose up -d
```

Dừng và xóa containers, network (giữ data của Mongo nếu không xóa volume):

```bash
docker compose down
```

Xóa kèm volume (mất dữ liệu Mongo):

```bash
docker compose down -v
```

Truy cập:

- Frontend: http://localhost:3000
- Backend (trực tiếp): http://localhost:4000
- MongoDB: localhost:27018 (client bên ngoài nếu cần)
- Redis: localhost:6380

Kiểm tra logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mail-service
```

---

## Level 2 — Scale + Load Balancer + Messaging (Compose nâng cao)

Bổ sung:

- Scale backend thành nhiều container (ví dụ 3 replicas).
- Thêm Nginx làm reverse proxy/cân bằng tải.
- Giữ Redis để minh họa giao tiếp bất đồng bộ (backend publish → mail-service consume).

File: `docker-compose.level2.yml`

Chạy (vừa build vừa scale 3 replicas cho backend):

```bash
docker compose -f docker-compose.level2.yml up -d --build --scale backend=3
```

Lần sau (giữ scale cũ, không build lại):

```bash
docker compose -f docker-compose.level2.yml up -d
```

Dừng:

```bash
docker compose -f docker-compose.level2.yml down
```

Truy cập:

- Frontend: http://localhost:3000
- Backend qua Nginx LB: http://localhost:4000

Nginx config mẫu (file `nginx.conf` đã có sẵn):

```nginx
upstream backend_app {
    server backend:4000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Giải thích nhanh:

- Ở Level 2, `backend` không publish port ra ngoài. Các bản sao backend giao tiếp nội bộ trong mạng `bookora-network`.
- Nginx publish cổng 4000 (host) → 80 (container), reverse proxy vào `backend:4000`.
- Giao tiếp bất đồng bộ: Backend có thể đẩy job sang Redis, `mail-service` lắng nghe và xử lý (ví dụ gửi email welcome, xử lý file, gửi thông báo…).

---

## Level 3 — Docker Swarm (Orchestration)

Swarm mang lại:

- Scale dễ dàng, rolling update, rollback
- Load balancing qua VIP (Virtual IP) nội bộ cho mỗi service
- Overlay network giữa các node (nếu multi-node)

File: `docker-stack.yml`

Vì `docker stack deploy` không hỗ trợ khóa `build`, trước khi deploy bạn cần build sẵn các image local:

```bash
# Build local images
docker build -t bookora-backend:latest ./backend
docker build -t bookora-mail-service:latest ./mail-service
docker build -t bookora-frontend:latest ./frontend
```

Khởi tạo Swarm (nếu chưa có):

```bash
docker swarm init
```

Triển khai stack:

```bash
docker stack deploy -c docker-stack.yml bookora
```

Kiểm tra:

```bash
docker stack services bookora
docker service ps bookora_backend
```

Truy cập:

- Frontend: http://localhost:3000
- Backend qua Nginx (LB của Swarm + Nginx): http://localhost:4000

Scale/rolling update/rollback:

```bash
# Scale backend lên 5 replicas
docker service scale bookora_backend=5

# Rolling update (sau khi build image mới với cùng tag)
docker service update --image bookora-backend:latest bookora_backend

# Xóa stack
docker stack rm bookora
```

Ghi chú:

- Trong `docker-stack.yml`, mạng `bookora-net` dùng `driver: overlay`.
- `backend` đặt `deploy.replicas: 3` (mặc định). Swarm VIP sẽ cân bằng tải request đến các task backend.

---

## Câu hỏi thường gặp (FAQ)

1. Khi nào cần `--build`?

- `docker compose up -d` sẽ tự động build nếu CHƯA có image. Tuy nhiên nó sẽ KHÔNG rebuild nếu Dockerfile/context đã thay đổi.
- Dùng `docker compose up -d --build` trong các tình huống:
  - Lần chạy đầu tiên (an toàn).
  - Sau khi sửa Dockerfile hoặc mã nguồn ảnh hưởng đến build context và bạn muốn chắc chắn rebuild.
- Nếu bạn đã build rồi và không thay đổi gì, `docker compose up -d` là đủ.

2. Xóa sạch dữ liệu Mongo để chạy lại từ đầu?

```bash
docker compose down -v
# hoặc với level2
docker compose -f docker-compose.level2.yml down -v
```

3. Lỗi cổng đang bận?

- Đảm bảo các cổng 3000, 4000, 27018, 6380 không bị service khác chiếm.
- Đổi cổng trong compose nếu cần.

4. Frontend không gọi được API?

- Kiểm tra biến `NEXT_PUBLIC_API_URL` ở `./frontend/.env.pro`.
  - Level 1/2 (Compose): http://localhost:4000
  - Level 3 (Swarm): vẫn http://localhost:4000 (Nginx proxy).
- Kiểm tra CORS ở backend (nếu có).

---

## Lệnh nhanh theo từng level

Level 1:

```bash
# Lần đầu khuyến nghị
docker compose up -d --build
# Lần sau
docker compose up -d
# Dừng
docker compose down
```

Level 2:

```bash
# Chạy + build + scale backend=3
docker compose -f docker-compose.level2.yml up -d --build --scale backend=3

# Dừng
docker compose -f docker-compose.level2.yml down
```

Level 3 (Swarm):

```bash
# Build images (bắt buộc trước khi deploy)
docker build -t bookora-backend:latest ./backend
docker build -t bookora-mail-service:latest ./mail-service
docker build -t bookora-frontend:latest ./frontend

# Khởi tạo Swarm và deploy
docker swarm init
docker stack deploy -c docker-stack.yml bookora

# Kiểm tra
docker stack services bookora
docker service ps bookora_backend

# Scale
docker service scale bookora_backend=5

# Rolling update (sau khi build image mới)
docker service update --image bookora-backend:latest bookora_backend

# Xóa stack
docker stack rm bookora
```

---

## Phụ lục: Cấu hình Nginx (level 2/3)

File `nginx.conf` (đã có trong repo):

```nginx
upstream backend_app {
    server backend:4000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Level 2: Nginx map `./nginx.conf` vào `/etc/nginx/conf.d/default.conf` và publish cổng `4000:80`.
- Level 3: `docker-stack.yml` dùng `configs` để mount `nginx.conf` vào container.
-