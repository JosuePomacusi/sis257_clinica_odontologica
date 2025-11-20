import { ref } from 'vue'
import http from '@/plugins/axios'
// Estado reactivo global para los tratamientos
const tratamientos = ref([])

export function useTratamientos() {
  // Función para cargar tratamientos disponibles
  const cargarTratamientosDisponibles = async () => {
    try {
      const response = await http.get('odontologos_tratamientos/mis-tratamientos-disponibles')
      tratamientos.value = response.data
    } catch (error) {
      console.error('Error al cargar tratamientos disponibles:', error)
    }
  }
  // Devuelve las funciones y estados reactivos que necesites
  return {
    tratamientos,
    cargarTratamientosDisponibles,
  }
}
