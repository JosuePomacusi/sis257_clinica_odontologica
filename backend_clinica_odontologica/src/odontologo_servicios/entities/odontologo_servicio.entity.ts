
import { Tratamiento } from 'src/tratamientos/entities/tratamiento.entity';
import { Odontologo } from '../../odontologos/entities/odontologo.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('odontologo_servicios')
export class OdontologoServicio {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'odontologo_id' })
  odontologoId: number;

  @Column('integer', { name: 'servicio_id' })
  tratamientoId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', select: false })
  fechaEliminacion: Date;

  @ManyToOne(() => Odontologo, odontologo => odontologo.odontologo_servicios)
  @JoinColumn({ name: 'odontologo_id', referencedColumnName: 'id' })
  odontologo: Odontologo;

  @ManyToOne(() => Tratamiento, tratamiento => tratamiento.odontologo_servicios)
  @JoinColumn({ name: 'tratamiento_id', referencedColumnName: 'id' })
  tratamiento: Tratamiento;
}
