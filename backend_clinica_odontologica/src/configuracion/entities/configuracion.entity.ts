import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn, // ⬅️ Usamos PrimaryColumn
  UpdateDateColumn,
} from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryColumn('varchar', { length: 100, nullable: false })
  clave: string; 

  @Column('varchar', { length: 255, nullable: false })
  valor: string; 

  @Column('varchar', { length: 255, nullable: true })
  descripcion: string; 
  
  // --- Auditoría y Soft Delete ---
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', select: false })
  fechaEliminacion: Date;
}