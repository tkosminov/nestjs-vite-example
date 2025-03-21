import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(bodyParser.json({ limit: config.get('APP_BODY_LIMIT') }));
  app.use(
    bodyParser.urlencoded({
      limit: config.get('APP_BODY_LIMIT'),
      extended: true,
      parameterLimit: config.get('APP_BODY_PARAMETER_LIMIT'),
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  if (process.env.RUN_BUILD === 'true') {
    await app.listen(8080).then(() => {
      console.log(`${config.get('APP_NAME')} listening on http://localhost:8080`);
    });
  }

  return app;
}

export const vite_node_app = createApp();
