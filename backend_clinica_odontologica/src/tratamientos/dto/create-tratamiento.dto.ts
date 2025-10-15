import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateTratamientoDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString({ message: 'La descripción debe ser texto' })
    @MaxLength(100, { message: 'La descripción no debe superar los 100 caracteres' })
    descripcion: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'El costo es obligatorio' })
    @IsNumber({}, { message: 'El costo debe ser numérico' })
    @IsPositive({ message: 'El costo debe ser un número positivo' })
    costo: number;
}
