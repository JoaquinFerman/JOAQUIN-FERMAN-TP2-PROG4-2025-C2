const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
};
