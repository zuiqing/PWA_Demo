FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY . .

ENV EVENT_API_PORT=3001
ENV EVENT_DB_PATH=/app/data/events.sqlite

EXPOSE 3001

CMD ["node", "index.js"]
