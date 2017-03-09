<template>
    <div class="verifyResult">
        <comHeader title="认证中心" back="true" @onBackClick="goHome"></comHeader>
        <hr>
        <div class="result">
            <p v-if="basicAuth.nextStep == 900" class="success">审核中</p>
            <p v-else-if="basicAuth.nextStep == 901" class="fail">认证失败</p>
            <div>
                <h4 class="verifing">
                    <img v-if="basicAuth.nextStep == 900" src="/static/img/verifyResultSuccess.png">
                    <img v-if="basicAuth.nextStep == 901" src="/static/img/verifyResultError.png">
                    <span v-if="basicAuth.nextStep == 900">您的资料正在审核中，结果将以短信形式通知您</span>
                    <strong v-if="basicAuth.nextStep == 901">很遗憾，您的资料暂不符合我们的要求。建议您过段时间再来试试！</strong>
                </h4>
            </div>
        </div>
        <div class="step">
            <img src="/static/img/verityStep.jpg">
        </div>
    </div>
</template>

<script>
import comHeader from 'components/header.vue';
import { Indicator ,Toast } from 'mint-ui';
export default {
    name: 'verifyResult',
    data () {
        return {
            basicAuth:{
                nextStep:0
            }
        }
    },
    mounted:function(){
        this.$nextTick(() => {
            this.fresh(); 
        })
    },
    components: {
        comHeader
    },
    methods:{
        fresh:function(){   
            Indicator.open();
            this.$http.post('/apis/risk/h5/index').then((response) => {
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
                this.basicAuth = resData.data.basicAuth;
                if(this.basicAuth.nextStep == 902){
                    this.$router.push({
                        name:'home'
                    });
                }
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        goHome(){
            this.$router.push({
                name:'home'
            });
        },
    }
}
</script>

<style lang="sass">
    @import '../../scss/risk/verifyResult.scss';
</style>