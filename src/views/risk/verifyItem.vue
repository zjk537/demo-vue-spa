<template>
    <div class="verifyItem">
        <comHeader title="认证中心" back="true" @onBackClick="goHome"></comHeader>
        <p>基础认证</p>
        <div class="itemBox" style="display:none;">
            <div class="stepLine">
                <span :class="basicAuth.nextStep | stepFilter(101)"></span>
                <i></i>
                <span :class="basicAuth.nextStep | stepFilter(200)"></span>
                <i></i>
                <span :class="basicAuth.nextStep | stepFilter(301)"></span>
                <i></i>
                <span :class="basicAuth.nextStep | stepFilter(400)"></span>
            </div>
            <section>
                <div :class="basicAuth.nextStep | classFilter(101)" @click="onVerClick">
                    <i></i>
                    <p>身份信息认证<strong>{{ basicAuth.nextStep | msgFilter(101) }}</strong></p>
                </div>

                <div :class="basicAuth.nextStep | classFilter(200)" @click="onVerClick">
                    <i></i>
                    <p>芝麻信用认证<strong>未认证</strong></p>
                </div>
                
                <div :class="basicAuth.nextStep | classFilter(301)" @click="onVerClick">
                    <i></i>
                    <p>手机信息认证<strong>{{ basicAuth.nextStep | msgFilter(301) }}</strong></p>
                </div>
               
                <div :class="basicAuth.nextStep | classFilter(400)" @click="onVerClick">
                    <i></i>
                    <p>绑定银行卡<strong>未认证</strong></p>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,Picker,Popup,MessageBox } from 'mint-ui';
export default {
    name: 'verifyItem',
    data () {
        return{
            basicAuth:{
                nextStep:0,//100,"身份信息" 101,"身份信息" 200,"芝麻认证"300,"手机认证联系人" 301,"手机认证手机授权" 400,"银行卡认证" 900,"审核中" 901,"审核拒绝" 902,"审核通过"
            }
        }
          
    },
    components: {
        comHeader
    },
    filters:{
        stepFilter(value,value2){
            if(parseInt(value/100) == parseInt(value2/100)){
                return 'containue';
            }
            if(value > value2){
               return 'verified';
            }
            return 'noVerify';
        },
        classFilter(value,value2){
            let className = 'item ';
            if(parseInt(value/100) == parseInt(value2/100)){
                className += 'active';
            }
            if(value > value2){
                className += 'finish';
            }
            return className; 
        },
        msgFilter(value,value2){
            if(value > value2){
                return '';
            }
            if(value < value2 || value % 100 == 0){
                return '未认证';  
            } 
            
            return '继续认证';
        }
    },
    mounted: function() {
        this.$nextTick(() => {
            this.fresh();
        })
    },
    methods:{
        
        fresh:function(){
            var $container = $('.itemBox');
            Indicator.open();
            this.$http.post('/apis/risk/h5/index').then((response) => {
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
                this.basicAuth = resData.data.basicAuth;
                if(this.basicAuth.nextStep >= 900){
                    this.$router.replace({
                        name:'verifyResult'
                    });
                    return;
                }
                $container.show();
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        goHome(){
            this.$router.replace({
                name:'home'
            });
        },
        onVerClick:function(){
            let $sender = $(event.currentTarget);

            if(!$sender.hasClass("active")){
                return;
            }
            let nextRouter = '';
            switch(this.basicAuth.nextStep){
                case 100:
                case 101:
                    _hmt.push(['_trackEvent', 'h5_toIdentity', 'click', '身份信息认证']);
                    nextRouter = 'identiy';
                    break;
                case 200:
                    _hmt.push(['_trackEvent', 'h5_toZhima', 'click', '芝麻信用认证']);
                    nextRouter = 'getZhimaAuthUrl';
                    break;
                case 300:
                    _hmt.push(['_trackEvent', 'h5_toRelation', 'click', '手机信息认证']);
                    nextRouter = 'relationMes';
                    break;
                case 301:
                    _hmt.push(['_trackEvent', 'h5_toMobile', 'click', '手机信息认证']);
                    nextRouter = 'mobileVerify';
                    break;
                case 400:
                    _hmt.push(['_trackEvent', 'h5_toRiskBindBank', 'click', '绑定银行卡']);
                    nextRouter = 'riskbindBank';
                    break;
            }
            this.$router.push({
                name: nextRouter
            });
        }
    }
}
</script>

<style lang="scss">
    @import './src/scss/risk/messageStyle.scss';
    @import './src/scss/risk/verifyItem.scss';
</style>