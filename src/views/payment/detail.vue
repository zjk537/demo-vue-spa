<template>
    <div class="pay_detail">
        <comHeader title="还款详情" back="true" @onBackClick="onGoBack"></comHeader>
        <comEmpty msg="暂无还款详情" img="ic_empty.png"></comEmpty>
        <div class="content contentContainer" style="display:none;">
        	<div class="status">已还总额 (元)<a href="javascript:;">{{ bill.statusName}}</a></div>
            <div class="amount">
                <h3 class="coin">{{ bill.amount | toDecimal }}</h3>
                <div v-if="bill.status == 330"  class="date">还款时间 {{ bill.realPayDate }} {{ bill.realPayTime }}</div>
                <div v-else class="date">到期还款日 {{ bill.repayEndDate }}</div>
            </div>
            <div class="info detail ">
                <h4>还款明细</h4>
                <billDetail :details="bill.details"></billDetail>
            </div>
            <div class="info other">
                <h4>其他信息</h4>
                <ul>
                    <li><label>借款日</label><span>{{ bill.loanDate }}</span></li>
                    <li><label>借款天数</label><span>{{ bill.loanDays }}天</span></li>
                    <li><label>交易号</label><span>{{ bill.tradeId }}</span></li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import billDetail from 'components/billDetail.vue';
import { Indicator,Toast } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'payDetail',
    props: [],
    data() {
        return {
            bill:{}
        }
    },
    components: {
        comHeader,comEmpty,billDetail,Indicator,Toast 
    },
    filters:{
        toDecimal:utility.toDecimal
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.getDetail();
        })
    },
    methods: {
        getDetail(){
            Indicator.open();
            let $contentContainer = $('.contentContainer'),
                $emptyContainer = $('.emptyContainer');
            let apiUrl = '/apis/bill/details';
            let params = {
                billId:this.$route.params.billId
            }
            this.$http.post(apiUrl,params).then((response) => {
                Indicator.close();
                if(response.status != 200){
                    $emptyContainer.show();
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    $emptyContainer.show(),
                    Toast(response.data.message);
                    return;
                }
                
                this.bill = resData.data;
                $contentContainer.show();
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });

        },
        onGoBack(){
            let backUrl = this.$route.params.backUrl;
            if(backUrl != '/'){
                this.$router.push({
                    name: backUrl
                });
                return;
            }
            this.$router.go(-1);
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/payment/detail'
</style>