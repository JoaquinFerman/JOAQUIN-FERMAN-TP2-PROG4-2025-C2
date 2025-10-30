FROM node:20-alpine

WORKDIR /app

# Copia solo los archivos del backend
COPY . .

# Instala dependencias
RUN npm install

# Compila el proyecto NestJS
RUN npm run build

# Expone el puerto NestJS (por defecto 3000)
EXPOSE 3000

# Comando para iniciar el backend
CMD ["npm", "run", "start:prod"]