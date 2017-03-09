import '../static/css/reset.css'
import Vue from 'vue'
import App from './App'
import Mint from 'mint-ui'
import VueRouter from 'vue-router'
import VueHttp from 'vue-resource'
import routerconfig from "../config/routerconfig"
import Toast from 'mint-ui';

//import Vuex from 'vuex'
import store from './store'

import 'mint-ui/lib/style.css'
import './assets/iconfont/iconfont.css'
import './assets/js/resetfontsize.js'
require('jquery.cookie')

Vue.use(Mint);
Vue.use(VueRouter)
Vue.use(VueHttp);
//Vue.use(Vuex);

// 跨域请求配置
Vue.http.options.xhr = { withCredentials: true }
//Vue.http.options.root = '';
//Vue.http.headers.common['Authorization'] = 'Basic YXBpOnBhc3N3b3Jk';

// Send request body as application/x-www-form-urlencoded content type
Vue.http.options.emulateJSON = true;

//Send PUT, PATCH and DELETE requests with a HTTP POST and set the X-HTTP-Method-Override header
//Vue.http.options.emulateHTTP = true;

Vue.http.interceptors.push((request, next)  => {

  // modify request
  //request.method = 'POST';
  //request.headers['auth'] = 'authauth';
  
  let _timeout = setTimeout(() =>{
    next(request.respondWith(request.body,{
      status:408,
      statusText:'数据请求超时,请检查您的网络连接'
    }));

    // if(request.onTimeout) {
    //     request.onTimeout(request);
    //     request.abort()
    // }  
    request.abort();
  },1000 * 120);

  // continue to next interceptor
  next((response) => {
    // modify response
    //response.body = '...';
    clearTimeout(_timeout);
    if(response.data.code == 1030 || response.data.code == 1002){// 1030 多端登录  1002 未登录
      //var redirectRouter = vm.$route.path;
      window.localStorage.clear();
      $.cookie('sdx_auth_h5_token',null,{
                    expires: -1,
                    path:'/',
                    domain:'.jiandanjiekuan.com',
                    secure: false
                });
      //vm.$store.dispatch('clearPreBill');
      vm.$store.dispatch('clearAllCache');
      vm.$router.replace({
        name:'login'
        //,query:{ redirect: redirectRouter }
      });
    }
  });
});

const router = new VueRouter({
    mode: 'history',
    routes: routerconfig
});
//登录中间验证，页面需要登录而没有登录的情况直接跳转登录
router.beforeEach((to,from,next) => {
  
  // home 不需要登录
  if(to.meta && to.meta.requiresAuth == false){
    next();
    return;    
  } 
  if($.cookie('sdx_auth_h5_token')){
    next();
    return;
  }
  // 没有cookie 跳转登录
  //var redirectRouter = encodeURIComponent(to.path);
  window.localStorage.clear();
  $.cookie('sdx_auth_h5_token',null,{
                  expires: -1,
                  path:'/',
                  domain:'.jiandanjiekuan.com',
                  secure: false
              });
  //var redirectRouter = to.path;
  next({
      path: '/login'
      //,query: { redirect: redirectRouter }
    });
});

router.afterEach(route => {
  // 百度 统计代码PV
  /*debugger;*/
  if(_hmt){
    _hmt.push(['_trackPageview', '/' + route.name]);
  }
});
/* eslint-disable no-new */
let vm = new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App, Toast },
})
