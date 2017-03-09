<template>
	<div class="mobileVerify">
        <comHeader title="手机信息" back="true" @onBackClick="goRiskIndex"></comHeader>
        <riskStep widthLine="80%" dotOneClass="active"  dotTwoClass="active"  dotThreeClass="active"></riskStep>
       <!--  <telephoneVerify v-if="initData.authType=='lhp'"></telephoneVerify> -->
        <flashBank v-if="initData.authType=='wecash'"></flashBank>

	</div>
</template>

<script>
import comHeader from 'components/header.vue';
import riskStep from 'components/riskStep.vue';
import flashBank from './flashBank.vue';/*
import telephoneVerify from './telephoneVerify.vue';*/
import { Indicator,Toast,Picker,Popup,MessageBox } from 'mint-ui';
export default {
    name: 'mobileVerify',
    data () {
        return {
            authType:{
                wecash:false,
                lhp:false
            },
            initData:{}
        }
    },
    components: {
        riskStep,
        comHeader,
        flashBank,
        Indicator
    },
    mounted: function() {
        this.$nextTick(() => {
            this.startVerify();
        })
    },
    methods:{
        startVerify:function(){
            Indicator.open();
            this.$http.post('/apis/risk/h5/mobile/init').then((response) => {
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
                this.initData = resData.data;

            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
         goRiskIndex(){
            this.$router.replace({
                name:'verifyItem'
            });
        },
    }
}
</script>

<style lang="scss">
    @import '../../scss/risk/messageStyle.scss';
    .mobileVerify{height:100%;position:relative;}
    // .smsItem .right{
    //     border-left:1px solid #e3e3e3;
    //     top:1rem !important;
    //     white-space: nowrap;
    // }
    // .vertical-line {
    //     display: none;
    // }
    .code{margin-left: 0.4rem;}
</style>