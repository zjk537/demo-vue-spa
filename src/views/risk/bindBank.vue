<template>
	<div class="bind_Bank">
		<comHeader title="绑定银行卡" back="true" @onBackClick="goRiskIndex" ></comHeader>
        <riskStep  widthLine="98%" dotOneClass="active" dotTwoClass="active" dotThreeClass="active" dotFourClass="active"></riskStep>    
        <bindBank nextlink="verifyResult" needGPS="true"></bindBank>
	</div>
</template>

<script>
import comHeader from 'components/header.vue';
import riskStep from 'components/riskStep.vue';
import bindBank from '../auth/bindBank.vue';
import { Indicator,Toast,Picker,Popup,MessageBox } from 'mint-ui';
export default {
    name: 'riskBindBank',
    data() {
        return {
        }
    },
    components: {
        comHeader,riskStep,bindBank
    },
    methods:{
        goRiskIndex(){
            this.$router.replace({
                name:'verifyItem'
            });
        },
    }
}
</script>

<style lang="scss">
.bind_bank{padding-top:0 !important;}
.bind_bank .header{display:none;}
.info .notice{top:35% !important;}
// .bind_bank .split{padding-top:0.6rem !important;}
.bind_bank .group li span{text-align:center !important;}
#btnSelBank{position:absolute !important;right:0;}
.code{position:absolute !important;right:0;}
.bind_bank .group li span.code:before { left: -.8rem !important; }
#btnSelBank .icon-jiantou{position:absolute;right:0 !important;}
</style>