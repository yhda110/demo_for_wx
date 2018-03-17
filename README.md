#webdemo_for_wx
###### 一个简单的基于node+web的微信公众平台对接demo

* [前言](#first)
* [开始吧](#chapter1)
* [从微信验证服务器开始](#chapter2)

---
<div id="first"></div>
##### 前言
&emsp;&emsp;距离上次微信开发已经好几年了，最近做运营活动需要重新配一套关于微信公众平台的方案，虽然网上一大堆关于这方面的资料，但是都是碎片化的，在这里整理了一下，方便大家用到的时候不用那么麻烦的找DEMO。当然，我会一步一步在这篇文档中从零开始和大家一起走一下这个流程，想必是非常有趣的。所以你需要准备的：

* node;
* 微信开发者工具;
* 一个文本编辑器，比如sublime;
* 一些时间

<div id="chapter1"></div>
##### 开始吧
&emsp;&emsp;首先假定你安装了 *Node.js* ,接下来通过*npm*包管理工具安装GIT下来的项目的依赖。
>$ npm install

&emsp;&emsp;安装完毕后找到*/routes/index.js*文件，将wx_appId，wx_secret变量设置为自己的公共号的appId/secret，然后找到文件*/views/index.html*将第9行的appid设置为自己公众号的appid。
&emsp;&emsp;supervisor启动服务，然后通过微信开发者工具访问你外网的域名www.xxx.xxx/home
>$ npm run supervisor
<div id="chapter2"></div>
##### 从微信验证服务器开始
&emsp;&emsp;我们第一步需要做微信服务器配置，在服务端*/routes/index.js*代码中添加一条router来接收微信在验证服务器时传来的get请求：
<pre>
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
</pre>
&emsp;&emsp;然后打开微信管理后台=>开发>基本配置，在该页面找到服务器配置，然后将外网根地址放到服务器地址(URL)中，然后将Token填入yhda110,点击验证就通过了。
&emsp;&emsp;那么问题来了，微信是如何成功绑定我们的服务器的呢？我们从结果往前推导，在我们绑定的时候点击了微信公众号后台的修改/绑定按钮，这时微信向我们所填写的服务器地址发送get请求，并且携带了一些参数，在上面的代码中可以看到，当微信访问该请求时，我们的node后端代码会获取请求的参数然后做加密/校验，如果验证通过则向访问者返回*echostr*，微信接受到*echostr*后通过服务器验证



###文档持续更新中
<div class="footer">
 &emsp;&emsp;by: Storm&emsp;&emsp;WXId: yhda110
</div>








   
