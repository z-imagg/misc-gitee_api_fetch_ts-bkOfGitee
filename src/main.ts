
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";
import {Runtime} from "inspector";
import readlineSync from 'readline-sync'

import * as fs from "fs";
import assert from "assert";

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
async function interept( ) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page,DOM,Runtime, Fetch} = client;

    //请求过滤
    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      const req:Protocol.Network.Request=params.request;
      const url:string = params.request.url;
      if(!url.startsWith("https://gitee.com")){
        return;
      }
      // 暂时不打印 普通 请求日志
      // console.log(`【请求地址】${url}`)

      const headerText=req.headers.toString();
      if(headerText.includes(markupPrjName)){
        console.log(`【在请求头,发现标记请求地址】【${url}】【${headerText}】`)
      }
      if(url.includes(markupPrjName)){
        console.log(`【在url,发现标记请求地址】【${url}】`)
      }
      if(req.hasPostData){
        const postData:string = req.postData;
        if(postData && postData.includes(markupPrjName)){
          console.log(`【在请求体,发现标记请求地址】【${url}】【${postData}】`)
        }
      }
      /**
       【在请求体】【发现标记请求地址】【https://gitee.com/tmpOrg/projects】【utf8=%E2%9C%93&authenticity_token=xUuuL7czpeKrHp3QoLju7yfE67WTOa5xnSQk7C%2FOaNAqAUO7fXTpgQUJqsXW4aiSOxIUoOHqvkwKr3yaLxaZ4g%3D%3D&project%5Bimport_url%5D=https%3A%2F%2Fgithub.com%2Fintel%2FARM_NEON_2_x86_SSE.git&user_sync_code=&password_sync_code=&project%5Bname%5D=intel--ARM_NEON_2_x86_SSE&project%5Bnamespace_path%5D=tmpOrg&project%5Bpath%5D=xxxxxx&project%5Bdescription%5D=zzzzz&project%5Bpublic%5D=1&language=0】
       */

    })

    //请求过滤，寻找重定向
    Network.on("requestWillBeSent",(params: Protocol.Network.RequestWillBeSentEvent)=>{
      const req:Protocol.Network.Request=params.request;
      const reqUrl:string=req.url;
      const redirectResp:Protocol.Network.Response=params.redirectResponse;

      if(redirectResp==null && reqUrl==accInfoPgUrl){
        console.log(`【发现直接进入账户页】【undefined--->账户页】【此即已登录】undefined ----> ${reqUrl}`)
        /*
        若 params.request获得的响应的状态码是302 ，则 未登录；  后续 会发生期望的重定向
        若 params.request获得的响应的状态码是200 ，则 已登录；  后续 不会发生期望的重定向
        因此 不用判定 响应的状态码，只需要看后续的重定向
        即 这里可以等效的认为： 暂时 在这里 判定为 已登录  是 不会导致结果错误的
         */
        //已登录:
        loginFlag=TRUE;
      }

      if(redirectResp && reqUrl){
        const redirectRespUrl:string=redirectResp.url;
        console.assert(redirectRespUrl!=null)

        if(accInfoPgUrl==redirectRespUrl && reqUrl==giteeLoginPageUrl){
          console.log(`【发现故意制造的重定向】【账户页--->登录页】【此即未登录】${redirectRespUrl} ----> ${reqUrl}`)
          //未登录
          loginFlag=FALSE;
        }

        // 暂时不打印 普通 重定向日志
        console.log(`【发现重定向】${redirectRespUrl} ----> ${reqUrl}`)

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
    await Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
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
    await Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
      expression:js_fillMarkupGoalRepo
    })
    readlineSync.question("此时在gitee导入URL页面，填写各字段、点击'导入'按钮 后，【注意'仓库名称' 'project_name'字段是标记字段，其他各字段不要与标记字段取值相同】, 在此nodejs控制台按任意键继续")

  }catch(err){
    console.error(err);
  }
}

interept()
