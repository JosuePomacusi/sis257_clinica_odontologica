import { Test, TestingModule } from '@nestjs/testing';
import { OdontologoServiciosService } from './odontologo_servicios.service';

describe('OdontologoServiciosService', () => {
  let service: OdontologoServiciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OdontologoServiciosService],
    }).compile();

    service = module.get<OdontologosServiciosService>(OdontologosServiciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
