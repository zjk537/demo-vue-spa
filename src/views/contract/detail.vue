<template>
	<div class="contract">
		<comHeader :title="contract.contractName" back="true"></comHeader>
		<div id="conSwarp" class="content">
            <iframe :src="contract.contractUrl" id="iframepage" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" @load="iFrameHeight"></iframe>
        </div>
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
import { mapGetters } from 'vuex'
export default {
    name: 'contractDetail',
    data() {
        return {
            cindex:0,
            contract:{}
        }
    },
    components: {
        comHeader
    },
    computed: mapGetters({
        contracts:'getContracts'
    }),
    mounted() {
        this.$nextTick(() => {
            this.initPage();
        });
    },
    methods: {
        initPage(){
            this.contract = this.contracts[this.$route.params.cindex];
        },
        iFrameHeight(){
            var ifm = document.getElementById("iframepage"); 
            var subWeb = ifm.contentWindow.document || ifm.contentDocument;
            if(ifm != null && subWeb != null) {
               // ifm.height = subWeb.body.scrollHeight;
               // ifm.width = subWeb.body.scrollWidth;
               $("#conSwarp").height(subWeb.body.clientHeight);
            } 
        }
    }
}
</script>

<style lang="scss">
@import "./src/scss/contract/style";
</style>