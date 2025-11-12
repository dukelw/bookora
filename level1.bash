docker compose up -d --build

docker compose up -d

# Index book elasticsearch data
curl -X POST http://localhost:4000/books/reindex

docker compose down
