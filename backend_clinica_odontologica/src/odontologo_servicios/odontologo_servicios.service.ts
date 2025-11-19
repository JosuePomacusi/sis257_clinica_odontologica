import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOdontologoServicioDto } from './dto/create-odontologo_servicio.dto';
import { UpdateOdontologoServicioDto } from './dto/update-odontologo_servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OdontologoServicio } from './entities/odontologo_servicio.entity';
import { In, Not, Repository } from 'typeorm';
import { Odontologo } from 'src/odontologos/entities/odontologo.entity';
import { Tratamiento } from 'src/tratamientos/entities/tratamiento.entity';

@Injectable()
export class OdontologosServiciosService {
  constructor(
    @InjectRepository(OdontologoServicio)
    private odontologoServicioRepository: Repository<OdontologoServicio>,
    @InjectRepository(Odontologo)
    private odontologoRepository: Repository<Odontologo>,
    @InjectRepository(Tratamiento)
    private tratamientoRepository: Repository<Tratamiento>,
  ) {}

  async create(
    createOdontologoServicioDto: CreateOdontologoServicioDto,
  ): Promise<OdontologoServicio> {
    const { odontologoId, tratamientoId } = createOdontologoServicioDto;

    // Verificar si el odontólogo existe
    const odontologoExistente = await this.odontologoRepository.findOneBy({
      id: odontologoId,
    });
    if (!odontologoExistente) {
      throw new NotFoundException(`El odontólogo con ID ${odontologoId} no existe`);
    }

    // Verificar si el servicio existe
    const tratamientoExistente = await this.tratamientoRepository.findOneBy({
      id: tratamientoId,
    });
    if (!tratamientoExistente) {
      throw new NotFoundException(`El servicio con ID ${tratamientoId} no existe`);
    }

    const existe = await this.odontologoServicioRepository.findOne({
      where: { odontologoId: odontologoId, tratamientoId: tratamientoId },
    });
    if (existe)
      throw new ConflictException(
        `El odontólogo ya está asociado con el servicio de nombre ${tratamientoExistente.nombre} se agrego los no repetidos. Gracias`,
      );

    const odontologoServicio = new OdontologoServicio();
    odontologoServicio.odontologoId = createOdontologoServicioDto.odontologoId;
    odontologoServicio.tratamientoId = createOdontologoServicioDto.tratamientoId;
    return this.odontologoServicioRepository.save(odontologoServicio);
  }

  async findAll(): Promise<OdontologoServicio[]> {
    return this.odontologoServicioRepository.find({
      relations: ['odontologo', 'servicio'],
    });
  }

  async findOne(id: number): Promise<OdontologoServicio> {
    if (isNaN(id)) {
      throw new BadRequestException('El id proporcionado no es válido');
    }

    try {
      const odontologoServicio = await this.odontologoServicioRepository.findOneOrFail({
        where: { id },
        relations: ['odontologo', 'servicio'],
      });
      return odontologoServicio;
    } catch (error) {
      throw new ConflictException('El odontólogo no está asociado con este servicio');
    }
  }

  async update(
    id: number,
    updateOdontologoServicioDto: UpdateOdontologoServicioDto,
  ): Promise<OdontologoServicio> {
    const odontologoServicio = await this.odontologoServicioRepository.findOneBy({ id });

    if (!odontologoServicio) {
      throw new NotFoundException('La relación no existe para este odontólogo y servicio');
    }

    // Actualizar el servicioId
    if (updateOdontologoServicioDto.tratamientoId !== undefined) {
      odontologoServicio.tratamientoId = updateOdontologoServicioDto.tratamientoId;
    }

    // Guardar los cambios
    return this.odontologoServicioRepository.save(odontologoServicio);
  }

  async remove(id: number): Promise<OdontologoServicio> {
    const odontologoServicio = await this.odontologoServicioRepository.findOneBy({ id });
    if (!odontologoServicio)
      throw new ConflictException('El odontólogo no está asociado con este servicio');
    return this.odontologoServicioRepository.softRemove(odontologoServicio);
  }

  async eliminarRelacion(odontologoId: number, tratamientoId: number): Promise<boolean> {
    console.log('Intentando eliminar relación:', { odontologoId, servicioId: tratamientoId });

    try {
      // Buscar la relación
      const relacion = await this.odontologoServicioRepository.findOne({
        where: { odontologoId, tratamientoId: tratamientoId },
      });

      if (!relacion) {
        console.error('Relación no encontrada en la base de datos');
        return false;
      }

      // Eliminar la relación
      await this.odontologoServicioRepository.remove(relacion);
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByOdontologoId(odontologoId: number): Promise<any> {
    const odontologoServicios = await this.odontologoServicioRepository.find({
      where: { odontologoId },
      relations: ['servicio'], // Solo necesitamos los servicios relacionados
    });

    // Devuelve un array vacío si no hay servicios
    return odontologoServicios.map(item => ({
      id: item.tratamiento.id,
      nombre: item.tratamiento.nombre,
      descripcion: item.tratamiento.descripcion,
      precio: item.tratamiento.precio,
      duracion: item.tratamiento.duracion,
    }));
  }

  async findServiciosDisponibles(odontologoId: number): Promise<any> {
    // Obtener los IDs de los servicios ya asignados
    const tratamientosAsignados = await this.odontologoServicioRepository.find({
      where: { odontologoId },
      relations: ['servicio'],
    });

    const tratamientosAsignadosIds = tratamientosAsignados.map(item => item.tratamiento.id);

    // Obtener todos los servicios que NO están asignados
    const tratamientosDisponibles = await this.tratamientoRepository.find({
      where: {
        id: Not(In(tratamientosAsignadosIds)), // Excluir los servicios asignados
      },
    });

    return tratamientosDisponibles;
  }
}
