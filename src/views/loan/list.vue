<template>
    <div class="list">
        <comHeader title="借款列表" back="true"></comHeader>
        <comEmpty msg="暂无借款信息"></comEmpty>
        <div class="group listContainer" style="display:none;" 
        v-infinite-scroll="loadMore" 
        infinite-scroll-disabled="loading"
        infinite-scroll-distance="10"
        infinite-scroll-immediate-check="false">
            <div class="item" v-for="item in items">
        		<ul >
        			<li>
        				<label>借款总额</label><span class="coin">{{ item.amount | toDecimal }}</span>
        			</li>
        			<li>
        				<label>申请成功时间</label><span>{{ item.createDate }}</span>
        			</li>
        			<li>
        				<label>订单状态</label><span>{{ item.statusName }}</span>
        			</li>
        		</ul>
                <router-link v-if="item.status == 1" :to="{name:'paymentPaying', params:{ billId: item.billId }}" onclick="_hmt.push(['_trackEvent', 'h5_loan_toPay', 'click', '借款_去还款']);">
                    去还款<i class="iconfont icon-jiantou"></i>
                </router-link>
        		<router-link v-if="item.status == 2" :to="{name:'paymentDetail', params:{ billId: item.billId, backUrl:'/' }}" onclick="_hmt.push(['_trackEvent', 'h5_loan_payDetail', 'click', '借款_查看账单']);">
                    查看账单<i class="iconfont icon-jiantou"></i>
                </router-link>
            </div>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import { Indicator,Toast,InfiniteScroll } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'loanList',
    props: [],
    data() {
        return {
            pageIndex:0,
            loading:false,
            items:null
        }
    },
    components: {
        comHeader,comEmpty,Indicator,Toast,InfiniteScroll
        
    },
    filters:{
        toDecimal: utility.toDecimal
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods: {
        initPage(){
            this.loadMore();
        },
        loadMore(){
            let $emptyContainer = $(".emptyContainer"),
                $listContainer = $('.listContainer');
            this.pageIndex++;
            let apiUrl = '/apis/trade/findTradeList';
            let params = {
                pageNum: this.pageIndex
            };
            this.loading = true;
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    if(this.pageIndex==1) $emptyContainer.show();
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code === 6010){
                    // 您尚未认证身份信息，请认证后再申请借款
                    $emptyContainer.show();
                    return;
                }
                if(resData.code != 200){
                    if(this.pageIndex==1) $emptyContainer.show();
                    Toast(resData.message);
                    return;
                }
                if(!resData.data || resData.data.length === 0){
                    if(this.pageIndex == 1) {
                        $emptyContainer.show();
                    } else {
                        Toast('已经到底啦');
                    }
                    return;
                }
                this.items = resData.data;
                this.loading = false;
                $listContainer.show();
            }, (error) => {
                Indicator.close();
                this.loading = false;
                $emptyContainer.addClass('error').show();
                //Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/loan/list'
</style>