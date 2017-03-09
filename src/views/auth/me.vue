<template>
    <div class="me">
        <comHeader title="我的" back="true" ></comHeader>
        <div class="group">
            <ul>
                <li>
                    <router-link :to="{name:'loanList'}" onclick="_hmt.push(['_trackEvent', 'h5_meBorrow', 'click', '我的借款']);">
                    我的借款<i class="iconfont icon-jiantou"></i>
                    </router-link>
                <li>
                    <router-link :to="{name:'paymentPaying'}" onclick="_hmt.push(['_trackEvent', 'h5_mePayment', 'click', '我要还款']);">
                    我要还款<i class="iconfont icon-jiantou"></i>
                    </router-link>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
export default {
    name: 'me',
    props: ['msg'],
    data() {
        return {
            title:""
        }
    },
    components: {
        comHeader
        
    },
    mounted: function() {
        
    },
    methods: {
        
    }
}
</script>

<style lang="scss">
@import './src/scss/auth/me'
</style>