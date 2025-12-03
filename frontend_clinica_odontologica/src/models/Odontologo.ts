
export interface Especialidad {
  id: number
  nombre: string
  descripcion: string
  fechaCreacion: string
  fechaModificacion: string
  fechaEliminacion?: string
}

export interface Odontologo {
  tratamientos: any
  id: number
  nombre: string
  primerApellido: string
  segundoApellido: string
  email: string
  password: string
  telefono: string
  direccion: string
  especialidad: Especialidad
  imagen?: string
  rol_id?: number
  fechaCreacion?: string
  fechaModificacion?: string
  rol?: {
    id: number
    nombre: string
    fechaCreacion: string
    fechaModificacion: string
  }
}
