import type { Odontologo } from './Odontologo'
import type { Paciente } from './Paciente'
import type { Tratamiento } from './Tratamientos'


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
  tratamiento?: Tratamiento
}
