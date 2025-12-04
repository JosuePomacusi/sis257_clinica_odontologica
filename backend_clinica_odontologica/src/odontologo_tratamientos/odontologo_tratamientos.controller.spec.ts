import { Test, TestingModule } from '@nestjs/testing';
import { OdontologoTratamientosController } from './odontologo_tratamientos.controller';
import { OdontologoTratamientosService } from './odontologo_tratamientos.service';

describe('OdontologoTratamientosController', () => {
  let controller: OdontologoTratamientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OdontologoTratamientosController],
      providers: [OdontologoTratamientosService],
    }).compile();

    controller = module.get<OdontologoTratamientosController>(OdontologoTratamientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
