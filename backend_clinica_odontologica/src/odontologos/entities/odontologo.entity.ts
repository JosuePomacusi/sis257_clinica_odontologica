import { Cita } from 'src/citas/entities/cita.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Cita, cita => cita.odontologo)
  citas: Cita[];
}
