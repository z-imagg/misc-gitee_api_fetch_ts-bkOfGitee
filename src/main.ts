
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";
import {Runtime} from "inspector";
import readlineSync from 'readline-sync'
import * as fs from "fs";
import * as nodeFetch from 'node-fetch'
import fetch, {Response} from "node-fetch";

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
//gitee账户页面url
const accInfoPgUrl="https://gitee.com/profile/account_information";
async function interept( ) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page,DOM,Runtime, Fetch} = client;

    await Network.enable();
    await Runtime.enable();
    await DOM.enable();
    await Page.enable();

    //访问 gitee账户页面url
    const resp:nodeFetch.Response = await nodeFetch.default(accInfoPgUrl)
    if(nodeFetch.isRedirect(resp.status)){
      //这样写不对，因为nodeFetch这是在nodejs进程，而不是在浏览器chrome进程，
      // 这个nodeFetch发出的请求没有携带任何身份信息在请求中，肯定会受到重定向
    }
    //打开gitee登录页面
    await Page.navigate( {url:giteeLoginPageUrl});
    // types/chrome-remote-interface 说 没有此方法 loadEventFired，但是 官方例子 中有此方法， https://github.com/cyrus-and/chrome-remote-interface/wiki/Async-await-example
    await Page.loadEventFired()
    await DOM.getDocument();
    //填写用户名、密码
    await Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
      expression:js_fillUserPass
    })
    const _trash=readlineSync.question("此时在gitee登录页面，填写各字段、点击'登录'按钮、填写可能的验证码 后，在此nodejs控制台按任意键继续")
    //打开gitee导入页面
    await Page.navigate({url:giteeImportPageUrl})
    await Page.loadEventFired()
    await DOM.getDocument();
    //填写标记仓库
    await Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
      expression:js_fillMarkupGoalRepo
    })
    readlineSync.question("此时在gitee导入URL页面，填写各字段、点击'导入'按钮 后，【注意'仓库名称' 'project_name'字段是标记字段，其他各字段不要与标记字段取值相同】, 在此nodejs控制台按任意键继续")

    //请求过滤
    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      const req:Protocol.Network.Request=params.request;
      const url:string = params.request.url;
      if(!url.startsWith("https://gitee.com")){
        return;
      }
      console.log(`【请求地址】${url}`)

      const headerText=req.headers.toString();
      if(headerText.includes(markupPrjName)){
        console.log(`【在请求头】【发现标记请求地址】【${url}】【${headerText}】`)
      }
      if(url.includes(markupPrjName)){
        console.log(`【在url】【发现标记请求地址】【${url}】`)
      }
      if(req.hasPostData){
        const postData:string = req.postData;
        if(postData && postData.includes(markupPrjName)){
          console.log(`【在请求体】【发现标记请求地址】【${url}】【${postData}】`)
        }
      }
      /**
【在请求体】【发现标记请求地址】【https://gitee.com/tmpOrg/projects】【utf8=%E2%9C%93&authenticity_token=xUuuL7czpeKrHp3QoLju7yfE67WTOa5xnSQk7C%2FOaNAqAUO7fXTpgQUJqsXW4aiSOxIUoOHqvkwKr3yaLxaZ4g%3D%3D&project%5Bimport_url%5D=https%3A%2F%2Fgithub.com%2Fintel%2FARM_NEON_2_x86_SSE.git&user_sync_code=&password_sync_code=&project%5Bname%5D=intel--ARM_NEON_2_x86_SSE&project%5Bnamespace_path%5D=tmpOrg&project%5Bpath%5D=xxxxxx&project%5Bdescription%5D=zzzzz&project%5Bpublic%5D=1&language=0】
       */

    })

  }catch(err){
    console.error(err);
  }
}

interept()
