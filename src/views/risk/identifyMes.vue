<template>
    <div class="identifyMes">
        <comHeader title="身份信息" back="true" @onBackClick="goRiskIndex"></comHeader>
        <riskStep  widthLine="20%" dotOneClass="active"></riskStep>
        <section class="message">
            <p name="name">
                <span>姓名</span>
                <input type="text" placeholder="请输入姓名" v-model="submitMes.name" @keyup="onTxtChange()" @input="onTxtChange()"/>
            </p>
            <p name="idcard">
                <span>身份证号</span>
                <input type="text" placeholder="请输入身份证号" v-model="submitMes.idcard" @keyup="onTxtChange()" @input="onTxtChange()"/>
            </p>
            <div @click="stashIdentifyMes">
                <router-link tag="p" :to="{name:'identifyPic'}">
                    <span class="photo">身份证照片</span>
                    <img v-if="identifyPic.frontIdcardFile" :src="identifyPic.frontIdcardFile ? 'data:image/png;base64,'+identifyPic.frontIdcardFile : '' ">
                    <img v-if="identifyPic.reverseIdcardFile" :src="identifyPic.reverseIdcardFile ? 'data:image/png;base64,'+identifyPic.reverseIdcardFile : ''">
                    <img v-if="identifyPic.handIdcardFile" :src="identifyPic.handIdcardFile ? 'data:image/png;base64,'+identifyPic.handIdcardFile : ''">
                    <strong> {{ identifyPic.handIdcardFile ? '修改' :'去拍照' }}  </strong>
                </router-link>
            </div>
        </section>

        <section class="message">
            <p @click="pickerMaritalShow" class="marrage">
                <span>婚姻状况</span>
                <label>{{ submitMes.marital }}</label>
                <strong>{{ submitMes.marital ? '' : '请选择' }} </strong>
            </p>
            <p name="companyName">
                <span>公司名称</span>
                <input type="text" placeholder="请输入公司详细名称" v-model="submitMes.companyName" @keyup="onTxtChange()"   @input="onTxtChange()"/>
            </p>
            <p @click="pickerIncomeShow" class="money">
                <span>月收入</span>
                <label>{{ submitMes.income.value }}</label>
                <strong>{{ submitMes.income.value ? '' : '请选择' }}</strong>
            </p>
            <!-- <p @click="onLocationClick" class="area"> -->
            <p @click="onLocationClick" class="area">
                <span>公司地址</span>
                <label>{{ submitMes.area }}</label>
                <strong>{{ submitMes.area ? '修改' : '请选择' }} </strong>
            </p>
            <p  name="companyAddress">
                <span></span>
                <input type="text" id="txtAddress" placeholder="请输入详细街道门牌号" v-model="submitMes.companyAddress" @keyup="onTxtChange()" @input="onTxtChange()"/>
            </p>
        </section>
        <button id="submitMes" @click="saveMessage">下一步</button>

        <mt-popup
          v-model="popPicker.maritalShow"
          position="bottom">
            <div class="pick_bar">
                <span class="canel" @click="popPicker.maritalShow = false">取消</span>
                <span class="confirm" @click="pickerMaritalConfirm">确定</span>
            </div>
            <mt-picker :slots="pickerSlots.marital" @change="onMaritalChange"></mt-picker>
        </mt-popup>

        <mt-popup
          v-model="popPicker.incomeShow"
          position="bottom">
            <div class="pick_bar">
                <span class="canel" @click="popPicker.incomeShow = false">取消</span>
                <span class="confirm" @click="pickerIncomeConfirm">确定</span>
            </div>
            <mt-picker :slots="pickerSlots.income" @change="onIncomeChange"></mt-picker>
        </mt-popup>

        <mt-popup
          v-model="popPicker.areaShow"
          position="bottom">
            <div class="pick_bar">
                <span class="canel" @click="popPicker.areaShow = false">取消</span>
                <span class="confirm" @click="pickerAreaConfirm">确定</span>
            </div>
            <mt-picker :slots="pickerSlots.area" @change="onAreaChange"></mt-picker>
        </mt-popup>
    </div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    import utily from '../../js/common/utily.js';
    import { Indicator,Toast,Picker,Popup,MessageBox } from 'mint-ui';
    import { mapGetters } from 'vuex';
    export default {
        name: 'identifyMes',
        data () {
            return {
                popPicker:{
                    maritalShow: false,
                    maritalValue:null,
                    incomeShow: false,
                    incomeValue:null,
                    areaShow: false,
                    areaValue:null
                },
                pickerSlots:{
                    marital:[{flex: 1,values: [],className: 'slot1',textAlign: 'center'}],
                    income:[{flex: 1,values: [],className: 'slot1',textAlign: 'center'}],
                    area:[{flex: 1,values: [],className: 'area1',textAlign: 'center'},
                          {flex: 1,values: [],className: 'area2',textAlign: 'center'},
                          {flex: 1,values: [],className: 'area3',textAlign: 'center'},],
                },
                submitMes:{
                    name:'',
                    idcard:'',
                    companyName:'',
                    companyAddress:'',
                    marital:'',
                    income:{},
                    area:'',
                    longitude:null,
                    latitude:null
                },
                flag:{
                    submitFlag:false
                },
                provincial:[], // 所有省
                urban:[], // 所有市
                township:[], // 所有县
                moneyIncome:[],
                identifyPic:''
            } 
        },
        components: {
            riskStep,
            comHeader
        },
        computed: mapGetters({
           getIdentifyMes :'getIdentifyMes'
        }),
        mounted: function() {
            this.$nextTick(() => {
                $('input').focus(function(){
                    $('.header').css('position','relative');
                    $('.head').css('padding-top','0');
                })
                $('input').blur(function(){
                    $('.header').css('position','fixed');
                    $('.head').css('padding-top','2.5rem');
                })
                this.submitMes = this.getIdentifyMes;
                this.getIdentifyPic();
                this.saveTongdonData();
                this.onTxtChange();
            });
        },
        methods:{
            stashIdentifyMes:function(){
                this.$store.dispatch('saveIdentifyMes',this.submitMes);
            },
            onTxtChange(){
                if(  this.empty() ){
                    $('#submitMes').removeClass('canSubmit');
                }else{
                    $('#submitMes').addClass('canSubmit');
                }
            },
            goRiskIndex(){
                this.$router.replace({
                    name:'verifyItem'
                });
            },
            saveTongdonData(){
                var jdjk_td_token = $('sdx_auth_h5_token');// auth token 作Key 防止用户重复
                if($.cookie(jdjk_td_token)){ // 
                    return;
                }
                let apiUrl = '/apis/risk/h5/tongdun/loan';
                let params = {
                    token: window.tokenId,
                    eventId: 'loan_professional_web'
                };
                this.$http.post(apiUrl,params,{credentials: true})
                .then((response) => {
                    if(response.status != 200){
                        console.log('tongdun' + response.statusText);
                        return;
                    }
                    var resData = response.data;
                    if(resData.code != 200){
                        console.log('tongdun:' + resData.message);
                        return;
                    }
                    $.cookie(jdjk_td_token,resData.data,{
                        expires:1,
                        path:'/',
                        domain:'.jiandanjiekuan.com',
                        secure: false
                    });
                }, (error) => {
                    console.log('tongdun:' + error);
                });

            },
            bindMaritalPicker(){
                
                let $marrage = $('.marrage');
                if($marrage.hasClass("disabled")){
                    return;
                }
                $marrage.addClass("disabled");
                let url = '/apis/risk/h5/getMaritals';
                this.$http.post(url).then((response) => {
                    $marrage.removeClass('disabled');
                    if(response.status != 200){
                        console.log(response.statusText);
                        return;
                    }

                    var resData = response.data;
                    if(resData.code != 200){
                        console.log(resData.message);
                        return;
                    }
                    if(!resData.data || resData.data.length == 0){
                        console.log('marital is empty');
                        return;
                    }
                    this.pickerSlots.marital[0].values = [];
                    resData.data.forEach(item => {
                        this.pickerSlots.marital[0].values.push(item.value);
                    });
                    this.popPicker.maritalShow = true;
                }, (error) => {
                    $marrage.removeClass('disabled');
                    Indicator.close();
                    console.log(error);
                });
            },
            bindIncomePicker(){
                let $income = $('.money');
                if($income.hasClass("disabled")){
                    return;
                }
                $income.addClass('disabled');
                let url = '/apis/risk/h5/getMonthlyIncomes';
                this.$http.post(url).then((response) => {
                    $income.removeClass('disabled');
                    if(response.status != 200){
                        console.log(response.statusText);
                        return;
                    }

                    var resData = response.data;
                    if(resData.code != 200){
                        console.log(resData.message);
                        return;
                    }
                    if(!resData.data || resData.data.length == 0){
                        console.log('income is empty');
                        return;
                    }
                    this.moneyIncome = resData.data;
                    this.pickerSlots.income[0].values = [];
                    resData.data.forEach(item => {
                        this.pickerSlots.income[0].values.push(item.value);
                    });
                    this.popPicker.incomeShow = true;
                }, (error) => {
                    $income.removeClass('disabled');
                    console.log(error);
                });
            },
            bindAreaPicker(){
                let $area = $('.area');
                if($area.hasClass("disabled")){
                    return;
                }
                $area.addClass('disabled');
                let url = '/apis/risk/h5/getAreas';
                this.$http.post(url).then((response) => {
                    $area.removeClass('disabled');
                    if(response.status != 200){
                        console.log(response.statusText);
                        return;
                    }
                    var resData = response.data;
                    if(resData.code != 200){
                        console.log(resData.message);
                        return;
                    }
                    if(!resData.data || resData.data.length == 0){
                        console.log('area is empty');
                        return;
                    }
                    this.provincial = [];
                    this.urban = [];
                    this.township = [];
                    resData.data.forEach(item => {
                        switch(item.levels){
                            case 1:
                                this.provincial.push(item);
                                break;
                            case 2:
                                this.urban.push(item);
                                break;
                            case 3:
                                this.township.push(item);
                                break;
                        }
                    });
                    this.pickerSlots.area[0].values = this.provincial;
                    this.popPicker.areaShow = true;
                }, (error) => {
                    $area.removeClass('disabled');
                    console.log(error);
                });
            },
            errorTipShow(validateResult){
                $(".errorTip").remove();
                if(!validateResult)return;
                for (let item of validateResult) {
                    if( !item.flag ){
                        let errorMessage = item.message;
                        let errorTipDiv = 
                        '<div class="errorTip">'+
                            '<b><i class="errorIcon"></i>'+errorMessage+'</b>'+
                        '</div>';
                        $('p[name="'+item.name+'"]').after(errorTipDiv);
                    }
                }
            },
            regex(){  
                let nameRegex = utily.regex().nameRegex.test( this.submitMes.name);
                let companyNameRegex = utily.regex().companyNameRegex.test( this.submitMes.companyName);
                let companyAddressRegex = utily.regex().companyAddressRegex.test( this.submitMes.companyAddress);
                let idCardRegex = utily.regex().idCardRegex.test( this.submitMes.idcard);
                this.flag.submitFlag = nameRegex && idCardRegex && companyNameRegex && companyAddressRegex;
               
                let validateResult =
                [
                    {
                        "message":"请输入正确的姓名",
                        "name":"name",
                        'flag': nameRegex
                    },
                    {
                        "message":"请输入正确的身份证号",
                        "name":"idcard",
                        'flag': idCardRegex
                    },
                    {
                        "message":"公司名称需在2～30个字内",
                        "name":"companyName",
                        "flag":companyNameRegex
                    },
                    {
                        "message":"公司详细地址需在5～30个字内",
                        "name":"companyAddress",
                        "flag":companyAddressRegex
                    },
                ]  
                this.errorTipShow(validateResult);
            },
            empty(){
                let empty;
                return empty = 
                    !this.submitMes.name ||
                    !this.submitMes.idcard ||
                    !this.submitMes.companyName ||
                    !this.submitMes.area  ||
                    !this.submitMes.income.id ||
                    !this.submitMes.marital||
                    !this.submitMes.companyAddress
            },
            getIdentifyPic:function(){
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
                    this.identifyPic = resData.data || {};
                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },
            saveMessage:function(){ 
                _hmt.push(['_trackEvent', 'h5_identify_next', 'click', '身份_下一步']);
                if( this.empty() ){ 
                    Toast('请将信息填写完整后提交');
                    return;
                }

                this.regex();
                if(!this.flag.submitFlag)
                return;
                
                // if(!this.submitMes.longitude || !this.submitMes.latitude){
                //     console.log('location lat or lon is empyt!');
                //     return;
                // }
                let params = {
                    name : this.submitMes.name,
                    idcard :this.submitMes.idcard,
                    maritalStatus : this.submitMes.marital,
                    companyName : this.submitMes.companyName,
                    monthlyIncomeId : this.submitMes.income.id,
                    monthlyIncome : this.submitMes.income.value,
                    province : this.submitMes.province,
                    city : this.submitMes.city,    
                    county : this.submitMes.county,
                    companyAddress : this.submitMes.companyAddress,
                    longitude : this.submitMes.longitude,
                    latitude : this.submitMes.latitude
                };
                
                Indicator.open();
                this.$http.post('/apis/risk/h5/saveIdcardInfo',params).then((response) => {
                    Indicator.close();

                    if(response.status != 200){
                        Toast(response.statusText);
                        return;
                    }
                    var resData = response.data;
                    this.$store.dispatch('saveIdentifyMes',this.submitMes);
                    if(resData.code==200){
                        _hmt.push(['_trackEvent', 'h5_identify_next', 'click', '身份_下一步(跳转成功)']);
                        this.$router.push({
                            name:'getZhimaAuthUrl'
                        });
                        return;
                    }
                    if(resData.code==599999){
                        let validateResult = resData.data.validateResult;
                        this.errorTipShow(validateResult);
                    }else{
                        Toast(resData.message);
                    }

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },
            pickerMaritalShow(){
                if(this.pickerSlots.marital[0].values.length > 0){
                    this.popPicker.maritalShow = true;
                    return;
                }
                this.bindMaritalPicker();
            },
            onMaritalChange(picker,values){
                this.popPicker.maritalValue = values[0];
            },
            pickerMaritalConfirm(){
                this.submitMes.marital = this.popPicker.maritalValue;
                this.popPicker.maritalShow = false;
                this.onTxtChange();
            },
            pickerIncomeShow(){
                if(this.pickerSlots.income[0].values.length > 0){
                    this.popPicker.incomeShow = true;
                    return;
                }
                this.bindIncomePicker();
            },
            onIncomeChange(picker,values){
                this.popPicker.incomeValue = values[0];
            },
            pickerIncomeConfirm(){
                this.submitMes.income = this.moneyIncome.filter(item => {
                   return item.value == this.popPicker.incomeValue
                })[0];
                this.popPicker.incomeShow = false;
                this.onTxtChange();
            },
            pickerAreaShow(){
                if(this.pickerSlots.area[0].values.length > 0){
                    this.popPicker.areaShow = true;
                    return;
                }
                this.bindAreaPicker();
            },
            onAreaChange(picker,values){
                this.onTxtChange();
                let provincialId=values[0].id;
                let urbanName=values[1];
                let urbanId ='';
                let urbanAryName = [];
                let townshipAry = [];
                let provincialDiv=$('.area1 .picker-item'); // 省dom
                let urbanDiv=$('.area2 .picker-item'); // 市dom
                for(var i=0;i<this.urban.length;i++){
                    if(this.urban[i].parentId==provincialId){
                        urbanAryName.push(this.urban[i].name);
                    }
                    if(this.urban[i].name == urbanName){
                        urbanId = this.urban[i].id;
                    }
                    picker.setSlotValues(1, urbanAryName)
                }
                for(var i=0;i<this.township.length;i++){
                    if(this.township[i].parentId==urbanId){
                        townshipAry.push(this.township[i].name)
                    }

                    picker.setSlotValues(2, townshipAry)
                }
                townshipAry ? townshipAry : [];

                for(var k=0;k<this.provincial.length;k++){
                    $(provincialDiv).eq(k).html(this.provincial[k].name)
                }
                this.popPicker.areaValue = values[0].name + ' ' + values[1] + ' ' + values[2];
            },
            pickerAreaConfirm(){
                this.submitMes.area = this.popPicker.areaValue;
                // vue 在this 对象变化后会影响 数据双向绑定
                $('.area label').text(this.submitMes.area);
                let areas = this.submitMes.area.split(' ');
                this.submitMes.province = areas[0]; 
                this.submitMes.city = areas[1];
                this.submitMes.county = areas[2];
                this.popPicker.areaShow = false;
                this.onTxtChange();
            },
            bindLocation(lat,lng){
                let url = '/apis/risk/h5/getLocation';
                let params = {
                    lat:lat,
                    lng:lng
                };
                Indicator.open();
                this.$http.post(url,params).then((response) => {
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
                    this.submitMes.area = resData.data.province + " " + resData.data.city + " " + resData.data.district;
                    this.submitMes.province = resData.data.province;
                    this.submitMes.city = resData.data.city;
                    this.submitMes.county = resData.data.district;
                    // vue 在this 对象变化后会影响 数据双向绑定
                    $('.area label').text(this.submitMes.area);
                    $('.area strong').text('修改');
                    this.onTxtChange();
                    
                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },  
            onLocationClick(){
                var lbsObj = {
                    lat: '',
                    lon: ''
                };
                if($.cookie('sdx_h5_lbs')){
                    lbsObj = JSON.parse($.cookie('sdx_h5_lbs'));
                }
                var location = $('.area label').text().trim();
                if(!lbsObj.lon || location != ''){
                    this.pickerAreaShow();
                    return;
                }
                this.submitMes.latitude = lbsObj.lat;
                this.submitMes.longitude = lbsObj.lon;
                this.bindLocation(this.submitMes.latitude,this.submitMes.longitude);

                // if(!navigator.geolocation){
                //     Toast("您的浏览器不支持地理位置");
                //     return;
                // }
                // Indicator.open();
                // var options = {
                //     // 指示浏览器获取高精度的位置，默认为false
                //    enableHighAccuracy:true, 
                //    // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                //     timeout: 1000*5,
                //    // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                //    maximumAge:1000
                // };
                // var _vue = this;
                // Indicator.open();
                // navigator.geolocation.getCurrentPosition(function(pos){
                //     Indicator.close();
                //     _vue.submitMes.latitude = pos.coords.latitude;
                //     _vue.submitMes.longitude = pos.coords.longitude;
                //     _vue.bindLocation(_vue.submitMes.latitude,_vue.submitMes.longitude);
                // },function(e) {
                //     Indicator.close(); 
                //      MessageBox({
                //         title: '定位服务不可用',
                //         message: '<div class="left"> 方法1：请打开App的定位服务<br/>方法2：请点击返回，重新进入此页面</div>',
                //         showCancelButton: true,
                //         cancelButtonText:'关闭',
                //         confirmButtonText:'确定'
                //     });
                // },options);
            }
        }
    }
</script>
<style lang="scss">
    @import './src/scss/risk/messageStyle.scss';
    .identifyMes{
        .mint-popup{
            width: 100%;
        }
        .pick_bar{
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

        .picker-slot.area1,.picker-slot.area2,.picker-slot.area3{
            max-width: 33.33333%;
        }
    }
    
</style>