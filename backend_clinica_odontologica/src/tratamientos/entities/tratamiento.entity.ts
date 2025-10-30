import { Cita } from "src/citas/entities/cita.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tratamientos')
export class Tratamiento {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column('varchar', { length: 100 })
    descripcion: string;

    @Column('decimal', { precision: 9, scale: 2 })
    costo: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;

    @DeleteDateColumn({ name: 'fecha_eliminacion' })
    fechaEliminacion: Date;

    @OneToMany(() => Cita, cita => cita.tratamiento)
    citas: Cita[];
}
