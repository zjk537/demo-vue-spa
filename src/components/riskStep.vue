<template>
<div class="riskStep">
    <div class="head">
        <div class="step">
            <div class="lineBox">
                <p class="line" :style="{width:widthLine}"></p>
                <p class="lineBg"></p>
            </div>
            <div class="stepDot">
                <i :class="dotOneClass">1</i>
                <i :class="dotTwoClass">2</i>
                <i :class="dotThreeClass">3</i>
                <i :class="dotFourClass">4</i>
            </div>
        </div>
        <p class="stepSummary">
            <span>身份信息</span>
            <span>芝麻信用</span>
            <span>手机信息</span>
            <span>银行卡信息</span>
        </p>
    </div>
</div>
</template>
<script>
export default {
    name: 'riskStep',
    data () {
        return {
            msg:'for demo'
        }
    },
    props: ['widthLine','dotOneClass','dotTwoClass','dotThreeClass','dotFourClass'],
    components: {
        
    },
}
</script>
<style lang="sass">
    @import '../scss/components/riskStep.scss';
</style>