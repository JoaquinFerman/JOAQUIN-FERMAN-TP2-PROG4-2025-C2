FROM node:20-alpine

WORKDIR /app

# Copia solo el contenido de la carpeta server
COPY . .

RUN cd server && npm install
RUN cd server && npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]