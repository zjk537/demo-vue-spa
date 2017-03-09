<template>
	<div class="forgetServicePassword">
        <comHeader title="手机信息" back="true" @onBackClick="goback"></comHeader>
        <div class="resetStep1">
            <p class="title">
                方法一:&nbsp;&nbsp;电话重置
            </p>
            <div class="stepDetail">
                <p class="stepTitle">
                    <img src="/static/img/little-blue-phone.png">
                    <span>拨打运营商电话重置密码</span>
                </p>
                <span class="mobile">{{carrieroperator | telFilter }}</span>
                <button v-if="carrieroperator == 'LIANTONG' " onclick="_hmt.push(['_trackEvent', 'h5_liantong_service', 'click', '联系客服']);window.location.href='tel:10010'">联系客服</button>
                <button v-if="carrieroperator == 'DIANXIN' " onclick="_hmt.push(['_trackEvent', 'h5_dianxin_service', 'click', '联系客服']);window.location.href='tel:10000'">联系客服</button>
                <button v-if="carrieroperator == 'YIDONG' " onclick="_hmt.push(['_trackEvent', 'h5_yidong_service', 'click', '联系客服']);window.location.href='tel:10086'">联系客服</button>
                <div class="summary">
                    <img src="/static/img/forgetPasswordStep1.png">
                </div>
            </div>
        </div>
        <div class="resetStep2" v-if="carrieroperator=='LIANTONG' ? true : false">
            <p class="title">
                方法二:&nbsp;&nbsp;官网重置
            </p>
            <div class="stepDetail">
                <p class="stepTitle">
                    <!-- <img src="/static/img/little-blue-empty.png"> -->
                    <span>进入联通官网重置密码</span>
                </p>
                <button onclick="_hmt.push(['_trackEvent', 'h5_liantong_resetPwd', 'click', '重置密码']);location.href='https://uac.10010.com/cust/resetpwd/resetpwd?display=wap&page_type=06&app_code=MOBILE_MALL&redirect_uri=http://m.10010.com/mall-mobile/Login/callback&app_code=MOBILE_MALL&state=http://m.10010.com&sudaibear_outer=true'">去官网重置</button>
            </div>
        </div>
        <div class="resetStep2" v-if="carrieroperator=='DIANXIN2' ? true : false">
            <p class="title">
                方法二:&nbsp;&nbsp;官网重置
            </p>
            <div class="stepDetail">
                <p class="stepTitle">
                    <!-- <img src="/static/img/little-blue-empty.png"> -->
                    <span>进入电信官网重置密码</span>
                </p>
                <button onclick="_hmt.push(['_trackEvent', 'h5_dianxin_resetPwd', 'click', '重置密码']);location.href='http://wapzt.189.cn/pages/login/login_userLogin.html#/pages/password/passwordNoLogin.html?sudaibear_outer=true'">去官网重置</button>
            </div>
        </div>
	</div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    import utily from '../../js/common/utily.js';
    import { Toast ,Indicator,Picker} from 'mint-ui';
    export default {
        name: 'forgetPassword',
        data () {
            return {
                carrieroperator:null
            }
        },
        components: {
            riskStep,
            comHeader
        },
        watch: {
          '$route':'init'
            
        },
        mounted(){ 
            this.$nextTick(() => {
                this.init()
            })
        },
        filters:{
            telFilter(value){
                if(value == 'LIANTONG'){
                    return '10010';
                }
                if(value == 'DIANXIN'){
                    return '10000';
                }
                if(value == 'YIDONG'){
                    return '10086';
                }
            }
        },
        methods:{
            init:function(){
                Indicator.open();
                this.$http.post('/apis/risk/h5/mobile/forgetPassword').then((response) => {
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
                    this.carrieroperator = resData.data;

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },
            goback(){
                this.$router.replace({
                    name:'mobileVerify'
                });
            },
        }
    }
</script>

<style lang="scss">
    @import '../../scss/risk/forgetPassword.scss';
</style>