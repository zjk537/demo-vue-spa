<template>
	<div class="bind_bank">
		<comHeader title="绑定银行卡" back="true"></comHeader>
		<div class="group info">
            <div class="row">
                <label>姓名</label><span>{{ userInfo.realName }}</span>
            </div>      
            <div class="row">
                <label>身份证号</label><span>{{ userInfo.cardId }}</span>
            </div>
            <i class="notice" @click="onInfoNotice"></i>
        </div>
        <div class="split">添加银行卡 (请保证持卡人和您的身份信息一致)</div>
        <div class="group">
            <ul>
                <li class="flex">
                    <label>发卡银行</label><em id="lblBankName">{{ formData.bank.bankName }}</em>
                    <span id="btnSelBank" @click="onBankPickerShow">
                        <a href="javascript:;">选择银行 </a><i class="iconfont icon-jiantou"></i>
                    </span>
                </li>
                <li class="flex">
                    <label>银行卡号</label>
                    <input id="txtCardNo" type="tel" v-model="formData.cardNo" placeholder="请输入储蓄卡号" @keyup="onTxtChange" name="" style="margin-right:1rem;">
                </li>
            </ul>
        </div>
        <div class="group">
            <ul>
                <li class="flex">
                    <label>手机号码</label>
                    <input id="txtMobile" type="tel" v-model="formData.mobile" placeholder="银行卡预留手机号码" @keyup="onTxtChange" name="" style="margin-right:3rem;">
                    <i class="notice" @click="onMobileNotice"></i>
                </li>
                <li class="flex">
                    <label>验证码</label>
                    <input type="tel" v-model="formData.smsCode" placeholder="请输入短信验证码" @keyup="onTxtChange" name="">
                    <span class="code" @click="getSmsCode">获取验证码</span>
                </li>
            </ul>
        </div>
        <div id="btnConfirm" class="btn disabled" @click="onBindBank">确认提交</div>
        <mt-popup
          v-model="popPicker.bankShow"
          position="bottom">
            <div class="pick_bar">
                <span class="canel" @click="popPicker.bankShow = false">取消</span>
                <span class="confirm" @click="pickerConfirm">确定</span>
            </div>
            <mt-picker :slots="slots" @change="onBankChange"></mt-picker>
        </mt-popup>
	</div>
</template>

<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,Picker,Popup,MessageBox } from 'mint-ui';
var utility = require('static/js/utility');
export default {
    name: 'bindBank',
    props: ['nextlink','needGPS'],
    data() {
        return {
            timer:60,
            userInfo:{
                cardId:'',
                mobile:'',
                realName:''
            },
            slots:[{flex: 1,values: [],className: 'slot1',textAlign: 'center'}],
            popupBankPicker:false,
            popPicker:{
                bankShow:false,
                bankValue:null
            },
            bankList:[],
            formData:{
                bank: {},
                mobile:'',
                cardNo:'',
                smsCode:'',
                lat:null,
                lon:null
            }
        }
    },
    components: {
        comHeader,Indicator,Toast,Picker,Popup,MessageBox
        
    },
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods: {
        initPage(){
            this.bindUserInfo();
            this.bindBankPicker();
            //this.geoLocationLoad();
        },
        bindUserInfo(){
            let apiUrl = '/apis/account/bindBankInit';
            let params = {};
            Indicator.open();
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
                this.userInfo = resData.data;
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        bindBankPicker(){
            let apiUrl = '/apis/account/getBankList';
            let params = {};
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
                if(!resData.data || resData.data.length === 0){
                    console.log('bank list is empty!');
                    return;
                }
                this.bankList = resData.data;
                resData.data.forEach((item)=>{
                    this.slots[0].values.push(item.bankName);
                });

            }, (error) => {
                console.log(error);
            });
        },
        onBankChange(picker,values){
            this.popPicker.bankValue = values[0];
        },
        onBankPickerShow(){
            let $btnSelBank = $('#btnSelBank');
            if($btnSelBank.hasClass('disabled')){
                return;
            }
            this.popPicker.bankShow = true;
        },
        onMobileNotice(){
            MessageBox({
              title: '手机号说明',
              message: '银行卡预留的手机号码是办理该银行卡时所填写的手机号码，没有预留、手机号忘记或者已停用，请联系银行客服更新处理',
              confirmButtonText:'我知道了'
            });
        },
        onInfoNotice(){
            MessageBox({
              title: '',
              message: '为保证账户资金安全，只能绑定认证用户本人的银行卡',
              confirmButtonText:'我知道了'
            });
        },
        pickerConfirm(){
            this.formData.bank = this.bankList.filter(item => { return item.bankName == this.popPicker.bankValue})[0];
            $('#btnSelBank').find('a').text('');
            this.onTxtChange();
            this.popPicker.bankShow = false;
        },
        onTxtChange(){
            let $btnConfirm = $("#btnConfirm");
            if(!this.formData.bank.id ||
                this.formData.mobile.trim() == "" ||
                this.formData.cardNo.trim() == "" ||
                this.formData.smsCode.trim() == ""){
                $btnConfirm.addClass('disabled');
            } else {
                $btnConfirm.removeClass('disabled');
            }
        },
        getSmsCode(event){
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                return;
            }
            if(!this.formData.bank.id){
                Toast('请选择发卡银行');
                return;
            }
            if(!this.formData.cardNo){
                Toast('请输入银行卡号');
                return;
            }
            if(/[^\d]/.test(this.formData.cardNo)){
                this.formData.cardNo = this.formData.cardNo.replace(/[^\d]/g,'');
                return;
            }
            if(!this.formData.mobile){
                Toast('请输入银行卡预留手机号');
                return;
            }
            if(/[^\d]/.test(this.formData.mobile)){
                this.formData.mobile = this.formData.mobile.replace(/[^\d]/g,'');
                return;
            }
            if(!utility.isMobile(this.formData.mobile.trim())){
                Toast('银行卡预留手机号输入错误');
                return;
            }
            let apiUrl = '/apis/account/bindBankValidateCode';
            let params = {
                bankId: this.formData.bank.id,
                bankCard: this.formData.cardNo,
                mobile: this.formData.mobile
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
                this.formData.requestid = resData.data.requestid;
                $("#txtCardNo").attr('disabled','disabled');
                $('#txtMobile').attr('disabled','disabled');
                $('#btnSelBank').empty().addClass('disabled');

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
        //geoLocationLoad(callBack){


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
            //     _vue.formData.lat = pos.coords.latitude;
            //     _vue.formData.lon = pos.coords.longitude;
            //     if(callBack){
            //         callBack();
            //     }
            // },function(e) {
            //     if(_vue.needGPS){
            //          MessageBox({
            //             title: '定位服务不可用',
            //             message: '<div class="left">方法1：请打开App的定位服务<br/>方法2：请点击返回，重新进入此页面</div>',
            //             showCancelButton: true,
            //             cancelButtonText:'关闭',
            //             confirmButtonText:'确定'
            //         });
            //      }
            //      console.log(e);
            // },options);
        //},
        onBindBank(event){
            _hmt.push(['_trackEvent', 'h5_bindbank', 'click', '银行卡提交']);
            let $sender = $(event.currentTarget || event.target);
            if($sender.hasClass('disabled')){
                Toast('请将信息填写完整后提交');
                return;
            }
            // if(!this.needGPS){
            //     this.bindBank();
            //     return;
            // }
            // if(this.formData.lon){
            //     this.bindBank();
            //     return;
            // }
            
            var lbsObj = {
                lat: '',
                lon: ''
            };
            if($.cookie('sdx_h5_lbs')){
                lbsObj = JSON.parse($.cookie('sdx_h5_lbs'));
            }
            this.formData.lat = lbsObj.lat;
            this.formData.lon = lbsObj.lon;
            this.bindBank();

            //this.geoLocationLoad(this.bindBank);

        },
        bindBank(){
            let $sender = $('#btnConfirm');
            if($sender.hasClass('disabled')){
                Toast('请将信息填写完整后提交');
                return;
            }

            $sender.addClass('disabled');
            let apiUrl = '/apis/account/bindBank';
            let params = {
                bankId: this.formData.bank.id,
                bankCard: this.formData.cardNo,
                mobile: this.formData.mobile,
                requestid: this.formData.requestid,
                validateCode: this.formData.smsCode,
                lon: this.formData.lon,
                lat: this.formData.lat
            };
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
                    Toast(resData.message);
                    return;
                }
                //this.$store.dispatch('addNewCard',);
                _hmt.push(['_trackEvent', 'h5_bindbankOK', 'click', '银行卡提交(跳转成功)']);
                if(this.nextlink){
                    this.$router.push({
                        name:this.nextlink
                    });
                    return;
                }
                this.$router.go(-1);
            }, (error) => {
                Indicator.close();
                $sender.removeClass('disabled');
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        }
    }
}
</script>

<style lang="scss">
@import './src/scss/auth/bindBank';
.bind_bank{
    .mint-popup{
        width:100%;
        border-radius:0;
    }
    .mint-msgbox-message{
        line-height: 1.5rem;
    }
    .pick_bar{
        line-height:1.5rem;
        position:relative;
        border-bottom:1px solid $borderColor;
        span{
            padding:.5rem 1rem;
            color:$blue;
            font-size:1rem;
            display:inline-block;
            width:4rem;
            text-align:center;
        }
        .confirm{
            float:right;
        }
    }
}

</style>