import { Module } from '@nestjs/common';
import { OdontologosService } from './odontologos.service';
import { OdontologosController } from './odontologos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Odontologo } from './entities/odontologo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Odontologo])],
  controllers: [OdontologosController],
  providers: [OdontologosService],
})
export class OdontologosModule {}
