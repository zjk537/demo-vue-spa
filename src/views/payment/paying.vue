<template>
    <div class="paying">
        <comHeader title="待还账单" back="true" menu="已还账单" @onMenuClick="toPaidBill"></comHeader>
        <comEmpty msg="暂无还款账单"></comEmpty>
        <div class="content detailContainer" style="display:none;">
            <div class="group">
            	<div class="status">
                    应还总额 (元)<span>{{ bill.statusName }}</span>
                </div>
                <div class="amount">
                    <h3>{{ bill.amount | toDecimal }}</h3>
                    <div class="date">到期还款日 {{ bill.repayEndDate }}</div>
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
            <div class="btn" @click="onConfirmPay">确认还款</div>
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
    name: 'paying',
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
        this.$nextTick(() => {
            this.getPayingBill();
        })
    },
    methods: {
        // 获取待付款账单
        getPayingBill(){
            var $detailContainer = $(".detailContainer"),
                $emptyContainer = $(".emptyContainer");
            
            Indicator.open();
            this.$http.post('/apis/bill/pendRepayment',{},{credentials: true})
            .then((response) => {

                Indicator.close();
                if(response.status != 200){
                    $emptyContainer.show();
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code == 4100){// 账户不存在
                    $emptyContainer.show();
                    return;
                }
                if(resData.code != 200){
                    $emptyContainer.show();
                    Toast(response.data.message);
                    return;
                }
                if(!resData.data || resData.data.length === 0){
                    $emptyContainer.show();
                    return;
                }
                this.bill = resData.data[0];
                $detailContainer.show();
            }, (error) => {
                Indicator.close();
                $emptyContainer.addClass('error').show();
                Toast({message:'数据请求失败，请稍后重试',position:"bottom" });
                console.log(error);
            });
        },
        onConfirmPay(event){
            _hmt.push(['_trackEvent', 'h5_paying_confirm', 'click', '还款_确认还款']);
            let $sender = $(event.currentTarget || event.target);
            if(this.bill.status === 320){
                Toast('您的还款申请正在处理中');
                return;
            }
            if($sender.hasClass('disabled')){
                return;
            }

            this.$router.push({
                name:'paymentPay',
                params:{
                    billId: this.bill.billId
                }
            })
        },
        toPaidBill(){
            _hmt.push(['_trackEvent', 'h5_toPaidBill', 'click', '立即借款']);
            this.$router.push({
                name:'paymentList'
            });
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/payment/paying'
</style>