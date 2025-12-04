import { Test, TestingModule } from '@nestjs/testing';
import { OdontologoTratamientosService } from './odontologo_tratamientos.service';

describe('OdontologoTratamientosService', () => {
  let service: OdontologoTratamientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OdontologoTratamientosService],
    }).compile();

    service = module.get<OdontologoTratamientosService>(OdontologoTratamientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
