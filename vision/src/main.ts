import { createApp } from 'vue'
import App from './App.vue'
// 引入创建的echarts插件
import { EChartsPlugin } from './plugins/echarts-plugin'
// import axiosInstance from './plugins/axios'
import axios from 'axios'
import router from './router'
import './assets/css/global.less'
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket_service'
import { createPinia } from 'pinia'


SocketService.getintance.connect()
const app = createApp(App)

const pinia = createPinia()
// 使用Echarts插件 
app.use(EChartsPlugin)
app.use(router)
app.use(pinia)

// 将 Axios 实例挂载到全局属性上
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'

app.config.globalProperties.$http = axios;
// 挂载socketservice对象到vue原型对象上
app.config.globalProperties.$socket = SocketService.getintance


app.mount('#app')
