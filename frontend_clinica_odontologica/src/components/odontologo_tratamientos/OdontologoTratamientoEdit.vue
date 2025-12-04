<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext' // Agregado para el campo de búsqueda
import { useAuthStore } from '@/stores'
import { useToast } from 'primevue/usetoast'
import { useTratamientos } from '@/composables/useTratamientos'
import type { Tratamiento } from '@/models/Tratamientos'

// --- Inicialización y Stores ---
const authStore = useAuthStore()
const toast = useToast()
const { cargarTratamientosDisponibles } = useTratamientos() // Composable para recargar el listado de tratamientos disponibles
const odontologoLogueado = computed(() => authStore.user)

// --- Estado Reactivo ---
const tratamientos = ref<Tratamiento[]>([])
const nombreBusqueda = ref('')
const isDeleting = ref(false) // Estado para controlar la eliminación asíncrona
const isLoading = ref(false) // Estado para controlar la carga de la lista
const tratamientoIdToDelete = ref<number | null>(null) // Renombrado para claridad
const mostrarConfirmDialog = ref<boolean>(false)

// --- Funciones de Lógica ---

/**
 * Obtiene la lista de tratamientos asignados al odontólogo logueado.
 */
const obtenerLista = async () => {
  isLoading.value = true
  try {
    // Nota: Se asume que esta API devuelve solo la información del Tratamiento
    const response = await http.get('odontologos_tratamientos/mis-tratamientos')
    tratamientos.value = response.data || []
  } catch (error) {
    console.error('Error obteniendo los datos:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudieron cargar sus tratamientos asignados.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

// Computed para filtrar tratamientos por nombre
const tratamientosFiltrados = computed(() => {
  const busqueda = nombreBusqueda.value.toLowerCase().trim()
  
  if (!busqueda) {
    return tratamientos.value
  }

  return tratamientos.value.filter(tratamiento =>
    tratamiento.nombre.toLowerCase().includes(busqueda),
  )
})

/**
 * Muestra el diálogo de confirmación de eliminación.
 * @param tratamientoId - ID del tratamiento a eliminar.
 */
function mostrarEliminarConfirm(tratamientoId: number) {
  tratamientoIdToDelete.value = tratamientoId
  mostrarConfirmDialog.value = true
}

/**
 * Ejecuta la eliminación del tratamiento asignado.
 */
async function eliminarTratamiento() {
  if (!odontologoLogueado.value?.id) {
    console.error('Error: Odontólogo no autenticado o ID no disponible.')
    toast.add({
      severity: 'error',
      summary: 'Error de Autenticación',
      detail: 'No se pudo verificar su identidad para realizar la eliminación.',
      life: 5000,
    })
    mostrarConfirmDialog.value = false
    return
  }

  const idOdontologo = odontologoLogueado.value.id
  const idTratamiento = tratamientoIdToDelete.value

  if (idTratamiento === null) return // Evitar eliminación si el ID es nulo

  isDeleting.value = true
  
  try {
    // La API elimina la relación (tabla intermedia) entre el odontólogo y el tratamiento
    await http.delete(
      `odontologos_tratamientos/eliminar-relacion/${idOdontologo}/${idTratamiento}`,
    )
    
    // --- Post-eliminación ---
    toast.add({
      severity: 'success',
      summary: 'Eliminación Exitosa',
      detail: 'El tratamiento ha sido desasignado de su lista.',
      life: 3000,
    })
    
    // 1. Recargar la lista de tratamientos disponibles (en el composable)
    await cargarTratamientosDisponibles()

    // 2. Actualizar la lista local de tratamientos asignados
    await obtenerLista() 
    
    // 3. Emitir evento global (si es necesario)
    window.dispatchEvent(new CustomEvent('tratamientoEliminado'))

    mostrarConfirmDialog.value = false
  } catch (error) {
    console.error('Error al eliminar:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al desasignar el tratamiento.',
      life: 5000,
    })
  } finally {
    isDeleting.value = false
    tratamientoIdToDelete.value = null
  }
}

// Llamar obtenerLista al montar el componente
onMounted(() => {
  obtenerLista()
})

// Exponer la función para que el componente padre pueda forzar la recarga
defineExpose({
  obtenerLista,
})
</script>

<template>
  <div class="contenedor-lista">
    <Toast />
    
    <InputText
      v-model="nombreBusqueda"
      placeholder="Buscar tratamiento por nombre"
      class="p-inputtext-lg busqueda-input"
    />

    <div v-if="isLoading" class="estado-mensaje">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #667eea;"></i>
      <p>Cargando sus tratamientos...</p>
    </div>
    
    <div v-else-if="tratamientosFiltrados.length === 0" class="estado-mensaje">
      <i class="pi pi-info-circle" style="font-size: 2rem; color: #10b981;"></i>
      <p v-if="nombreBusqueda">No se encontraron tratamientos que coincidan con la búsqueda.</p>
      <p v-else>Usted no tiene tratamientos asignados. Asigne tratamientos para comenzar.</p>
    </div>

    <div v-else class="tarjetas-grid">
      <div
        v-for="tratamiento in tratamientosFiltrados"
        :key="tratamiento.id"
        class="tarjeta-tratamiento"
      >
        <h3 class="tratamiento-nombre">{{ tratamiento.nombre }}</h3>
        <p><strong>Descripción:</strong> {{ tratamiento.descripcion || 'N/A' }}</p>
        <p><strong>Precio:</strong> {{ tratamiento.precio?.toFixed(2) }} Bs.</p>
        <p><strong>Duración:</strong> {{ tratamiento.duracion }} min</p>

        <div class="acciones">
          <Button
            icon="pi pi-trash"
            aria-label="Eliminar"
            class="p-button-danger boton-eliminar"
            @click="mostrarEliminarConfirm(tratamiento.id)"
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Desasignación"
      :style="{ width: '25rem' }"
      :modal="true"
      :closable="!isDeleting"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle" style="font-size: 1.5rem; color: orange;"></i>
        <p>¿Estás seguro de que deseas desasignar este tratamiento de tu lista?</p>
      </div>
      
      <div class="flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          :disabled="isDeleting"
          @click="mostrarConfirmDialog = false"
        />
        <Button 
          type="button" 
          :label="isDeleting ? 'Eliminando...' : 'Desasignar'"
          :icon="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          severity="danger" 
          :disabled="isDeleting"
          @click="eliminarTratamiento" 
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.contenedor-lista {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

/* Campo de búsqueda */
.busqueda-input {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  width: 100%;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #c7d2fe; /* Color de acento sutil */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.busqueda-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.4);
}

/* Grid para las tarjetas */
.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(300px, 1fr)
  );
  gap: 1.5rem;
}

/* Tarjeta de servicio */
.tarjeta-tratamiento {
  background-color: #ffffff;
  border-left: 5px solid #667eea; /* Borde de color para distinción */
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.tarjeta-tratamiento:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* Título de la tarjeta */
.tratamiento-nombre {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 700;
  border-bottom: 1px dashed #e3e3e3;
  padding-bottom: 0.5rem;
}

/* Información del servicio */
.tarjeta-tratamiento p {
  margin: 0.3rem 0;
  color: #555;
  font-size: 0.95rem;
}

/* Botones de acción */
.acciones {
  margin-top: 1.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end; /* Solo un botón (Eliminar) */
}

.boton-eliminar {
  /* Usamos la clase p-button-danger de PrimeVue */
  background-color: #ef4444;
  border-color: #ef4444;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.boton-eliminar:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* Mensajes de Estado (Carga, Vacío) */
.estado-mensaje {
  text-align: center;
  padding: 3rem;
  background-color: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
}

.estado-mensaje p {
  font-size: 1.1rem;
  color: #4b5563;
  margin-top: 1rem;
}

/* Clases para el diálogo de confirmación */
.flex {
  display: flex;
}
.align-items-center {
  align-items: center;
}
.gap-3 {
  gap: 1rem;
}
.justify-content-end {
  justify-content: flex-end;
}
.mt-4 {
  margin-top: 1rem;
}
</style>