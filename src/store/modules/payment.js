import * as types from '../mutation-types'

// init state
const state = {
	confirmBill:null
	// {
	// 	// billId:1
	// 	// billDetails:[]
	// 	//bindcardId: 1
	// 	//mobile:1111
	// 	//amount:111
	// }
}


// getters
const getters = {
	getConfirmBill: state => {
		if(!state.confirmBill){
			state.confirmBill = JSON.parse(window.localStorage.getItem('store_confirm_bill') || '{}');
		}
		return state.confirmBill;
	},
}

// actions 
const actions = {
	saveConfirmBill({commit},  bill ){
		commit(types.SAVE_CONFIRM_BILL,bill);
	}
}

const mutations = {
	[types.SAVE_CONFIRM_BILL](state, bill){
		state.confirmBill = bill
		// 本地化存储
		if(window.localStorage){
		    //游览器支持localStorage
		    window.localStorage.setItem('store_confirm_bill', JSON.stringify(bill));
		} else {
			console.log('you browser don\'t support localStorage!');
		}
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}