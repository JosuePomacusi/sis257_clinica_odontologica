<script setup lang="ts">
import { ref, computed } from 'vue'
import CitaOdontologoList from '../components/citas/CitaOdontologoList.vue'
import { useAuthStore } from '@/stores'

// --- Tipado de la Referencia del Componente Hijo ---
// Importamos el tipo de la instancia del componente de lista para tipado estricto
type CitaOdontologoListInstance = InstanceType<typeof CitaOdontologoList>

// --- Inicialización y Stores ---
const authStore = useAuthStore()

// --- Estado Reactivo ---
// Referencia tipada al componente de lista de citas
const CitaOdontologoListRef = ref<CitaOdontologoListInstance | null>(null)

// Filtrar citas solo del paciente autenticado
// Obtiene el ID del usuario logueado (paciente) y asegura que sea `number` o `null`
const pacienteId = computed<number | null>(() => authStore.user?.id || null)
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="pi pi-calendar-plus page-icon"></i>
            Mis Citas Programadas
          </h1>
          </div>
      </div>

      <div class="list-section">
        <CitaOdontologoList 
          ref="CitaOdontologoListRef" 
          :paciente-id="pacienteId" 
        />
        
        <div v-if="!pacienteId" class="alert-warning">
            <i class="pi pi-exclamation-triangle"></i>
            Debe iniciar sesión para ver sus citas programadas.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.page-container {
  /* Fondo con imagen y degradado */
  background-image: linear-gradient(rgba(36, 0, 144, 0.1), rgba(36, 0, 144, 0.2)),
    url('@/assets/images/slider/slider-1.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Fondo fijo */
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  max-width: 1400px;
  /* Eliminar margin: 12% auto; para que el contenido fluya mejor */
  margin: 0 auto;
  padding-top: 3rem; 
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
}

.header-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  position: sticky;
  top: 1rem; /* Fija el encabezado al hacer scroll */
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: center; /* Centrar título */
  align-items: center;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700; /* Más audaz */
  color: #240090;
  margin: 0;
  display: flex;
  align-items: center;
}

.page-icon {
    font-size: 1.75rem;
    margin-right: 0.75rem;
    color: #4a148c;
}

.list-section {
  flex-grow: 1;
  padding-bottom: 2rem;
}

/* Alerta de no logueado */
.alert-warning {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
  margin-top: 1rem;
}
.alert-warning i {
    font-size: 1.2rem;
}

/* Responsive styles */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem 0; /* Eliminar padding lateral para el fondo */
  }

  .content-wrapper {
    padding-top: 1rem;
  }

  .header-section {
    border-radius: 0;
    margin: 0;
    top: 0; /* Fijar al borde superior */
  }

  .page-title {
    font-size: 1.5rem;
  }
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-section {
  animation: slideDown 0.3s ease-out;
}
</style>