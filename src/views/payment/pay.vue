<template>
    <div class="pay">
        <comHeader title="确认支付" back="true"></comHeader>
        <comEmpty msg="暂无还款详情" img="ic_empty.png"></comEmpty>
        <div class="content contentContainer"  style="display:none;">
            <div class="wrap">
            	<div class="amount">
                    <h3 class="coin">{{ bill.amount | toDecimal}}</h3>
                    <p>还款总金额 (元)</p>   
                </div>
                <div class="detail">
                    <billDetail :details="bill.details"></billDetail>
                </div>
                <div class="split"></div>
                <div class="group bankContainer">
                    <ul class="radio_list">
                        <li v-for="(bank,index) in bindBanks" :class="bank | filterClass(index)" @click="bankCheck" :data-id="bank.id">
                            <router-link v-if="'addbank' == bank.payType" :to="{ name: 'bindBank'}" onclick="_hmt.push(['_trackEvent', 'h5_pay_addNewCard', 'click', '还款_添加新卡支付']);">
                                <div class="title">
                                    <label>添加新卡支付</label>
                                </div>
                                <i class="iconfont icon-jiantou"></i>
                            </router-link>
                            <div v-else class="title">
                                <img :src="bank.bankPic">
                                <label>{{ bank.cardName }}（尾号{{ bank.cardLast }}）</label>
                                <span>{{ bank.bankNote }}</span>
                            </div>
                            <div class="box"></div>
                        </li>
                        <!-- 
                            <li class="" v-on:click="bankCheck($event)">
                                <div class="title" style="background-image:url(/static/img/ic_zxbank.png)">
                                    <label>中信银行储蓄卡（尾号3582）</label>
                                    <span>限额10000元</span>
                                </div>
                                <div class="box"></div>
                            </li>
                            <li class="checked" v-on:click="bankCheck($event)">
                                <div class="title" style="background-image:url(/static/img/ic_zxbank.png)">
                                    <label>中信银行储蓄卡（尾号3582）</label>
                                    <span>限额10000元</span>
                                </div>
                                <div class="box"></div>
                            </li>
                            <li class="add" v-on:click="bankCheck($event)">
                                <div class="title">
                                    <label>添加新卡支付</label>
                                </div>
                                <i class="iconfont icon-jiantou"></i>
                            </li>
                            <li class="disabled" v-on:click="bankCheck($event)">
                                <div class="title" style="background-image:url(/static/img/ic_zxbank.png)">
                                    <label>中信银行储蓄卡（尾号3582）</label>
                                    <span>银行系统升级，暂无法使用</span>
                                </div>
                            </li> 
                        -->
                    </ul>
                    <!-- <div class="more" @click="showMore($event)">
                        更多支付方式<i class="iconfont icon-jiantou-copy1">
                    </div> -->
                </div>
            </div>
            <div :class="'btn ' +(bindBanks.length > 1 ? '' : 'disabled')" @click="validatePay">确认支付</div>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import billDetail from 'components/billDetail.vue';
import { Indicator,Toast,MessageBox } from 'mint-ui';
let utility = require('static/js/utility');
export default {
    name: 'pay',
    data() {
        return {
            bill:{},
            bindBanks:[]
        }
    },
    filters:{
        filterClass(value,index){
            if("addbank" == value.payType){
                return "add";
            }
            if(0 === index){
                return "checked";
            }
            if(0 === value.status){
                return "disabled";
            }
        },
        toDecimal:utility.toDecimal
    },
    components: {
        comHeader,comEmpty,billDetail,Indicator,Toast,MessageBox
        
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.getDetail();
        })
    },
    // watch: {
    //     // 如果路由有变化，会再次执行该方法
    //     '$route': 'getDetail'
    // },
    methods: {
        bankCheck(event){
            var $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            }
            if($sender.hasClass('add')){// 已添加link 跳转
                return;
            }
            if($sender.hasClass('checked')){
                return;
            }

            $sender.siblings().removeClass('checked');
            $sender.addClass('checked');
        },
        showMore(event){
            var $sender = $(event.currentTarget || event.target),
                $bankContainer = $(".bankContainer");
            $bankContainer.find('li').show();
            $sender.hide();
        },
        getDetail(){
            Indicator.open();
            let $contentContainer = $('.contentContainer'),
                $emptyContainer = $('.emptyContainer');
            let apiUrl = '/apis/bill/payCashier';
            let params = {
                billId: this.$route.params.billId
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
                if(resData.code != 200){
                    $emptyContainer.show();
                    Toast(resData.message);
                    return;
                }
                this.bill = resData.data.bill;
                this.bindBanks = resData.data.bindBanks;
                $contentContainer.show();
            }, (error) => {
                Indicator.close();
                $emptyContainer.addClass('error').show();
                //Toast({message:'数据请求失败,请稍后重试!',position:"bottom" });
                console.log(error);
            });

        },
        validatePay(event){ 
            _hmt.push(['_trackEvent', 'h5_pay_confirm', 'click', '还款_确认支付']);
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            } 
            let $bankContainer = $(".bankContainer");
            let bindcardId = $bankContainer.find('li.checked').attr('data-id');
            let apiUrl = '/apis/bill/bankpay';
            let params = {
                billId: this.$route.params.billId,
                bindcardId: bindcardId
            }
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                let resData = response.data;
                
                if(resData.code == 202){
                    MessageBox({
                        title:'账单金额变更',
                        message: resData.message,
                        confirmButtonText:'我知道了'
                    }).then(action=>{
                        // 重新加载，或直接数据绑定
                        this.bill = resData.data.bill;
                        //window.location.reload();
                    });
                }
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
                // 跳转
                let bindcard = resData.data.bindcard; 
                let confirmbill = {
                    billId:this.bill.billId,
                    billDetail: this.bill.details,
                    bindcardId: bindcard.id,
                    mobile: bindcard.mobile,
                    amount: this.bill.amount
                } 
                this.$store.dispatch('saveConfirmBill', confirmbill);
                this.$router.replace({
                    name:'paymentCardPay'
                });
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:"bottom" });
                console.log(error);
            });
        }

    }
}
</script>

<style lang="scss">
@import './src/scss/payment/pay';
.mint-msgbox-message{
    text-align:left;
    line-height:1.5rem;
}
</style>