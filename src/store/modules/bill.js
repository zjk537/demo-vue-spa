import * as types from '../mutation-types'

// init state
const state = {
	detail:null,// 订单详情
	preBill:null // 预付订单
}


// getters
const getters = {
	getDetail: state => {
		if(!state.detail){
			state.detail = JSON.parse(window.localStorage.getItem('store_bill_detail') || '{}');
		}
		return state.detail;
	},
	getCoupons: state => {
		if(!state.detail){
			state.detail = JSON.parse(window.localStorage.getItem('store_bill_detail') || '{}');
		}
		if(state.detail.couponDetailSortVo){
			return state.detail.couponDetailSortVo.couponDetailTradeUseVoList || [];
		} 
		return [];
	},
	getContracts: state => {
		if(!state.detail){
			state.detail = JSON.parse(window.localStorage.getItem('store_bill_detail') || '{}');
		}

		return state.detail.contractViewList || [];
	},
	getPreBill: state => state.preBill
}

// actions 
const actions = {
	saveBillDetail({commit},  billDetail ){
		commit(types.SAVE_BILL_DETAIL,billDetail);
	},
	clearBillDetail({commit}){
		commit(types.CLEAR_BILL_DETAIL);
	},
	noCoupon({commit}){
		commit(types.NO_COUPON);
	},
	selectCoupon({commit}, coupon){
		commit(types.SELECT_COUPON,coupon);
	},
	savePreBill({commit},preBill){
		commit(types.SAVE_PRE_BILL,preBill);
	},
	clearPreBill({commit}){
		commit(types.CLEAR_PRE_BILL);
	}
}

const mutations = {
	[types.SAVE_BILL_DETAIL](state, billDetail){
		state.detail = billDetail;
		if(billDetail.couponDetailSortVo){
			state.coupons = billDetail.couponDetailSortVo.couponDetailTradeUseVoList
		}
		state.contracts = billDetail.contractViewList;
		// 本地化存储
		if(window.localStorage){
		    //游览器支持localStorage
		    window.localStorage.setItem('store_bill_detail', JSON.stringify(billDetail));
		} else {
			console.log('you browser don\'t support localStorage!');
		}
	},
	[types.CLEAR_BILL_DETAIL](state){
		state.detail = null;
	},
	[types.NO_COUPON](state){
		if(state.detail.couponDetailSortVo.properCouponCode != undefined){
			state.detail.couponDetailSortVo.properCouponCode = '';
		}
	},
	[types.SELECT_COUPON](state,coupon){
		state.detail.couponDetailSortVo.properCouponCode = coupon.couponCode;
		//state.detail.couponDetailSortVo.properCouponDescribe = coupon.moneyDescribe;
		state.detail.couponDetailSortVo.properCouponMoney = coupon.money;
	},
	[types.SAVE_PRE_BILL](state,preBill){
		state.preBill = preBill;
	},
	[types.CLEAR_PRE_BILL](state){
		state.preBill = null;
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}