import { NestFactory } from '@nestjs/core';
import { DropboxSignModule } from './dropbox-sign/dropbox-sign.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(DropboxSignModule);
  app.enableCors({
    origin: '*',
    methods: '*',
    credentials: true,
  });
  const port = process.env.PORT || 4000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
