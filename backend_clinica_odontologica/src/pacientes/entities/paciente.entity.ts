import { Cita } from 'src/citas/entities/cita.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100, name: 'nombre' })
  nombre: string;

  @Column('date', { name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column('varchar', { length: 20, name: 'telefono' })
  telefono: string;

  @Column('integer', { name: 'rol_id' })
  rolId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Cita, cita => cita.paciente)
  citas: Cita[];

  @ManyToOne(() => Rol, rol => rol.pacientes)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;
}
