<script setup lang="ts">
import { ref } from 'vue'
import OdontologosListCard from '@/components/odontologos/OdontologosListCard.vue'

// --- Tipado de la Referencia del Componente Hijo ---
// Se obtiene el tipo del componente hijo (OdontologosListCard) para asegurar el tipado
// de la referencia. Esto es crucial si se utiliza `defineExpose` en el componente hijo.
type OdontologosListCardInstance = InstanceType<typeof OdontologosListCard>

// Referencia reactiva al componente hijo
const OdontologoListCardRef = ref<OdontologosListCardInstance | null>(null)
</script>

<template>
  <div class="page-background" role="main">
    <div class="main-container">
      <h1 class="page-title">
        <i class="pi pi-users page-icon"></i>
        Nuestros Odontólogos
      </h1>
      
      <OdontologosListCard ref="OdontologoListCardRef" />
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.page-background {
  /* Fondo con imagen */
  background-image: url('@/assets/images/slider/slider-1.png');
  background-size: cover;
  background-position: center;
  /* Asegura que ocupe toda la altura visible y un padding base */
  min-height: 100vh;
  padding: 3rem 1rem; /* Aumento de padding para mayor espacio */
  display: flex;
  align-items: flex-start; /* Contenedor comienza arriba */
  justify-content: center;
}

.main-container {
  /* Contenedor principal del contenido */
  background-color: rgba(255, 255, 255, 0.98); /* Fondo más opaco para legibilidad */
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Sombra más fuerte y elegante */
  padding: 2.5rem; /* Padding uniforme */
  width: 95%;
  max-width: 1400px;
  margin-top: 2rem;
  /* Animación de entrada sutil */
  animation: fadeIn 0.8s ease-out;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700; /* Más audaz */
  color: #240090;
  margin-bottom: 2rem;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-icon {
    font-size: 2rem;
    color: #4a148c; /* Color de acento */
}

/* Responsive */
@media (max-width: 768px) {
  .page-background {
    padding: 1rem 0.5rem;
  }

  .main-container {
    padding: 1rem;
    width: 100%;
    margin-top: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    gap: 0.5rem;
  }
  .page-icon {
    font-size: 1.5rem;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>