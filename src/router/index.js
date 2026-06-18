import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Detail from '@/pages/Detail.vue'
import Contact from '@/pages/Contact.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/detail/:productId/:variantId?', name: 'Detail', component: Detail },
  { path: '/contact', name: 'Contact', component: Contact },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
