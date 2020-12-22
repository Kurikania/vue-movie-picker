import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: guard
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import(/* webpackChunkName: "about" */ '../views/SignUp.vue')
  },
  {
    path: '/',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "about" */ '../views/SignIn.vue')
  },
  {
    path: '/match',
    name: 'Match',
    beforeEnter: guard,
    component: () => import(/* webpackChunkName: "match" */ '../views/Match.vue')
  },
  {
    path: '/add-partner',
    name: 'AddPartner',
    beforeEnter: guard,
    component: () => import(/* webpackChunkName: "about" */ '../views/AddPartner.vue')
  }
]

function guard(to, from, next) {
  if(store.state.user.id) {
    next()
  } else {
    next('/')
  }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
