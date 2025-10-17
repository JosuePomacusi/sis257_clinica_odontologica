import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
<<<<<<< HEAD
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
=======
>>>>>>> origin/pacientes

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });


  app.enableCors();

 
  const config = new DocumentBuilder()
    .setTitle('API Clínica Odontológica')
    .setDescription(
      'API para la gestión de pacientes, odontólogos, tratamientos y citas en la clínica odontológica',
    )
    .setVersion('1.0')
    .addTag('tratamientos') 
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidoc', app, documentFactory);


  await app.listen(process.env.PORT ?? 0);
  console.log(`App corriendo en ${await app.getUrl()}`);
=======
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Aplicación corriendo en ${await app.getUrl()}`);
>>>>>>> origin/pacientes
}
bootstrap();