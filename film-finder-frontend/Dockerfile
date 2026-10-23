FROM node:20 AS builder
WORKDIR /app
# Копируем зависимости
COPY package.json package-lock.json ./
# Устанавливаем зависимости проекта
RUN npm install
# Копируем весь исходный код фронтенда
COPY . .
# Собираем проект
RUN npm run build
FROM nginx:alpine
# Копируем собранный билд 
COPY --from=builder /app/dist /usr/share/nginx/html
# Открываем 80 порт внутри контейнера
EXPOSE 80
# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]