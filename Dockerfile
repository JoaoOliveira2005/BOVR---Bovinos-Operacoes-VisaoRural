FROM node:22-bookworm-slim

ENV CI=true \
    EXPO_NO_TELEMETRY=1

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY frontend/ ./
COPY backend/ /app/backend/

CMD ["sh", "-c", "npm run typecheck && npm test -- --watch=false && node node_modules/jest/bin/jest.js --config ../backend/jest.config.cjs --runInBand"]
