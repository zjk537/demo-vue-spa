<template>
	<div class="home">
		<comHeader title="简单借款" menu="我的" @onMenuClick="toMe"></comHeader>
		<div class="content">
            <div class="circle">
                <svg width="260" height="260" viewbox="0 0 260 260">
                    <circle cx="130" cy="130" r="120" stroke-width="1" stroke="#e6e6e6" stroke-dasharray="3,2" fill="none"></circle>
                    <circle cx="130" cy="130" r="110" stroke-width="4" stroke="#e6e6e6" fill="none"></circle>
                    <circle cx="130" cy="130" r="110" stroke-width="4" stroke="#3d3dcb" fill="none" transform="rotate(-90, 130, 130)" stroke-dasharray="0 1069"></circle> 
                </svg>
                <!-- <div class="canvas"></div> -->
                <div class="box">
                    <h3>{{ info.availableAmount | toInt }}</h3>
                    <p>可借额度</p>
                    <button v-if="!info.isHaveTrade && info.isPromoteQuota" @click="upAmount">提高额度</button>
                </div>
            </div>
            <div v-if="!info.isLogin || (!info.isHaveTrade && info.availableAmount == 0) " class="msg">认证后最高可借5000元</div>
            <div v-if="info.isHaveTrade" class="item">
               <span class="bill">待还金额</span><span class="amount">{{ info.stillAmount | toDecimal }}</span>
            </div>
            <router-link v-if="!info.isLogin" class="btn" tag="div" :to="{name:'login'}">获得额度</router-link><!-- 登录 -->
            <div v-else-if="info.isHaveTrade" class="btn" @click="toPaying">我要还款</div><!-- 还款 -->
            <div v-else-if="info.availableAmount == 0" class="btn" @click="toRisk" >获得额度</div><!-- 风控 -->
            <div v-else class="btn" @click="toBorrow">立即借款</div>
        </div>
	</div>
</template>

<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,MessageBox } from 'mint-ui';
var utility = require('static/js/utility');
var common = require('static/js/common');
export default {
    name: 'home',
    props: [],
    data() {
        return {
            info:{
                availableAmount:0, //可借额度
                stillAmount:0, // 待还金额
                isPromoteQuota:false, //是否有提额项
                accountStatus:0, //账户状态 0正常 非0冻结
                isHaveTrade:false, //是否有借款
                isToPay:false, //是否可还款
                isLogin:false
            }
        }
    },
    components: {
        comHeader,Indicator,Toast,MessageBox
        
    },
    filters:{
        toDecimal:utility.toDecimal,
        toInt: utility.toInt
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
            $(window).scroll();
        });
    },
    methods: {
        initPage(){
            this.getInfoData();
            //this.canvasCircle();
            this.circleLoading(this.info.availableAmount);
        },
        circleLoading(value){ // 无用
            if(!value) {
                value = 0;
                return;
            }
            let $circles = $('circle');
            let percent = value / 500000,
                perimeter = Math.PI * 2 * 110;
            $circles[0].setAttribute('stroke','#b1b1ea');
            $circles[1].setAttribute('stroke','#b1b1ea');
            $circles[2].setAttribute('stroke-dasharray',perimeter * percent + ' ' + perimeter * (1 - percent));
        },
        canvasCircle(value){
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                PI = Math.PI

            if(!value) {
                value = 0;
            }
            canvas.width = 260
            canvas.height = 260
            canvas.style.cssText = 'width: 260px;height: 260px;'
            ctx.scale(2, 2)
            var percent = value / 500000
            ctx.save()
            ctx.translate(65,65)
            ctx.lineWidth = 1
            ctx.setLineDash([3, 2])
            ctx.fillStyle = '#e6e6e6'

            // 虚线圆
            ctx.save()
            ctx.strokeStyle = '#e6e6e6'
            ctx.rotate(-PI / 2)
            ctx.beginPath()
            ctx.arc(0, 0, 60, 0, PI * 2, false)
            ctx.stroke()
            ctx.restore()

            // 实线
            ctx.save()
            ctx.strokeStyle = value === 0 ? '#e6e6e6' : '#b1b1ea'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 0])
            ctx.rotate(-PI / 2)
            ctx.beginPath()
            ctx.arc(0, 0, 55, 0, PI * 2, false)
            ctx.stroke()
            ctx.restore()

            if(value > 0){
                var per = 0;
                var interval = setInterval(function(){
                    // 高亮圆
                    per += 0.01;
                    ctx.save()
                    ctx.strokeStyle = '#3d3dcb'
                    ctx.lineWidth = 2
                    ctx.setLineDash([5, 0])
                    ctx.rotate(-PI / 2)
                    ctx.beginPath()
                    ctx.arc(0, 0, 55, 0, PI * per * 2, false)
                    ctx.stroke()
                    ctx.restore()
                    if(per >= percent){
                        clearInterval(interval);
                    }
                },10);
            }
            
            $('.canvas').html(canvas)

        },
        getInfoData(){
            let apiUrl = '/apis/index';
            let params = {};
            Indicator.open();
            this.$http.get(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                this.info = resData.data;
                if(!this.info.isLogin){ // 未登录，清空本地cookie
                    $.cookie('sdx_auth_h5_token',null,{
                        expires: -1,
                        path:'/',
                        domain:'.jiandanjiekuan.com',
                        secure: false
                    });
                }
                if(resData.data.availableAmount){
                    // $('.circle').addClass('enable');
                    this.circleLoading(resData.data.availableAmount);
                    //this.canvasCircle(resData.data.availableAmount);
                }
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败,请稍后重试!',position:'bottom' });
                console.log(error);
            });
        },
        upAmount(){
            _hmt.push(['_trackEvent', 'h5_upAmount', 'click', '提高额度']);
            MessageBox({
              title: '',
              message: '下载APP，获取更高的借款额度',
              confirmButtonText:'立即下载'
            }).then(action => {
                _hmt.push(['_trackEvent', 'h5_upAmount_download', 'click', '提额_立即下载']);
                common.downLoad();
            });
        },
        toMe(){
            this.$router.push({
                name:'authMe'
            });
        },
        toRisk(){
            _hmt.push(['_trackEvent', 'h5_getAmount', 'click', '获得额度']);
            Indicator.open()
            this.$http.post('/apis/risk/h5/index').then((response) => {
                Indicator.close()
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                let basicAuth = resData.data.basicAuth;
                let nextRouter = '';
                switch(basicAuth.nextStep){
                    case 900:
                    case 901:
                    case 902:
                        nextRouter = 'verifyResult';
                        break;
                    case 100:
                    case 101:
                        nextRouter = 'identiy';
                        break;
                    case 200:
                        nextRouter = 'getZhimaAuthUrl';
                        break;
                    case 300:
                        nextRouter = 'relationMes';
                        break;
                    case 301:
                        nextRouter = 'mobileVerify';
                        break;
                    case 400:
                        nextRouter = 'riskbindBank';
                        break;
                }
                this.$router.push({
                    name: nextRouter
                });
                //console.log(basicAuth);
            }, (error) => {
                console.log(error);
            });
        },
        toPaying(){
            _hmt.push(['_trackEvent', 'h5_toBorrow', 'click', '我要还款']);
            let apiUrl = '/apis/index';
            let params = {};
            Indicator.open();
            this.$http.get(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                if(!resData.data.isLogin){
                    this.$router.push({
                        name: 'login'
                    });
                    return;
                }
                if(!resData.data.isHaveTrade){
                    let _vue = this;
                    MessageBox({
                      title: '',
                      message: '您的借款申请失败，请重新借款',
                      confirmButtonText:'我知道了'
                    }).then(action=>{
                        _vue.info = resData.data;
                        if(resData.data.availableAmount){
                            _vue.circleLoading(resData.data.availableAmount);
                            //_vue.canvasCircle(resData.data.availableAmount);
                        }
                    });
                    return;
                }
                if(!resData.data.isToPay){
                    MessageBox({
                      title: '',
                      message: '您的借款还未出账单，请出账后还款',
                      confirmButtonText:'我知道了'
                    });
                    return;
                }
                this.$router.push({
                    name:'paymentPaying'
                });
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
            
        },
        toBorrow(){
            _hmt.push(['_trackEvent', 'h5_toBorrow', 'click', '立即借款']);
            let apiUrl = '/apis/index';
            let params = {};
            Indicator.open();
            this.$http.get(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                if(!resData.data.isLogin){
                    this.$router.push({
                        name: 'login'
                    });
                    return;
                }
                if(resData.data.accountStatus != 0){
                    MessageBox({
                      title: '',
                      message: '您的账户被冻结，请联系客服',
                      showCancelButton: true,
                      confirmButtonText:'联系客服',
                      cancelButtonText: '取消'
                    }).then(action=>{
                        if(action == 'confirm'){
                            // window.location.href="wtai://wp//mc;4006050050";
                            window.location.href="tel:4006050050";
                        }
                    });
                    return;
                }
                if(!resData.data.isPassword){
                    this.$router.push({
                        name:'setTradePwd'
                    });
                    return;
                }

                this.$router.push({
                    name:'borrow'
                });
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
            
        }

    }
}
</script>

<style lang="scss">
@import './src/scss/home';
</style>