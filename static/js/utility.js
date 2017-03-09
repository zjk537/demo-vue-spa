/**
 * Created by zjk on 16/2/23.
 */
module.exports = {
	isMobile(mobile){
        let mobileRegex = /^[1][3-8]\d{9}$/;
        return mobileRegex.test(mobile);
    },
    isNum(val){
        let numRegex = /[^\d]/g;
        return numRegex.test(val);
    },
    getQueryParams(name) {
        var r = new RegExp("(\\?|#|&)" + name + "=([^&#]*)(&|#|$)");
        var m = location.href.match(r);
        if(!m){
            r=new RegExp("(/)" + name + "/([^&#/]*)(/)");
            m=location.href.match(r);
        }
        return decodeURIComponent(!m ? "" : m[2]);
    },
    toDecimal(value){
        if(!value){
            return "0";
        }
        return (value / 100).toFixed(2);
    },
    toInt(value){
        if(!value){
            return "0";
        }
        return parseInt(value / 100);
    },
    getGeolocation(){
        var geolocation = {
            lon:0,
            lat:0
        };
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function (p) {
                geolocation.lat = p.coords.latitude//纬度
                geolocation.lon = p.coords.longitude;
            }, function (e) {//错误信息
                console.log(e.code + "\n" + e.message);
            });
        }
        return geolocation;
    },
}