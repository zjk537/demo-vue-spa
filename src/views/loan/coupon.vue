<template>
    <div class="coupon">
        <comHeader title="选择优惠券" back="true"></comHeader>
        <comEmpty msg="暂无可用优惠券"></comEmpty>
        <div class="content coupContainer" style="display:none;">
            <div class="noticemsg">优惠券减免金额不超过服务费</div>
            <div v-for="item in coupons" :class="'group ' + (item.busStatus == 1 ? 'disabled' :'') ">
                <div class="split"></div>
                <div class="detail" @click="onCouponSelected(item)">
                    <div class="name">{{ item.typeName }}</div>
                    <ul>
                        <li>{{ item.moneyDescribe }}</li>
                        <li>{{ item.endTime }}</li>
                    </ul>
                    <span class="coin">{{ item.money | toInt }}</span>
                </div>
                <div class="rules">
                    {{ item.couponDescribe }}
                </div>
                <i class="iconfont icon-jiantou" @click="onFoldClick"></i>
            </div>
            <div class="btnbar">
                <div class="btn" @click="noCoupon">不使用优惠券</div>
            </div>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import { mapGetters } from 'vuex';
let utility = require('static/js/utility');
export default {
    name: 'coupon',
    data() {
        return {
            title:""
        }
    },
    components: {
        comHeader,comEmpty
        
    },
    computed: mapGetters({
        coupons:'getCoupons'
    }),
    filters:{
        toInt: utility.toInt
    },
    mounted: function() {
        this.$nextTick(() => {
            this.initPage();
        });
    },
    methods: {
        initPage(){
            let $emptyContainer = $('.emptyContainer'),
                $coupContainer = $('.coupContainer');
            if(!this.coupons || this.coupons.length == 0){
                $emptyContainer.show();
                $coupContainer.hide();
                return;
            }
            $emptyContainer.hide();
            $coupContainer.show();
        },
        onFoldClick(event){
            let $sender = $(event.currentTarget || event.target),
                $container = $sender.parents('.group');
            if($container.hasClass('unfold')){
                $container.removeClass('unfold');
            } else {
                $container.addClass('unfold');
            }
        },
        onCouponSelected(coupon){
            if(coupon.busStatus == 1){
                return;
            }
            this.$store.dispatch('selectCoupon',coupon);
            this.$router.go(-1);
        },
        noCoupon(){
            this.$store.dispatch('noCoupon');
            this.$router.go(-1);
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/loan/coupon'
</style>