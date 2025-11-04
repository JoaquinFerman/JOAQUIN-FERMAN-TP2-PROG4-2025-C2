FROM node:20-alpine

WORKDIR /app

# Copia archivos del servidor desde la raíz del repositorio
COPY server/package.json server/package-lock.json ./
COPY server/tsconfig*.json server/nest-cli.json ./
COPY server/src ./src

# Instalar dependencias y build
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
