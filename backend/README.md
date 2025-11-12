# Bookora - Development Mode Startup Guide

# Bookora - Hướng dẫn chạy dự án ở chế độ phát triển

---

## English

### Prerequisites

- **Node.js v22.x** and npm installed

  > You must use Node.js 22.x for development. [Download Node.js 22.x here](https://nodejs.org/en/download/current/)
  - You can check your versions:
    ```bash
    node -v    # Should output v22.x.x
    npm -v     # Should be compatible with Node.js 22
    ```
  - If you use [nvm](https://github.com/nvm-sh/nvm), run:
    ```bash
    nvm install 22
    nvm use 22
    ```

- Docker & Docker Compose installed

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/dukelw/bookora.git
   cd bookora
   ```

2. **Setup and run Backend (NestJS)**

   ```bash
   cd backend
   npm install
   docker compose -f docker-compose.elasticsearch.yml up -d
   # Wait until ElasticSearch is up and running
   curl -X POST http://localhost:4000/books/reindex
   npm run start:dev
   ```

3. **Setup and run Mail Service (Redis Bull Queue)**

   ```bash
   cd ../mail-service
   docker compose up -d
   npm run start:dev
   ```

4. **Setup and run Frontend (Next.js)**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Tiếng Việt

### Yêu cầu

- **Đã cài đặt Node.js phiên bản 22.x**

  > Bắt buộc sử dụng Node.js 22.x cho môi trường phát triển. [Tải Node.js 22.x tại đây](https://nodejs.org/en/download/current/)
  - Kiểm tra phiên bản:
    ```bash
    node -v    # Kết quả phải là v22.x.x
    npm -v     # Phù hợp với Node.js 22
    ```
  - Nếu dùng [nvm](https://github.com/nvm-sh/nvm), hãy dùng:
    ```bash
    nvm install 22
    nvm use 22
    ```

- Đã cài đặt Docker & Docker Compose

### Các bước

1. **Clone dự án**

   ```bash
   git clone https://github.com/dukelw/bookora.git
   cd bookora
   ```

2. **Setup và chạy Backend (NestJS)**

   ```bash
   cd backend
   npm install
   docker compose -f docker-compose.elasticsearch.yml up -d
   # Đợi ElasticSearch chạy xong
   curl -X POST http://localhost:4000/books/reindex
   npm run start:dev
   ```

3. **Setup và chạy Mail Service (hàng đợi Redis Bull)**

   ```bash
   cd ../mail-service
   docker compose up -d
   npm run start:dev
   ```

4. **Setup và chạy Frontend (Next.js)**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---
