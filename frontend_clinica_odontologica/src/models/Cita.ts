import type { Cliente } from './Cliente'
import type { Odontologo } from './Odontologo'
import type { Servicios } from './Servicios'

export interface Cita {
  id: number
  estado: string
  fechaHoraInicio: Date
  fechaHoraFin: Date
  pacienteId: number
  odontologoId: number
  tratamientoId: number
  paciente: Paciente
  odontologo: Odontologo
  tratamiento?: Tratamientos;
}
