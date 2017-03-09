export default [
	{
	    path: '/iconfont',
		meta: { requiresAuth: false },
	    component: (resolve) => { require(['../src/views/iconfont.vue'], resolve) }
	},
	{
	    path: '/',
	    name: 'home',
	    meta: { requiresAuth: false },
	    component: (resolve) => { require(['../src/views/home.vue'], resolve) }
	}, 
	{
	    path: '/login',
	    name:'login',
	    meta: { requiresAuth: false },
	    component: (resolve) => { require(['../src/views/auth/login.vue'], resolve) }
	}, 
	{
	    path: '/register',
	    name: 'register',
	    meta: { requiresAuth: false },
	    component: (resolve) => { require(['../src/views/auth/register.vue'], resolve) }
	}, 
	{
	    path: '/setPwd',
	    meta: { requiresAuth: false },
	    component: (resolve) => { require(['../src/views/auth/setPwd.vue'], resolve) }
	}, 
	{
	    path: '/auth/me',
	    name: 'authMe',
	    component: (resolve) => { require(['../src/views/auth/me.vue'], resolve) }
	},
	{
	    path: '/auth/bindBank',
	    name: 'bindBank',
	    component: (resolve) => { require(['../src/views/auth/bindBank.vue'], resolve) }
	},
	{
	    path: '/contract/:ctype',
	    name: 'contract',
	    component: (resolve) => { require(['../src/views/contract/contract.vue'], resolve) }
	},
	{
	    path: '/contract/detail/:cindex',
	    name: 'contractDetail',
	    component: (resolve) => { require(['../src/views/contract/detail.vue'], resolve) }
	},
	// {
	//     path: '/risk',
	//     name: 'risk',
	//     component: (resolve) => { require(['../src/views/iconfont.vue'], resolve) }
	// },
	{
	    path: '/loan/setTradePwd',
	    name: 'setTradePwd',
	    component: (resolve) => { require(['../src/views/loan/setTradePwd.vue'], resolve) }
	},
	{
	    path: '/loan/list',
	    name: 'loanList',
	    component: (resolve) => { require(['../src/views/loan/list.vue'], resolve) }
	},
	{
	    path: '/loan/borrow',
	    name: 'borrow',
	    component: (resolve) => { require(['../src/views/loan/borrow.vue'], resolve) }
	},
	{
	    path: '/loan/confirm',
	    name: 'loanConfirm',
	    component: (resolve) => { require(['../src/views/loan/confirm.vue'], resolve) }
	},
	{
	    path: '/loan/result/:tradeId',
	    name: 'loanResult',
	    component: (resolve) => { require(['../src/views/loan/result.vue'], resolve) }
	},
	{
	    path: '/loan/coupon',
	    name: 'coupon',
	    component: (resolve) => { require(['../src/views/loan/coupon.vue'], resolve) }
	},
	{
	    path: '/payment/list',
	    name: 'paymentList',
	    component: (resolve) => { require(['../src/views/payment/list.vue'], resolve) }
	},
	{
	    path: '/payment/pay/:billId',
	    name: 'paymentPay',
	    component: (resolve) => { require(['../src/views/payment/pay.vue'], resolve) }
	},
	{
	    path: '/payment/paying/',
	    name: 'paymentPaying',
	    component: (resolve) => { require(['../src/views/payment/paying.vue'], resolve) }
	},
	{
	    path: '/payment/detail/:billId/:backUrl',
	    name:'paymentDetail',
	    component: (resolve) => { require(['../src/views/payment/detail.vue'], resolve) }
	},
	{
	    path: '/payment/cardPay/',
	    name: 'paymentCardPay',
	    component: (resolve) => { require(['../src/views/payment/cardPay.vue'], resolve) }
	},
	{
	    path: '/payment/result/:billId',
	    name: 'payResult',
	    component: (resolve) => { require(['../src/views/payment/result.vue'], resolve) }
	},
	{
	    path: '/eye/identify',
	    name:'identiy',
	    component: (resolve) => { require(['../src/views/risk/identifyMes.vue'], resolve) }
	},
	{
	    path: '/eye/relationMes',
	    name:'relationMes',
	    component: (resolve) => { require(['../src/views/risk/relationMes.vue'], resolve) }
	},
	{
	    path: '/eye/mobileVerify',
	    name:'mobileVerify',
	    component: (resolve) => { require(['../src/views/risk/mobileVerify.vue'], resolve) }
	},
	{
	    path: '/eye/forgetPassword',
	    name:'forgetPassword',
	    component: (resolve) => { require(['../src/views/risk/forgetPassword.vue'], resolve) }
	},
	{
	    path: '/eye/verifyResult',
	    name:'verifyResult',
	    component: (resolve) => { require(['../src/views/risk/verifyResult.vue'], resolve) }
	},
	{
	    path: '/eye/identifyPic',
	    name:'identifyPic',
	    component: (resolve) => { require(['../src/views/risk/identifyPic.vue'], resolve) }
	},
	{
	    path: '/eye/verifyItem',
	    name: 'verifyItem',
	    component: (resolve) => { require(['../src/views/risk/verifyItem.vue'], resolve) }
	},
	{
	    path: '/eye/getZhimaAuthUrl',
	    name:'getZhimaAuthUrl',
	    component: (resolve) => { require(['../src/views/risk/getZhimaAuthUrl.vue'], resolve) }
	},
	{
	    path: '/eye/zhimaVerifyFailed',
	    name:'zhimaVerifyFailed',
	    component: (resolve) => { require(['../src/views/risk/zhimaVerifyFailed.vue'], resolve) }
	},
	// {
	//     path: '/eye/telephoneVerify',
	//     component: (resolve) => { require(['../src/views/risk/telephoneVerify.vue'], resolve) }
	// },
	// {
	//     path: '/eye/flashBank',
	//     component: (resolve) => { require(['../src/views/risk/flashBank.vue'], resolve) }
	// },
	{
	    path: '/eye/bindBank',
	    name:'riskbindBank',
	    component: (resolve) => { require(['../src/views/risk/bindBank.vue'], resolve) }
	},
	{
	    path: '*',
	    component: (resolve) => { require(['../src/views/home.vue'], resolve) }
	}, 
]