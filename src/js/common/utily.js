module.exports = {
    downLoad:function(){
        var userAgent = window.navigator.userAgent;
        var browser = null,platform = null,
            iosUrl = 'https://itunes.apple.com/us/app/su-dai-xiong/id1102390726?l=zh&ls=1&mt=8',
            androidUrl = 'http://dl.jiandanjiekuan.com/app/download/offical_jdjk.apk',
            androidWeChatUrl = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ufenqi.bajieloan&hmsr=%E9%80%9F%E8%B4%B7%E7%86%8A&hmpl=%E5%BA%94%E7%94%A8%E5%AE%9D%E5%BE%AE%E4%BF%A1%E4%B8%8B%E8%BD%BD&hmcu=&hmkw=&hmci=';

        if(userAgent.match(/MicroMessenger/i)=="MicroMessenger"){
            browser = 'MicroMessenger';
            /*_hmt.push(['_trackEvent', 'yingyongbao-download', 'click', 'download']);*/
            $(this).attr('disabled',"true");
            try{
                window.location.href = androidWeChatUrl;
            }catch(e){
                $(this).removeAttr("disabled");
            }
        }else{
            if(userAgent.match(/Android/i)=="Android"){
                location.href = "sudaibear://open_android_app";
                setTimeout(function(){
                    location.href = androidUrl;
                },200);
            }else if(userAgent.match(/iPhone/i)=="iPhone"){
                location.href = "sudaibear://open_ios_app";
                setTimeout(function(){
                    window.location.href= iosUrl;//iosUrl;
                },200);
               
            }
        }
    },
    reload:function(){
        var reload =
        '<div class="networkAnomaly">'+
            '<div class="networkAnomalyTitle">网络异常</div>'+
            '<img src="../../../static/img/networkAnomaly.png"/>'+
            '<button class="reload">重新加载</button>'+
        '</div>';
        $('body').append($(reload));
        $('body').on('click','.reload',function(){
            $('.networkAnomaly').remove();
            window.location.reload();
        })
    },
    regex:function(){
        return  {
                    nameRegex:new RegExp('^([\.]|[\u4E00-\u9FA5]){2,20}$'),
                    relationNameRegex:new RegExp('[\u4e00-\u9fa5a-zA-Z]{1,20}'),
                    mobileRegex:new RegExp('^(13[0-9]|14[57]|15[012356789]|17[3678]|18[0-9])[0-9]{8}$'),
                    idCardRegex:new RegExp(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/),
                    companyNameRegex:new RegExp('^[\u4e00-\u9fa5a-zA-Z() ]{2,30}$'),
                    companyAddressRegex:new RegExp('^[\u4e00-\u9fa5a-zA-Z0-9()#-]{5,30}')
                }
    }
}