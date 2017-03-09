<template>
	<div class="login">
		<comHeader back="true"></comHeader>
        <div class="content">
            <img src="/static/img/logo.png"/>
            <div class="row">
                <input type="tel" v-model="uName" name="uname" maxlength="11" placeholder="请输入手机号码" @keyup="onTxtKeyup">
                <em v-show="uName!= ''" class="icon-clear" @click="uName = ''"></em>
            </div>
            <div class="row">
                <input type="password" v-model="uPwd" name="upwd" maxlength="16"  placeholder="请输入登录密码" @keyup="onTxtKeyup">
                <em v-show="uPwd != ''" class="icon-clear" @click="uPwd = ''"></em>
            </div>
            <div class="row">
                <div class="btn" @click="onLoginClick">登录</div>
                <span class="findpwd" @click="onFindPwd">找回密码</span>
            </div>
        </div>
		<div class="footer">
			<a :href="bindRegisterUrl()" class="btn">手机快速注册</a>
		</div>
        <!-- <div class="mint-toast is-placemiddle" style="padding:10px 5%;"><span class="mint-toast-text">手机快速注册</span></div> -->
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,MessageBox } from 'mint-ui';

require('jquery.cookie');
var utility = require('static/js/utility');
var common = require('static/js/common');
var jsencrypt = require('jsencrypt');
var md5 = require('md5');
export default {
    name: 'login',
    props: [],
    data() {
        return {
            uName:'',
            uPwd:'',
            encryptPK:''
        }
    },
    components: {
        comHeader,Indicator,Toast,MessageBox
    },
    mounted() {
    	this.$nextTick(()=>{
           if($.cookie('sdx_auth_h5_token')){
                this.$router.push({
                    name:"home"
                });
            }
            this.onFocus();
    	});
    },
    methods: {
        onFocus(){
            $('input').focus(function(){
                setTimeout(function(){
                    $('.footer').hide();
                },0);
            }).blur(function(){
                setTimeout(function(){
                    $('.footer').show();
                },0);
            })
        },
    	onTxtKeyup(event){
    		var $sender = $(event.currentTarget || event.target);
            let valueLength = $sender.val().length,
                maxlength = parseInt($sender.attr('maxlength'));

            if(valueLength > maxlength){
                $sender.val($sender.val().slice(0,maxlength));
            }
    	},
        onFindPwd(){
           _hmt.push(['_trackEvent', 'h5_findpwd', 'click', '找回密码']);
           MessageBox({
              title: '',
              message: '下载APP，重新找回密码',
              confirmButtonText:'立即下载'
            }).then(action => {
                _hmt.push(['_trackEvent', 'h5_login_download', 'click', '登录_下载']);
                common.downLoad();
            }); 
        },
    	onLoginClick(){
           _hmt.push(['_trackEvent', 'h5_login', 'click', '登录']);
    		if(!this.uName){
    			Toast('请输入手机号码');
    			return;
    		}
    		if(!utility.isMobile(this.uName)){
    			Toast('请输入正确格式的手机号码');
    			return;
    		}
            if(/[^\d]/.test(this.uName)){
                $sender.val(this.uName.replace(/[^\d]/g,''));
                return;
            }
    		if(!this.uPwd){
    			Toast('请输入登录密码');
    			return;
    		}
            if(!this.encryptPK){
                this.loginPK();
                return;
            } 
            this.login();
    	},
        bindRegisterUrl(){
            if(/^m\.*/.test(location.host)){ // 线上 官网渠道
              return "https://activity.jiandanjiekuan.com/html/register.html?channelCode=8e6ee9f5b2c04e7fada4e7cd34351ad0";  
            }
            if(/^pre-m\.*/.test(location.host)){ // 预发
              return "https://pre-activity.jiandanjiekuan.com/html/register.html?channelCode=8e6ee9f5b2c04e7fada4e7cd34351ad0";  
            }
            if(/^test-m\.*/.test(location.host)){// 测试
              return "https://test-activity.jiandanjiekuan.com/html/register.html?channelCode=02b5a9d1a8a84a39a09164fbb14ce638";  
            }
            // 开发
            return "https://dev-activity.jiandanjiekuan.com/html/register.html?channelCode=02b5a9d1a8a84a39a09164fbb14ce638";  
        },
        login(){
            let apiUrl = '/apis/h5/login';
            let rsaPwd = this.encryPwd(this.uName,md5(this.uPwd));
            let params = {
                mobile:this.uName,
                password: rsaPwd
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
                if(resData.code == 1020){// 密码错误次数超过5次
                    MessageBox({
                        title: '',
                        message: '密码多次错误，请3小时后再试或找回密码',
                        showCancelButton: true,
                        confirmButtonText:'找回密码',
                        cancelButtonText:'我知道了'
                    }).then(action => {
                        if(action == "confirm"){
                             MessageBox({
                              title: '',
                              message: '下载APP，重新找回密码',
                              confirmButtonText:'立即下载'
                            }).then(action => {
                                common.downLoad();
                            });   
                        }
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }
                $.cookie('sdx_auth_h5_token',resData.data,{
                    expires:1,
                    path:'/',//如果不设置有效路径，在默认情况下，只能在cookie设置当前页面读取该cookie，cookie的路径用于设置能够读取cookie的顶级目录。
                    domain:'.jiandanjiekuan.com',
                    secure: false//默认是false，如果为true，cookie的传输协议需为https
                });
                //let redirectRouter = this.$route.query.redirect ? this.$route.query.redirect : '/';
               
                this.$router.replace({
                    //path: redirectRouter
                    name:"home"
                })
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试!',position:'bottom' });
                console.log(error);
            });
        },
        loginPK(){
            let apiUrl = "/apis/pk";
            let params = {};
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                this.encryptPK = response.data.data;
                this.login();
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

<style lang='scss'>
@import './src/scss/auth/login';
.login{
    input::placeholder{color:#999 !important;}
}
</style>