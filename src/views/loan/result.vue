<template>
    <div class="loan_result">
        <comHeader title="申请成功"></comHeader>
        <div class="steps">
            <div class="step step1 enabled">
                <div class="line"></div>
                <div class="box"></div>
                您的借款申请已提交
            </div>
            <div class="step step2">
                <div class="line"></div>
                <div class="box"></div>
                打款成功
                <div class="desc">您的账单状态将在<span>5</span>分钟内更新，请稍后查看</div>
            </div>
        </div>
        <div class="amount">
            <label>借款金额 (元)</label>
            <h3 class="coin">{{ this.amount | toDecimal }}</h3>
        </div>
        <div class="btnbar">
            <router-link :to="{ name: 'home'}" class="btn" replace>返回首页</router-link>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'loanResult',
    data() {
        return {
            tradeId:0,
            amount:0,
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
        })
    },
    methods: {
        initPage(){
            this.tradeId = this.$route.params.tradeId;
            let apiUrl = '/apis/trade/status';
            let params = {
                tradeId:this.tradeId
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
                if(resData.data.status == 170 || resData.data.status == 190){ // 打款成功
                    $('.step2').addClass('enabled');
                    return;
                }
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
@import './src/scss/loan/result'
</style>