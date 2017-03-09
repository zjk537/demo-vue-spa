<template>
	<div class="flashBank" >
        <!-- 进入页面看到的页面3种情况 -->
        <comEmpty></comEmpty>
        <div class="firstStepWrap" style="display:none;">
            <div class="verifyNotice">请继续填写验证码信息</div>
            <div class="blanketVerify-container">
                <div class="info">
                    <div class="key">
                        您授权的手机号码为
                    </div>
                    <div class="value">
                        {{responseData.authMobile}} 
                    </div>
                </div>
                <div class="item pwdType" v-show="showStatus.pwdType">
                    <div class="itemTitle">
                        <span> 密码类型 </span>
                    </div>
                    <div class="itemCheck">
                        <p>
                            <input type="radio" id="servicePassword" value="3" @click="onRadioClick" checked name="group1"/> 
                            <span></span>   
                            <label for="servicePassword"> 服务密码 </label>
                        </p>
                        <p>
                            <input type="radio" id="customerPassword" value="1" @click="onRadioClick" name="group1"/> 
                            <span></span>
                            <label for="customerPassword"> 客户密码  </label>
                        </p>
                    </div>
                </div>
                <div class="item serviceCode" v-show="showStatus.serviceCode">
                    <div class="inner">
                        <span class="key">密码</span>
                        <input type="text" placeholder="请输入运营商服务密码" v-model="step1.serviceCode">
                    </div>
                </div>
                <div class="item" v-show="showStatus.imgCode">
                    <div class="inner left">
                        <span class="key">验证码</span>
                        <input type="text"placeholder="请输入图片验证码" v-model="step1.imgCode">
                    </div>
                    <div class="inner right">
                        <img class="code" onclick="_hmt.push(['_trackEvent', 'h5_getImgCode', 'click', '获取图片验证码']);" @click="getImgCode">
                    </div>
                </div>
                <div class="item" v-show="showStatus.smsCode">
                    <div class="inner left">
                        <span class="key">验证码</span>
                        <input type="text"  placeholder="请输入短信验证码" v-model="step1.smsCode" >
                    </div>
                    <div class="inner right">
                        <span class="vertical-line">|</span>
                        <button class="code" onclick="_hmt.push(['_trackEvent', 'h5_getSmsCode', 'click', '获取登录短信']);"  @click="getSmsCode" >&nbsp;获取验证码</button>
                    </div>
                </div>
                <div class="item full" v-show="showStatus.smsNoSend">
                    <div class="inner">
                        <span class="key">验证码</span>
                        <input type="text" v-model="step1.smsCode2" placeholder="请输入短信验证码">
                        <label class="prompt"></label>
                    </div>
                </div>
                <div class="forget">
                    <router-link  tag="a" :to="{name:'forgetPassword'}" onclick="_hmt.push(['_trackEvent', 'h5_mobile_forgetPwd', 'click', '忘记服务密码']);">忘记服务密码?</router-link>
                </div>
                <div class="submit">
                    <button @click="auth">授权</button>
                </div>
            </div>
        </div>


     
        <div class="process hide-content" id="process">
            <div class="process-container">
                <canvas id="canvas"></canvas>
                <div class="text">
                    <div>{{ warningMessage }}</div>
                </div>
            </div>
        </div>


        <div class="warning" id="warning">
          <span class="content">
                {{warning}}
          </span>
        </div>
        <div class="img-container">
            <img src="../../../static/img/process-success.png" id="successImg">
            <img src="../../../static/img/process-error.png" id="errorImg">
        </div>
	</div> 
</template>
<script>
import comHeader from 'components/header.vue';
import comEmpty from 'components/empty.vue';
import riskStep from 'components/riskStep.vue';
import painting from '../../js/common/paint.js';
import { Toast,Indicator } from 'mint-ui';
export default {
    name: 'flashBank',
    data () {
        return {
            time:60,
            warning:'',
            warningMessage:'',
            step1:{
                serviceCode:'',
                imgCode:'',
                smsCode:'',
                smsCode2:'',
                pwdType:''
            },
            showStatus:'',
            step:1,
            needSecVerify:false,
            verifyUrl:'',
            process:'',
            processor:'',
            smsPromt:"服务升级中，请您联系客服获取验证码",
            responseData:'',
            timeInterval:null
        }
    },
    components: {
        comEmpty
    },
    mounted: function() {
        this.initView()
    },
    methods:{
        initView:function(){
            let $emptyContainer = $(".emptyContainer");
            if(!this.$parent.initData.code){
                $emptyContainer.addClass('error').show();
                return;
            }

            $(".firstStepWrap").show();
            this.responseData = this.$parent.initData;
            this.showStatus = this.responseData.showStatus;
        },
        onRadioClick(){
            let $serviceInput = $('.serviceCode input'),
                $checkedPwdType = $('.pwdType input[type="radio"]:checked');
            if(parseInt($checkedPwdType.val()) === 3){
                $serviceInput.attr('placeholder','请输入运营商服务密码');
            } else {
                $serviceInput.attr('placeholder','请输入客户密码');
            }
        },
        _updateMsg:function(msg){
            $("#process .text div").text(msg);
        },
        _initProcessor:function(){
            if(!this.processor){
                $('#process').removeClass('hide-content');
                this.processor = new painting.process('canvas',3,120*1000,{
                    font:'50px Arial'
                },'',0);
                this.processor.hide();
            }
        },
        auth:function(e){
            var $sender = $(e.currentTarget || e.target);
            if(!this.step === 1 ){
                this.verifyUrl = '/apis/risk/h5/mobile/wecashLogin';
            }else{
                this.verifyUrl = '/apis/risk/h5/mobile/wecashVerify';
            }

            this.verify($sender);
        },
        verify:function(sender){
            _hmt.push(['_trackEvent', 'h5_mobile_auth'+ this.step, 'click', '手机_授权']);
            this._initProcessor();
            // sms code validate
           
            if( this.showStatus.serviceCode && !this.step1.serviceCode){
                this._updateMsg('请填写密码');
                this.processor.error();
                return;
            }
            if( this.showStatus.pwdType && !this.step1.serviceCode){
                this._updateMsg('请填写密码');
                this.processor.error();
                return;
            }
            if(this.showStatus.smsCode && !this.step1.smsCode){
                this._updateMsg('请填写短信验证码');
                this.processor.error();
                return;
            }
            if(this.showStatus.smsNoSend && !this.step1.smsCode2){
                this._updateMsg('请填写短信验证码');
                this.processor.error();
                return;
            }
            if(this.showStatus.imgCode && !this.step1.imgCode){
                this._updateMsg('请填写图形验证码');
                this.processor.error();
                return;
            }
            
            this._updateMsg('授权中...');
            this.processor.show();
            sender.prop('disabled',true);
            this.step1.pwdType = $('.itemCheck input[type="radio"]:checked').val();

            this.$http.post(this.verifyUrl,{
                password:this.step1.serviceCode,
                imageCode:this.step1.imgCode,
                smsCode:this.step1.smsCode || this.step1.smsCode2,
                pwdType:this.step1.pwdType
            }).then((res) => {
                debugger;
                sender.removeProp('disabled');
                this.processor.hide();
                if(!res){
                    console.log("Interface response empty or null");
                    return;
                }
                if(res.data.code != 200){
                    this._updateMsg(res.data.message);
                    this.processor.error();
                    this.step1 = {
                        serviceCode:'',
                        imgCode:'',
                        smsCode:'',
                        smsCode2:'',
                        pwdType:''
                    };
                    return;
                }
                var resData = res.data.data;
                if(!resData){
                    console.log("Interface response object attr[data] is empty or null");
                    return;
                }
                // 授权成功
                if(resData.code === 200){
                    _hmt.push(['_trackEvent', 'h5_mobile_auth'+ this.step +'_Ok', 'click', '手机_授权(跳转成功)']);
                    
                    this.$router.push({
                        name:'riskbindBank'
                    });
                    return;  
                }

                if(resData.code === 401){
                    // this._updateMsg(resData.message);
                    // this.processor.error();
                    // setTimeout(function(){
                    window.location.reload(true)
                    // },2000);
                    return;
                }    
                if(resData.code === 500){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    return;
                }
                if(resData.code === 600){
                    $('button.code').removeAttr('disabled').html('获取验证码');
                    clearInterval(this.timeInterval);
                    if(resData.imgUrl)
                        $('img.code').attr('src', resData.imgUrl);

                    $('.forget').hide();
                    $('.info').hide();
                    $('.verifyNotice').show();
                    this.step1 = {
                        serviceCode:'',
                        imgCode:'',
                        smsCode:'',
                        smsCode2:'',
                        pwdType:''
                    };
                    
                    this.showStatus = JSON.parse(resData.showStatus);
                    if(this.showStatus.smsNoSend){
                        $('.prompt').text(resData.prompt || this.smsPromt);
                    }
                    if(resData.nextstep == 'verify'){
                        this.step = 2;
                    }  
                    return;
                }
                if(resData.code != 200){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    return;
                }
            }, (error) => {
                sender.removeProp('disabled');
                this.processor.hide();
                console.log(error);
            });
           
        },
        getImgCode:function (e) {
            var $sender = $(e.currentTarget || e.target);
            this._initProcessor();
            // 防止再次点击
            $sender.prop('disabled',true);

            this.$http.post('/apis/risk/h5/mobile/getWecashCaptche',).then((res) => {
                $sender.removeProp('disabled');
                this.processor.hide();
                if(!res){
                    console.log('Interface response empty');
                    return;
                }
                if(res.data.code != 200){
                    this._updateMsg(res.message);
                    this.processor.error();
                    return;
                }
                var resData = res.data.data;
                if(resData.code === 401){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    setTimeout(function(){
                        window.location.reload(true)
                    },2000);
                    return;
                }
                if(resData.code != 200){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    return;
                }

                $sender.attr("src",resData.imgUrl);
                $sender.parents('.item').find('input').val('');
                
            }, (error) => {
                $sender.removeProp('disabled');
                this.processor.hide();
                console.log(error);
            });

        },
        getSmsCode:function (e) {
            var $sender = $(e.currentTarget || e.target);
            this._initProcessor();
            
            this._updateMsg('正在获取短信验证码...');
            this.processor.show();
            $sender.prop('disabled',true);


            this.$http.post('/apis/risk/h5/mobile/getWecashSms').then((res) => {  
                this.processor.hide();
                $sender.removeProp('disabled');
                if(!res){
                    console.log('Interface response empty');
                    return;
                }
                if(res.data.code != 200){
                    this._updateMsg(res.message);
                    this.processor.error();
                    return;
                }
                var resData = res.data.data;
                if(resData.code === 401){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    setTimeout(function(){
                        window.location.reload(true)
                    },2000);
                    return;
                }
                if(resData.code != 200){
                    this._updateMsg(resData.message);
                    this.processor.error();
                    return;
                }

                $sender.prop('disabled',true);
                var interTime = this.time;
                var _this = this;
                this.timeInterval = setInterval(function () {
                    if(interTime <= 0){
                        $sender.html('重新获取');
                        interTime = _this.time;
                        clearInterval(_this.timeInterval);
                        $sender.removeProp('disabled');
                        return;
                    }

                    interTime --;
                    $sender.html('<label>'+ interTime +'s</label>');
                },1000);
            }, (error) => {
                $sender.removeProp('disabled');
                this.processor.hide();
                console.log(err);
            });
        }
    }
}

</script>

<style lang="sass">
    @import '../../scss/risk/flashBank.scss';
</style>