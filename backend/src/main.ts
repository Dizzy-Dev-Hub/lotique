import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS - allow frontend to connect
  app.enableCors({
    origin: '*', // For production, replace with specific frontend URL
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lotique API')
    .setDescription('The Lotique Luxury Auction Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // If we are not running on Vercel, listen on the port
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const port = configService.get<number>('port') || 3001;
    await app.listen(port);
    console.log(`Server running on: http://localhost:${port}`);
  }

  return app.getHttpAdapter().getInstance();
}

// For Vercel
let server: any;
export default async (req: any, res: any) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
};
