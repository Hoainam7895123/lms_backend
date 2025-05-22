# Dùng Node 16 Alpine chính thức
FROM node:16-alpine

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy dependencies trước để tận dụng cache layer Docker
COPY package*.json ./

# Cài dependencies production
RUN npm install --only=production

# Copy source code vào sau để tránh invalidate cache
COPY . .

# Đặt biến môi trường
ENV HOST 0.0.0.0

# Mở port
EXPOSE 8000

# Chạy app
CMD ["node", "index.js"]
