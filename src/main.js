import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标库
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入树表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑插件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑css样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 配置请求的根路径2
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置拦截器
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 注册全局过滤器
Vue.filter('dataFormat', (originVal) => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // 不足两位0填充
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 挂载到全局
Vue.prototype.$http = axios

// 按需注册
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false

// 将富文本编辑器全局注册
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
