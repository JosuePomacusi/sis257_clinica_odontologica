import { Module } from '@nestjs/common';
import { OdontologosServiciosService } from './odontologo_servicios.service';
import { OdontologosServiciosController } from './odontologo_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdontologoServicio } from './entities/odontologo_servicio.entity';
import { Odontologo } from 'src/odontologos/entities/odontologo.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OdontologoServicio, Odontologo, Servicio])],
  controllers: [OdontologosServiciosController],
  providers: [OdontologosServiciosService],
})
export class OdontologoServiciosModule {}
