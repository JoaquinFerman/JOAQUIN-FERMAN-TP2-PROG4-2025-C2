FROM node:20-alpine

WORKDIR /app

# Copia todo el contenido de la carpeta server al contenedor
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]