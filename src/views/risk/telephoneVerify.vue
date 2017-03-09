<template>
	<div class="telephoneVerify">
        <div class="telephone-verify-container">
            <div class="info">
                <div class="key">
                    您授权的手机号码为
                </div>
                <div class="value">
                   {{initMes.authMobile}} 
                </div>
                <input type="hidden" v-model="initMes.code" id="flowCode"/>
            </div>
            
            <!-- 服务密码 -->
            <div class="item">
                <div class="inner">
                    <span class="key">服务密码</span>
                    <input type="tel" placeholder="请输入运营商服务密码" v-model="service.password" onkeyup="value=value.replace(/[^\d]/g,'').slice(0,10)"><!--  -->
                </div>
            </div>
            
            <!-- 图片验证码 -->
            <div v-if="initMes.code == 301" id="imgcode1" class="item">

                <!-- class="item #if($!code == "301") #else   #end"  data-imgcode ="#if($!code == "301") true #else false #end" -->
                <div class="inner left">
                    <span class="key">验证码</span>
                    <input type="text" placeholder="请输入验证码" v-model="service.imageCode"><!--   -->
                </div>
                <div class="inner right">
                    <img class="code" src="$!imgUrl" id='imageCodeUrl1'>
                </div>
            </div>
            
            <!-- 短信验证码 -->
            <div v-if="initMes.code == 311"  class="sms sms-container sms-container1" id="smscode1"> <!-- class="sms sms-container sms-container1 #if($!code == "311") #else hide-content  #end "  data-smscode1 ="#if($!code == "300") true #else false #end" -->
                <div class="item">
                    <div class="inner left">
                        <span class="key">验证码</span>
                        <input placeholder="请输入短信验证码" v-model="loginSms.code"><!--  --> 
                    </div>
                    <div class="inner right">
                        <span class="vertical-line">|</span>
                        <button class="code" id="loginSmsCode" @click="loginSmsSubmit">获取验证码</button> <!--  -->
                    </div>
                </div>
            </div>
            <div class="forget">
                <a href="/risk/mobile/forgetPassword" >忘记服务密码?</a><!-- onclick="_hmt.push(['_trackEvent', 'jisu_shouji_a1', 'click', '忘记服务密码']);" -->
            </div>
            <div class="submit">
                <button @click="auth">授权</button>
            </div>
        </div>
        <div class="sms sms-container sms-container2 hide-content">
            <div class="item">
                <div class="inner left">
                    <input placeholder="请输入验证码" v-model="sms.code"><!--   -->
                </div>
                <div class="inner right">
                    <span class="vertical-line">|</span>
                    <button class="code" id="code" @click="getCode">获取验证码</button><!--  -->
                </div>
            </div>
            <div class="summaryTip">收不到验证码？请不要返回上一页，等待倒计时结束后重新发送。</div>
            <div class="submit">
                <button @click="verifySms">提交</button>
            </div>
        </div>
        <div class="image-code-container hide-content">
            <div class="item">
                <div class="inner left">
                    <input type="text"placeholder="请输入验证码"v-model="detailImageCode.code"><!--    -->
                </div>
                <div class="inner right">
                    <img class="code" id='detailImageCodeUrl'>
                </div>
            </div>
            <div class="submit">
                <button @click="verifyDetailImageCode" >提交</button><!-- -->
            </div>
        </div>
        <div class="no-sms-image-code-container hide-content">
            <div class="item">
                <div class="inner left">
                    <input type="text" placeholder="请输入验证码" v-model="noSmsDetailImageCode.code"><!--   -->
                </div>
                <div class="inner right">
                    <img class="code" id='noSmsDetailImageCodeUrl'>
                </div>
            </div>
            <div class="submit">
                <button @click="noSmsVerifyDetailImageCode">提交</button><!--  -->
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
            <img src="/static/img/process-success.png" id="successImg">
            <img src="/static/img/process-error.png" id="errorImg">
        </div>
</template>
<script>
var flowCode = $('#flowCode').val();
import comHeader from 'components/header.vue';
import riskStep from 'components/riskStep.vue';
import painting from '../../js/common/paint.js';
import { Toast,Indicator } from 'mint-ui';
export default {
    name: 'telephoneVerify',
    data () {
        return {
            time:60,
            warning:'',
            showCode:false,
            showMobileClose:false,
            lockCode:false,
            warningMessage:'',
            detailCurrentTime:60,
            service:{
                password:'',
                imageCode:''
            },
            sms:{
                code:''
            },
            imageCode:{
                code:'',
                imageUrl:''
            },
            detailImageCode:{
                code:'',
                imageUrl:''
            },
            noSmsDetailImageCode:{
                code:'',
                imageUrl:''
            },
            loginSms:{
                code:''
            },
            processor:'',
            initProcess:'',
            process:'',
            initMes:{
                // authMobile:'',
                // flowCode:'',
                // ifHideImg:true,
                // ifHideSms:true
            }
        }
    },
    components: {
        Indicator,Toast
    },
    mounted: function() {
        this.$nextTick(() => {
            this.init();
            
        })
    },
    methods:{
        init:function(){
            Indicator.open();
            this.$http.post('/apis/risk/h5/mobile/init').then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }
                this.initMes = resData.data;
                this.freshload();
                
            }, (error) => {
                Indicator.close();
                console.log(error);
            });
        },
        freshload:function(){
            if( this.initMes.code == 311 ){
                var currentTime = 60,outdate= false;
                $('.sms-container1').removeClass('hide-content');
                $("#loginSmsCode").prop("disabled", true);
                var timeInterval = setInterval(function(){
                    if(currentTime <= 0){
                        $("#loginSmsCode").html('重新获取');
                        currentTime = this.time;
                        outdate = true;
                        clearInterval(timeInterval);
                        $("#loginSmsCode").prop("disabled", false);
                        $('#loginSmsCode').css('color','#2395ff');
                    }else{
                        currentTime --;
                        $("#loginSmsCode").html('<span>'+ currentTime +'</span>s');
                        $('#loginSmsCode').css('color','#888888');
                    }
                },1000);
            }
        },                                                                                                                                                                                                                                                                                           
        //服务密码或者图片验证码
        auth:function(){
                if(!this.processor){
                    $('#process').removeClass('hide-content');
                    this.initProcess = function(){
                        this.process = painting.process;
                        this.processor = new painting.process('canvas',3,120*1000,{
                            font:'50px Arial'
                        },'',0);
                    };
                    this.initProcess();
                    this.processor.hide();
                }/*
                if(!this.service.password){
                    this.warningMessage = '服务密码不可为空';
                    this.processor.error();
                    return;
                }*/
                var imageCode1 = $.trim($('#imgcode1').data('imgcode'));
                if(this.initMes.code == 301){
                    if(this.service.imageCode === ''){
                        this.warningMessage = '图片验证码不可为空';
                        this.processor.error();
                    }else{
                        this.warningMessage = '授权中';
                        this.processor.show();
                        this.$http.post('/apis/risk/h5/mobile/checkImageCaptche',{
                            password:this.service.password,
                            imageCode:this.service.imageCode
                        }).then((res) => {
                            var res = res.data;
                            var data = res.data;
                            if(res.code === 200){
                                if(data.code === 200){
                                    this.warningMessage = '授权成功';
                                    this.processor.show();
                                    this.processor.success();
                                    this.$router.push({
                                        name:'riskbindBank'
                                    });
                                }else if(data.code ===301){
                                    this.imageCode.code = '';
                                    this.processor.hide();
                                    $('#imageCodeUrl1').attr('src',data.imgUrl);
                                    this.service.imageCode='';
                                    $('.telephone-verify-container input').val('');
                                    this.initMes.code = 301;
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    this.service.imageCode='';
                                }else if(data.code === 302){
                                    $('.telephone-verify-container').addClass('hide-content');
                                    $('.sms-container2').removeClass('hide-content');
                                    this.processor.hide();

                                    var currentTime = this.time,outdate= false;
                                    $("#code").prop("disabled", true);
                                    var timeInterval = setInterval(function(){
                                        if(currentTime <= 0){
                                            $("#code").html('重新获取');
                                            currentTime = this.time;
                                            outdate = true;
                                            clearInterval(timeInterval);
                                            $("#code").prop("disabled", false);
                                            $('#code').css('color','#2395ff');
                                        }else{
                                            currentTime --;
                                            $("#code").html('<span>'+ currentTime +'</span>s');
                                            $('#code').css('color','#888888');
                                        }
                                    },1000);
                                }else if(data.code === 303){
                                    this.warningMessage = res.data.message;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                }else if(data.code === 304){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('#imageCodeUrl1').attr('src',data.imgUrl);
                                    this.service.imageCode='';
                                    $('.telephone-verify-container input').val('');
                                }else if(data.code === 306){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 307){
                                    this.warningMessage = res.data.message;;
                                    processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 308){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 309){
                                    $('.telephone-verify-container').addClass('hide-content');
                                    $('.image-code-container').removeClass('hide-content');
                                    $('.telephone-verify-container input').val('');
                                    this.detailCode = true;
                                    //详单验证码赋值
                                    this.detailImageCode.code = '';
                                    $('#detailImageCodeUrl').attr('src',data.imgUrl);
                                    this.processor.hide();
                                    /*this.warningMessage = res.data.message;;
                                    processor.error();*/
                                    return;
                                }else if(data.code === 311){
                                    $('.sms-container1').removeClass('hide-content');
                                    this.processor.hide();

                                    var currentTime = this.time,outdate= false;
                                    $("#loginSmsCode").prop("disabled", true);
                                    var timeInterval = setInterval(function(){
                                        if(currentTime <= 0){
                                            $("#loginSmsCode").html('重新获取');
                                            currentTime = this.time;
                                            outdate = true;
                                            clearInterval(timeInterval);
                                            $("#loginSmsCode").prop("disabled", false);
                                            $('#loginSmsCode').css('color','#2395ff');
                                        }else{
                                            currentTime --;
                                            $("#loginSmsCode").html('<span>'+ currentTime +'</span>s');
                                            $('#loginSmsCode').css('color','#888888');
                                        }
                                    },1000);
                                    this.initMes.code = 311;
                                    return;
                                }else if(data.code === 500){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }
                            }else if(res.code === 1030){
                                /*this.warningMessage = res.message;*/
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                setTimeout(function(){
                                    location.href='https://'+location.host+'/risk/h5/mobile/verify';
                                },500)
                            }else{
                                /*this.warningMessage = res.message;*/
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                            }
                        }, (error) => {
                            this.processor.hide();
                            console.log(error);
                        });
                    }
                    return;
                }else if( this.initMes.code== 311 ){
                    //TODO
                    if(this.loginSms.code === ''){
                        this.warningMessage = '验证码不可为空';
                        this.processor.error();
                    }else{
                        this.$http.post('/apis/risk/h5/mobile/checkLoginSmsCaptche',{
                            password:this.service.password,
                            smsCode:this.loginSms.code
                        }).then((res) => {
                            var res = res.data;
                            var data = res.data;
                            if(res.code === 200){
                                if(data.code === 200){
                                    this.warningMessage = '授权成功';
                                    this.processor.success();
                                    this.$router.push({
                                        name:'riskbindBank'
                                    });
                                }else if(data.code ===301){
                                    $('#imgcode1').removeClass('hide-content');
                                    this.imageCode.imageUrl = data.imgUrl;
                                    $('#imageCodeUrl1').attr('src',data.imgUrl);
                                    this.service.imageCode='';
                                    this.processor.hide();
                                    $('#imgcode1').data('imgcode','true');
                                    this.initMes.code = 301;
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();

                                }else if(data.code ===302){
                                    $('.telephone-verify-container').addClass('hide-content');
                                    $('.sms-container2').removeClass('hide-content');
                                    this.processor.hide();

                                    var currentTime = this.time,outdate= false;
                                    $("#code").prop("disabled", true);
                                    var timeInterval = setInterval(function(){
                                        if(currentTime <= 0){
                                            $("#code").html('重新获取');
                                            currentTime = this.time;
                                            outdate = true;
                                            clearInterval(timeInterval);
                                            $("#code").prop("disabled", false);
                                            $('#code').css('color','#2395ff');
                                        }else{
                                            currentTime --;
                                            $("#code").html('<span>'+ currentTime +'</span>s');
                                            $('#code').css('color','#888888');
                                        }
                                    },1000);
                                }else if(data.code === 303){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 306){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 307){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 308){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }else if(data.code === 309){
                                    $('.telephone-verify-container').addClass('hide-content');
                                    $('.image-code-container').removeClass('hide-content');
                                    $('.telephone-verify-container input').val('');
                                    this.detailCode = true;
                                    //详单验证码赋值
                                    this.detailImageCode.code = '';
                                    $('#detailImageCodeUrl').attr('src',data.imgUrl);
                                    this.processor.hide();
                                    return;
                                }else if(data.code === 312){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    this.service.password = '';
                                    return;
                                }else if(data.code === 500){
                                    this.warningMessage = res.data.message;;
                                    this.processor.error();
                                    $('.telephone-verify-container input').val('');
                                    return;
                                }
                            }else if(res.code === 1030){
                                /*this.warningMessage = res.message;*/
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                setTimeout(function(){
                                    location.href='https://'+location.host+'/risk/h5/mobile/verify';
                                },500)
                            }else{
                                /*this.warningMessage = res.message;*/
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                            }
                        }, (error) => {
                            this.processor.hide();
                            console.log(error);
                        });
                    }
                    //TODO
                }else{
                    if(!this.service.password){
                        this.warningMessage = '服务密码不可为空';
                        this.processor.error();
                        return;
                    }
                    this.warningMessage = '授权中';
                    this.processor.show();

                    this.$http.post('/apis/risk/h5/mobile/checkPwd',{
                        password:this.service.password
                    }).then((res) => {
                        var res = res.data;
                        var data = res.data;
                        if(res.code === 200){
                            if(data.code === 200){
                                this.warningMessage = '授权成功';
                                this.processor.success();
                                this.$router.push({
                                    name:'riskbindBank'
                                });
                            }else if(data.code ===301){
                                $('#imgcode1').removeClass('hide-content');
                                this.imageCode.imageUrl = data.imgUrl;
                                $('#imageCodeUrl1').attr('src',data.imgUrl);
                                this.service.imageCode='';
                                this.processor.hide();
                                $('#imgcode1').data('imgcode','true');
                                this.initMes.code = 301;
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                            }else if(data.code ===302){
                                $('.telephone-verify-container').addClass('hide-content');
                                $('.sms-container2').removeClass('hide-content');
                                this.processor.hide();

                                var currentTime = this.time,outdate= false;
                                $("#code").prop("disabled", true);
                                var timeInterval = setInterval(function(){
                                    if(currentTime <= 0){
                                        $("#code").html('重新获取');
                                        currentTime = this.time;
                                        outdate = true;
                                        clearInterval(timeInterval);
                                        $("#code").prop("disabled", false);
                                        $('#code').css('color','#2395ff');
                                    }else{
                                        currentTime --;
                                        $("#code").html('<span>'+ currentTime +'</span>s');
                                        $('#code').css('color','#888888');
                                    }
                                },1000);
                            }else if(data.code === 303){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }else if(data.code === 306){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }else if(data.code === 307){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }else if(data.code === 308){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }else if(data.code === 309){
                                $('.telephone-verify-container').addClass('hide-content');
                                $('.image-code-container').removeClass('hide-content');
                                $('.telephone-verify-container input').val('');
                                this.detailCode = true;
                                //详单验证码赋值
                                this.detailImageCode.code = '';
                                $('#detailImageCodeUrl').attr('src',data.imgUrl);
                                this.processor.hide();
                                return;
                            }else if(data.code === 311){
                                    $('.sms-container1').removeClass('hide-content');
                                    this.processor.hide();

                                    var currentTime = this.time,outdate= false;
                                    $("#loginSmsCode").prop("disabled", true);
                                    var timeInterval = setInterval(function(){
                                        if(currentTime <= 0){
                                            $("#loginSmsCode").html('重新获取');
                                            currentTime = this.time;
                                            outdate = true;
                                            clearInterval(timeInterval);
                                            $("#loginSmsCode").prop("disabled", false);
                                            $('#loginSmsCode').css('color','#2395ff');
                                        }else{
                                            currentTime --;
                                            $("#loginSmsCode").html('<span>'+ currentTime +'</span>s');
                                            $('#loginSmsCode').css('color','#888888');
                                        }
                                    },1000);

                                    this.initMes.code = 311;
                                    return;
                            }else if(data.code === 500){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }
                            //TODO
                        }else if(res.code === 1030){
                            /*this.warningMessage = res.message;*/
                            this.processor.error();
                            $('.telephone-verify-container input').val('');
                            setTimeout(function(){
                                location.href='https://'+location.host+'/risk/h5/mobile/verify';
                            },500)
                        }else{
                            /*this.warningMessage = res.message;*/
                            this.processor.error();
                            $('.telephone-verify-container input').val('');
                        }
                    }, (error) => {
                        this.processor.hide();
                        console.log(error);
                    });
                }
            
        },
        //页面中获取按钮
        loginSmsSubmit:function(){
            var currentTime = this.time,outdate= false;
            $("#loginSmsCode").prop("disabled", "disabled");
            if(!this.processor){
                $('#process').removeClass('hide-content');
                this.initProcess = function(){
                    this.process = painting.process;
                    this.processor = new painting.process('canvas',3,120*1000,{
                        font:'50px Arial'
                    },'',0);
                };
                this.initProcess();
                this.processor.hide();
            }
            this.$http.post('/apis/risk/h5/mobile/sendLoginSmsCaptche').then((res) => {                   
                var data = res.data.data;
                if(data.code === 200){
                    var timeInterval = setInterval(function(){
                        if(currentTime <= 0){
                            $("#loginSmsCode").html('重新获取');
                            currentTime = this.time;
                            outdate = true;
                            clearInterval(timeInterval);
                            $("#loginSmsCode").prop("disabled", false);
                            $('#loginSmsCode').css('color','#2395ff');
                        }else{
                            currentTime --;
                            $("#loginSmsCode").html('<span>'+ currentTime +'</span>s');
                            $('#loginSmsCode').css('color','#888888');
                        }
                    },1000);
                }else if(data.code === 306){
                    this.warningMessage = res.data.message;;
                    this.processor.error();
                    $('.sms-container1 input').val('');
                }else if(data.code === 308){
                    this.warningMessage = res.data.message;;
                    this.processor.error();
                    $('.sms-container1 input').val('');
                    return;
                }else if(data.code === 500){
                    this.warningMessage = res.data.message;;
                    this.processor.error();
                    $('.telephone-verify-container input').val('');
                    return;
                
                }else if(data.code == 1030){
                    this.warningMessage = data.message;
                    this.processor.error();
                    $('.telephone-verify-container input').val('');
                    setTimeout(function(){
                        location.href='https://'+location.host+'/risk/h5/mobile/verify';
                    },500);
                   return;
                }else{
                    this.warning = data.message;
                    /*warning.show();*/
                    $('.sms-container1 input').val('');
                    $("#loginSmsCode").prop("disabled", false);
                }
               
            }, (error) => {
                console.log(err);
                $('.sms-container1 input').val('');
            });

        },  
        //验证详单验证码
        verifyDetailImageCode:function(){
            if(!this.detailImageCode.code){
                this.warningMessage = '图片验证码不可为空';
                this.processor.error();
                return;
            }
            this.warningMessage = '获取中...';
            this.processor.show();
            this.$http.post('/apis/risk/h5/mobile/checkDetailImageCaptche',{
                imageCode:this.detailImageCode.code
            }).then((res) => {
                var res = res.data;
                var data = res.data;
                if(res.code === 200){
                    var data = res.data;
                    if(data.code === 310){
                        this.detailImageCode.code = '';
                        $('#detailImageCodeUrl').attr('src',data.imgUrl);
                        this.warningMessage = '请重新输入图片验证码';
                        $('.image-code-container input').val('');
                        this.processor.error();
                    }else if(data.code === 302){
                        $('.image-code-container').addClass('hide-content');
                        $('.sms-container').removeClass('hide-content');
                        $('.image-code-container input').val('');
                        this.processor.hide();
                        this.getDetailSmsCode();
                    }else if(data.code === 500){
                        this.warningMessage = res.data.message;;
                        this.processor.error();
                        $('.telephone-verify-container input').val('');
                        return;
                    }else{
                        this.warningMessage = res.message;
                        this.processor.error();
                        $("#code").prop("disabled", false);
                        $('.image-code-container input').val('');
                    }
                }else if(res.code === 1030){
                    this.warningMessage = res.message;
                    this.processor.error();
                    $('.telephone-verify-container input').val('');
                    setTimeout(function(){
                        location.href='https://'+location.host+'/risk/h5/mobile/verify';
                    },500)
                }else{
                    this.warningMessage = res.message;
                    this.processor.error();
                    $('.image-code-container input').val('');
                }
            }, (error) => {
                    this.processor.hide();
                    console.log(err);
            });
            
        },
        noSmsVerifyDetailImageCode:function(){
                this.$http.post('/apis/risk/h5/mobile/checkDetailImageCaptche',{
                        imageCode:this.noSmsDetailImageCode.code
                }).then((res) => {
                    var res = res.data;
                    if(res.code === 200){
                        $('.no-sms-image-code-container').addClass('hide-content');
                        $('.sms-container').removeClass('hide-content');
                        $('.no-sms-image-code-container input').val('');
                        this.processor.hide();
                    }else if(res.code === 1030){
                        this.warningMessage = res.message;
                        this.processor.error();
                        $('.telephone-verify-container input').val('');
                        setTimeout(function(){
                            location.href='https://'+location.host+'/risk/h5/mobile/verify';
                        },500)
                    }else{
                        this.warningMessage = res.message;
                        this.noSmsDetailImageCode.code = '';
                        $('#noSmsDetailImageCodeUrl').attr('src',data.imgUrl);
                        this.warningMessage = '请重新输入图片验证码';
                        this.processor.error();
                        $('.no-sms-image-code-container input').val('');
                    }

                }, (error) => {
                        this.processor.hide();
                        console.log(err);
                        $('.no-sms-image-code-container input').val('');
                });
           
        },
        //验证详单302后,(后台)发送短信
        getDetailSmsCode:function(){
            $("#code").prop("disabled", true);
            this.timeInterval = setInterval(function(){
                if(this.detailCurrentTime <= 0){
                    $("#code").html('重新获取');
                    clearInterval(this.timeInterval);
                    $("#code").prop("disabled", false);
                    $('#code').css('color','#2395ff');
                }else{
                    this.detailCurrentTime --;
                    $("#code").html('<span>'+ this.detailCurrentTime +'</span>s');
                    $('#code').css('color','#888888');
                }
            },1000);
        },
        //发送短信验证码(直接重新获取或者返回详单有sms发送页面)
        getCode:function(){
            var currentTime = this.time,outdate= false;
            $("#code").prop("disabled", true);
            if(this.detailCode){
                //返回详单有sms发送页面
                $('.sms-container').addClass('hide-content');
                $('.image-code-container').removeClass('hide-content');
                $('.image-code-container input,.sms-container input').val('');
                this.getDetailImageCaptche(this.detailImageCode.code,$('#detailImageCodeUrl'));
            }else{
                this.$http.post('/apis/risk/h5/mobile/sendSmsCaptche').then((res) => { 
                    var data = res.data.data;
                    if(data.code === 200){
                        var timeInterval = setInterval(function(){
                            if(currentTime <= 0){
                                $("#code").html('重新获取');
                                currentTime = this.time;
                                outdate = true;
                                clearInterval(timeInterval);
                                $("#code").prop("disabled", false);
                                $('#code').css('color','#2395ff');
                            }else{
                                currentTime --;
                                $("#code").html('<span>'+ currentTime +'</span>s');
                                $('#code').css('color','#888888');
                            }
                        },1000);
                    }else if(data.code === 306){
                        this.warningMessage = data.message;
                        this.processor.error();
                        $('.sms-container input').val('');
                    }else if(data.code === 308){
                        this.warningMessage = data.message;
                        this.processor.error();
                        $('.sms-container input').val('');
                        return;
                    }else if(data.code === 500){    
                        this.warningMessage = data.message;
                        this.processor.error();
                        $('.telephone-verify-container input').val('');
                        return;
                    }else if(data.code === 1030){
                        this.warningMessage = data.message;
                        this.processor.error();
                        $('.telephone-verify-container input').val('');
                        setTimeout(function(){
                            location.href='https://'+location.host+'/risk/h5/mobile/verify';
                        },500)
                    }else{
                        this.warning = data.message;
                        //todo 1010
                        /*warning.show();*/
                        $('.sms-container input').val('');
                        $("#code").prop("disabled", false);
                    }
                }, (error) => {
                    this.processor.hide();
                    console.log(err);
                    $('.sms-container input').val('');
                });
           
            }
        },
        //验证短信验证码
        verifySms:function(){
            
                if(!this.processor){
                    $('#process').removeClass('hide-content');
                    this.initProcess = function(){
                        this.process = painting.process;
                        this.processor = new painting.process('canvas',3,120*1000,{
                            font:'50px Arial'
                        },'',0);
                    };
                    this.initProcess();
                    this.processor.hide();
                }
                if(!this.sms.code){
                    this.warningMessage = '短信验证码不可为空';
                    this.processor.error();
                    return;
                }
                this.warningMessage = '正在审核手机号信息...';
                this.processor.show();

                this.$http.post('/apis/risk/h5/mobile/checkSmsCaptche',{
                    smsCode:this.sms.code
                }).then((res) => { 
                    var res = res.data;
                    var data = res.data;
                    if(res.code == 200){
                        if(res.data.code === 200){
                            this.warningMessage = '授权成功';
                            this.processor.success();
                            this.$router.push({
                                name:'riskbindBank'
                            });
                        }else if(res.data.code === 305){
                            this.warningMessage = res.data.message;;
                            this.processor.error();
                            $('.sms-container input').val('');
                        }else if(res.data.code === 310){
                            //TODO 跳转到不用发送短信验证码页面?是否直接返回imageURL
                            $('.sms-container').addClass('hide-content');
                            $('.no-sms-image-code-container').removeClass('hide-content');
                            this.processor.hide();
                            this.getDetailImageCaptche(this.noSmsDetailImageCode.code,$('#noSmsDetailImageCodeUrl'));
                        }else if(res.data.code === 500){
                            this.warningMessage = res.data.message;;
                            this.processor.error();
                            $('.telephone-verify-container input').val('');
                            return;
                        }else{
                            /*this.warningMessage = res.message;*/
                            this.processor.error();
                            $('.sms-container input').val('');
                        }
                    
                    }else if(res.code === 1030){
                        /*this.warningMessage = res.message;*/
                        this.processor.error();
                        $('.telephone-verify-container input').val('');
                        setTimeout(function(){
                            location.href='https://'+location.host+'/risk/h5/mobile/verify';
                        },500)
                    }else{
                        /*this.warningMessage = res.message;*/
                        this.processor.error();
                        $('.image-code-container input').val('');
                    }
                }, (error) => {
                    this.processor.hide();
                    console.log(err);
                });
           
        },
        //重新获取详单验证码
        getDetailImageCaptche:function(detailImageCode,urlObject){
            this.$http.post('/apis/risk/h5/mobile/getDetailImageCaptche').then((res) => { 
                var data = res.data;
                if(data.code === 200){
                    detailImageCode = '';
                    urlObject.attr('src',data.data.imgUrl);
                }else if(data.code === 1030){
                    this.warningMessage = data.message;
                    this.processor.error();
                    $('.telephone-verify-container input').val('');
                    setTimeout(function(){
                        location.href='https://'+location.host+'/risk/h5/mobile/verify';
                    },500)
                }else{
                    this.warningMessage = data.message;
                }
            }, (error) => {
                this.processor.hide();
                console.log(err);
            });
        },
        //验证图片验证码
        verifyImageCode:function(){
           
                if(!this.imageCode.code){
                    this.warningMessage = '图片验证码不可为空';
                    this.processor.error();
                    return;
                }
                if(!this.service.password){
                    this.warningMessage = '服务密码不可为空';
                    this.processor.error();
                    return;
                }
                this.warningMessage = '验证中';
                this.processor.show();
                var verifyImageCodeAjax = $.ajax({
                    url: this.apiServer +"/apis/risk/h5/mobile/checkImageCaptche",
                    dataType: "json",
                    async: true,
                    type: "POST",
                    timeout : 120*1000,
                    data:{
                        password:this.service.password,
                        imageCode:this.imageCode.code
                    },
                    success: function(res) {
                        var res = res.data;
                        var data = res.data;
                        if(res.code === 200){
                            if(data.code === 200){
                                this.warningMessage = '授权成功';
                                this.processor.show();
                                this.processor.success();
                                this.$router.push({
                                    name:'riskbindBank'
                                });
                            }else if(data.code ===301){
                                this.imageCode.code = '';
                                $('#imageCodeUrl').attr('src',data.imgUrl);
                                this.warningMessage = '请重新输入图片验证码';
                                this.processor.error();
                                $('.image-code-container input').val('');
                            }else if(data.code === 302){
                                $('.image-code-container').addClass('hide-content');
                                $('.sms-container').removeClass('hide-content');
                                $('.image-code-container input').val('');
                                this.processor.hide();
                                
                                var currentTime = this.time,outdate= false;
                                $("#code").prop("disabled", true);
                                var timeInterval = setInterval(function(){
                                    if(currentTime <= 0){
                                        $("#code").html('重新获取');
                                        currentTime = this.time;
                                        outdate = true;
                                        clearInterval(timeInterval);
                                        $("#code").prop("disabled", false);
                                        $('#code').css('color','#2395ff');
                                    }else{
                                        currentTime --;
                                        $("#code").html('<span>'+ currentTime +'</span>s');
                                        $('#code').css('color','#888888');
                                    }
                                },1000);
                            }else if(data.code === 304){
                                this.warningMessage = '图片验证码错误';
                                this.processor.error();
                                $("#code").prop("disabled", false);
                                $('.image-code-container input').val('');
                            }else if(data.code === 500){
                                this.warningMessage = res.data.message;;
                                this.processor.error();
                                $('.telephone-verify-container input').val('');
                                return;
                            }else{
                                this.warningMessage = res.message;
                                this.processor.error();
                                $("#code").prop("disabled", false);
                                $('.image-code-container input').val('');
                            }
                
                        }else if(res.code === 1030){
                            this.warningMessage = res.message;
                            this.processor.error();
                            $('.telephone-verify-container input').val('');
                            setTimeout(function(){
                                location.href='https://'+location.host+'/risk/h5/mobile/verify';
                            },500)
                        }else{
                            this.warningMessage = res.message;
                            this.processor.error();
                            $('.image-code-container input').val('');
                        }
                    },
                    complete: function(xhr,status) {
                        if(status=='timeout'){
                            verifyImageCodeAjax.abort();
                            this.warningMessage = '请求超时';
                            this.processor.error();
                        }
                    },
                    error: function(err) {
                        this.processor.hide();
                        console.log(err);
                    }
                });
            
        }
    }
}
</script>

<style lang="sass">
    @import '../../scss/risk/telephoneVerify.scss';
</style>