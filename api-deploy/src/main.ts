import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 4000);
  console.log(`YieldGuard API running on port ${process.env.PORT || 4000}`);
}
bootstrap();
