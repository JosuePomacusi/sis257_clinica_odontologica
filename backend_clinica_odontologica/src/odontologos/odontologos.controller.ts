import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OdontologosService } from './odontologos.service';
import { CreateOdontologoDto } from './dto/create-odontologo.dto';
import { UpdateOdontologoDto } from './dto/update-odontologo.dto';

@Controller('odontologos')
export class OdontologosController {
  constructor(private readonly odontologosService: OdontologosService) {}

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
