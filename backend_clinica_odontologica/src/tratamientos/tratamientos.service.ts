import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TratamientosService {
  constructor(
    @InjectRepository(Tratamiento) private tratamientosRepository: Repository<Tratamiento>,
  ) {}

  async create(createTratamientoDto: CreateTratamientoDto): Promise<Tratamiento> {
    const existente = await this.tratamientosRepository.findOneBy({
      descripcion: createTratamientoDto.descripcion.trim(),
    });
    if (existente) throw new ConflictException('Ya existe un tratamiento con esa descripción');

    const tratamiento = this.tratamientosRepository.create(createTratamientoDto);
    return this.tratamientosRepository.save(tratamiento);
  }

  async findAll(): Promise<Tratamiento[]> {
    return this.tratamientosRepository.find({ order: { descripcion: 'ASC' } });
  }

  async findOne(id: number): Promise<Tratamiento> {
    const tratamiento = await this.tratamientosRepository.findOneBy({ id });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');
    return tratamiento;
  }

  async update(id: number, updateTratamientoDto: UpdateTratamientoDto): Promise<Tratamiento> {
    const tratamiento = await this.findOne(id);
    Object.assign(tratamiento, updateTratamientoDto);
    return this.tratamientosRepository.save(tratamiento);
  }

  async remove(id: number): Promise<Tratamiento> {
    const tratamiento = await this.findOne(id);
    return this.tratamientosRepository.softRemove(tratamiento);
  }
}
