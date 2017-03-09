import * as types from '../mutation-types'

// init state
const state = {
	identifyMes:{
		income:{}
	}// 身份信息
}


// getters
const getters = {
	getIdentifyMes: state => state.identifyMes
}

// actions 
const actions = {
	saveIdentifyMes({commit},  identifyMes ){
		commit(types.SAVE_IDENTIFY_MES,identifyMes);
	}
}

const mutations = {
	[types.SAVE_IDENTIFY_MES](state, identifyMes){
		state.identifyMes = identifyMes;
	},
	[types.CLEAR_IDENTIFY_MES](state){
		state.identifyMes = {
			income:{}
		};
	},
}

export default {
	state,
	getters,
	actions,
	mutations
}