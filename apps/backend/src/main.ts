import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('Cotton 低代码平台 API')
    .setDescription('C端移动端低代码平台后端接口')
    .setVersion('1.0')
    .addTag('pages', '页面管理')
    .addTag('templates', '模板管理')
    .addTag('components', '组件管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
