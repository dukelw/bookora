# Build images local (vì docker stack deploy không đọc khóa build)

docker build -t bookora-backend:latest ./backend

docker build -t bookora-mail-service:latest ./mail-service

docker build -t bookora-frontend:latest ./frontend

# Khởi tạo Swarm và deploy

docker swarm init

docker stack deploy -c docker-stack.yml bookora

# Kiểm tra và truy cập

# Xem services: 
docker stack services bookora

# Xem tasks: 
docker service ps bookora_backend

# Truy cập:

Frontend: http://localhost:3000
Backend qua Nginx LB: http://localhost:4000

# Scale, rolling update, rollback

# Scale backend lên 5 replicas:
docker service scale bookora_backend=5

# Rolling update (sau khi build image mới):
docker service update --image bookora-backend:latest bookora_backend

# Xóa stack:
docker stack rm bookora