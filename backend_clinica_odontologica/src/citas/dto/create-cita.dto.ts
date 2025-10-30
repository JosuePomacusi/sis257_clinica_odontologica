import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateCitaDto {
    @ApiProperty()
    @IsInt({ message: 'El id paciente es de tipo numerico' })
    @IsNotEmpty({ message: 'El campo id paciente es obligatorio' })
    idPaciente: number;

    @ApiProperty()
    @IsInt({ message: 'El id odontologo es de tipo numerico' })
    @IsNotEmpty({ message: 'El campo id odontologo es obligatorio' })
    idOdontologo: number;

    @ApiProperty()
    @IsInt({ message: 'El id tartamiento es de tipo numerico' })
    @IsNotEmpty({ message: 'El campo id  tratamiento es obligatorio' })
    idTratamiento: number;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty({ message: 'El campo fecha es obligatoria' })
    fecha: string;

    @ApiProperty()
    @IsString({ message: 'La descripción debe ser texto' })
    @IsNotEmpty({ message: 'El campo hora es obligatoria' })
    hora: string;

    @ApiProperty()
    @IsString({ message: 'La descripción debe ser texto' })
    @IsNotEmpty({ message: 'El campo estado es obligatorio' })
    @MaxLength(20)
    estado: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    motivo: string;
}