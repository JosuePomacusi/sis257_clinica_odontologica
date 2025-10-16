import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('citas')
export class Cita {
 
    @PrimaryGeneratedColumn('identity')
    id_cita: number;

    @Column()
    id_paciente: number;

    @Column()
    id_odontologo: number;

    @Column()
    id_tratamiento: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'time' })
    hora: string; 

    @Column('varchar', { length: 20 }) 
    estado: string;

    @Column('varchar', { nullable: true, length: 255 })
    motivo: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;

    @DeleteDateColumn({ name: 'fecha_eliminacion' })
    fechaEliminacion: Date;
}