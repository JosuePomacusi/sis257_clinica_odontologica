import { IsInt, IsString, IsNotEmpty, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateCitaDto {

    @IsInt()
    @IsNotEmpty()
    id_paciente: number;

    @IsInt()
    @IsNotEmpty()
    id_odontologo: number;

    @IsInt()
    @IsNotEmpty()
    id_tratamiento: number;

    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @IsString()
    @IsNotEmpty()
    hora: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    estado: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    motivo: string;
}