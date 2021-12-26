import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPage from '../views/ScreenPage.vue'
Vue.use(VueRouter)

const routes = [
  {
    name: 'ScreenPage',
    path: '/',
    component: ScreenPage
  },
  {
    name: 'SellerPage',
    path: '/sellerpage',
    component: () => import('../views/SellerPage.vue')
  },
  {
    name: 'TrendPage',
    path: '/trendpage',
    component: () => import('../views/TrendPage.vue')
  },
  {
    name: 'MapPage',
    path: '/mappage',
    component: () => import('../views/MapPage.vue')
  },
  {
    name: 'RankPage',
    path: '/rankpage',
    component: () => import('../views/RankPage.vue')
  },
  {
    name: 'HotProductPage',
    path: '/hotproductpage',
    component: () => import('../views/HotProductPage.vue')
  },
  {
    name: 'StockPgae',
    path: '/stockpage',
    component: () => import('../views/StockPage.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
