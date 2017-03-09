<template>
	 <ul class="bill_detail">
        <li v-for="item in details">
            <label>{{ item.itemName }}</label><span class="coin">{{ item.itemValue | toDecimal }}</span>
        </li>
    </ul>
</template>

<script>
let utility = require('static/js/utility');

export default {
    name: 'billDetail',
    props: ['details'],
    data() {
        return {
            test:''
        }
    },
    components: {
        
    },
    filters:{
        toDecimal:utility.toDecimal
    },
    mounted: function() {
    	
    },
    methods: {

    }
}
</script>

<style lang="scss">
.bill_detail{
	li{
		line-height: 1.5rem;
		padding:.2rem 0;
		width: 50%;
		label{
			display: inline-block;
			min-width: 5rem;
		}
	}
	li:nth-child(even){
		width:50%;
		float: right;
		margin-top: -1.9rem;
	}
}
</style>