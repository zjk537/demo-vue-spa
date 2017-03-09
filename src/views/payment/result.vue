<template>
    <div class="pay_result">
        <comHeader title="账单还款"></comHeader>
        <div class="steps">
            <div class="step step1 enabled">
                <div class="line"></div>
                <div class="box"></div>
                您的还款申请已提交
            </div>
            <div class="step step2">
                <div class="line"></div>
                <div class="box"></div>
                <div class="ok">
                    还款成功
                    <div class="desc">您的账单状态将在<span>15</span>分钟内更新，请稍后查看</div>
                </div>
                <div class="nok">
                    还款失败
                    <div class="desc">您的账单还款失败，请重新还款</div>
                </div>
            </div>

        </div>
        <div class="amount">
            <label>还款金额 (元)</label>
            <h3 class="coin">{{ this.amount | toDecimal }}</h3>
        </div>
        <div class="btnbar">
            <router-link :to="{ name: 'home'}" class="btn" replace>返回首页</router-link>
            <router-link :to="{ name: 'paymentDetail', params: { billId: this.billId, backUrl:'home'}}" class="btn" replace>查看还款详情</router-link>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import { mapGetters } from 'vuex'
import { Indicator,Toast } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'payResult',
    props: [],
    data() {
        return {
            billId:0,
            amount:0
        }
    },
    components: {
        comHeader,Indicator,Toast
        
    },
    filters:{
        toDecimal:utility.toDecimal
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods: {
        initPage(){
            this.billId = this.$route.params.billId;
            let apiUrl = '/apis/bill/status';
            let params = {
                billId:this.billId
            };
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                this.amount = resData.data.amount;
                if(resData.data.status == 320){ // 还款中
                    return;
                }
                if(resData.data.status == 330){ // 还款成功
                    $('.step2').addClass('enabled');
                    return;
                }
                $('.step2').addClass('fail');
                console.log(resData);
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
@import './src/scss/payment/result'
</style>