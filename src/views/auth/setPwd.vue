<template>
	<div class="container setPwd">
		<comHeader title="设置登录密码" back="true"></comHeader>
		<div class="row">
			<input type="password" name="upwd" placeholder="密码(6~16位登录密码)">
			<em class="icon-clear"></em>
		</div>
		<div class="row">
			<input type="password" name="upwd2" placeholder="确认密码(6~16位登录密码)">
			<em class="icon-clear"></em>
		</div>
		<div class="row">
			<button>提交注册</button>
		</div>
	</div>
</template>
<script>
import comHeader from 'components/header.vue';
export default {
    name: 'setPwd',
    props: [],
    data() {
        return {
            msg:""
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
@import "./src/scss/auth/login";
.setPwd{padding-top: 5rem;}
</style>