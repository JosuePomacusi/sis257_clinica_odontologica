import { Module } from '@nestjs/common';
import { OdontologoTratamientosService } from './odontologo_tratamientos.service';
import { OdontologoTratamientosController } from './odontologo_tratamientos.controller';

@Module({
  controllers: [OdontologoTratamientosController],
  providers: [OdontologoTratamientosService],
})
export class OdontologoTratamientosModule {}
