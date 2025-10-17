import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOdontologoDto {
  @IsNotEmpty({ message: 'El campo Nombre es obligatorio' })
  @IsString({ message: 'El campo Nombre debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El campo Nombre excede los 100 caracteres' })
  readonly nombre: string;

  @IsNotEmpty({ message: 'El campo Especialidad es obligatorio' })
  @IsString({ message: 'El campo Especialidad debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El campo Especialidad excede los 100 caracteres' })
  readonly especialidad: string;

  @IsNotEmpty({ message: 'El campo Teléfono es obligatorio' })
  @IsString({ message: 'El campo Teléfono debe ser de tipo cadena' })
  @MaxLength(15, { message: 'El campo Teléfono excede los 15 caracteres' })
  readonly telefono: string;
}
