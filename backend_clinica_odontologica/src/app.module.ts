import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { OdontologosModule } from './odontologos/odontologos.module';
import { CitasModule } from './citas/citas.module';
import { RolesModule } from './roles/roles.module';
import { OdontologoServiciosModule } from './odontologo_servicios/odontologo_servicios.module';
import { HorariosModule } from './horarios/horarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '*/**/entities/*.{ts|js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    CitasModule,
    TratamientosModule,
    PacientesModule,
    OdontologosModule,
    RolesModule,
    OdontologoServiciosModule,
    HorariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
