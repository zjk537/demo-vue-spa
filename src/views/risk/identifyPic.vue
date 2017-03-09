<template>
	<div class="identifyPic" id="identifyPic">
        <comHeader title="身份证照片" back="true"></comHeader>
        <section class="picBox">
            <h5>1.上传身份证正面照</h5>
            <div>
                <span class="cardRule stand">
                    <img class="example" src="/static/img/identifyPicA.jpg"/>
                </span>
                <span class="cardRule">
                    <img class="front" :src="mes.frontIdcardFile ? 'data:image/png;base64,'+mes.frontIdcardFile : '/static/img/identifyPicBg.jpg'"/>
                    <input class="frontInput" type="file" name="frontIdcardFile" @change="upload" accept="image/*;capture=camera">
                    <strong class="canvasImgContainer"></strong>
                </span>
            </div>
            <h5>2.上传身份证反面照</h5>
            <div>
                <span class="cardRule stand">
                    <img class="example" src="/static/img/identifyPicB.jpg"/>
                </span>
                <span class="cardRule">
                    <img class="back" :src="mes.reverseIdcardFile ? 'data:image/png;base64,'+mes.reverseIdcardFile : '/static/img/identifyPicBBg.jpg'"/> 
                    <input class="backInput" type="file" name="reverseIdcardFile" @change="upload" accept="image/*;capture=camera">
                    <strong class="canvasImgContainer"></strong>
                </span>
            </div>
            <p>请确保您的身份证摆放平整，信息清晰可见</p>
        </section>
        <section class="picBox personPicBox">
            <h5>3.上传手持身份证自拍照</h5>
            <div>
                <span class="cardRule stand">
                    <img class="example" src="/static/img/identifyPicC.jpg"/>
                </span>
                <span class="cardRule">
                   <img class="person" :src="mes.handIdcardFile ? 'data:image/png;base64,'+mes.handIdcardFile : '/static/img/identifyBg.png'"/> 
                    <input class="personInput" type="file" name="handIdcardFile" @change="upload" accept="image/*;capture=camera">
                    <strong class="canvasImgContainer"></strong>
                </span>
            </div>
            <p>请保持您的五官和身份证信息清晰可见，无遮挡</p>
        </section>
        <button id="submitMes" class="" @click="uploadIdcardImage">提交信息</button>
	</div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    import upload from 'src/js/common/upload.js';
    import { MessageBox , Indicator ,Toast } from 'mint-ui';
    export default {
        name: 'identifyPic',
        data () {
            return {
               /* frontMes:{},
                backMes:{},
                personMes:{}*/
                mes:{ 
                }
            }
        }, 
        components: {
            riskStep,
            comHeader
        },
        mounted: function(){
            this.$nextTick(()=>{
                this.getIdentifyPic();
                /*this.checkVal();*/
            });
        },
        methods:{
            getIdentifyPic:function(){
                let $btnSubmit = $('#submitMes');
                Indicator.open();
                this.$http.post('/apis/risk/h5/getIdcardImage').then((response) => {
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

                    if(!resData.data){
                        $btnSubmit.removeClass('canSubmit');
                        return;
                    }
                    $btnSubmit.addClass('canSubmit');
                    this.mes = resData.data;

                    // if(resData.code==200){
                    //     if(!resData.data){
                    //         resData.data = {};
                    //         $('#submitMes').removeClass('canSubmit');
                    //     }else{
                    //         $('#submitMes').addClass('canSubmit');
                            
                    //         $('.frontInput').attr('value',resData.data.frontIdcardFile);
                    //         $('.backInput').attr('value',resData.data.reverseIdcardFile);
                    //         $('.personInput').attr('value',resData.data.handIdcardFile);
                    //     }
                    //     this.mes = resData.data;
                        
                    //     let h = $('.stand img').css('height');
                    //     let w = $('.stand img').css('width');
                    //     let $img = $('.cardRule img');
                    //     $img.css("width", w);
                    //     $img.css("height", h);

                    // }else{
                    //     Toast(resData.message);
                    // }

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败,请稍后重试!',position:'bottom' });
                    console.log(error);
                });
            },
            uploadPic:function(name,imgData){
                let url = '/apis/risk/h5/',
                    imgObj = imgData.split(',')[1],
                    params = null;

                let $btnSubmit = $('#submitMes');
                if(name == 'frontIdcardFile'){
                    _hmt.push(['_trackEvent', 'h5_idCard_front', 'click', '身份证正面点击']);
                    url  += 'ocrIdcardFront';
                    //obj = $('.frontInput').attr("value")
                    params = {
                        'frontIdcardFile':imgObj
                    };
                }else if(name == 'reverseIdcardFile'){
                    _hmt.push(['_trackEvent', 'h5_idCard_back', 'click', '身份证反面点击']);
                    url += 'ocrIdcardReverse';
                    //obj = $('.backInput').attr("value")
                    params = {
                        'reverseIdcardFile':imgObj
                    };
                }else if(name == 'handIdcardFile'){
                    _hmt.push(['_trackEvent', 'h5_idCard_hand', 'click', '手持身份证点击']);
                    url  += 'ocrIdcardHandle';
                    //obj = $('.personInput').attr("value")
                    params = {
                        'handIdcardFile':imgObj
                    };
                }
                Indicator.open();
                this.$http.post(url, params).then((response) => {
                    Indicator.close();
                    if(response.status != 200){
                        Toast(response.statusText);
                        return;
                    }
                    var resData = response.data;
                    let $imgContainer = $('input[name=' + name + ']').parent();
                    if(resData.code == 500100){
                        $imgContainer.css('border','1px solid red');
                        if(name == 'frontIdcardFile'){
                            this.mes.idcardFrontPath = '';
                        }
                        if(name == 'reverseIdcardFile'){
                            this.mes.idcardReversePath = '';
                        }
                        MessageBox({
                          title: '身份证照片不清晰',
                          message: '请按照示例图片样式重新上传',
                          showCancelButton: true,
                          confirmButtonText:'确定',
                          cancelButtonText: '取消'
                        });
                        return;
                    }

                    if(resData.code == 500101){
                        $imgContainer.css('border','1px solid red');
                        this.mes.idcardHandlePath ='';
                        MessageBox({
                          title: '手持身份证照片不清晰',
                          message: '请按照示例图片样式重新上传',
                          showCancelButton: true,
                          confirmButtonText:'确定',
                          cancelButtonText: '取消'
                        });
                        return;
                    }
                    if(resData.code != 200){
                        Toast(resData.message);
                        return;
                    }

                    $imgContainer.removeAttr('style');
                    let objData = resData.data;
                    if(name == 'frontIdcardFile'){
                        _hmt.push(['_trackEvent', 'h5_idCard_frontOK', 'click', '身份证正面成功']);
                        this.mes.idcardFrontPath = objData.idcardFrontPath;
                        this.mes.name = objData.name;  
                        this.mes.idcard = objData.idcard;   
                        this.mes.race = objData.race;     
                        this.mes.address = objData.address;
                    }
                    if(name == 'reverseIdcardFile'){
                        _hmt.push(['_trackEvent', 'h5_idCard_backOK', 'click', '身份证反面成功']);
                        this.mes.idcardReversePath = objData.idcardReversePath;
                        this.mes.valid_date = objData.valid_date;   
                        this.mes.issued_by = objData.issued_by;
                    } 
                    if(name == 'handIdcardFile'){
                        _hmt.push(['_trackEvent', 'h5_idCard_handOK', 'click', '手持身份证成功']);
                        this.mes.idcardHandlePath = objData.idcardHandlePath;
                    }
                    if(this.mes.idcardFrontPath && 
                        this.mes.idcardReversePath && 
                        this.mes.idcardHandlePath){
                        $btnSubmit.addClass('canSubmit');
                    } else {
                        $btnSubmit.removeClass('canSubmit');
                    }

                    // let code = response.data.code;
                    // if(code == 200){
                    //     //$(picContainer).css('border','none');
                        
                    //     if(name == 'frontIdcardFile'){
                    //         _hmt.push(['_trackEvent', 'h5_idCard_frontOK', 'click', '身份证正面成功']);
                    //         this.mes.idcardFrontPath = resData.idcardFrontPath;/*
                    //         this.mes.frontIdcardFile=resData.frontIdcardFile;*/
                    //         this.mes.name = resData.name;  
                    //         this.mes.idcard = resData.idcard;   
                    //         this.mes.race = resData.race;     
                    //         this.mes.address = resData.address;
                    //     }else if(name == 'reverseIdcardFile'){
                    //         _hmt.push(['_trackEvent', 'h5_idCard_backOK', 'click', '身份证反面成功']);
                    //         this.mes.idcardReversePath = resData.idcardReversePath;/*
                    //         this.mes.reverseIdcardFile=resData.reverseIdcardFile;*/
                    //         this.mes.valid_date = resData.valid_date;   
                    //         this.mes.issued_by = resData.issued_by;
                    //     }else if(name == 'handIdcardFile'){
                    //         _hmt.push(['_trackEvent', 'h5_idCard_handOK', 'click', '手持身份证成功']);
                    //         this.mes.idcardHandlePath = resData.idcardHandlePath;/*
                    //         this.mes.handIdcardFile=resData.handIdcardFile;*/
                    //     }
                        
                    // }else if(code==500100){
                    //     //$(picContainer).css('border','1px solid red');

                        
                    //     if(name == 'frontIdcardFile'){
                    //         this.mes.idcardFrontPath='';
                    //         this.mes.name = '';  
                    //         this.mes.idcard = '';   
                    //         this.mes.race = '';     
                    //         this.mes.address = '';
                    //     }else if(name == 'reverseIdcardFile'){
                    //         this.mes.idcardReversePath = '';
                    //         this.mes.valid_date = '';   
                    //         this.mes.issued_by = '';
                    //     }

                    //     MessageBox({
                    //       title: '身份证照片不清晰',
                    //       message: '请按照示例图片样式重新上传',
                    //       showCancelButton: true,
                    //       confirmButtonText:'确定',
                    //       cancelButtonText: '取消'
                    //     });
                        
                    // }else if(code==500101){
                    //     //$(picContainer).css('border','1px solid red');

                    //     this.mes.idcardHandlePath ='';

                    //     MessageBox({
                    //       title: '手持身份证照片不清晰',
                    //       message: '请按照示例图片样式重新上传',
                    //       showCancelButton: true,
                    //       confirmButtonText:'确定',
                    //       cancelButtonText: '取消'
                    //     });
                        
                    // }else{
                    //     Toast(response.data.message);
                    // }

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败,请稍后重试!',position:'bottom' });
                    console.log(error);
                });
            },
            upload:function(e){
                var $sender = $(e.currentTarget || e.target);

                var imgFile = $sender[0].files[0];
                if(imgFile.size >= 5*1024*1024){
                    vue.warning = '上传图片大小必须小于5MB';
                    warning.show();
                    return;
                }
                var $canvsContainer = $sender.next();
                function del(view) {
                    $(view).remove();
                }
                var image = new Image();
                image.src = window.URL.createObjectURL(imgFile);
                var _this = this;
                image.onload = function(){
                    var canvas = document.createElement("canvas");
                    var imgWidth = 1062;
                    var imgHeight = 1062/(image.width/image.height);

                    canvas.setAttribute("width", imgWidth);
                    canvas.setAttribute("height", imgHeight);
                    canvas.setAttribute("onclick", "del(this)");

                    $canvsContainer.html('');
                    $canvsContainer.append(canvas);
                    var cxt = canvas.getContext("2d");
                    cxt.drawImage(this, 0, 0, imgWidth, imgHeight);
                    let rio = 0.8;
                    if(imgFile.size > 200*1024){
                        rio = 200*1024 / imgFile.size;
                        if(rio < 0.3){
                            rio = 0.9;
                        }
                    }
                    let name = $sender.attr('name');
                    let imgData = canvas.toDataURL('image/jpeg', rio);
                    //let imgObj = imgData.split(',')[1];

                    $sender.prev().attr('src',imgData);
                    _this.uploadPic(name,imgData);

                    // var result = canvas.toDataURL("image/jpeg",rio).split(",")[1];
                    
                    // let imgData = 'data:image/png;base64,'+ result;
                    // $(e.target).attr("value",result);
                    // $(e.target).prev().attr('src',imgData);
                    // let frontIdcardFile=$('.frontInput').attr('value');
                    // let reverseIdcardFile=$('.backInput').attr('value');
                    // let handIdcardFile=$('.personInput').attr('value');
                    // if( !frontIdcardFile || !reverseIdcardFile || !handIdcardFile){
                    //     $('#submitMes').removeClass('canSubmit');
                    // }else{
                    //     $('#submitMes').addClass('canSubmit');
                    // }

                    // let name =$(e.target).attr('name');
                    // let picContainer = $(e.target).parent();

                    // _this.uploadPic(name,picContainer);
                }
            },
            uploadIdcardImage: function(){
                // let frontIdcardFile=$('.frontInput').attr('value');
                // let reverseIdcardFile=$('.backInput').attr('value');
                // let handIdcardFile=$('.personInput').attr('value');
                // if( !frontIdcardFile || !reverseIdcardFile || !handIdcardFile){
                //     Toast('请完善图片信息');
                //     return;
                // } 
                _hmt.push(['_trackEvent', 'h5_idCard_submit', 'click', '提交信息']);
                if(!this.mes.idcardFrontPath ||
                    !this.mes.idcardReversePath ||
                    !this.mes.idcardHandlePath){
                    Toast('请完善图片信息');
                    return;
                }

                let $btnSubmit = $('#submitMes');
                if(!$btnSubmit.hasClass('canSubmit')){
                    return;
                }
                let identifyPicPrams = {
                    idcardFrontPath:this.mes.idcardFrontPath,
                    idcardReversePath:this.mes.idcardReversePath,
                    idcardHandlePath:this.mes.idcardHandlePath,
                    name:this.mes.name,  
                    idcard:this.mes.idcard,   
                    race:this.mes.race,     
                    address:this.mes.address ,
                    valid_date:this.mes.valid_date,   
                    issued_by:this.mes.issued_by

                };

                
                Indicator.open();
                this.$http.post('/apis/risk/h5/uploadIdcardImage',identifyPicPrams).then((response) => {
                    Indicator.close(); 
                    if(response.status != 200){
                        Toast(response.statusText);
                        return;
                    }
                    var resData = response.data;
                    if(resData.code == 500100){
                        MessageBox({
                          title: '身份证照片不清晰',
                          message: '请按照示例图片样式重新上传',
                          showCancelButton: true,
                          confirmButtonText:'确定',
                          cancelButtonText: '取消'
                        });
                        return;
                    }
                    if(resData.code == 500101){
                        MessageBox({
                          title: '手持身份证照片不清晰',
                          message: '请按照示例图片样式重新上传',
                          showCancelButton: true,
                          confirmButtonText:'确定',
                          cancelButtonText: '取消'
                        });
                        return;
                    }
                    if(resData.code != 200){
                        Toast(resData.message);
                        return;
                    }
                    this.$router.go(-1);

                    // var code = response.data.code;
                    // if(code ==200){
                    //     this.$router.go(-1);
                    // }else if(code==500100){
                    //     MessageBox({
                    //       title: '身份证照片不清晰',
                    //       message: '请按照示例图片样式重新上传',
                    //       showCancelButton: true,
                    //       confirmButtonText:'确定',
                    //       cancelButtonText: '取消'
                    //     });
                    // }else if(code==500101){
                    //     MessageBox({
                    //       title: '手持身份证照片不清晰',
                    //       message: '请按照示例图片样式重新上传',
                    //       showCancelButton: true,
                    //       confirmButtonText:'确定',
                    //       cancelButtonText: '取消'
                    //     });
                    // }else{
                    //     Toast(resData.message);
                    // }

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败,请稍后重试!',position:'bottom' });
                    console.log(error);
                });


            }
        }
    }
</script>

<style lang="scss">
    @import '../../scss/risk/messageStyle.scss';
    @import '../../scss/risk/identifyPic.scss';
    #submitMes{background:#ccc;}
</style>