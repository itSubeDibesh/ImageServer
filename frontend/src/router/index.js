import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  //#region VISIT_WEBSITE
  {
    path: '/',
    name: 'home',
    component: () => import('../views/VISIT_WEBSITE/HomeView.vue'),
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/about',
    name: 'about',
    meta: {
      title: 'About'
    },
    component: () => import('../views/VISIT_WEBSITE/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login'
    },
    component: () => import('../views/VISIT_WEBSITE/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    meta: {
      title: 'Register'
    },
    component: () => import('../views/VISIT_WEBSITE/RegisterView.vue')
  },
  {
    path: '/analyze',
    name: 'analyze',
    meta: {
      title: 'Password Analyzer'
    },
    component: () => import('../views/VISIT_WEBSITE/AnalyzerView.vue')
  },
  {
    path: '/contact',
    name: 'contact',
    meta: {
      title: 'Contact'
    },
    component: () => import('../views/VISIT_WEBSITE/ContactView.vue')
  },
  //#endregion
  //#region ACCESS_ACCOUNT
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      title: 'Dashboard'
    },
    component: () => import('../views/ACCESS_ACCOUNT/DashboardView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    meta: {
      title: 'Settings'
    },
    component: () => import('../views/ACCESS_ACCOUNT/SettingsView.vue')
  },
  {
    path: '/verify',
    name: 'VerifyAccount',
    meta: {
      title: 'Verify Account'
    },
    component: () => import('../views/ACCESS_ACCOUNT/VerifyAccountView.vue')
  },
  {
    path: '/reset',
    name: 'ResetPassword',
    meta: {
      title: 'Reset Password'
    },
    component: () => import('../views/ACCESS_ACCOUNT/ResetView.vue')
  },
  {
    path: '/forgot',
    name: 'ForgotPassword',
    meta: {
      title: 'Forgot Password'
    },
    component: () => import('../views/ACCESS_ACCOUNT/ForgotPasswordView.vue')
  },
  //#endregion
  //#region MISCELLANEOUS
  {
    path: '/404',
    name: 'PageNotFound',
    meta: {
      title: 'Page Not Found'
    },
    component: () => import('../views/MISCELLANEOUS/PageNotFoundView.vue')
  },
  {
    path: '/429',
    name: 'TooManyRequests',
    meta: {
      title: 'Too Many Requests'
    },
    component: () => import('../views/MISCELLANEOUS/TooManyRequestsView.vue')
  },
  //#endregion
  //#region HANDEL_IMAGES
  {
    path: '/images',
    name: 'images',
    meta: {
      title: 'Images'
    },
    component: () => import('../views/HANDEL_IMAGE/ImageView.vue')
  },
  //#endregion
  //#region HANDEL_USERS
  {
    path: '/users',
    name: 'users',
    meta: {
      title: 'Users'
    },
    component: () => import('../views/HANDEL_USER/UserView.vue')
  }
  //#endregion
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
