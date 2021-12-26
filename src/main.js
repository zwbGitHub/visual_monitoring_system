import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import request from './utils/http'
import './assets/css/global.css'
import * as echarts from 'echarts'
import 'echarts/theme/vintage'
import 'echarts/theme/dark-blue'
import './utils/socket_server'
// 链接webSocket
import SocketService from './utils/socket_server'
SocketService.Instance.connect()
// 将webSocket的实例对象挂载到vue原型对象上
Vue.prototype.$webSocket = SocketService.Instance
Vue.config.productionTip = false
Vue.prototype.$request = request
Vue.prototype.$echarts = echarts
new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
