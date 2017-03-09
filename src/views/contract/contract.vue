<template>
	<div class="contract">
		<comHeader :title="title" back="true"></comHeader>
		<div class="group">
			<ul>
				<li v-for="(item,index) in contracts">
                    <router-link :to="{name:'contractDetail',params:{cindex: index}}" >
                        {{ item.contractName }} <i class="iconfont icon-jiantou"></i>
                    </router-link>
                </li>
			</ul>
		</div>
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
import { mapGetters } from 'vuex'
export default {
    name: 'contract',
    data() {
        return {
            title:""
        }
    },
    components: {
        comHeader
    },
    computed: mapGetters({
        contracts:'getContracts'
    }),
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods: {
        initPage(){
            if(this.$route.params.ctype == "loan"){
                this.title = "借款相关合同";
            }
        }

    }
}
</script>

<style lang="scss">
@import "./src/scss/contract/style";
</style>