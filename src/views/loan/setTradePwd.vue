<template>
	<div class="set_pwd">
		<comHeader title="设置交易密码" back="true" @onBackClick="goHome"></comHeader>
        <div class="content">
    		<div class="row">
                <label>请输入数字交易密码</label>
                
                <div class="pwdbox">
                    <input type="tel" v-model="pwd" name="" maxlength="6" @keyup="onTxtKeyup" @focus="onPwdFocus">
                </div>    
            </div>
            <div class="row">
                <label>请再次输入数字交易密码</label>
                <div class="pwdbox">
                    <input type="tel" v-model="pwd2" maxlength="6" name="" @keyup="onTxtKeyup" @focus="onPwdFocus">
                </div>    
            </div>
            <div id="btnSetPwd" class="btn disabled" @click="onSetPwdClick">设置完成</div>
        </div>
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast } from 'mint-ui';
var jsencrypt = require('jsencrypt');
var md5 = require('md5');
var utility = require('static/js/utility');
export default {
    name: 'setTradePwd',
    data () {
        return {
            pwd:'',
            pwd2:'',
            encryptPK:''
        }
    },
    components: {
        comHeader,Indicator,Toast
    },
    mounted(){
        this.$nextTick(()=>{

        });
    },
    methods:{
        onPwdFocus(event){
            let $sender = $(event.currentTarget || event.target),
                $dotBox = $sender.parents(".pwdbox");
            if($dotBox.hasClass('enabled')){
                return;
            } 
            $('.pwdbox').removeClass('enabled');
            $dotBox.addClass('enabled');
        },
        onTxtKeyup(event){
            let $sender = $(event.currentTarget || event.target),
                $dotBox = $sender.parents(".pwdbox"),
                $btnSetPwd = $("#btnSetPwd"),
                maxlength = parseInt($sender.attr('maxlength'));
            if(/[^\d]/.test($sender.val())){
                Toast('请输入数字交易密码');
                $sender.val($sender.val().replace(/[^\d]/g,''));
                return;
            }

            let valueLength = $sender.val().length,
                dotLength = $dotBox.children('span').length;
            
            if(valueLength > maxlength){
                $sender.val($sender.val().substr(0,maxlength));
                return;
            }

            if(valueLength > dotLength){
                $dotBox.append('<span><i class="dot"></i></span>');
            } else if(valueLength < dotLength){
                $dotBox.children('span:eq('+ (dotLength - 1)+')').remove();
            }

            if(this.pwd.toString().length === maxlength
                && this.pwd2.toString().length === maxlength){
                $btnSetPwd.removeClass('disabled');
            } else {
                $btnSetPwd.addClass('disabled');
            }
        },
        onSetPwdClick(){
            $('.pwdbox').removeClass('enabled');
            let $btnSetPwd = $("#btnSetPwd");
            if($btnSetPwd.hasClass('disabled')){
                return;
            }

            if(this.pwd != this.pwd2){
                Toast('两次输入的密码不一致');
                return;
            }
            if(!this.encryptPK){
                this.setPwdPK();
                return;
            } 
            this.setPwd();
        },
        goHome(){
            this.$router.push({
                name:'home'
            });
        },
        setPwd(){
            let $btnSetPwd = $("#btnSetPwd");
            let apiUrl = '/apis/account/settingPassWord';
            let rsaPwd = this.encryPwd(this.pwd,md5(this.pwd));
            let params = {
                password: rsaPwd 
            };
            Indicator.open();
            $btnSetPwd.addClass('disabled');
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                $btnSetPwd.removeClass('disabled');
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
                _hmt.push(['_trackEvent', 'h5_setTradePwd', 'click', '借款_交易密码_设置完成(跳转成功)']);
                // 跳转绑定银行卡页面
                this.$router.replace({
                    name:'borrow'
                });
                
            }, (error) => {
                Indicator.close();
                $btnSetPwd.removeClass('disabled');
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        setPwdPK(){
            let apiUrl = "/apis/pk";
            let params = {};
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                this.encryptPK = response.data.data;
                this.setPwd();
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
@import './src/scss/loan/setPwd'
</style>