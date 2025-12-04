<script setup lang="ts">
import { ref, computed } from 'vue'
import CitaOdontologoList from '../components/citas/CitaOdontologoList.vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore() // Accede al usuario autenticado
const CitaOdontologoListRef = ref<typeof CitaOdontologoList | null>(null)

// Filtrar citas solo del cliente autenticado
const pacienteId = computed(() => authStore.user?.id || null) // Obtiene el ID del cliente autenticado

</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="pi pi-calendar-plus" style="margin-right: 0.5rem;"></i>
            Citas Programadas
          </h1>
        </div>
      </div>

      <div class="list-section">
        <CitaOdontologoList ref="CitaOdontologoListRef" :paciente-id="pacienteId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background: linear-gradient(rgba(36, 0, 144, 0.1), rgba(36, 0, 144, 0.2)),
    url('@/assets/images/slider/slider-1.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 12% auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #240090;
  margin: 0;
  display: flex;
  align-items: center;
}

.list-section {
  flex-grow: 1;
}

/* Responsive styles */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem 0.5rem;
  }

  .header-section {
    border-radius: 0;
    margin: -1rem -0.5rem 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  animation: slideDown 0.3s ease-out;
}
</style>
