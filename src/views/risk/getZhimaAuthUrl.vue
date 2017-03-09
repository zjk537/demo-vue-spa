<template>
	<div class="getZhimaAuthUrl" id="identifyPic" >
        <comHeader title="芝麻信用" back="true" @onBackClick="goRiskIndex"></comHeader>
        <riskStep  widthLine="50%" dotOneClass="active"  dotTwoClass="active"></riskStep>   
        <div class="zhima" style="padding-top:1rem;">
            <img src="/static/img/zhima.png"/>
        </div>
        <a id="submitMes" href="javascript:;" class="canSubmit" @click="getZhimaVertify">去芝麻信用授权</a>
        <button class="noZhimaAuth" @click="alertConfirm">没有芝麻信用？</button>

	</div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    var common = require('static/js/common');
    import { MessageBox,Indicator,Toast  } from 'mint-ui';
    export default {
        name: 'getZhimaAuthUrl',
        data () {
            return {
                
            }
        },
        computed: {},
        components: {
            riskStep,
            comHeader
        },
        mounted: function() {
            this.$nextTick(() => {
                this.getZhimaVertify();
            })
        },
        methods:{
            getZhimaVertify: function(){
                _hmt.push(['_trackEvent', 'h5_zhima_auth', 'click', '芝麻授权']);
                Indicator.open();
                this.$http.post('/apis/risk/h5/getZhimaAuthUrl').then((response) => {
                    Indicator.close();
                    if(response.status!=200){
                        Toast(response.statusText);
                        return;
                    }
                    let url = response.data.data;
                    $('#submitMes').attr('href',url);
                 

                }, (error) => {
                    Indicator.close();
                    Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                    console.log(error);
                });
            },
            goRiskIndex(){
                this.$router.replace({
                    name:'verifyItem'
                });
            },
            alertConfirm:function(){
                _hmt.push(['_trackEvent', 'h5_zhima_no', 'click', '没有芝麻信用']);
                MessageBox({
                  title: '',
                  message: 'App借钱更简单</br>没有芝麻也能借',
                  showConfirmButton: true,
                  confirmButtonText :'立即下载'
                }).then(action => {
                    _hmt.push(['_trackEvent', 'h5_zhima_download', 'click', '芝麻_立即下载']);
                  common.downLoad();
                });
            }
        }
    }
</script>

<style lang="sass">
    @import '../../scss/risk/messageStyle.scss';
    @import '../../scss/risk/identifyPic.scss';
</style>