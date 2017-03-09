import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import bill from './modules/bill'
import payment from './modules/payment'
import identifyMes from './modules/identify'

Vue.use(Vuex)

export default new Vuex.Store({
	actions,
	modules:{
		bill,
		payment,
		identifyMes
	}
});