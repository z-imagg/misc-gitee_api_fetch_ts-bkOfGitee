
import CDP from 'chrome-remote-interface';
import * as DP  from "devtools-protocol";
import readlineSync from 'readline-sync'

import * as fs from "fs";
import assert from "assert";
import * as CL from 'chrome-launcher'

// nodejs版本>=9.3时， 阻塞式sleep实现如下，参考  https://www.npmjs.com/package/sleep
function msleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function sleep(seconds) {
  msleep(seconds*1000);
}


const urlList:string[]=[
  "https://gitee.com/tmpOrg/projects"
];

const giteeAccount=JSON.parse(fs.readFileSync("gitee_account.json","utf8"))
const giteeUserName=giteeAccount["user"];
const giteePwd=giteeAccount["pass"];

//gitee登录页面url
const giteeLoginPageUrl="https://gitee.com/login";
//gitee登录页面中"登录"按钮的css选择器，  firefox开发者工具   人工获得
const loginBtnCssSelector="div.field:nth-child(4) > input:nth-child(1)";
const loginPageMsg="【gitee登录页面】已填充用户名、密码， "
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
const js_fillUserPass=`
document.getElementById("user_login").value="${giteeUserName}";
document.getElementById("user_password").value="${giteePwd}";
document.title="${loginPageMsg}"+document.title;
`

//gitee导入页面url
const giteeImportPageUrl="https://gitee.com/projects/import/url";
const project_import_url = "https://github.com/intel/ARM_NEON_2_x86_SSE.git"
const markupPrjName = "markupField----intel--ARM_NEON_2_x86_SSE"
const importPageMsg="【gitee导入页面】已填充标记字段，"
const js_fillMarkupGoalRepo=`
document.getElementById("project_import_url").value="${project_import_url}";
document.getElementById("project_name").value="${markupPrjName}";
document.title="${importPageMsg}"+document.title;
`
//gitee账户页面url .  作为 登录判定依据 的 账户页面   的 url 故意且必须 和  正常进入 账户页面 不同 以 区分
const accInfoPgUrl="https://gitee.com/profile/account_information?different_to_normal=AvoidNoise";

class ReqWrapT {

  redirectResp:DP.Protocol.Network.Response;
  reqId:DP.Protocol.Network.RequestId;

  req:DP.Protocol.Network.Request;


  // 构造函数
  constructor(redirectResp:DP.Protocol.Network.Response, reqId:DP.Protocol.Network.RequestId,req:DP.Protocol.Network.Request ) {
    this.redirectResp=redirectResp
    this.reqId = reqId
    this.req = req
  }

}
class RespHdWrapT {

  reqId:DP.Protocol.Network.RequestId;
  statusCode:number
  respHd:DP.Protocol.Network.Headers;


  // 构造函数
  constructor( reqId:DP.Protocol.Network.RequestId,statusCode:number, respHd:DP.Protocol.Network.Headers ) {
    this.reqId = reqId
    this.statusCode=statusCode
    this.respHd = respHd
  }

}
const reqLs:Map<DP.Protocol.Network.RequestId,ReqWrapT[]>=new Map();
const respHdLs:Map<DP.Protocol.Network.RequestId,RespHdWrapT[]>=new Map();

function pushReq(redirectResp:DP.Protocol.Network.Response, reqId:DP.Protocol.Network.RequestId,req:DP.Protocol.Network.Request ){
  let ls:ReqWrapT[]=reqLs.get(reqId)
  if(ls==null){
    reqLs.set(reqId,[]);
    ls=reqLs.get(reqId)
  }
  ls.push(new ReqWrapT(redirectResp, reqId,req ))
}

function pushRespHd( reqId:DP.Protocol.Network.RequestId, statusCode:number, respHd:DP.Protocol.Network.Headers){
  let ls:RespHdWrapT[]=respHdLs.get(reqId)
  if(ls==null){
    respHdLs.set(reqId,[]);
    ls=respHdLs.get(reqId)
  }
  ls.push(new RespHdWrapT(reqId,statusCode, respHd ))
}


function reqLs_has(reqId:DP.Protocol.Network.RequestId){
  const ls:ReqWrapT[]=reqLs.get(reqId)
  const empty:boolean=(ls==null||ls.length==0)
  return !empty;
}

function reqLs_req1(chain:ReqWrapT[]){
  const empty:boolean=(chain==null||chain.length==0)
  return (!empty)?chain[0]:null;
}
function reqLs_req2(chain:ReqWrapT[]){
  const lack:boolean=(chain==null||chain.length<2)
  return (!lack)?chain[1]:null;
}
function respLs_1(chain:RespHdWrapT[]){
  const empty:boolean=(chain==null||chain.length==0)
  return (!empty)?chain[0]:null;
}
function respLs_2(chain:RespHdWrapT[]){
  const lack:boolean=(chain==null||chain.length<2)
  return (!lack)?chain[1]:null;
}

function reqLs_endReq(chain:ReqWrapT[]){
  const endIdx:number=chain.length-1;
  return (endIdx>=0)?chain[endIdx]:null;
}
function respLs_endResp(chain:RespHdWrapT[]){
  const endIdx:number=chain.length-1;
  return (endIdx>=0)?chain[endIdx]:null;
}

function __reqLs_get_req_url_any_startWith(reqId:DP.Protocol.Network.RequestId,urlPrefix:string){
  const ls:ReqWrapT[]=reqLs.get(reqId)
  const empty:boolean=(ls==null||ls.length==0)
  if(!empty){
    return ls.filter(k=>k.req.url.startsWith(urlPrefix)).length>0
  }
  return false;
}

function __reqLs_get_req_urlLsJoin(reqId:DP.Protocol.Network.RequestId){
  const ls:ReqWrapT[]=reqLs.get(reqId)
  const empty:boolean=(ls==null||ls.length==0)
  if(!empty){
    return ls.map(k=>k.req.url).join(",")
  }
  return "";
}
enum  MarkupHasEnum{
  Yes=1,
  No=2
}
function reqWpHasMarkup( ){
  // Array.from(reqLs.values()).map(k=>k[0].reqK.req.url)
  const reqIdLs:string[]= Array.from(reqLs.keys())
  const _reqWpHasMarkup:ReqWrapT[]=reqIdLs.map(reqId=>{ //隐含了同一种消息是严格有序的，且 forEach 严格遵守数组下标顺序
    const reqChain:ReqWrapT[]=reqLs.get(reqId)
    // const reqWpEnd:ReqWrapT=reqLs_endReq(reqChain);
    for (const reqK of reqChain) {
      const kHas:MarkupHasEnum=hasMarkupFieldIn1Req(reqK);
      if(kHas==MarkupHasEnum.Yes){//排除其他页面的干扰
        return reqK;
      }
    }

    return null;
  }).filter(k=>k!=null)
  return _reqWpHasMarkup;
}
function hasMarkupFieldIn1Req(reqWpEnd:ReqWrapT){
  let _markup:MarkupHasEnum=MarkupHasEnum.No;
  const headerText=reqWpEnd.req.headers.toString();
  const req:DP.Protocol.Network.Request = reqWpEnd.req;
  const urlEnd:string=reqWpEnd.req.url;
  if(headerText.includes(markupPrjName)){
    console.log(`【在请求头,发现标记请求地址】【${urlEnd}】【${headerText}】`)
    _markup=MarkupHasEnum.Yes
  }
  if(urlEnd.includes(markupPrjName)){
    console.log(`【在url,发现标记请求地址】【${urlEnd}】`)
    _markup=MarkupHasEnum.Yes
  }
  if(req.hasPostData){
    const postData:string = req.postData;
    if(postData && postData.includes(markupPrjName)){
      console.log(`【在请求体,发现标记请求地址】【${urlEnd}】【${postData}】`)
      _markup=MarkupHasEnum.Yes
    }
  }

  return _markup;
}

enum  LoginEnum{
  Other=0,
  AlreadLogin=1,
  NotLogin=2
}
function calcLoginFlag( ){

  let _LoginFlag:LoginEnum=LoginEnum.Other;
  const reqIdLs:string[]=Array.from(reqLs.keys())
  reqIdLs.forEach(reqId=>{ //隐含了同一种消息是严格有序的，且 forEach 严格遵守数组下标顺序
    const reqChain:ReqWrapT[]=reqLs.get(reqId)
    const respChain:RespHdWrapT[]=respHdLs.get(reqId)
    const retK:LoginEnum=calcLoginEnumIn1Chain(reqChain, respChain);
    if(retK!=LoginEnum.Other){//排除其他页面的干扰
      _LoginFlag=retK;
    }
  })
  return _LoginFlag;
}


function calcLoginEnumIn1Chain(reqChain:ReqWrapT[],  respChain:RespHdWrapT[]){

  let _loginFlag:LoginEnum=LoginEnum.Other;
  const reqWp1:ReqWrapT=reqLs_req1(reqChain);
  assert(reqWp1!=null, "xxx1")
  // if( reqWp1  == null ){return;}
  const respWp1:RespHdWrapT=respLs_1(respChain);

  const urlFirst:string=reqWp1.req.url;

  const reqWpEnd:ReqWrapT=reqLs_endReq(reqChain);
  const urlEnd:string=reqWpEnd.req.url;

  // const respWpEnd:RespHdWrapT=respLs_endResp(respChain);

  if( reqWp1.req. url == accInfoPgUrl ){
    const reqWp2:ReqWrapT=reqLs_req2(reqChain);
    const respWp2:RespHdWrapT=respLs_2(respChain);
    if(reqWp2==null){ // && respWp2.statusCode==200
      console.log(`【发现直接进入账户页】【undefined--->账户页】【此即已登录】${urlEnd}`)
      //已登录:
      _loginFlag=LoginEnum.AlreadLogin;
    } else
    if( reqWp2.req. url == giteeLoginPageUrl){ //&& respWp2.statusCode==302
      assert(respWp2!=null, "断言失败, 重定向的第二个请求的响应一定是正常的200")
      const targetUrl:string=respWp1.respHd["Location"]
      console.log(`【发现故意制造的重定向】【账户页--->登录页】【此即未登录】${urlFirst} ----> ${targetUrl}`)
      //未登录
      _loginFlag=LoginEnum.NotLogin;
    }
    // else{
    //   // throw new Error(`断言失败 ， 请求 ${urlEnd} 的响应状态码不应该是${resp.status}` )
    // }

  }
  return _loginFlag;

}
async function interept( ) {
  try{
    const chrome:CL.LaunchedChrome= await CL.launch(<CL.Options>{
      chromePath:"/app/chrome-linux/chrome",
      chromeFlags:["--no-first-run","--disable-gpu"]
    });
    const client:CDP.Client = await CDP(<CDP.Options>{
      port:chrome.port
    });
    const {Network, Page,DOM,Runtime, Fetch} = client;

    // 记录精简响应（全部响应都有，但全部都只有响应头、无响应体）
    Network.on("responseReceivedExtraInfo",(params: DP.Protocol.Network.ResponseReceivedExtraInfoEvent) =>{

      if(__reqLs_get_req_url_any_startWith(params.requestId,"https://gitee.com")){
        // 暂时不打印 普通 请求日志
        // console.log(`【响应ExtraInfo】【reqId=${params.requestId}】 【响应码=${params.statusCode}】  【reqUrl=${ __reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }
      pushRespHd(params.requestId,params.statusCode,params.headers)
    })
    // 记录完整响应（不含302等无响应体的）
    //     参考 https://stackoverflow.com/questions/70926015/get-response-of-a-api-request-made-using-chrome-remote-interface/70926579#70926579
    Network.on("responseReceived",(params: DP.Protocol.Network.ResponseReceivedEvent) =>{
      if(params.response.url.startsWith("https://gitee.com")){
        // 暂时不打印 普通 请求日志
        // console.log(`【响应】【reqId=${params.requestId}】【响应Url=${params.response.url}】 【响应码=${params.response.status}】  【请求Url=${ __reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }
      // pushResponse(params.requestId,params.response)

    })

    //记录请求
    Network.on("requestWillBeSent", (params: DP.Protocol.Network.RequestWillBeSentEvent) => {
      if(params.request.url.startsWith("https://gitee.com")){//https://gitee.com/tmpOrg/projects
        // 暂时不打印 普通 请求日志
        // console.log(`【请求】【reqId=${params.requestId}】 【${ (params.redirectResponse||{}).url } ----> ${params.request.url} 】`)
        pushReq(params.redirectResponse, params.requestId,params.request )
      }
      if(params.request.url.endsWith(".css")
        || params.request.url.indexOf(".js")>0
        || params.request.url.indexOf("cn-assets.gitee.com") > 0
        || params.request.url.indexOf("images") > 0
        || params.request.url.indexOf(".gif") > 0
        || params.request.url.startsWith("data:") // data:application, data:image
        || params.request.url.indexOf("gitee") < 0
      ){
        //调试用，暂时忽略可能的资源文件
        return;
      }

    })

    await Network.enable();
    await Runtime.enable();
    await DOM.enable();
    await Page.enable();

    readlineSync.question("回调Network.on已经执行， 按回车继续   ")
    //打开gitee账户页面
    console.log(`打开gitee账户页面 ${accInfoPgUrl}`)
    await Page.navigate( {url:accInfoPgUrl});
    //给浏览器以足够时间，看她是否重定向
    console.log(`给浏览器以足够时间，看她是否重定向`)
    await Page.loadEventFired()
    await DOM.getDocument();
    sleep(8);
    //是否已登录
    const LoginFlag:LoginEnum=calcLoginFlag()
    reqLs.clear()
    respHdLs.clear()

    //断言 此时登录状态不应该是未知
    assert(LoginFlag != LoginEnum.Other)

    //未登录
    if ( LoginFlag==LoginEnum.NotLogin){
    //打开gitee登录页面
    console.log(`打开gitee登录页面 ${giteeLoginPageUrl}`)
    await Page.navigate( {url:giteeLoginPageUrl});
    // types/chrome-remote-interface 说 没有此方法 loadEventFired，但是 官方例子 中有此方法， https://github.com/cyrus-and/chrome-remote-interface/wiki/Async-await-example
    await Page.loadEventFired()
    await DOM.getDocument();
    //填写用户名、密码
    await Runtime.evaluate(<DP.Protocol.Runtime.EvaluateRequest>{
      expression:js_fillUserPass
    })
    const _trash=readlineSync.question("此时在gitee登录页面，填写各字段、点击'登录'按钮、填写可能的验证码 后，在此nodejs控制台按任意键继续")
    }
    //已登录
    else if ( LoginFlag==LoginEnum.AlreadLogin){
      //不用打开gitee登录页面
      console.log(`已登录 不用打开gitee登录页面 `)
    }

    //打开gitee导入页面
    console.log(`打开gitee导入页面 ${giteeImportPageUrl}`)
    await Page.navigate({url:giteeImportPageUrl})
    await Page.loadEventFired()
    await DOM.getDocument();
    //填写标记仓库
    await Runtime.evaluate(<DP.Protocol.Runtime.EvaluateRequest>{
      expression:js_fillMarkupGoalRepo
    })
    // sleep(2)
    await Page.loadEventFired()
    await DOM.getDocument();
    console.log("此时在gitee导入URL页面，填写各字段、点击'导入'按钮 后，【注意'仓库名称' 'project_name'字段是标记字段，其他各字段不要与标记字段取值相同】")
    // sleep(5)
    reqWpHasMarkup()

  }catch(err){
    console.error(err);
  }
}

interept()
