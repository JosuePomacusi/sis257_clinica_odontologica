<script setup lang="ts">
import http from '../../plugins/axios'
import { onMounted, ref, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useAuthStore } from '@/stores' // Store de autenticación
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { useTratamientos } from '@/composables/useTratamientos'
import type { Tratamiento } from '@/models/Tratamientos'


// Obtener el odontólogo autenticado
const authStore = useAuthStore()
const toast = useToast()
const odontologoLogueado = computed(() => authStore.user)

// Usar el Composable 
const { cargarTratamientosDisponibles } = useTratamientos()

// Definir las variables reactivas
const tratamientos = ref<Tratamiento[]>([])
const nombreBusqueda = ref('')
const emit = defineEmits(['edit'])
const tratamientoDelete = ref<number | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)

// Obtener la lista de servicios
const obtenerLista = async () => {
  try {
    const response = await http.get('odontologos_tratamientos/mis-tratamientos')
    tratamientos.value = response.data
  } catch (error) {
    console.error('Error obteniendo los datos:', error)
  }
}

// Computed para filtrar servicios por nombre
const tratamientosFiltrados = computed(() =>
  tratamientos.value.filter(tratamiento =>
    tratamiento.nombre.toLowerCase().includes(nombreBusqueda.value.toLowerCase()),
  ),
)

// Función para mostrar el diálogo de confirmación de eliminación
function mostrarEliminarConfirm(tratamientoId: number) {
  tratamientoDelete.value = tratamientoId
  mostrarConfirmDialog.value = true
}

// Función para eliminar un servicio

async function eliminar() {
  if (!odontologoLogueado.value) {
    console.error('Odontólogo no autenticado.')
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes realizar esta acción. Odontólogo no autenticado.',
        life: 3000
      })
    return
  }

  if (tratamientoDelete.value) {
    try {

      await http.delete(
        `odontologos_tratamientos/eliminar-relacion/${odontologoLogueado.value.id}/${tratamientoDelete.value}`,
      )
      toast.add({
        severity: 'success',
        summary: 'Tratamiento eliminado',
        detail: 'El tratamiento ha sido eliminado correctamente.',
        life: 3000
      })
      await cargarTratamientosDisponibles()

      obtenerLista() // Actualizar la lista después de eliminar

      // Emitir evento global de servicio eliminado 
      const event = new CustomEvent('tratamientoEliminado') 
      window.dispatchEvent(event)

      mostrarConfirmDialog.value = false
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hubo un problema al eliminar el tratamiento.',
        life: 3000
      })
    }
  }
}
// Llamar obtenerLista al montar el componente
onMounted(() => {
  obtenerLista()
})
defineExpose({
  obtenerLista, // Permite acceder a este método desde otros componentes
})
</script>

<template>
  <div class="contenedor-lista">
    <!-- Campo de búsqueda -->
    <input
      v-model="nombreBusqueda"
      placeholder="Buscar tratamiento por nombre"
      class="busqueda"
    />

    <!-- Contenedor de tarjetas -->
    <div class="tarjetas-grid">
      <div
        v-for="tratamiento in tratamientosFiltrados"
        :key="tratamiento.id"
        class="tarjeta-tratamiento"
      >
        <h3>{{ tratamiento.nombre }}</h3>
        <p><strong>Descripción:</strong> {{ tratamiento.descripcion }}</p>
        <p><strong>Precio:</strong> {{ tratamiento.precio }} Bs.</p>
        <p><strong>Duración:</strong> {{ tratamiento.duracion }} min</p>

        <!-- Botones de acción -->
        <div class="acciones">
          <Button
            icon="pi pi-trash"
            aria-label="Eliminar"
            class="boton-eliminar"
            @click="mostrarEliminarConfirm(tratamiento.id)"
          />
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de eliminación -->
    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar este tratamiento?</p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.contenedor-lista {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Campo de búsqueda */
.busqueda {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  width: 100%;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.busqueda:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.25);
}

/* Grid para las tarjetas */
.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(300px, 1fr)
  ); /* Tres columnas ajustables */
  gap: 1.5rem; /* Espaciado entre tarjetas */
}

/* Tarjeta de servicio */
.tarjeta-tratamiento {
  background-color: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  text-align: start;
}

.tarjeta-tratamiento:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Título de la tarjeta */
.tarjeta-tratamiento h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: bold;
}

/* Información del servicio */
.tarjeta-tratamiento p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 1rem;
}

/* Botones de acción */
.acciones {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}

.boton-editar {
  background-color: #4caf50;
  color: #ffffff;
}

.boton-editar:hover {
  background-color: #45a049;
}

.boton-eliminar {
  background-color: #f44336;
  color: #ffffff;
}

.boton-eliminar:hover {
  background-color: #e53935;
}
</style>
