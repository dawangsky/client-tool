import { createRouter, createWebHashHistory } from 'vue-router'
import { getAccessToken } from '@/api/http'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: '', name: 'login', component: () => import('@/views/auth/Login.vue'), meta: { title: '登录', guest: true } },
      ],
    },
    {
      path: '/register',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
          name: 'register',
          component: () => import('@/views/auth/Register.vue'),
          meta: { title: '注册', guest: true },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/AppShell.vue'),
      meta: { auth: true },
      children: [
        { path: '', name: 'home', component: () => import('@/views/Home.vue'), meta: { title: '资产概览' } },
        { path: 'funds', name: 'funds', component: () => import('@/views/product/FundList.vue'), meta: { title: '产品列表' } },
        {
          path: 'funds/:fundCode',
          name: 'fund-detail',
          component: () => import('@/views/product/FundDetail.vue'),
          meta: { title: '产品详情' },
        },
        {
          path: 'purchase/:fundCode',
          name: 'purchase',
          component: () => import('@/views/trade/Purchase.vue'),
          meta: { title: '申购' },
        },
        {
          path: 'redeem/:fundCode',
          name: 'redeem',
          component: () => import('@/views/trade/Redeem.vue'),
          meta: { title: '赎回' },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/trade/Orders.vue'),
          meta: { title: '交易记录' },
        },
        {
          path: 'orders/:orderNo',
          name: 'order-detail',
          component: () => import('@/views/trade/OrderDetail.vue'),
          meta: { title: '订单详情' },
        },
        {
          path: 'positions',
          name: 'positions',
          component: () => import('@/views/position/Positions.vue'),
          meta: { title: '我的持仓' },
        },
        {
          path: 'positions/:fundCode',
          name: 'position-detail',
          component: () => import('@/views/position/PositionDetail.vue'),
          meta: { title: '持仓详情' },
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/views/document/Messages.vue'),
          meta: { title: '消息中心' },
        },
        {
          path: 'risk-quiz',
          name: 'risk-quiz',
          component: () => import('@/views/suitability/RiskQuiz.vue'),
          meta: { title: '风险测评' },
        },
        {
          path: 'kyc',
          name: 'kyc',
          component: () => import('@/views/account/Kyc.vue'),
          meta: { title: '实名认证' },
        },
        {
          path: 'open-account',
          name: 'open-account',
          component: () => import('@/views/account/OpenAccount.vue'),
          meta: { title: '账户' },
        },
        {
          path: 'bind-card',
          name: 'bind-card',
          component: () => import('@/views/account/BindCard.vue'),
          meta: { title: '绑定银行卡' },
        },
        {
          path: 'devices',
          name: 'devices',
          component: () => import('@/views/session/Devices.vue'),
          meta: { title: '登录设备' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${(to.meta.title as string) || '财富基金'} · 财富基金`
  const loggedIn = !!getAccessToken()
  const needsAuth = to.matched.some((r) => r.meta.auth)
  const isGuest = to.matched.some((r) => r.meta.guest)

  if (needsAuth && !loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 已登录访问登录/注册页时进入首页
  if (isGuest && loggedIn) {
    return { name: 'home' }
  }
})

export default router
