import { Test, TestingModule } from '@nestjs/testing';
import { OdontologoServiciosController } from './odontologo_servicios.controller';
import { OdontologoServiciosService } from './odontologo_servicios.service';

describe('OdontologoServiciosController', () => {
  let controller: OdontologoServiciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OdontologoServiciosController],
      providers: [OdontologoServiciosService],
    }).compile();

    controller = module.get<OdontologoServiciosController>(OdontologoServiciosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
