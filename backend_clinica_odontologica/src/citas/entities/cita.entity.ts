import { Odontologo } from "src/odontologos/entities/odontologo.entity";
import { Paciente } from "src/pacientes/entities/paciente.entity";
import { Tratamiento } from "src/tratamientos/entities/tratamiento.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('citas')
export class Cita {

    @PrimaryGeneratedColumn('identity')
    idCita: number;

    @Column()
    idPaciente: number;

    @Column()
    idOdontologo: number;

    @Column()
    idTratamiento: number;

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

    @ManyToOne(() => Paciente, paciente => paciente.citas)
    @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
    paciente: Paciente;

    @ManyToOne(() => Odontologo, odontologo => odontologo.citas)
    @JoinColumn({ name: 'id_odontologo', referencedColumnName: 'id' })
    odontologo: Odontologo;

    @ManyToOne(() => Tratamiento, tratamiento => tratamiento.citas)
    @JoinColumn({ name: 'id_tratamiento', referencedColumnName: 'id' })
    tratamiento: Tratamiento;
}