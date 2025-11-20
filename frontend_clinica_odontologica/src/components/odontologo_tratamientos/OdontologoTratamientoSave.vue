<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import http from '../../plugins/axios'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores' // Store para autenticación
import type { Tratamiento } from '@/models/Tratamientos'
import type { Odontologo_tratamiento } from '@/models/Odontologo_tratamiento'

// Obtener el odontólogo autenticado
const authStore = useAuthStore()
const odontologoLogueado = computed(() => authStore.user)

// Inicializar Toast
const toast = useToast()

// Props y eventos
const props = defineProps({
  mostrar: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

// Estado reactivo
const tratamientos = ref<Tratamiento[]>([]) // Servicios disponibles (no asignados)
const tratamientosAsignados = ref<number[]>([]) // IDs de servicios ya asignados
const tratamientosSeleccionados = ref<number[]>([]) // IDs de servicios seleccionados

// Computed para el estado del diálogo
const dialogVisible = computed({
  get: () => props.mostrar,
  set: async value => {
    if (!value) {
      resetFormulario() // Limpia el formulario al cerrar
      emit('close')
    } else {
      // Recarga los servicios disponibles y asignados al abrir el diálogo
      if (odontologoLogueado.value?.id) {
        await Promise.all([
          cargarTratamietosAsignados(),
          cargarTratamientosDisponibles(),
        ])
      }
    }
  },
})

// Reiniciar el formulario
function resetFormulario() {
  tratamientosSeleccionados.value = [] // Limpia los servicios seleccionados
}

// Cargar servicios disponibles
async function cargarTratamientosDisponibles() {
  try {
    const response = await http.get(
      'odontologos_tratamientos/mis-tratamientos-disponibles',
    )
    tratamientos.value = response.data // Aquí se actualiza con los servicios no asignados
  } catch (error) {
    console.error('Error al cargar tratamientos disponibles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al cargar los tratamientos disponibles.',
      life: 3000,
    })
  }
  return
}

// Cargar servicios ya asignados al odontólogo autenticado
async function cargarTratamietosAsignados() {
  if (!odontologoLogueado.value?.id) return

  try {
    const response = await http.get('odontologos_tratamientos/mis-tratamientos')
    tratamientosAsignados.value = response.data.map(
      (item: Odontologo_tratamiento) => item.tratamiento_id,
    )
  } catch (error) {
    console.error('Error al cargar tratamientos asignados:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al cargar los tratamientos asignados.',
      life: 3000,
    })
  }
}

// Guardar relaciones
async function handleSave() {
  try {
    if (tratamientosSeleccionados.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un tratamieto.',
        life: 3000,
      })
      return
    }

    // Crear relaciones para cada servicio seleccionado
    await Promise.all(
      tratamientosSeleccionados.value.map(tratamientoId =>
        http.post('odontologos_tratamientos', {
          odontologoId: odontologoLogueado.value?.id ?? 0,
          tratamientoId: tratamientoId,
        }),
      ),
    )

    // Actualizar los servicios disponibles después de guardar
    await cargarTratamientosDisponibles()

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tratamientos añadido correctamente.',
      life: 3000,
    })
    emit('guardar')
    emit('close')
    dialogVisible.value = false
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Error desconocido'
    console.error('Error al guardar relaciones:', errorMessage)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Hubo un problema al guardar las relaciones: ${errorMessage}`,
      life: 3000,
    })
  }
}

// Escuchar el evento global de servicio eliminado
const onTratamientoEliminado = async () => {
  await cargarTratamientosDisponibles()
}
// Cargar servicios disponibles y asignados al odontólogo al montar el componente
onMounted(() => {
  window.addEventListener('tratamientoEliminado', onTratamientoEliminado)
  window.addEventListener('tratamientoCreado', onTratamientoEliminado)
})
// Limpiar los eventos al desmontar el componente
onBeforeUnmount(() => {
  window.removeEventListener('tratamientoEliminado', onTratamientoEliminado)
  window.removeEventListener('tratamientoCreado', onTratamientoEliminado)
})

// Montar datos iniciales
onMounted(async () => {
  if (odontologoLogueado.value?.id) {
    // Cargar los servicios disponibles y los asignados al odontólogo
    await Promise.all([
      cargarTratamietosAsignados(),
      cargarTratamientosDisponibles(),
    ])
  }
})

</script>

<template>
  <Dialog v-model:visible="dialogVisible" header="Relacionar Tratamientos" style="width: 30rem">
    <div class="mb-4">
      <label class="font-semibold mb-2">Odontólogo</label>
      <div v-if="odontologoLogueado" class="font-semibold text-blue-500">
        <p>Nombre: {{ odontologoLogueado.name || 'Nombre no disponible' }}</p>
        <p>Email: {{ odontologoLogueado.email || 'Email no disponible' }}</p>
      </div>
      <p v-else class="font-semibold text-red-500">Odontólogo no autenticado</p>
    </div>

    <div class="mb-4">
      <label class="font-semibold mb-2">Tratamietos</label>
      <div v-if="tratamientos.length">
        <div v-for="tratamiento in tratamientos" :key="tratamiento.id" class="flex items-center">
          <Checkbox v-model="tratamientosSeleccionados" :value="tratamiento.id" />
          <span class="ml-2">{{ tratamiento.nombre }}</span>
        </div>
      </div>
      <p v-else class="text-red-500">No hay tratamietos para seleccionar</p>
    </div>

    <div class="flex justify-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="$emit('close')" />
      <Button label="Guardar" icon="pi pi-save" @click="handleSave" />
    </div>
  </Dialog>
</template>
