import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getTokenFromLocalStorage } from '@/helpers'
import { useAuthStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requireMainJs: true, roles: [] }, 
    },
    {
      path: '/citas',
      name: 'citas',
      component: () => import('../views/CitaView.vue'),
      meta: { roles: ['paciente', 'odontologo'] },
    },
    {
      path: '/citas-paciente',
      name: 'citas-paciente',
      component: () => import('../views/CitaView.vue'), 
      meta: { roles: ['paciente'] },
    },
    {
      path: '/citas-odontologo',
      name: 'citas-odontologo',
      component: () => import('../views/CitaOdontologoView.vue'),  
      meta: { roles: ['odontologo'] }, 
    },  
    {
      path: '/pacientes',
      name: 'pacientes',
      component: () => import('../views/PacienteCrudView.vue'),
      meta: { roles: ['odontologo'] },
    },
    {
      path: '/paciente-crear-cuenta',
      name: 'paciente-crear-cuenta',
      component: () => import('../views/PacienteCrearCuentaView.vue'),
      meta: { roles: [] },
    },
    {
      path: '/paciente-perfil',
      name: 'paciente-perfil',
      component: () => import('../views/PacienteView.vue'),
      meta: { roles: ['paciente'] },
    },
    {
      path: '/odontologo-perfil',
      name: 'odontologo-perfil',
      component: () => import('../views/OdontologoPerfilView.vue'),
      meta: { roles: ['odontologo'] },
    },
    {
      path: '/odontologos',
      name: 'odontologos',
      component: () => import('../views/OdontologoView.vue'),
      meta: { roles: ['odontologo'] },
    },
    {
      path: '/tratamientos',
      name: 'tratamientos',
      component: () => import('../views/TratamientosView.vue'),
      meta: { roles: ['odontologo'] },
    },
    {
      path: '/odontologo_tratamientos',
      name: 'odontologo_tratamientos',
      component: () => import('../views/OdontologoTratamientosView.vue'),
      meta: { roles: ['odontologo'] },
    },
    {
      path: '/odontologo-cards', 
      name: 'odontologo-cards', 
      component: () => import('../views/OdontologoCardView.vue'),
      meta: { roles: [] },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { roles: [] },
    },
   
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const publicPages = ['/', '/login','/paciente-crear-cuenta', '/odontologo-cards'] 
  const authRequired = !publicPages.includes(to.path)
  const authStore = useAuthStore()
  const userRol = authStore.rol

  
  if (authRequired && !getTokenFromLocalStorage()) {
    if (authStore) authStore.logout()
    authStore.returnUrl = to.fullPath
    return next({ name: 'login' })  
  }

 
  if (to.name === 'citas') {
    if (userRol === 'paciente') {
      next({ name: 'citas-paciente' }) 
    } else if (userRol === 'odontologo') {
      next({ name: 'citas-odontologo' }) 
    } else {
      next({ name: 'unauthorized' }) 
    }
  } else {
    next() 
  }
})

export default router
