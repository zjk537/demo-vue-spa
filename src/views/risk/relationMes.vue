<template>
	<div class="relationMes">
        <comHeader title="手机信息" back="true" @onBackClick="goRiskIndex"></comHeader>
        <riskStep  widthLine="80%" dotOneClass="active"  dotTwoClass="active"  dotThreeClass="active"></riskStep>
        <p class="tip">请填写第一联系人</p>
        <section class="message noMarginTop">
            <p class="relation1" name="relation1" @click="pickShow">
                <span>关系</span>
                <label class="relation1Val">父母</label>
                <strong> </strong>
            </p>
            <p name="contactName1">
                <span>姓名</span>
                <input type="text" class="name" placeholder="请输入真实姓名" v-model="contactName1"  @keyup="onTxtChange()"/>
            </p>
            <p name="contactMobile1">
                <span>手机号</span>
                <input type="tel" class="mobile" placeholder="请输入联系人的手机号" v-model="contactMobile1"  @keyup="onTxtChange()"/>
            </p>
        </section>
        <p class="tip">请填写第二联系人</p>
        <section class="message noMarginTop">
            <p class="relation2" name="relation2" @click="pickShow">
                <span>关系</span>
                <label class="relation2Val" >朋友</label>
                <strong> </strong>
            </p>
            <p name="contactName2">
                <span>姓名</span>
                <input type="text" class="name" placeholder="请输入真实姓名" v-model="contactName2" @keyup="onTxtChange()"/>
            </p>
            <p name="contactMobile2">
                <span>手机号</span>
                <input type="tel" class="mobile" placeholder="请输入联系人的手机号" v-model="contactMobile2" @keyup="onTxtChange()"/>
            </p>
        </section>
        <button id="submitMes" @click="saveContactInfo">下一步</button>
     <!--    
        <div class="mask mask-relation1" style="display:none;">
            <mt-picker class="mt-picker" :slots="slotsRelation1" :showToolbar=true @change="changeRelation1" >
                <span name="relation1" @click="pickerHide" >取消</span>
                <span name="relation1" @click="pickerConfirm">确认</span>
            </mt-picker>
        </div> 
        <div class="mask mask-relation2" style="display:none;">
            <mt-picker class="mt-picker" :slots="slotsRelation2" :showToolbar=true @change="changeRelation2" >
                <span name="relation2" @click="pickerHide" >取消</span>
                <span name="relation2" @click="pickerConfirm">确认</span>
            </mt-picker>
        </div>  -->

        <mt-popup 
            v-model="popPicker.picker_relation1" 
            position="bottom">
            <div class="pick_bar">
                    <span class="canel" name="relation1" @click="popPicker.picker_relation1 = false" >取消</span>
                    <span class="confirm" name="relation1" @click="pickerConfirm">确认</span>
                </div>
            <mt-picker  
                class="picker-relation1" 
                :slots="slotsRelation1" 
                @change="changeRelation1" >
            </mt-picker>
        </mt-popup>

        <mt-popup 
            v-model="popPicker.picker_relation2" 
            position="bottom">
            <div class="pick_bar">
                    <span class="canel"  name="relation2" @click="popPicker.picker_relation2 = false" >取消</span>
                    <span class="confirm" name="relation2" @click="pickerConfirm">确认</span>
                </div>
            <mt-picker 
                class="picker-relation2" 
                :slots="slotsRelation2"
                @change="changeRelation2" >
            </mt-picker>
        </mt-popup>


	</div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    import utily from '../../js/common/utily.js';
    import { Toast ,Indicator,Picker,Popup} from 'mint-ui';
    export default {
        name: 'relationMes',
        data () {
            return {
                popPicker:{
                    picker_relation1: false,
                    relation1Value: '父母',
                    picker_relation2: false,
                    relation2Value: '父母'
                },
                slotsRelation1:[{
                    flex: 1,
                    values:['父母','配偶','兄弟姐妹'],
                    className: 'relation1',
                    textAlign: 'center'
                }],
                slotsRelation2:[{
                    flex: 1,
                    values:['父母','配偶','兄弟姐妹','同事','朋友'],
                    className: 'relation2',
                    textAlign: 'center'
                }],
                relation1:'父母',
                relation2:'朋友',
                contactName1:'',
                contactMobile1:'',
                contactName2:'',
                contactMobile2:'',
                submitFlag:false,
            }
        },
        components: {
            riskStep,
            comHeader
        },
        mounted(){ 
            this.$nextTick(() => {
            })
        },
        methods:{
            onTxtChange:function(){
                if( this.empty() ){
                    $('#submitMes').removeClass('canSubmit');
                }else{
                    $('#submitMes').addClass('canSubmit');
                }    
            },
            errorTipShow:function(validateResult){
                $(".errorTip").remove();
                if(!validateResult)return;
                for (var item of validateResult) {
                    if( !item.flag ){
                        var errorMessage = item.message;
                        var errorTipDiv = 
                        '<div class="errorTip">'+
                            '<b><i class="errorIcon"></i>'+errorMessage+'</b>'+
                        '</div>';
        
                        $('p[name="'+item.name+'"]').after(errorTipDiv);
                    }
                }
            },
            empty:function(){
                let empty; 
                return empty =
                    !this.contactName1 ||
                    !this.contactName2 ||
                    !this.contactMobile1 ||
                    !this.contactMobile2 
            },
            regex:function(){

                let contactName1 = utily.regex().relationNameRegex.test( this.contactName1 );
                let contactName2 = utily.regex().relationNameRegex.test( this.contactName2 );
                let contactMobile1 = utily.regex().mobileRegex.test( this.contactMobile1 );
                let contactMobile2 = utily.regex().mobileRegex.test( this.contactMobile2 );

                this.submitFlag = 
                    contactName1 && 
                    contactName2 && 
                    contactMobile1 && 
                    contactMobile2;

                let validateResult =
                [
                    {
                        "message":"联系人姓名只支持中文和字母",
                        "name":"contactName1",
                        'flag': contactName1
                    },
                    {
                        "message":"联系人姓名只支持中文和字母",
                        "name":"contactName2",
                        'flag': contactName2
                    },
                    {
                        "message":"请输入正确的手机号",
                        "name":"contactMobile1",
                        'flag': contactMobile1
                    },
                    {
                        "message":"请输入正确的手机号",
                        "name":"contactMobile2",
                        'flag': contactMobile2
                    },
                ]  
                this.errorTipShow(validateResult);
                
                return this.submitFlag;
            },
            saveContactInfo:function(){
                _hmt.push(['_trackEvent', 'h5_contact_next', 'click', '联系人_下一步']);
                if( this.empty() ){
                    Toast('请将信息填写完整后提交');
                    return;
                }

                if(!this.regex())return;

                Indicator.open();
                let prams = {
                    relation1:this.relation1,
                    contactName1:this.contactName1,   
                    contactMobile1:this.contactMobile1, 
                    relation2:this.relation2,   
                    contactName2:this.contactName2,   
                    contactMobile2 :this.contactMobile2
                }
                this.$http.post('/apis/risk/h5/saveContactInfo',prams).then((response) => {
                    Indicator.close(); 
                    
                    if(response.status != 200){
                        Toast(response.statusText);
                        return;
                    }
                    var resData = response.data;
                    if(resData.code == 599999){
                        let validateResult = resData.data.validateResult;
                    
                        this.errorTipShow(validateResult);
                        return;
                    }
                    if(resData.code != 200){
                        Toast(resData.message);
                        return;
                    }
                    _hmt.push(['_trackEvent', 'h5_contact_nextOk', 'click', '联系人_下一步(跳转成功)']);
                    this.$router.push({
                        name:'mobileVerify'
                    })

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },
            changeRelation1:function(picker, values) {
              this.popPicker.relation1Value = values[0];
            },
            changeRelation2:function(picker, values) {
              this.popPicker.relation2Value = values[0];
            },
            pickShow:function(event){
                var $sender = $(event.currentTarget || event.target);
                var target = $sender.attr('class');
                this.popPicker['picker_' + target] = true;
            },
            pickerConfirm:function(e){
                var $sender = $(event.currentTarget || event.target);
                var target = $sender.attr('name');
                this[target] = this.popPicker[target + "Value"];

                $('.'+target+'Val').text(this[target])
                $('.'+target+' strong').text('');
                this.popPicker['picker_'+target] = false;
                this.onTxtChange();
            },
            goRiskIndex(){
                this.$router.replace({
                    name:'verifyItem'
                });
            },

        }
    }
</script>

<style lang="scss">
    .relationMes{
        .mint-popup{
            width: 100%;
        }
        .pick_bar{
            width:100%;
            line-height:1.5rem;
            position:relative;
            border-bottom:1px solid #e6e6e6;
            span{
                padding:.5rem 1rem;
                color:#3d3dcb;
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
    @import '../../scss/risk/messageStyle.scss';
</style>