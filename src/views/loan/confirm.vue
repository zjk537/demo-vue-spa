<template>
	<div class="confirm">
		<comHeader title="确认借款申请" back="true" @onBackClick="onCancelTrade"></comHeader>
        <div class="row detail">
    		<ul>
                <li><label>借款金额</label><span class="coin">{{ billDetail.amount | toDecimal }}</span></li>      
                <li><label>到期应还</label><span class="coin">{{ billDetail.totalAmount | toDecimal2(billDetail) }}</span></li>      
                <li><label>服务费</label><span class="coin">{{ billDetail.feeAmount | toDecimal }}</span></li>      
                <li><label>预计还款日</label><span>{{ billDetail.repayDate }}</span></li>      
                <li><label>收款账户</label><span>{{ billDetail.cardName }}</span></li>      
            </ul>
        </div>
        <router-link class="row coupon" :to="{ name: 'coupon'}" tag="div" >
            <label>优惠券</label>
            <span v-if="billDetail.couponDetailSortVo.properCouponCode == undefined">暂无优惠券可使用<i class="iconfont icon-jiantou"></i></span>
            <span v-else-if="billDetail.couponDetailSortVo.properCouponCode == ''" >
                {{ billDetail.couponDetailSortVo.properCouponDescribe }}
            </span>
            <span v-else class="enabled">
            -{{ billDetail.couponDetailSortVo.properCouponMoney | minAmount(billDetail.feeAmount) }}元<i class="iconfont icon-jiantou"></i></span>
        </router-link>
        
        <div class="label">验证码发送至 {{ billDetail.buyerMobile }}</div>
        <div class="form">
            <ul>
                <li class="flex">
                    <label>验证码 </label>
                    <input id="txtSmsCode" type="text" v-model="smsCode" placeholder="请输入验证码" name="" @keyup="onKeyup" autocomplete="off">
                    <span id="btnSmsCode" @click="getSmsCode">获取验证码</span>
                </li>
                <li class="flex">
                    <label>交易密码</label>
                    <input type="password" v-model="tradePwd" placeholder="请输入6位交易密码" name="" @keyup="onKeyup" autocomplete="off">
                </li>
            </ul>
        </div>
        <div class="label">同意
         <router-link :to="{ name: 'contract', params:{ ctype: 'loan'}}" onclick="_hmt.push(['_trackEvent', 'h5_loan_contract', 'click', '借款_借款相关合同']);">借款相关合同
         </router-link>
        </div>
        <div id="btnConfirm" class="btn disabled" @click="loanConfirm">确认借款</div>
	</div>
</template>

<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,MessageBox } from 'mint-ui';
import { mapGetters } from 'vuex';
var utility = require('static/js/utility');
var common = require('static/js/common');
var jsencrypt = require('jsencrypt');
var md5 = require('md5');
export default {
    name: 'confirm',
    data () {
        return {
            smsCode:'',
            tradePwd:'',
            timer:60,
            encryptPK:'',
            lat:null,
            lon:null,
            timeInterval:null
        }
    },
    components: {
        comHeader,Indicator,Toast,MessageBox
    },
    computed: mapGetters({
        billDetail:'getDetail',
        preBill:'getPreBill'
    }),
    filters:{
        toDecimal: utility.toDecimal,
        toDecimal2(totalAmount,bdetail){
            var resultValue = totalAmount;
            if(bdetail.couponDetailSortVo && bdetail.couponDetailSortVo.properCouponCode){
                if(bdetail.couponDetailSortVo.properCouponMoney > bdetail.feeAmount)
                    resultValue = resultValue - bdetail.feeAmount;
                else
                    resultValue = resultValue - bdetail.couponDetailSortVo.properCouponMoney;
            }
            return utility.toDecimal(resultValue);
        },
        minAmount(couponMoney,feeAmount){
            var resultValue = feeAmount;
            if(couponMoney < feeAmount){
                resultValue = couponMoney;
            }
            return utility.toDecimal(resultValue);
        }
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods:{
        initPage(){
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
        onKeyup(){
            let $btnConfirm = $("#btnConfirm");
            if(this.smsCode && this.tradePwd){
                $btnConfirm.removeClass('disabled');
                return;
            }
            if(!$btnConfirm.hasClass('disabled')){
                $btnConfirm.addClass('disabled');
            } 
        },
        getSmsCode(event){
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            }
            var interTime = this.timer;
            let apiUrl = '/apis/trade/getTradeVerificationCode';
            let params = {
                tradeIdStr:this.billDetail.tradeIdStr
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
                if(resData.code == 6207){ // 验证码错误次数太多
                    MessageBox({
                        title: '',
                        message: resData.message,
                        showCancelButton: true,
                        confirmButtonText:'继续申请',
                        cancelButtonText:'取消交易'
                    }).then(action => {
                        if(action == "confirm"){
                            this.createPreBill(); 
                        } else { // cancel
                            this.cancelTrade();
                            this.$router.push({
                                name:'home'
                            });
                        }
                    });
                    return;
                }

                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                
                $sender.addClass('disabled');
                Toast('短信验证码已发送，请注意查收');
                var interTime = this.timer;
                var _vue = this;
                this.timeInterval = setInterval(function () {
                    if(interTime <= 0){
                        $sender.html('重新获取');
                        interTime = _vue.timer;
                        clearInterval(_vue.timeInterval);
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
        createPreBill(){
            Indicator.open();
            let apiUrl = '/apis/trade/createPreTrade';
            let params = {
                productId: this.preBill.pId,
                amount:this.preBill.amount * 100,
                instalment:this.preBill.perid,
                buyerBindCardId: this.preBill.cardId
            }
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code == 887){ // 交易出错
                    MessageBox({
                        title: '',
                        message: resData.message
                    }).then(action => {
                        this.$router.push({
                            name:'home'
                        });
                    });
                    return;
                }
                
                if(resData.code == 888 || resData.code == 621 || resData.code == 6207){ // 888:验证码校验次数超限 621 验证码过期 6207 验证码错误次数太多
                    MessageBox({
                        title: '',
                        message: resData.message,
                        showCancelButton: true,
                        confirmButtonText:'继续申请',
                        cancelButtonText:'取消交易'
                    }).then(action => {
                        if(action == "confirm"){
                            this.createPreBill(); 
                        } else { // cancel
                            this.cancelTrade();
                            this.$router.push({
                                name:'home'
                            });
                        }
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
                // todo 创建订单成功，跳转，并用vuex 保存状态
                this.$store.dispatch("saveBillDetail",resData.data);
                // this.$router.push({
                //     name:'loanConfirm'
                // });
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        loanConfirm(event){
            let $btnConfirm = $(event.currentTarget || event.target);
            if($btnConfirm.hasClass('disabled')){
                return;
            }
            if(!this.smsCode || !this.tradePwd){
                return;
            }

            if(!this.encryptPK){
                this.loanPK();
                return;
            }

            this.loan();
        },
        onCancelTrade(){
            MessageBox({
                title:'',
                message:'确认取消借款申请',
                showCancelButton: true,
                confirmButtonText:'继续借款',
                cancelButtonText:'取消借款'
            }).then(action => {
                if(action == 'cancel'){
                    this.cancelTrade();
                    this.$router.go(-1);
                }
            });
        },
        cancelTrade(){
            let apiUrl = '/apis/trade/cancelPreTrade';
            let params = {
                tradeId:this.billDetail.tradeIdStr
            };

            // 清空 bill detail
            this.$store.dispatch('clearBillDetail');
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                if(response.status != 200){
                    console.log(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    console.log(resData.message);
                    return;
                }
                console.log(resData.message);
            }, (error) => {
                console.log(error);
            });
        },
        loan(){
            let $btnConfirm = $("#btnConfirm");
            let rsaPwd = this.encryPwd(this.billDetail.buyerMobile, md5(this.tradePwd));
            let apiUrl = '/apis/trade/createTrade';
            let params = {
                tradeVerificationCode:this.smsCode,
                tradePassword: rsaPwd, 
                tradeIdStr: this.billDetail.tradeIdStr,
                couponCode: this.billDetail.couponDetailSortVo.properCouponCode,
                lon: this.lon,
                lat: this.lat
            };
            $btnConfirm.addClass('disabled');
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                $btnConfirm.removeClass('disabled');
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code == 6204){ // 交易密码错3次 用户冻结，提示下载app
                    MessageBox({
                      title: '',
                      message: '请下载APP找回交易密码',
                      confirmButtonText:'立即下载'
                    }).then(action => {
                        common.downLoad();
                    });
                    return;
                }
                if(resData.code == 6207){ // 哈行 验证码超30分钟
                    MessageBox({
                        title: '',
                        message: resData.message,
                        showCancelButton: true,
                        confirmButtonText:'继续申请',
                        cancelButtonText:'取消交易'
                    }).then(action => {
                        if(action == "confirm"){
                            this.createPreBill(); 
                        } else { // cancel
                            this.cancelTrade();
                            this.$router.push({
                                name:'home'
                            });
                        }
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(resData.message);
                    // 哈行 验证成功，其他验证未通过 若重复申请哈行验证码，会出错 屏蔽验证码按钮
                    if(resData.data && resData.data.inputStatus && resData.data.inputStatus == '1'){
                        clearInterval(this.timeInterval);
                        $("#btnSmsCode").text('获取验证码').addClass('disabled');
                        $("#txtSmsCode").attr('disabled','disabled');
                    }
                    return;
                }
                _hmt.push(['_trackEvent', 'h5_loanOK', 'click', '借款_确认借款(成功)']);
                this.$store.dispatch('clearBillDetail');
                this.$store.dispatch('clearPreBill');

                this.$router.replace({
                    name:'loanResult',
                    params:{
                        tradeId: this.billDetail.tradeIdStr
                    }
                });
            }, (error) => {
                Indicator.close();
                $btnConfirm.removeClass('disabled');
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        loanPK(){
            let apiUrl = "/apis/pk";
            let params = {};
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                this.encryptPK = response.data.data;
                this.loan();
            }, (error) => {
                Indicator.close();
                console.log('encrypt pk error:' + error);
            });
        },
        encryPwd(uName,md5pwd){
            let divider = '☞';
            let plainText = uName + divider + md5pwd + divider + new Date().getTime();
            var encrypt = new jsencrypt.JSEncrypt();
            encrypt.setPublicKey(this.encryptPK);
            var encrypted = encrypt.encrypt(plainText);
            return encrypted;
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/loan/confirm'
</style>