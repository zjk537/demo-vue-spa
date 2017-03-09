<template>
	<div class="register">
        <comHeader back="true"></comHeader>
		<img src="/static/img/reg_banner.jpg">
		<div class="form">
			<ul>
				<li class="flex">
					<input type="tel" v-model='mobile' name="" maxlength="11" placeholder="请输入您的手机号" @keyup="onTextChange">
                    <em v-show="mobile != ''" class="icon-clear" @click="onMobileClear"></em>
                    </li>
				<li class="flex">
					<input type="text" v-model='smsCode' name="" placeholder="请输入验证码" @keyup="onTextChange">
					<span class="btn" @click="getSmsCode">获取验证码</span>
				</li>
				<li class="flex">
					<input type="password" v-model='pwd' name="" maxlength="16" placeholder="请设置6~16位数字、字母、符号的登录密码" @keyup="onTextChange">
                    <em v-show="pwd != ''" class="icon-clear" @click="onPwdClear"></em>
				</li>
				<li class="btnbar">
					<div class="msg"></div>
					<div id="btnRegister" class="btn disabled" @click="onRegister">注册</div>
					<router-link :to="{name:'login'}">老用户登录 >></router-link>
				</li>
			</ul>
		</div>
		<img src="/static/img/reg_step.jpg">
		<img src="/static/img/reg_desc.jpg">
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast } from 'mint-ui';
require('jquery.cookie');
var utility = require('static/js/utility');
var jsencrypt = require('jsencrypt');
export default {
    name: 'register',
    props: [],
    data() {
        return {
            mobile:'',
            smsCode:'',
            pwd:'',
            timer:60,
            encryptPK:''
        }
    },
    components: {
    	comHeader,Indicator,Toast
    },
    mounted: function() {
        if($.cookie('sdx_auth_h5_token')){
            this.$router.push({
                name:"home"
            });
        }
    },
    methods: {
    	onTextChange(event){
    		let $btnRegister = $("#btnRegister"),
    			$msg = $(".msg"),
                $sender = $(event.currentTarget || event.target);

            let valueLength = $sender.val().length,
                maxlength = parseInt($sender.attr('maxlength'));

            // 设置输入最大长度
            if(valueLength > maxlength){
                $sender.val($sender.val().slice(0,maxlength));
                return;
            }

    		if(this.mobile && this.smsCode && this.pwd){
    			$btnRegister.removeClass('disabled');
    			$msg.empty().hide();
                return;
    		} 
            if(!$btnRegister.hasClass('disabled')){
    			$btnRegister.addClass('disabled');
    		}
            $msg.empty().hide();
    	},
    	getSmsCode(event){
    		let $sender = $(event.currentTarget || event.target),
    			$msg = $('.msg');
            if($sender.hasClass('disabled')){
                return;
            }

            if(!this.mobile){
            	$msg.text('请输入手机号').show();
            	return;
            }
            if(!utility.isMobile(this.mobile)){
            	$msg.text('请输入正确格式的手机号码').show();
            	return;
            }

            $msg.empty().hide();

            let apiUrl = '/apis/h5/registerMsg';
            let params = {
                mobile:this.mobile
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
                if(resData.code == 1010){ // 老用户 2秒后去登录
                	Toast('手机号码已注册，请登录');
                	let vueRouter = this.$router;
                	setTimeout(function(){
                		vueRouter.push({
                			name:'login'
                		});
                	},1000 * 2);
                	return;
                }
                if(resData.code != 200){
                    $msg.text(resData.message).show();
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
    	onRegister(){
    		let $btnRegister = $("#btnRegister");
    		if($btnRegister.hasClass('disabled')){
    			return;
    		}

    		let $msg = $(".msg");
    		if(!this.mobile){
    			$msg.text('请输入手机号').show();
    			return;
    		}
    		if(!utility.isMobile(this.mobile)){
    			$msg.text('请输入正确格式的手机号码').show();
    			return;
    		}
    		if(!this.smsCode){
    			$msg.text('请输入验证码').show();
    			return;
    		}
    		if(!this.pwd){
    			$msg.text('请输入登录密码').show();
    			return;
    		}
    		//let regPwd = /(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]{6,16}/;
            let regPwd = /[A-Za-z0-9#@!~%^&*,.=?<>_`~+]{6,16}/;
    		if(!regPwd.test(this.pwd)){
    			$msg.text('请设置6~16位数字、字母、符号的登录密码').show();
    			return;
    		}
    		$msg.empty().hide();
            if(!this.encryptPK){
                this.registerPK();
            } else {
                this.register();
            }
    		
    	},
        onMobileClear(){
            this.mobile = '';
            $("#btnRegister").addClass('disabled');
        },
        onPwdClear(){
            this.pwd = '';
            $("#btnRegister").addClass('disabled');
        },
        register(){
            let apiUrl = '/apis/h5/saveUserInfo';
            let params = {
                mobile:this.mobile,
                verificationCode:this.smsCode,
                passWord: this.encryPwd(this.mobile,this.pwd)
            };
            Indicator.open();
            let $btnRegister = $("#btnRegister"),
                $msg = $('.msg');
            $btnRegister.addClass('disabled');
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                $btnRegister.removeClass('disabled');
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    $msg.text(resData.message).show();
                    return;
                }
                $.cookie('sdx_auth_h5_token',resData.data,{
                    expires:1,
                    path:'/',//如果不设置有效路径，在默认情况下，只能在cookie设置当前页面读取该cookie，cookie的路径用于设置能够读取cookie的顶级目录。
                    domain:'.jiandanjiekuan.com',
                    secure: false//默认是false，如果为true，cookie的传输协议需为https
                });
                this.$router.replace({
                    name:'home'
                });   
            }, (error) => {
                Indicator.close();
                $btnRegister.removeClass('disabled');
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        registerPK(){
            let apiUrl = "/apis/pk";
            let params = {};
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                this.encryptPK = response.data.data;
                this.register();
            }, (error) => {
                Indicator.close();
                console.log('encrypt pk error:' + error);
            });
        },
        encryPwd(uName,uPwd){
            let divider = '☞';
            let plainText = uName + divider + uPwd + divider + new Date().getTime();
            var encrypt = new jsencrypt.JSEncrypt();
            encrypt.setPublicKey(this.encryptPK);
            var encrypted = encrypt.encrypt(plainText);
            
            return encrypted;
        }
    }
}
</script>

<style lang='scss'>
@import './src/scss/auth/register';
</style>