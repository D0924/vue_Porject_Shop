import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welconme from '../components/Welconme.vue'
import Users from '../components/user/user.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    // 重定向到登入页面
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welconme',
      children: [
        { path: '/welconme', component: Welconme },
        { path: '/users', component: Users }
      ]
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from从那个路径而来
  // next()放行
  if (to.path === '/login') { return next() }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('./login')
  next()
})
export default router
