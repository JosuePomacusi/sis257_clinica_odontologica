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

//@ApiBearerAuth()
@ApiTags('Odontologos')
@Controller('odontologos')
export class OdontologosController {
  constructor(private readonly odontologosService: OdontologosService) {}

  @Get('mi-perfil')
  async findAuthenticatedUser(@Req() req: any) {
    const userId = req.user.id; 
    return await this.odontologosService.findAuthenticatedUser(userId); 
  }

  @Post('cambiar-password')
  async cambiarPassword(
    @Req() req: any, 
    @Body() body: { passwordActual: string; nuevaPassword: string },
  ) {
    const userId = req.user.id; 
    const { passwordActual, nuevaPassword } = body;

 
    if (!passwordActual || !nuevaPassword) {
      throw new BadRequestException('Ambas contraseñas son obligatorias.');
    }


    return await this.odontologosService.cambiarPassword(userId, passwordActual, nuevaPassword);
  }

  @Post()
  create(@Body() createOdontologoDto: CreateOdontologoDto) {
    return this.odontologosService.create(createOdontologoDto);
  }


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
