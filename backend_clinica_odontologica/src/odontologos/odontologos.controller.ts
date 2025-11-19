import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OdontologosService } from './odontologos.service';
import { CreateOdontologoDto } from './dto/create-odontologo.dto';
import { UpdateOdontologoDto } from './dto/update-odontologo.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Odontologos')
@Controller('odontologos')
export class OdontologosController {
  constructor(private readonly odontologosService: OdontologosService) {}

  @Get('mi-perfil')
  async findAuthenticatedUser(@Req() req: any) {
    const userId = req.user.id; // Extrae el ID del usuario autenticado desde el token
    return await this.odontologosService.findAuthenticatedUser(userId); // Retorna el odontologo autenticado
  }

  @Post('cambiar-password')
  async cambiarPassword(
    @Req() req: any, // Usuario autenticado a través del token JWT
    @Body() body: { passwordActual: string; nuevaPassword: string }, // Campos enviados en el cuerpo
  ) {
    const userId = req.user.id; // ID del usuario autenticado
    const { passwordActual, nuevaPassword } = body;

    // Validar que los campos no estén vacíos
    if (!passwordActual || !nuevaPassword) {
      throw new BadRequestException('Ambas contraseñas son obligatorias.');
    }

    // Llama al servicio para cambiar la contraseña
    return await this.odontologosService.cambiarPassword(userId, passwordActual, nuevaPassword);
  }

  @Post()
  create(@Body() createOdontologoDto: CreateOdontologoDto) {
    return this.odontologosService.create(createOdontologoDto);
  }

  // Método público: No tiene @ApiBearerAuth ni @UseGuards
  @Get()
  findAll() {
    return this.odontologosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.odontologosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOdontologoDto: UpdateOdontologoDto) {
    return this.odontologosService.update(+id, updateOdontologoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.odontologosService.remove(+id);
  }
}
