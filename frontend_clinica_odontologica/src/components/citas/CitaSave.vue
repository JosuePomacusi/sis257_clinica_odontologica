<script setup lang="ts">
import type { Cita } from '../../models/Cita'
import type { Odontologo } from '../../models/Odontologo'
import type { Tratamiento } from '../../models/Tratamientos'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { computed, ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores'
import { DatePicker } from 'primevue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import Message from 'primevue/message'

const toast = useToast()

const ENDPOINT = 'citas'
const ODONTOLOGOS_ENDPOINT = 'odontologos'
const TRATAMIENTOS_ENDPOINT = 'tratamientos/odontologo'

const authStore = useAuthStore()

const props = defineProps({
  mostrar: Boolean,
  cita: {
    type: Object as () => Cita,
    default: () => ({}) as Cita,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const cita = ref<Cita>({ ...props.cita })
const odontologos = ref<Odontologo[]>([])
const tratamientos = ref<Tratamiento[]>([])
const horariosOcupados = ref<Array<{ fechaHoraInicio: string; fechaHoraFin: string }>>([])
const validacionFecha = ref<string>('')
const fechasDeshabilitadas = ref<Date[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) {
      validacionFecha.value = ''
      emit('close')
    }
  },
})

// Cargar odontologos al montar el componente
onMounted(async () => {
  try {
    odontologos.value = await http
      .get(ODONTOLOGOS_ENDPOINT)
      .then(response => response.data)
    
    // Construir array de fechas deshabilitadas (solo fines de semana)
    construirFechasDeshabilitadas()
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar los datos iniciales',
      life: 3000,
    })
  }
})

// Función para verificar si una fecha es fin de semana
function esFinDeSemana(fecha: Date): boolean {
  const dia = fecha.getDay()
  return dia === 0 || dia === 6 // 0 = Domingo, 6 = Sábado
}

// Función para verificar si una hora está dentro del horario laboral (8 AM - 6 PM)
function esHorarioLaboral(fecha: Date): boolean {
  const hora = fecha.getHours()
  return hora >= 8 && hora < 18
}

// Construir array de fechas deshabilitadas (solo fines de semana)
function construirFechasDeshabilitadas() {
  const fechas: Date[] = []
  
  // Agregar fines de semana para los próximos 6 meses
  const hoy = new Date()
  const seisAdelante = new Date()
  seisAdelante.setMonth(seisAdelante.getMonth() + 6)
  
  for (let d = new Date(hoy); d <= seisAdelante; d.setDate(d.getDate() + 1)) {
    if (esFinDeSemana(d)) {
      const fecha = new Date(d)
      fecha.setHours(0, 0, 0, 0)
      fechas.push(fecha)
    }
  }
  
  fechasDeshabilitadas.value = fechas
}

// Cargar citas ocupadas del odontólogo seleccionado para una fecha específica
async function cargarCitasOcupadas(odontologoId: number, fecha?: Date) {
  if (!odontologoId) return
  
  try {
    const response = await http.get(`${ENDPOINT}`)
    const todasLasCitas = response.data
    
    // Filtrar citas del odontólogo seleccionado
    const citasOdontologo = todasLasCitas.filter((c: any) => {
      if (props.modoEdicion && c.id === cita.value.id) return false
      return c.odontologoId === odontologoId || c.odontologo?.id === odontologoId
    })
    
    horariosOcupados.value = citasOdontologo.map((c: any) => ({
      fechaHoraInicio: c.fechaHoraInicio,
      fechaHoraFin: c.fechaHoraFin
    }))
  } catch (error) {
    console.error('Error al cargar citas ocupadas:', error)
    horariosOcupados.value = []
  }
}

// Verificar si un horario específico está ocupado
function horarioEstaOcupado(fechaHora: Date): boolean {
  if (!fechaHora) return false
  
  return horariosOcupados.value.some(horario => {
    const inicio = new Date(horario.fechaHoraInicio)
    const fin = new Date(horario.fechaHoraFin)
    return fechaHora >= inicio && fechaHora < fin
  })
}

// Validar disponibilidad de horario
async function validarDisponibilidad(fechaHora: Date): Promise<boolean> {
  if (!cita.value.odontologoId || !fechaHora) {
    validacionFecha.value = ''
    return true
  }
  
  // Verificar fin de semana
  if (esFinDeSemana(fechaHora)) {
    validacionFecha.value = 'No se pueden agendar citas los fines de semana'
    return false
  }
  
  // Verificar horario laboral (8 AM - 6 PM)
  if (!esHorarioLaboral(fechaHora)) {
    validacionFecha.value = 'Las citas deben ser entre las 8:00 AM y las 6:00 PM'
    return false
  }
  
  // Verificar horario ocupado
  if (horarioEstaOcupado(fechaHora)) {
    validacionFecha.value = 'Este horario ya está ocupado. Por favor, seleccione otro.'
    return false
  }
  
  validacionFecha.value = ''
  return true
}

// Cargar servicios al cambiar el odontólogo seleccionado
watch(
  () => cita.value.odontologoId,
  async odontologoId => {
    if (odontologoId) {
      try {
        tratamientos.value = await http
          .get(`${TRATAMIENTOS_ENDPOINT}/${odontologoId}`)
          .then(response => response.data)

        // Cargar citas ocupadas del odontólogo
        await cargarCitasOcupadas(odontologoId)

        // Si hay un servicio preseleccionado, asegúrate de que esté reflejado en los servicios cargados
        if (!tratamientos.value.some(s => s.id === cita.value.tratamientoId)) {
          cita.value.tratamientoId = 0 // Restablecer si el servicio no pertenece al odontólogo actual
        }
      } catch (error) {
        console.error('Error al cargar tratamientos:', error)
        tratamientos.value = []
      }
    } else {
      tratamientos.value = []
      horariosOcupados.value = []
    }
  },
)

// Observa cambios en props.cita y actualiza cita
watch(
  () => props.cita,
  newCita => {
    cita.value = { ...newCita }
  },
  { immediate: true }, // Esto asegura que se sincronice al cargar por primera vez
)

watch(
  () => cita.value.tratamientoId,
  async tratamientoId => {
    if (tratamientoId && cita.value.fechaHoraInicio) {
      // Solo calcular si hay servicio y fecha de inicio definidos
      const tratamiento = tratamientos.value.find(s => s.id === tratamientoId)
      if (tratamiento) {
        calcularFechaHoraFin(Number(tratamiento.duracion))
      }
    }
  },
)

watch(
  () => cita.value.fechaHoraInicio,
  async (fechaHoraInicio) => {
    if (fechaHoraInicio) {
      // Validar disponibilidad
      await validarDisponibilidad(new Date(fechaHoraInicio))
      
      // Calcular fecha de fin si hay tratamiento seleccionado
      if (
        cita.value.tratamientoId &&
        (!cita.value.fechaHoraFin ||
          new Date(cita.value.fechaHoraFin).getTime() !==
            new Date(fechaHoraInicio).getTime())
      ) {
        const tratamiento = tratamientos.value.find(
          s => s.id === cita.value.tratamientoId,
        )
        if (tratamiento) {
          calcularFechaHoraFin(Number(tratamiento.duracion))
        }
      }
    } else {
      validacionFecha.value = ''
    }
  },
)

function calcularFechaHoraFin(duracionMinutos: number) {
  const fechaInicio = new Date(cita.value.fechaHoraInicio)
  fechaInicio.setSeconds(0, 0) // Ajustar segundos y milisegundos

  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)
  fechaFin.setSeconds(0, 0) // Ajustar segundos y milisegundos

  // Solo actualiza si es necesario
  if (
    !cita.value.fechaHoraFin ||
    new Date(cita.value.fechaHoraFin).getTime() !== fechaFin.getTime()
  ) {
    cita.value.fechaHoraInicio = fechaInicio
    cita.value.fechaHoraFin = fechaFin
  }
}

function getOdontologoLabel(odontologo: Odontologo) {
  return odontologo ? `${odontologo.nombre} ${odontologo.primerApellido}` : ''
}

// Función para cargar servicios
async function cargarTratamientos(odontologoId: number) {
  tratamientos.value = await http
    .get(`${TRATAMIENTOS_ENDPOINT}/${odontologoId}`)
    .then(response => response.data)

  // Validar si el servicio seleccionado aún está disponible
  if (cita.value.tratamientoId) {
    const tratamientoSeleccionado = tratamientos.value.find(
      s => s.id === cita.value.tratamientoId,
    )
    if (!tratamientoSeleccionado) {
      cita.value.tratamientoId = 0 // Limpia el servicio si ya no está disponible
    }
  }
}
// Observa cambios en odontologoId para cargar servicios
watch(
  () => cita.value.odontologoId,
  async odontologoId => {
    if (odontologoId) {
      await cargarTratamientos(odontologoId)
    } else {
      tratamientos.value = []
    }
  },
)

// Cargar datos al abrir el modal en modo edición
watch(
  () => props.cita,
  async newCita => {
    cita.value = { ...newCita }

    // Si está en modo edición, carga los servicios asociados al odontólogo seleccionado
    if (props.modoEdicion && cita.value.odontologoId) {
      await cargarTratamientos(cita.value.odontologoId)
      await cargarCitasOcupadas(cita.value.odontologoId)
    }
  },
  { immediate: true }, // Asegura la ejecución al iniciar
)

async function handleSave() {
  try {
    if (!authStore.user) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El usuario no está autenticado',
        life: 3000,
      })
      return
    }

    // Validaciones
    if (!cita.value.odontologoId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, seleccione un odontólogo',
        life: 3000,
      })
      return
    }

    if (!cita.value.tratamientoId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, seleccione un tratamiento',
        life: 3000,
      })
      return
    }

    if (!cita.value.fechaHoraInicio || !cita.value.fechaHoraFin) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, seleccione las fechas de inicio y fin',
        life: 3000,
      })
      return
    }

    // Validar disponibilidad final
    const esDisponible = await validarDisponibilidad(new Date(cita.value.fechaHoraInicio))
    if (!esDisponible) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: validacionFecha.value,
        life: 4000,
      })
      return
    }

    const pacienteId = authStore.user.id

    // Crear objeto con el formato correcto para el backend
    const fechaInicio = new Date(cita.value.fechaHoraInicio)
    const fechaFin = new Date(cita.value.fechaHoraFin)

    const body = {
      clienteId: pacienteId,
      odontologoId: cita.value.odontologoId,
      servicioId: cita.value.tratamientoId, // Backend espera servicioId
      estado: cita.value.estado || 'Pendiente',
      fechaHoraInicio: fechaInicio.toISOString(),
      fechaHoraFin: fechaFin.toISOString(),
    }

    if (props.modoEdicion && cita.value.id) {
      await http.patch(`${ENDPOINT}/${cita.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita actualizada correctamente',
        life: 3000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita creada correctamente',
        life: 3000,
      })
    }
    
    emit('guardar')
    cita.value = {} as Cita
    validacionFecha.value = ''
    dialogVisible.value = false
  } catch (error: any) {
    console.error('Error al guardar:', error)
    
    let mensaje = 'Error al guardar la cita'
    
    if (error.response?.status === 409) {
      mensaje = 'El horario seleccionado no está disponible'
    } else if (error.response?.data?.message) {
      mensaje = error.response.data.message
    } else if (error.message) {
      mensaje = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 4000,
    })
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="custom-dialog"
      style="width: 600px; max-width: 95vw"
    >
      <template #header>
        <span class="dialog-header-text">
          {{ props.modoEdicion ? 'Editar Cita' : 'Crear Nueva Cita' }}
        </span>
      </template>

      <div class="form-container">
        <!-- Información del Profesional -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-user-plus"></i>
            Profesional y Tratamiento
          </h3>

          <!-- Odontólogo -->
          <div class="form-field">
            <label for="odontologo" class="form-label">
              <i class="pi pi-user-md"></i>
              Odontólogo
            </label>
            <Select
              id="odontologo"
              v-model="cita.odontologoId"
              :options="odontologos"
              :optionLabel="getOdontologoLabel"
              optionValue="id"
              placeholder="Seleccione un odontólogo"
              class="form-input"
            />
          </div>

          <!-- Tratamiento -->
          <div class="form-field">
            <label for="tratamiento" class="form-label">
              <i class="pi pi-heart"></i>
              Tratamiento
            </label>
            <Select
              id="tratamiento"
              v-model="cita.tratamientoId"
              :options="tratamientos"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Seleccione un tratamiento"
              class="form-input"
            />
          </div>
        </div>

        <!-- Información de Fechas -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-calendar"></i>
            Programación
          </h3>

          <!-- Información de horario laboral -->
          <div class="info-box">
            <i class="pi pi-info-circle"></i>
            <span>
              <strong>Horario de atención:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM
            </span>
          </div>

          <!-- Fecha de inicio -->
          <div class="form-field">
            <label for="fechaInicio" class="form-label">
              <i class="pi pi-calendar-plus"></i>
              Fecha y Hora de Inicio
            </label>
            <DatePicker
              id="fechaInicio"
              v-model="cita.fechaHoraInicio"
              showIcon
              :showTime="true"
              :disabledDates="fechasDeshabilitadas"
              :minDate="new Date()"
              dateFormat="yy-mm-dd"
              placeholder="Selecciona fecha y hora de inicio"
              class="form-input"
              :disabled="!cita.odontologoId"
            />
            <small v-if="!cita.odontologoId" class="text-muted">
              Primero seleccione un odontólogo
            </small>
            <Message 
              v-if="validacionFecha" 
              severity="error" 
              :closable="false"
              class="mt-2"
            >
              {{ validacionFecha }}
            </Message>
          </div>

          <!-- Fecha de fin -->
          <div class="form-field">
            <label for="fechaFin" class="form-label">
              <i class="pi pi-calendar-minus"></i>
              Fecha y Hora de Fin
            </label>
            <InputText
              id="fechaFin"
              :value="new Date(cita.fechaHoraFin).toLocaleString()"
              disabled
              class="form-input"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            class="btn-cancel"
            @click="dialogVisible = false"
          />
          <Button
            type="button"
            label="Guardar"
            icon="pi pi-check"
            class="btn-save"
            @click="handleSave"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.custom-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.dialog-header-text {
  color: white !important;
  font-size: 1.25rem;
  font-weight: 600;
}

.custom-dialog :deep(.p-dialog-header-icon) {
  color: white !important;
}

.custom-dialog :deep(.p-dialog-header-icon):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.custom-dialog :deep(.p-dialog-content) {
  padding: 2rem;
  background-color: #f8f9fa;
  max-height: 70vh;
  overflow-y: auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #667eea;
  font-size: 1.2rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

/* Estilos globales para todos los inputs */
:deep(.p-inputtext) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(input) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(.p-select) {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

:deep(.p-select:hover) {
  border-color: #cbd5e0;
}

:deep(.p-select:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.p-datepicker) {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

:deep(.p-datepicker:hover) {
  border-color: #cbd5e0;
}

:deep(.p-inputtext::placeholder),
:deep(input::placeholder) {
  color: #9ca3af !important;
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #9e9e9e;
  border-color: #e0e0e0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel {
  background-color: #e2e8f0 !important;
  color: #4a5568 !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #cbd5e0 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Scrollbar personalizada */
.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar {
  width: 8px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}

/* Caja de información */
.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.info-box i {
  color: #2196f3;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.info-box span {
  color: #1565c0;
}

/* Estilos para mensajes de validación */
.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-style: italic;
}

.mt-2 {
  margin-top: 0.5rem;
}

:deep(.p-message) {
  margin: 0;
  font-size: 0.875rem;
}

:deep(.p-message .p-message-text) {
  font-size: 0.875rem;
}

/* Estilo para campos deshabilitados */
:deep(.p-datepicker:disabled),
:deep(.p-datepicker.p-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estilo para fechas deshabilitadas en el calendario */
:deep(.p-datepicker table td.p-disabled span) {
  background-color: #f5f5f5 !important;
  color: #9e9e9e !important;
  text-decoration: line-through;
  cursor: not-allowed;
}

:deep(.p-datepicker table td.p-disabled span:hover) {
  background-color: #f5f5f5 !important;
}

/* Animaciones */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-container {
  animation: slideIn 0.3s ease-out;
}
</style>
