<template>
    <div class="pay_list">
        <comHeader title="已还账单" back="true"></comHeader>
        <comEmpty msg="暂无还款账单"></comEmpty>
        <div class="group listContainer" style="display:none;">
        	<ul v-infinite-scroll="loadMore" infinite-scroll-immediate-check="false">
                <router-link :to="{ name: 'paymentDetail',  params: { billId: item.billId, backUrl:'/'}}" tag="li" v-for="item in items">
                    <div class="coin">{{ item.amount | toDecimal }}</div>
                    <div class="princ">借款{{ item.principalAmount | toDecimal }}</div>
                    <div class="date">{{ item.realPayDate }} <i class="iconfont icon-jiantou"></i></div>
                </router-link>
            </ul>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import { Indicator,Toast,InfiniteScroll } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'payList',
    props: [],
    data() {
        return {
            pageIndex:0,
            items:[],
            isBottom:false
        }
    },
    components: {
        comHeader,comEmpty,Indicator,Toast,InfiniteScroll
        
    },
    filters:{
        toDecimal:utility.toDecimal
    },
    mounted: function() {
        this.$nextTick(() => {
            this.loadMore();
        })
    },
    methods: {
        loadMore(){
            if(this.isBottom)
                return;
            let $emptyContainer = $('.emptyContainer'),
                $listContainer = $('.listContainer');
            this.pageIndex++;
            Indicator.open();
            let apiUrl = '/apis/bill/repayment';
            let params = {
                pageNum:this.pageIndex
            }
            this.$http.post(apiUrl,params,{credentials: true})
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
                if(!resData.data.pageData || resData.data.pageData.length === 0){
                    if(this.pageIndex == 1) $emptyContainer.show();
                    this.isBottom = true;
                    return;
                }
                this.items = resData.data.pageData;
                $listContainer.show();
            }, (error) => {
                Indicator.close();
                $emptyContainer.addClass('error').show();
                //Toast({message:'数据请求失败,请稍后重试!',position:'bottom' });
                console.log(error);
            });
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/payment/list'
</style>