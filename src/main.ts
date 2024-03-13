
import CDP from 'chrome-remote-interface';
import * as DP  from "devtools-protocol";
import {Runtime} from "inspector";
import readlineSync from 'readline-sync'

import * as fs from "fs";
import assert from "assert";
import Protocol from "devtools-protocol";

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

const Unknown=0; const TRUE=1; const FALSE=2;
//是否已登录
let loginFlag:number=Unknown;

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
const reqLs:Map<DP.Protocol.Network.RequestId,ReqWrapT[]>=new Map();

function pushReq(redirectResp:DP.Protocol.Network.Response, reqId:DP.Protocol.Network.RequestId,req:DP.Protocol.Network.Request ){
  let ls:ReqWrapT[]=reqLs.get(reqId)
  if(ls==null){
    reqLs.set(reqId,[]);
    ls=reqLs.get(reqId)
  }
  ls.push(new ReqWrapT(redirectResp, reqId,req ))
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

function reqLs_endReq(chain:ReqWrapT[]){
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

function findMarkupField(reqWpEnd:ReqWrapT){
  const headerText=reqWpEnd.req.headers.toString();
  const req:DP.Protocol.Network.Request = reqWpEnd.req;
  const urlEnd:string=reqWpEnd.req.url;
  if(headerText.includes(markupPrjName)){
    console.log(`【在请求头,发现标记请求地址】【${urlEnd}】【${headerText}】`)
  }
  if(urlEnd.includes(markupPrjName)){
    console.log(`【在url,发现标记请求地址】【${urlEnd}】`)
  }
  if(req.hasPostData){
    const postData:string = req.postData;
    if(postData && postData.includes(markupPrjName)){
      console.log(`【在请求体,发现标记请求地址】【${urlEnd}】【${postData}】`)
    }
  }
}
function findLogin(reqChain:ReqWrapT[], respStatus:number, resp:null|DP.Protocol.Network.Response){

  const reqWp1:ReqWrapT=reqLs_req1(reqChain);
  assert(reqWp1!=null, "xxx1")
  // if( reqWp1  == null ){return;}


  const reqWpEnd:ReqWrapT=reqLs_endReq(reqChain);
  const urlEnd:string=reqWpEnd.req.url;

  if( reqWp1.req. url == accInfoPgUrl ){
    const reqWp2:ReqWrapT=reqLs_req2(reqChain);
    if(reqWp2==null){ // && respStatus==200
      console.log(`【发现直接进入账户页】【undefined--->账户页】【此即已登录】${urlEnd}`)
      //已登录:
      loginFlag=TRUE;
    } else
    if( reqWp2.req. url == giteeLoginPageUrl){ //&& respStatus==302
      assert(resp!=null, "断言失败, 重定向的第二个请求的响应一定是正常的200")
      const targetUrl:string=resp.headers["Location"]
      console.log(`【发现故意制造的重定向】【账户页--->登录页】【此即未登录】${urlEnd} ----> ${targetUrl}`)
      //未登录
      loginFlag=FALSE;
    }
    else{
      throw new Error(`断言失败 ， 请求 ${urlEnd} 的响应状态码不应该是${resp.status}` )
    }
  }

}
async function interept( ) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page,DOM,Runtime, Fetch} = client;

    Network.on("responseReceivedExtraInfo",(params: DP.Protocol.Network.ResponseReceivedExtraInfoEvent) =>{

      const reqChain:ReqWrapT[]=reqLs.get(params.requestId);
      findLogin(reqChain,params.statusCode,null)
      if(__reqLs_get_req_url_any_startWith(params.requestId,"https://gitee.com")){
        // 暂时不打印 普通 请求日志
        console.log(`【响应ExtraInfo】【reqId=${params.requestId}】 【响应码=${params.statusCode}】  【reqUrl=${ __reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }
    })
    // 请求和对应的响应，查找被标记的请求的响应，
    //     参考 https://stackoverflow.com/questions/70926015/get-response-of-a-api-request-made-using-chrome-remote-interface/70926579#70926579
    Network.on("responseReceived",(params: DP.Protocol.Network.ResponseReceivedEvent) =>{
      if(params.response.url.startsWith("https://gitee.com")){
        // 暂时不打印 普通 请求日志
        console.log(`【响应】【reqId=${params.requestId}】【响应Url=${params.response.url}】 【响应码=${params.response.status}】  【请求Url=${ __reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }

      const requestId:DP.Protocol.Network.RequestId = params.requestId
      const respUrl:string = params.response.url;
      assert(reqLs_has(requestId),`断言失败，响应【requestId=${requestId},response.url=${respUrl}】对应的请求不存在`)

/////////////////
      const reqChain:ReqWrapT[]=reqLs.get(params.requestId);
      const reqWpEnd:ReqWrapT=reqLs_endReq(reqChain);
      findLogin(reqChain,params.response.status,params.response)

      findMarkupField(reqWpEnd)
    })

    //记录请求
    Network.on("requestWillBeSent", (params: DP.Protocol.Network.RequestWillBeSentEvent) => {
      if(params.request.url.startsWith("https://gitee.com")){
        // 暂时不打印 普通 请求日志
        console.log(`【请求】【reqId=${params.requestId}】 【${ (params.redirectResponse||{}).url } ----> ${params.request.url} 】`)
      }
      pushReq(params.redirectResponse, params.requestId,params.request )
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
    sleep(8);

    //断言 此时登录状态不应该是未知
    assert(loginFlag != Unknown)

    //未登录
    if ( loginFlag==FALSE){
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
    if ( loginFlag==TRUE){
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
    readlineSync.question("此时在gitee导入URL页面，填写各字段、点击'导入'按钮 后，【注意'仓库名称' 'project_name'字段是标记字段，其他各字段不要与标记字段取值相同】, 在此nodejs控制台按任意键继续")

  }catch(err){
    console.error(err);
  }
}

interept()
