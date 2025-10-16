import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente) private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
    const existe = await this.pacientesRepository.findOneBy({
      nombre: createPacienteDto.nombre.trim(),
    });
    if (existe) throw new ConflictException('El paciente ya existe');

    const paciente = this.pacientesRepository.create(createPacienteDto);
    return this.pacientesRepository.save(paciente);
  }

  async findAll(): Promise<Paciente[]> {
    return this.pacientesRepository.find();
  }

  async findOne(id: number): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOneBy({ id });
    if (!paciente) throw new NotFoundException('El paciente no existe');
    return paciente;
  }

  async update(
    id: number,
    updatePacienteDto: UpdatePacienteDto,
  ): Promise<Paciente> {
    const paciente = await this.findOne(id);
    Object.assign(paciente, updatePacienteDto);
    return this.pacientesRepository.save(paciente);
  }

  async remove(id: number): Promise<Paciente> {
    const paciente = await this.findOne(id);
    return this.pacientesRepository.softRemove(paciente);
  }
}
