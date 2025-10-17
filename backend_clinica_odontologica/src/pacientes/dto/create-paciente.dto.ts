import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePacienteDto {
  @IsNotEmpty({ message: 'El campo Nombre es obligatorio' })
  @IsString({ message: 'El campo Nombre debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El campo Nombre excede los 100 caracteres',
  })
  readonly nombre: string;

  @IsDefined({ message: 'El campo Fecha de Nacimiento es obligatorio' })
  @IsDateString(
    {},
    { message: 'El campo Fecha de Nacimiento debe ser de tipo fecha válida' },
  )
  readonly fechaNacimiento: Date;

  @IsNotEmpty({ message: 'El campo Teléfono es obligatorio' })
  @IsString({ message: 'El campo Teléfono debe ser de tipo cadena' })
  @MaxLength(15, {
    message: 'El campo Teléfono excede los 15 caracteres',
  })
  readonly telefono: string;
}
