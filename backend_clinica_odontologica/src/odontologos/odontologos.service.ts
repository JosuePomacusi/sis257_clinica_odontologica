import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOdontologoDto } from './dto/create-odontologo.dto';
import { UpdateOdontologoDto } from './dto/update-odontologo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Odontologo } from './entities/odontologo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OdontologosService {
  constructor(
    @InjectRepository(Odontologo) private odontologosRepository: Repository<Odontologo>,
  ) {}

  async create(createOdontologoDto: CreateOdontologoDto): Promise<Odontologo> {
    const existe = await this.odontologosRepository.findOneBy({
      nombre: createOdontologoDto.nombre.trim(),
    });
    if (existe) throw new ConflictException('El odontólogo ya existe');

    const odontologo = this.odontologosRepository.create(createOdontologoDto);
    return this.odontologosRepository.save(odontologo);
  }

  async findAll(): Promise<Odontologo[]> {
    return this.odontologosRepository.find();
  }

  async findOne(id: number): Promise<Odontologo> {
    const odontologo = await this.odontologosRepository.findOneBy({ id });
    if (!odontologo) throw new NotFoundException('El odontólogo no existe');
    return odontologo;
  }

  async update(
    id: number,
    updateOdontologoDto: UpdateOdontologoDto,
  ): Promise<Odontologo> {
    const odontologo = await this.findOne(id);
    Object.assign(odontologo, updateOdontologoDto);
    return this.odontologosRepository.save(odontologo);
  }

  async remove(id: number): Promise<Odontologo> {
    const odontologo = await this.findOne(id);
    return this.odontologosRepository.softRemove(odontologo);
  }
}
