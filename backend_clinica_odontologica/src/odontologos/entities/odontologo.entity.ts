import { Cita } from 'src/citas/entities/cita.entity';
import { Horario } from 'src/horarios/entities/horario.entity';
import { OdontologoServicio } from 'src/odontologo_servicios/entities/odontologo_servicio.entity';
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

@Entity('odontologos')
export class Odontologo {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100, name: 'nombre' })
  nombre: string;

  @Column('varchar', { length: 100, name: 'especialidad' })
  especialidad: string;

  @Column('varchar', { length: 15, name: 'telefono' })
  telefono: string;

  @Column('integer', { name: 'rol_id' })
  rolId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Cita, cita => cita.odontologo)
  citas: Cita[];

  @OneToMany(() => Horario, horario => horario.odontologo)
  horarios: Horario[];

  @OneToMany(() => OdontologoServicio, odontologoServicio => odontologoServicio.odontologo)
  odontologo_servicios: OdontologoServicio[];

  @ManyToOne(() => Rol, rol => rol.odontologos)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;
}
