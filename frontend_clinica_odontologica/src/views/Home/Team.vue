<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Odontologo } from '@/models/Odontologo'
import http from '@/plugins/axios'

const odontologos = ref<Odontologo[]>([])
const cargando = ref(true)

async function obtenerOdontologos() {
  try {
    cargando.value = true
    const response = await http.get('odontologos')
    odontologos.value = response.data
  } catch (error) {
    console.error('Error al cargar odontólogos:', error)
  } finally {
    cargando.value = false
  }
}

function obtenerNombreCompleto(odontologo: Odontologo): string {
  return `Dr. ${odontologo.nombre} ${odontologo.primerApellido} ${odontologo.segundoApellido}`
}

onMounted(() => {
  obtenerOdontologos()
})
</script>

<template>
  <div class="section team-area section-padding" id="odontologos">
    <div class="container">
      <div class="team-wrapper">
        <!-- Team Title Start -->
        <div class="team-title-wrapper">
          <div class="row">
            <div class="col-lg-8 col-md-8 col-sm-8">
              <div class="section-title">
                <h3 class="sub-title">¡Atención médica y general!</h3>
                <h2 class="title">Conozca a nuestros médicos</h2>
              </div>
            </div>
          </div>
        </div>
        <!-- Team Title End -->

        <!-- Loading State -->
        <div v-if="cargando" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <!-- Team Content Wrapper Start -->
        <div v-else class="team-content-wrapper">
          <div class="row">
            <div
              class="col-lg-4 col-md-4 col-sm-6"
              v-for="odontologo in odontologos"
              :key="odontologo.id"
            >
              <div class="team-item">
                <!-- Team Img Start -->
                <div class="team-img">
                  <img
                    :src="
                      odontologo.imagen ||
                      '@/assets/images/team/default-doctor.jpg'
                    "
                    :alt="`${odontologo.nombre} ${odontologo.primerApellido}`"
                  />
                </div>
                <!-- Team Img End -->

                <!-- Team Content Start -->
                <div class="team-content text-center">
                  <ul class="social">
                    <li>
                      <a href="#" target="_blank"
                        ><i class="ri-facebook-fill"></i
                      ></a>
                    </li>
                    <li>
                      <a href="#" target="_blank"
                        ><i class="ri-twitter-fill"></i
                      ></a>
                    </li>
                    <li>
                      <a href="#" target="_blank"
                        ><i class="ri-linkedin-fill"></i
                      ></a>
                    </li>
                    <li>
                      <a href="#" target="_blank"
                        ><i class="ri-instagram-fill"></i
                      ></a>
                    </li>
                  </ul>
                  <h3 class="name">
                    {{ obtenerNombreCompleto(odontologo) }}
                  </h3>
                  <h5 class="designation">
                    {{
                      odontologo.especialidad?.nombre || 'Especialidad General'
                    }}
                  </h5>
                  <div class="team-info">
                    <ul>
                      <li>
                        <i class="ri-mail-unread-fill"></i>
                        <span>{{ odontologo.email }}</span>
                      </li>
                      <li>
                        <i class="ri-phone-fill"></i> {{ odontologo.telefono }}
                      </li>
                    </ul>
                  </div>
                </div>
                <!-- Team Content End -->
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="odontologos.length === 0" class="text-center py-5">
            <p class="text-muted">
              No hay odontólogos disponibles en este momento.
            </p>
          </div>
        </div>
        <!-- Team Content Wrapper End -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.team-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.team-img {
  height: 350px;
  overflow: hidden;
}

.team-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.designation {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
