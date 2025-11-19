import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
    const buscarRepetidos = await this.pacientesRepository.findOne({
      where: [{ email: createPacienteDto.email }],
    });
    if (buscarRepetidos) {
      throw new ConflictException('El email ya existe');
    }

    const paciente = new Paciente();
    paciente.nombre = createPacienteDto.nombre.trim();
    paciente.primerApellido = createPacienteDto.primerApellido.trim();
    paciente.segundoApellido = createPacienteDto.segundoApellido.trim();
    paciente.email = createPacienteDto.email.trim();
    paciente.password = process.env.DEFAULT_PASSWORD;
    paciente.telefono = createPacienteDto.telefono.trim();
    paciente.direccion = createPacienteDto.direccion.trim();

    return this.pacientesRepository.save(paciente);
  }

  async findAll(): Promise<Paciente[]> {
    return this.pacientesRepository.find({ relations: ['rol'] });
  }

  async findOne(id: number): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOneBy({ id });
    if (!paciente) {
      throw new ConflictException('El cliente no existe');
    }
    return paciente;
  }

  async findAuthenticatedUser(id: number): Promise<Paciente> {
    // Reutilizamos findOne para obtener al cliente autenticado
    return this.findOne(id);
  }

  async update(
    id: number,
    updatePacienteDto: UpdatePacienteDto,
  ): Promise<Paciente> {
    const Paciente = await this.findOne(id);
    const pacienteUpdate = Object.assign(Paciente, updatePacienteDto);
    return this.pacientesRepository.save(pacienteUpdate);
  }

  async remove(id: number) {
    const paciente = await this.findOne(id);
    return this.pacientesRepository.softRemove(paciente);
  }

  async validate(email: string, clave: string): Promise<Paciente | null> {
    const emailOk = await this.pacientesRepository.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'password'], // Campos seleccionados
      relations: ['rol'], // Incluye la relación con el rol
    });

    if (!emailOk) {
      return null; // Retorna null si no encuentra el cliente
    }

    // Validamos la contraseña
    const isPasswordValid = await emailOk.validatePassword(clave);
    if (!isPasswordValid) {
      return null; // Retorna null si la contraseña no es válida
    }

    return emailOk; // Devuelve el cliente con el rol cargado
  }
  async cambiarPassword(
    userId: number,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<string> {
    // 1. Buscar al cliente por ID
    const cliente = await this.findOne(userId);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    // 2. Validar la contraseña actual
    const isPasswordValid = await cliente.validatePassword(passwordActual);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    // 3. Actualizar la contraseña
    cliente.password = nuevaPassword; // Asignar la nueva contraseña
    await this.pacientesRepository.save(cliente); // Guardar cambios (se hashea automáticamente en `hashPassword`)

    return 'La contraseña ha sido actualizada correctamente.';
  }
}
