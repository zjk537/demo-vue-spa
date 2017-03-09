<template>
	<div class="getZhimaAuthUrl">
        <comHeader title="芝麻信用" back="true" @onBackClick="goRiskIndex"></comHeader>
        <riskStep  widthLine="50%" dotOneClass="active"  dotTwoClass="active"></riskStep>   
        <div class="zhimaFailed">
            <img src="/static/img/zhimaVerifyFailed.png"/>
        </div>
        <a id="zhimaReverify" href="javascript:;" class="canSubmit" @click="getZhimaVertify">重新认证</a>

	</div>
</template>

<script>
    import comHeader from 'components/header.vue';
    import riskStep from 'components/riskStep.vue';
    import upload from '../../js/common/upload.js';
    import utily from '../../js/common/utily.js';
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
                Indicator.open();
                this.$http.post('/apis/risk/h5/getZhimaAuthUrl').then((response) => {
                    Indicator.close();
                    if(response.status!=200){
                        Toast(response.statusText);
                        return;
                    }
                    let url = response.data.data;
                    $('#zhimaReverify').attr('href',url);

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
            }
        }
    }
</script>

<style lang="scss">
    @import '../../scss/risk/messageStyle.scss';
    .getZhimaAuthUrl{
      text-align:center;
    }
    #zhimaReverify{
      display: inline-block;
      padding: 0 1rem;
      height: 2.8rem;
      line-height: 2.8rem;
      margin: 0 auto;
      margin-top: 1.4rem;
      background: #ccc;
      font-size: 1.1rem;
      color: #fff;
    }
</style>