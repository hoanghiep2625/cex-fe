FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json npm-lock.yaml* ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
