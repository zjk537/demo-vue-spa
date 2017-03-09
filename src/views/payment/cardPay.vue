<template>
    <div class="card_pay">
        <comHeader title="银行卡支付" back="true"></comHeader>
        <div class="content" >
        	<div class="amount">
                <h3 class="coin">{{ confrimBill.amount | toDecimal }}</h3>
                <p>还款总金额 (元)</p>   
            </div>
            <div class="detail">
                <billDetail :details="confrimBill.billDetail"></billDetail>
            </div>
            <div class="split"></div>
            <div class="group">
                <p>本次交易需要短信确认，验证码已发送至手机：<br/><em>{{ confrimBill.mobile }}</em> </p>
                <div class="item flex">
                    <input v-model="smsCode" type="text" name="" @keyup="onValuesChange" placeholder="请输入短信验证码"><span @click="getSmsCode">获取验证码</span>
                </div>
            </div>
        </div>
        <div id="btnConfirm" class="btn disabled" @click="onConfirmPay">确认支付</div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import billDetail from 'components/billDetail.vue';
import { Indicator,Toast,MessageBox } from 'mint-ui';
import { mapGetters } from 'vuex'
let utility = require('static/js/utility');
export default {
    name: 'cardPay',
    data() {
        return {
            timer:60,
            smsCode:'',
            lat:null,
            lon:null
        }
    },
    components: {
        comHeader,billDetail,Indicator,Toast,MessageBox
        
    },
    computed: mapGetters({
        confrimBill:'getConfirmBill'
    }),
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
            this.getBillDetail();
            this.geoLocationLoad();
        },
        geoLocationLoad(callBack){
            var lbsObj = {
                lat: '',
                lon: ''
            };
            if($.cookie('sdx_h5_lbs')){
                lbsObj = JSON.parse($.cookie('sdx_h5_lbs'));
            }
            this.lat = lbsObj.lat;
            this.lon = lbsObj.lon;
            // if(!navigator.geolocation){
            //     Toast("您的浏览器不支持地理位置");
            //     return;
            // }
            // var options = {
            //    enableHighAccuracy:true, 
            //     timeout: 1000 * 5,
            //    maximumAge:1000
            // };
            // var _vue = this;
            // navigator.geolocation.getCurrentPosition(function(pos){
            //     _vue.lat = pos.coords.latitude;
            //     _vue.lon = pos.coords.longitude;
            //     if(callBack){
            //         callBack();
            //     }
            // },function(e) {
            //     //  MessageBox({
            //     //     title: '定位服务不可用',
            //     //     message: '方法1：请打开App的定位服务<br/>方法2：请点击返回，重新进入此页面',
            //     //     showCancelButton: true,
            //     //     cancelButtonText:'关闭',
            //     //     confirmButtonText:'确定'
            //     // });
            //      console.log(e);
            // },options);
        },
        getSmsCode(event){
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            }

            let apiUrl = '/apis/bill/bankpay/verifyCode';
            let params = {
                billId: this.confrimBill.billId,
                bindcardId: this.confrimBill.bindcardId,
                mobile: this.confrimBill.mobile
            };
            $sender.addClass('disabled');
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                $sender.removeClass('disabled');
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
                
                $sender.addClass('disabled');
                Toast('短信验证码已发送，请注意查收');
                var interTime = this.timer;
                var timeInterval = setInterval(function () {
                    if(interTime <= 0){
                        $sender.html('重新获取');
                        interTime = this.timer;
                        clearInterval(timeInterval);
                        $sender.removeClass('disabled');
                        return;
                    }

                    interTime --;
                    $sender.text(interTime +'s');
                },1000);
            }, (error) => {
                Indicator.close();
                $sender.removeClass('disabled');
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        onValuesChange(){
            let $btnConfirm = $('#btnConfirm');

            let smsCode = $.trim(this.smsCode);
            if(smsCode.length > 0){
                $btnConfirm.removeClass('disabled');
            } else {
                $btnConfirm.addClass('disabled');
            }
        },
        getBillDetail(){
            Indicator.open();
            let apiUrl = '/apis/bill/payCashier';
            let params = {
                billId: this.confrimBill.billId
            }
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
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
                this.confrimBill.billDetial = resData.data.bill.details;
                this.confrimBill.amount = resData.data.bill.amount;
                this.$store.dispatch('saveConfirmBill', this.confrimBill);
                
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:"bottom" });
                console.log(error);
            });

        },
        onConfirmPay(event){
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            }
            let smsCode = $.trim(this.smsCode);
            if(!smsCode){
                Toast('请输入短信验证码');
                return;
            }
            this.confirmPay();
        },
        confirmPay(){
            //let geoLocation = utility.getGeolocation();
            let apiUrl = '/apis/bill/bankpay/confirmPay';
            let params = {
                billId: this.confrimBill.billId,
                bindcardId: this.confrimBill.bindcardId,
                validateCode: this.smsCode,
                amount: this.confrimBill.amount,
                lon: this.lon,
                lat: this.lat
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
                if(resData.code == 8600){
                    MessageBox({
                        title:'账单金额变更',
                        message: resData.message.replace(/\n/g,"<br/>"),
                        confirmButtonText:'我知道了'
                    }).then(action => {
                        // 重新加载，或直接数据绑定
                       this.getBillDetail();
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
            
                _hmt.push(['_trackEvent', 'h5_pay_OK', 'click', '还款_银行卡支付(成功)']);
                this.$router.replace({
                    name:'payResult',
                    params: { billId: this.confrimBill.billId }
                });
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
@import './src/scss/payment/cardPay'
</style>