import { Module } from '@nestjs/common';
import { OdontologoServiciosService } from './odontologo_servicios.service';
import { OdontologoServiciosController } from './odontologo_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdontologoServicio } from './entities/odontologo_servicio.entity';
import { Odontologo } from 'src/odontologos/entities/odontologo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OdontologoServicio, Odontologo, Servicio])],
  controllers: [OdontologoServiciosController],
  providers: [OdontologoServiciosService],
})
export class OdontologoServiciosModule {}
