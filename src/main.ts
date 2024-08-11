import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const { httpAdapter } = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService<AllConfigType>);

  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('YARM Api docs')
    .setDescription('The YARM API description')
    .addBearerAuth()
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
