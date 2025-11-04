FROM node:20-alpine

WORKDIR /app

# Copia archivos necesarios
COPY package.json .
COPY package-lock.json .
COPY tsconfig*.json .
COPY nest-cli.json .
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
