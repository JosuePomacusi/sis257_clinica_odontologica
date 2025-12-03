import { PartialType } from '@nestjs/swagger';
import { CreateEspecialidadeDto } from './create-especialidades.dto';

export class UpdateEspecialidadeDto extends PartialType(CreateEspecialidadeDto) {}
