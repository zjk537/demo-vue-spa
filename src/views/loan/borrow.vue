<template>
    <div class="borrow">
        <comHeader title="借款" back="true" @onBackClick="clearCache"></comHeader>
        <div class="content">
            <div class="amount">
                <label>借款金额 (元)</label>
                <h3 class="coin">
                    <input id="txtAmount" type="tel" v-model="bill.amount" name="" value="" placeholder="0" @keyup="onAmountChange" @blur="saveCache">
                </h3>
            </div>
            <div class="perid">
                <label>借款周期</label>
                <ul class="flexbox">
                    <li v-for="(item,index) in perids" :class="item == bill.perid ? 'enabled' : ''" :data-value="item" @click="onPeridClick($event)">
                        {{ item }}天
                    </li>
                </ul>
            </div>
            
            <div class="bank bankContainer" style="display:none">
                <div class="serivce">
                    <div class="row">
                        <label>还款金额</label><span class="coin">{{ totalPay }}</span>
                    </div>
                    <div class="row">
                        <label>服务费</label><span class="coin">{{ servicePay }}</span>
                    </div>
                </div>
                <label v-if="bindBanks.length > 0">收款银行卡</label>
                <div v-if="curBank.status == 1" class="item" @click="popupBank = true">
                    <img :src="curBank.bankPic">
                    {{ curBank.cardName }}（尾号{{ curBank.cardLast }}）<i class="iconfont icon-jiantou">
                </div>
                <div v-else-if="bindBanks.length == 0" class="item add" @click="onAddNewCard">
                    添加银行卡 <i class="iconfont icon-jiantou">
                </div>
            </div>
        </div>
        <div id="btnNext" class="btn disabled" @click="createPreBill">下一步</div>
        <mt-popup 
            v-model="popupBank"
            popup-transition="popup-fade">
            <div class="popup_bank">
                <div class="title">
                    更换银行卡<span @click="popupBank = false"></span>
                </div>
                <ul>
                    <li :class="item | filterClass(index)" v-for="(item,index) in bindBanks" @click="onChangeBank(item)">
                        <img :src="item.bankPic">
                        <label>{{ item.cardName }}（尾号{{ item.cardLast }}）</label>
                        <span>{{ item.bankNote }}</span>
                        <i class="iconfont icon-jiantou">
                    </li>
                    <li v-if="bindBanks.length < 3" class="add" @click="onAddNewCard">
                        <label>添加新卡</label>
                        <i class="iconfont icon-jiantou">
                    </li>
                </ul>
            </div>
        </mt-popup>
    </div>
</template>
<script>
import comHeader from 'components/header.vue';
import { Indicator,Toast,Popup,MessageBox } from 'mint-ui';
import { mapGetters } from 'vuex';
export default {
    name: 'borrow',
    data() {
        return {
            info:{
                pId:0,
                rate:1,//利率
                interestRate:1,//服务费费率
                maxMoney:500000,
                minMoney:10000,
            },
            bill:{
                pId:0,
                amount:null,
                perid:28,
                cardId:1
            },
            perids:[],
            totalPay:0,
            servicePay:0,
            popupBank:false,
            bindBanks:[],
            curBank:{}
        }
    },
    components: {
        comHeader,Indicator,Toast,Popup,MessageBox
        
    },
    computed: mapGetters({
        preBill:'getPreBill'
    }),
    mounted: function() {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    filters:{
        filterClass(value,index){
            if(0 === value.status){
                return "disabled";
            }
        }
    },
    methods: {
        initPage(){
            // 获取已绑定的银行卡列表
            this.getInfoData();
            this.getBindBanks();
        },
        getBindBanks(){
            let apiUrl = '/apis/account/bankCards';
            let params = {};
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                if(response.status != 200){
                    console.log(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code != 200){
                    console.log(resData.message);
                    return;
                }
                if(!resData.data){
                    console.log('response data is empty');
                    return;
                }

                if(!resData.data.bindBanks){
                    return;
                }
                this.bindBanks = resData.data.bindBanks;
                this.curBank = this.bindBanks[0];
                this.bill.cardId = this.curBank.id;
                if(this.preBill){
                    $("#btnNext").removeClass('disabled');
                }
            }, (error) => {
                console.log(error);
            });
        },
        
        onChangeBank(bank){
            this.curBank = bank;
            this.bill.cardId = bank.id;
            this.popupBank = false;
        },
        onAddNewCard(){
            _hmt.push(['_trackEvent', 'h5_loan_addBankCard', 'click', '借款_添加新的储蓄卡']);
            this.saveCache();
            this.$router.push({
                name:'bindBank'
            });
        },
        clearCache(){
            this.$store.dispatch('clearPreBill');
            this.$router.go(-1);
        },
        saveCache(){
            this.$store.dispatch('savePreBill',this.bill);
        },
        getInfoData(){
            let apiUrl = '/apis/trade/getData';
            let params = {};
            Indicator.open();
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code == 6207){ // 债券切换，需刷新页面
                    MessageBox.alert('操作成功').then(action => {
                      window.location.reload();
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(resData.message);
                    return;
                }

                this.info.pId = resData.data.pid;
                this.info.maxMoney = resData.data.maxMoney;
                this.info.minMoney = resData.data.minMoney;
                this.info.rate = resData.data.rate;
                this.info.interestRate = resData.data.interestRate;
                this.perids = resData.data.productDays;
                this.bill.pId = resData.data.pid;

                let pl = this.perids.length;
                setTimeout(function(){
                    // flex 在ios 7|8 上不兼容，需要js 处理
                    let $perid = $('.perid');
                    let pw = $perid.width();
                    let lw = pw * (1 - (pl-1) * 0.05) / pl;
                    $perid.find('li').width(lw);
                },10);
                
                
                // bind cache data
                if(this.preBill){
                    this.bill.amount = this.preBill.amount;
                    this.bill.perid = this.preBill.perid;
                    $('.perid').find('li[data-value='+this.preBill.perid + ']').addClass('enabled');
                    $('.bankContainer').show();
                    this.computePay();
                    if(this.curBank.id){
                        $("#btnNext").removeClass('disabled');
                    }
                }

            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        },
        onAmountChange(){
            let $txtAmount = $('#txtAmount'),
                $btnNext = $("#btnNext"),
                $bankContainer = $('.bankContainer');
            if(!this.bill.amount){
                $btnNext.addClass('disabled');
                return;
            }
            if(!/^[1-9][0-9]*$/.test(this.bill.amount)){
                Toast('请输入数字金额');
                let tmpAmount = this.bill.amount.replace(/[^\d]/g,'');

                this.bill.amount = tmpAmount.replace(/\b(0+)/gi,"");
                return;
            }  

            $btnNext.removeClass('disabled');
            if(this.bill.amount * 100 >= this.info.minMoney){
                // if(this.bindBanks.length > 0){
                //     $btnNext.removeClass('disabled');
                // }
                $bankContainer.show();
            } else {
                //$btnNext.addClass('disabled');
                $bankContainer.hide();
            }
            let $perid = $('.perid');
            this.bill.perid = parseInt($perid.find('li.enabled').attr('data-value'));
            this.computePay();
        },
        onPeridClick(event){
            let $sender = $(event.currentTarget || event.target),
                $perids = $sender.siblings();
            if($sender.hasClass('enabled')){
                return;
            }
            $perids.removeClass('enabled');
            $sender.addClass('enabled');
            this.bill.perid = $sender.attr('data-value');
            this.saveCache();
            this.computePay();
        },
        computePay(){
            if(!this.bill.amount){
                return;
            }
            let amount = parseInt(this.bill.amount);
            let serPay = amount * (this.info.rate * this.bill.perid + this.info.interestRate);
            this.servicePay = Math.round(serPay * 100)/100;
            this.totalPay = amount + this.servicePay;
        },
        createPreBill(event){
            let $sender = $(event.currentTarget || event.target);
            if(this.bill.amount * 100 < this.info.minMoney){
                Toast('单笔借款金额最低'+ parseInt(this.info.minMoney / 100) + '元');
                return;
            }

            if(this.bill.amount % 100 != 0){
                Toast('借款金额需为100的整数');
                return;
            }

            if(this.bill.amount * 100 > this.info.maxMoney){
                Toast('您的可借额度为'+ parseInt(this.info.maxMoney / 100) + '元，请重新输入借款金额');
                return;
            }

            if(!this.bindBanks || this.bindBanks.length == 0){
                Toast('请绑定收款银行卡');
                return;
            }
            if($sender.hasClass('disabled')){
                return;
            }
            Indicator.open();
            let apiUrl = '/apis/trade/createPreTrade';
            let params = {
                productId: this.info.pId,
                amount:this.bill.amount * 100,
                instalment:this.bill.perid,
                buyerBindCardId: this.curBank.id
            }
            this.$http.post(apiUrl,params,{credentials: true})
            .then((response) => {
                Indicator.close();
                if(response.status != 200){
                    Toast(response.statusText);
                    return;
                }
                var resData = response.data;
                if(resData.code == 887){ //交易出错
                    MessageBox({
                        title: '',
                        message: resData.message
                    }).then(action => {
                        this.$router.push({
                            name:'home'
                        });
                    });
                    return;
                }
                if(resData.code != 200){
                    Toast(response.data.message);
                    return;
                }

                // todo 创建订单成功，跳转，并用vuex 保存状态
                this.$store.dispatch("saveBillDetail",resData.data);
                this.saveCache();
                this.$router.push({
                    name:'loanConfirm'
                });
            }, (error) => {
                Indicator.close();
                Toast({message:'数据请求失败，请稍后重试',position:'bottom' });
                console.log(error);
            });
        }

    }
}
</script>

<style lang="scss">
@import './src/scss/loan/borrow';
.mint-popup{
    width:80%;
    border-radius:.5rem;
}
</style>