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

const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) emit('close')
  },
})

// cargar odontologos al montar el componente
onMounted(async () => {
  odontologos.value = await http
    .get(ODONTOLOGOS_ENDPOINT)
    .then(response => response.data)
})

// Cargar servicios al cambiar el odontólogo seleccionado
watch(
  () => cita.value.odontologoId,
  async odontologoId => {
    if (odontologoId) {
      tratamientos.value = await http
        .get(`${TRATAMIENTOS_ENDPOINT}/${odontologoId}`)
        .then(response => response.data)

      // Si hay un servicio preseleccionado, asegúrate de que esté reflejado en los servicios cargados
      if (!tratamientos.value.some(s => s.id === cita.value.tratamientoId)) {
        cita.value.tratamientoId = 0 // Restablecer si el servicio no pertenece al odontólogo actual
      }
    } else {
      tratamientos.value = []
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
  fechaHoraInicio => {
    if (
      fechaHoraInicio &&
      cita.value.tratamientoId &&
      (!cita.value.fechaHoraFin ||
        new Date(cita.value.fechaHoraFin).getTime() !==
        new Date(fechaHoraInicio).getTime())
    ) {
      // Evita recalcular si la fechaHoraFin ya es correcta
      const tratamiento = tratamientos.value.find(s => s.id === cita.value.tratamientoId)
      if (tratamiento) {
        calcularFechaHoraFin(Number(tratamiento.duracion))
      }
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
  return odontologo ? `${odontologo.nombre} ${odontologo.primerApellido}` : '';
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
    }
  },
  { immediate: true }, // Asegura la ejecución al iniciar
)

async function handleSave() {
  try {
    if (!authStore.user) {
      throw new Error('El usuario no está autenticado.')
    }

    const pacienteId = authStore.user.id

    // Verificar que las fechas estén seleccionadas
    if (!cita.value.fechaHoraInicio || !cita.value.fechaHoraFin) {
      throw new Error('Por favor, selecciona las fechas de inicio y fin.')
    }

    const body = {
      pacienteId: pacienteId,
      odontologoId: cita.value.odontologoId,
      tratamientoId: cita.value.tratamientoId,
      estado: cita.value.estado || 'Pendiente', // Valor predeterminado para estado
      fechaHoraInicio: new Date(cita.value.fechaHoraInicio).toISOString(),
      fechaHoraFin: new Date(cita.value.fechaHoraFin).toISOString(),
    }

    if (props.modoEdicion && cita.value.id) {
      await http.patch(`${ENDPOINT}/${cita.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    cita.value = {} as Cita
    dialogVisible.value = false
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.add({ severity: 'warn', summary: 'Error', detail: 'Horario no disponible', life: 3000 });
    } else {
      console.error('Error al guardar:', error)
      alert(error?.response?.data?.message || error.message)
    }
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
     v-model:visible="dialogVisible" 
     :header="props.modoEdicion ? 'Editar Cita' : 'Crear Cita'"
      style="width: 30rem"
      >
      <div class="p-fluid">
        <!-- Odontólogo -->
        <div class="p-field mb-4">
          <label for="odontologo" class="font-semibold">Odontólogo</label>
          <Select 
          id="odontologo"
           v-model="cita.odontologoId"
           :options="odontologos" 
           :optionLabel="getOdontologoLabel"
           optionValue="id" 
           placeholder="Seleccione un odontólogo"
           />
        </div>

        <!-- Tratamiento -->
        <div class="p-field mb-4">
          <label for="tratamiento" class="font-semibold">Tratamiento</label>
          <Select 
          id="tratamiento" 
          v-model="cita.tratamientoId"
          :options="tratamientos" 
          optionLabel="nombre" 
          optionValue="id"
          placeholder="Seleccione un tratamiento" 
          />
        </div>

        <!-- Fecha de inicio -->
        <div class="p-field mb-4">
          <label for="fechaInicio" class="font-semibold">Fecha Inicio</label>
          <DatePicker 
          id="fechaInicio" 
          v-model="cita.fechaHoraInicio" 
          showIcon 
          :showTime="true" 
          dateFormat="yy-mm-dd"
          placeholder="Selecciona fecha y hora de inicio" 
          />
        </div>

        <!-- Fecha de fin (solo lectura) -->
        <div class="p-field mb-4">
          <label for="fechaFin" class="font-semibold">Fecha Fin</label>
          <InputText 
          id="fechaFin" 
          :value="new Date(cita.fechaHoraFin).toLocaleString()" 
          disabled 
          />
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-4">
          <Button 
          type="button" 
          label="Cancelar" 
          icon="pi pi-times" 
          severity="secondary"
          @click="dialogVisible = false" 
          />
          <Button 
          type="button" 
          label="Guardar" 
          icon="pi pi-save" 
          @click="handleSave" 
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>


<style scoped>
.card {
  max-width: 500px;
  margin: 20px auto;
}
</style>