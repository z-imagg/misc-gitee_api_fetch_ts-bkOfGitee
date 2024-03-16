// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CDP from 'chrome-remote-interface';
import * as DP from "devtools-protocol";
import readlineSync from 'readline-sync'

import {existsSync, mkdirSync, writeFileSync} from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import assert from "assert";

import {ReqTemplateI, TemplPlaceE} from "./req_tmpl_t.js";
import {ReqWrapT, RespHdWrapT} from "./rq_rp_wrap_t.js";
import {LoginEnum, MarkupHasEnum} from "./enums.js";
import {RqTab} from "./rq_tab_c.js";
import {RpHdTabC} from "./rpHd_tab_c.js";
import {LsUtilC} from "./ls_util_c.js";
import {
  giteeLoginPageUrl,
  js_fillUserPass,
  giteeImportPageUrl,
  nowMs,
  markup_project_name,
  markupFieldLs,
  js_fillMarkupGoalRepo,
  accInfoPgUrl, siteBaseUrl,
} from './site_gitee_cfg.js'

import {chromePath,reqTemplDir} from "./my_cfg.js";


const reqTab:RqTab=new RqTab(new Map())

const respHdTab:RpHdTabC=new RpHdTabC(new Map())

function reqWpHasMarkup(reqTab:RqTab ){
  // Array.from(reqLs.values()).map(k=>k[0].reqK.req.url)
  const reqIdLs:string[]= Array.from(reqTab._rqDct.keys())
  const _reqWpHasMarkup:ReqWrapT[]=reqIdLs.map(reqId=>{ //隐含了同一种消息是严格有序的，且 forEach 严格遵守数组下标顺序
    const reqChain:ReqWrapT[]=reqTab._rqDct.get(reqId)
    // const reqWpEnd:ReqWrapT=LsUtilC.endElem(reqChain);
    for (const reqK of reqChain) {
      const kHas:MarkupHasEnum=hasMarkupFieldIn1Req(reqK,reqTab.thisSiteCookies);
      if(kHas==MarkupHasEnum.Yes){//排除其他页面的干扰
        return reqK;
      }
    }

    return null;
  }).filter(k=>k!=null)
  return _reqWpHasMarkup;
}

function hasMarkupFieldIn1Req(reqWpEnd:ReqWrapT,thisSiteCookies:DP.Protocol.Network.Cookie[]){
  let _markup:MarkupHasEnum=MarkupHasEnum.No;
  const headerText=reqWpEnd.req.headers.toString();
  const req:DP.Protocol.Network.Request = reqWpEnd.req;
  const urlEnd:string=reqWpEnd.req.url;
  if(headerText.includes(markup_project_name)){
    console.log(`【在请求头,发现标记请求地址】【${urlEnd}】【${headerText}】`)
    writeReqExampleAsTemplate(reqWpEnd.reqId, req,TemplPlaceE.ReqHeader,thisSiteCookies)
    _markup=MarkupHasEnum.Yes
  }
  if(urlEnd.includes(markup_project_name)){
    console.log(`【在url,发现标记请求地址】【${urlEnd}】`)
    _markup=MarkupHasEnum.Yes
    writeReqExampleAsTemplate(reqWpEnd.reqId, req,TemplPlaceE.Url,thisSiteCookies)
  }
  if(req.hasPostData){
    const postData:string = req.postData;
    if(postData && postData.includes(markup_project_name)){
      console.log(`【在请求体,发现标记请求地址】【${urlEnd}】【${postData}】`)
      _markup=MarkupHasEnum.Yes
      writeReqExampleAsTemplate(reqWpEnd.reqId, req,TemplPlaceE.Body,thisSiteCookies)
    }
  }

  return _markup;
}

// 写请求例子作为请求模板
function writeReqExampleAsTemplate(reqId:DP.Protocol.Network.RequestId, req:DP.Protocol.Network.Request,templatePlace:TemplPlaceE,thisSiteCookies:DP.Protocol.Network.Cookie[]){
  const reqTemplText:string=JSON.stringify(<ReqTemplateI>{
    nowMs,reqId,req,templatePlace,markupFieldLs,thisSiteCookies
  })
  if(!existsSync(reqTemplDir)){
    mkdirSync(reqTemplDir)
  }
  const reqTmplFp:string=`${reqTemplDir}/${reqId}.json`
  writeFileSync(reqTmplFp,reqTemplText)
  console.log(`已写入请求例子（作为请求模板）文件 【${reqTmplFp}】`)
}

function calcLoginFlag(reqTab:RqTab ):LoginEnum{

  let _LoginFlag:LoginEnum=LoginEnum.Other;
  const reqIdLs:string[]=Array.from(reqTab._rqDct.keys())
  reqIdLs.forEach(reqId=>{ //隐含了同一种消息是严格有序的，且 forEach 严格遵守数组下标顺序
    const reqChain:ReqWrapT[]=reqTab._rqDct.get(reqId)
    const respChain:RespHdWrapT[]=respHdTab._rspHdDct.get(reqId)
    const retK:LoginEnum=calcLoginEnumIn1Chain(reqChain, respChain);
    if(retK!=LoginEnum.Other){//排除其他页面的干扰
      _LoginFlag=retK;
    }
  })
  return _LoginFlag;
}

function calcLoginEnumIn1Chain(reqChain:ReqWrapT[],  respChain:RespHdWrapT[]){

  let _loginFlag:LoginEnum=LoginEnum.Other;
  const reqWp1:ReqWrapT=LsUtilC.elem1(reqChain);
  assert(reqWp1!=null, "xxx1")
  // if( reqWp1  == null ){return;}
  const respWp1:RespHdWrapT=LsUtilC.elem1(respChain);

  const urlFirst:string=reqWp1.req.url;

  const reqWpEnd:ReqWrapT=LsUtilC.endElem(reqChain);
  const urlEnd:string=reqWpEnd.req.url;

  // const respWpEnd:RespHdWrapT=LsUtilC.endElem(respChain);

  if( reqWp1.req. url == accInfoPgUrl ){
    const reqWp2:ReqWrapT=LsUtilC.elem2(reqChain);
    const respWp2:RespHdWrapT=LsUtilC.elem2(respChain);
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
async function mainFunc( ) {
  try{
    const client:CDP.Client = await CDP(<CDP.Options>{
      port:0
    });
    const {Network, Page,DOM,Runtime, Fetch} = client;

    // 记录精简响应（全部响应都有，但全部都只有响应头、无响应体）
    Network.on("responseReceivedExtraInfo",(params: DP.Protocol.Network.ResponseReceivedExtraInfoEvent) =>{

      if(reqTab.__reqLs_get_req_url_any_startWith(params.requestId,"https://gitee.com")){
        // 暂时不打印 普通 请求日志
        // console.log(`【响应ExtraInfo】【reqId=${params.requestId}】 【响应码=${params.statusCode}】  【reqUrl=${reqTab. __reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }
      respHdTab.pushRespHd(params.requestId,params.statusCode,params.headers)
    })
    // 记录完整响应（不含302等无响应体的）
    //     参考 https://stackoverflow.com/questions/70926015/get-response-of-a-api-request-made-using-chrome-remote-interface/70926579#70926579
    Network.on("responseReceived",(params: DP.Protocol.Network.ResponseReceivedEvent) =>{
      if(params.response.url.startsWith("https://gitee.com")){
        // 暂时不打印 普通 请求日志
        // console.log(`【响应】【reqId=${params.requestId}】【响应Url=${params.response.url}】 【响应码=${params.response.status}】  【请求Url=${ reqTab.__reqLs_get_req_urlLsJoin(params.requestId) }】`)
      }
      // pushResponse(params.requestId,params.response)

    })

    //记录请求
    Network.on("requestWillBeSent", (params: DP.Protocol.Network.RequestWillBeSentEvent) => {
      if(params.request.url.startsWith("https://gitee.com")){//https://gitee.com/tmpOrg/projects
        // 暂时不打印 普通 请求日志
        // console.log(`【请求】【reqId=${params.requestId}】 【${ (params.redirectResponse||{}).url } ----> ${params.request.url} 】`)
        reqTab.pushReq(params.redirectResponse, params.requestId,params.request )
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

    readlineSync.question("回调Network.on已经执行。 若测试已登录情形，请现在在此浏览器人工登录gitee，后回车继续。否则直接回车继续。")
    //打开gitee账户页面
    console.log(`打开gitee账户页面 ${accInfoPgUrl}`)
    await Page.navigate( {url:accInfoPgUrl});//nav1 引起页面新加载
    //给浏览器以足够时间，看她是否重定向
    await Page.loadEventFired()
    await DOM.getDocument();//阻塞的DOMget1 被 nav1 吃掉
    //是否已登录
    const LoginFlag:LoginEnum=calcLoginFlag(reqTab)
    reqTab._rqDct.clear()
    respHdTab._rspHdDct.clear()

    //断言 此时登录状态不应该是未知
    assert(LoginFlag != LoginEnum.Other)

    //未登录
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ( LoginFlag==LoginEnum.NotLogin){
    //打开gitee登录页面
    console.log(`打开gitee登录页面 ${giteeLoginPageUrl}`)
    await Page.navigate( {url:giteeLoginPageUrl});//nav2 引起页面新加载
    // types/chrome-remote-interface 说 没有此方法 loadEventFired，但是 官方例子 中有此方法， https://github.com/cyrus-and/chrome-remote-interface/wiki/Async-await-example
    await Page.loadEventFired()
    await DOM.getDocument();//阻塞的DOMget2 被 nav2 吃掉
    //填写用户名、密码
    await Runtime.evaluate(<DP.Protocol.Runtime.EvaluateRequest>{
      expression:js_fillUserPass
    })
    console.log("在gitee登录页面，请填写各字段、填写可能的验证码, 点击'登录'按钮 。")
    await Page.loadEventFired()
    //用户在chroome浏览器进程上点击 '登录'按钮 , 引起页面新加载，将吃掉 nodejs进程中 阻塞的DOMget3
    await DOM.getDocument();//阻塞的DOMget3
    }
    //已登录
    else if ( LoginFlag==LoginEnum.AlreadLogin){
      //不用打开gitee登录页面
      console.log(`已登录 不用打开gitee登录页面 `)
    }

    reqTab.thisSiteCookies=(
      await client.Network.getCookies(<DP.Protocol.Network.GetCookiesRequest>{urls:[ siteBaseUrl]})  // siteBaseUrl  "https://gitee.com"
    ).cookies


    //打开gitee导入页面
    console.log(`打开gitee导入页面 ${giteeImportPageUrl}`)
    await Page.navigate({url:giteeImportPageUrl})//nav4 引起页面新加载
    await Page.loadEventFired()
    await DOM.getDocument();//阻塞的DOMget4 被 nav4 吃掉
    //填写标记仓库
    await Runtime.evaluate(<DP.Protocol.Runtime.EvaluateRequest>{
      expression:js_fillMarkupGoalRepo  //此js脚本  点击了 '导入'按钮 , 引起页面新加载，将吃掉 nodejs进程中 阻塞的DOMget5
    })
    console.log("gitee导入URL页面，js脚本【js_fillMarkupGoalRepo】 将填写各字段, 并'导入'按钮，【请勿手动操作】")
    await Page.loadEventFired()

    await DOM.getDocument();//阻塞的DOMget5

    //寻找有标记字段值的请求们
    const _reqWpHasMarkup:ReqWrapT[] = reqWpHasMarkup(reqTab)
    let exitCode:null|number=null;
    if(_reqWpHasMarkup.length>0){
      exitCode=0;
      console.log("【退出nodejs进程，退出代码为0，业务功能正常完成】, 找到有标记字段值的请求们，写入路径请看上面日志")
    }else{
      console.log("【退出nodejs进程，退出代码为1，业务功能正常完成】, 找到有标记字段值的请求们，写入路径请看上面日志")
      exitCode=1;
    }

    //结束此函数开头打开的chrome浏览器进程


    //退出nodejs进程
    process.exit(exitCode)

  }catch(err){
    console.error(err);
  }
}

mainFunc()
