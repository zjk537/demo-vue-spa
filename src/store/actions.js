import * as types from './mutation-types'

// actions 
export const clearAllCache = ({ commit }) => {
	commit(types.CLEAR_PRE_BILL);
	commit(types.CLEAR_BILL_DETAIL);
	commit(types.CLEAR_IDENTIFY_MES);
}