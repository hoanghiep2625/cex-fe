FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ENABLE_TURBOPACK=false npm run build

EXPOSE 3000
CMD ["npm", "start"]
