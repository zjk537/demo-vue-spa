<template>
	<div class="emptyContainer" style="display:none;">
		<div class="empty">
	    	<div class="notice">
	    		<img src="/static/img/ic_empty.png"><br/>
	    		{{ msg }}
	    	</div>
	    	<div class="error">
	    		<img src="/static/img/net_error.png"><br/>
	    		当前网络不可用，请检查您的网络设置<br/>
	    		<div class="btn" @click="onReload">重新加载</div>
	    	</div>
	    </div>
	</div>
</template>

<script>
export default {
    name: 'empty',
    props: ['msg','img','net-error'],
    data() {
        return {
            test:''
        }
    },
    components: {
        
    },
    mounted: function() {
    	
    },
    methods: {
    	onReload(){
    		window.location.reload();
    	}
    }
}
</script>

<style lang="scss">
@import '../scss/base.scss';
.empty{
	position:absolute;
	color:#999;
	bottom:0;
	left: 0;
	top:0;
	right: 0;
	margin-top: -5rem;
	font-size:.9rem;
	.notice,.error{
		position:absolute;
		height: 8.5rem;
		line-height: 1.5rem;
		top: 50%;
		margin-top: -3.25rem;
		width: 9rem;
		text-align:center;
		border:none;
		width: 100%;
		img{
			display: inline-block;
			width: 8rem;
			margin-bottom: .5rem;
			margin-left: 1rem;
		}
	}
	.error{
		display: none;
		.btn{
			background: transparent;
			color: $yellow;
			width: 5rem;
			margin-top: 1rem;
			display: inline-block;
		}
	}

}
.error{
	.notice{
		display: none;
	}
	.error{
		display: block;
		white-space:nowrap;
	}
}
</style>