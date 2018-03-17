var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var request = require('request');
var sha1=require('sha1');
var wx_accessData = '';
var wx_jsapi_ticket = '';
var wx_appId = '你的微信appid';
var wx_secret = 'd4624c36b6795d1d99dcf0547af5443d';
var token = "weixin"; //此处需要你自己修改！
router.get('/home', function(req, res, next) {
	res.sendfile("./views/index.html");
});
router.get('/MP_verify_Nky1lU7kUVQ9l2FQ.txt', function(req, res, next) {
    res.sendfile("./views/MP_verify_Nky1lU7kUVQ9l2FQ.txt");
});

/* GET home page. */
router.get('/', function(req, res, next) {
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
  
    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(token,timestamp,nonce);
    array.sort();
    var str = array.toString().replace(/,/g,"");
  
    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(str,'utf-8').digest("hex");
  
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(code===signature){
        res.send(echostr)
    }else{
        res.send("error");
    }
});
//获取用户信息接口
router.get('/get_userinfo', function(req, res, next) {
    var options = {
       url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
       qs: {
        appid: wx_appId,
        secret: wx_secret,
        code: req.query.code,
        grant_type: 'authorization_code'
       },
        method: 'GET',
        json: true,
    }   
    request(options, function (error, response, body) {
        res.send(body);
    })
});
//中控服务器定时获取token
getAccessToken();
function getAccessToken(){
    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        method: 'GET',
        json: true,
        qs: {
          grant_type: 'client_credential',
          appid: wx_appId,
          secret: wx_secret
        }
    };
    request(options, function (error, response, body) {
        wx_accessData = body.access_token;
        getJsapiTicket();
        setTimeout(function(){
            getAccessToken();
        },(body.expires_in-60)*1000)
    })
}
function getJsapiTicket(){
    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
        method: 'GET',
        json: true,
        qs: {
            access_token: wx_accessData,
            type: 'jsapi'
        }
    };
    request(options, function (error, response, body) {
        wx_jsapi_ticket = body.ticket;
    })
}

router.get('/wx_config', function(req, res, next) {
     // noncestr
    var createNonceStr = function() {
      return Math.random().toString(36).substr(2, 15);
    };
    // timestamp
    var createTimeStamp = function () {
      return parseInt(new Date().getTime() / 1000) + '';
    };
    // 计算签名方法
    var calcSignature = function (ticket, noncestr, ts, url) {
      var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
      return sha1(str); //获得签名  
    }
    var noncestr = createNonceStr();
    var timestamp = createTimeStamp();
    var url = encodeURI(req.query.url);
    var signature = calcSignature(wx_jsapi_ticket, noncestr, timestamp, url);
    res.send({
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: noncestr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1  
        wx_appId: wx_appId
    });
});
module.exports = router;