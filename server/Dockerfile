FROM node:20-alpine

WORKDIR /app

# Copia solo los archivos necesarios del backend
COPY server/package.json .
COPY server/package-lock.json .
COPY server/tsconfig* .
COPY server/src ./src

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]