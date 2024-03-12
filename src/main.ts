
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";
import {Runtime} from "inspector";
import readlineSync from 'readline-sync'

import * as fs from "fs";
import {sync} from "rimraf";

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
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
const js_fillUserPass=`
document.getElementById("user_login").value="${giteeUserName}";
document.getElementById("user_password").value="${giteePwd}";
alert("已填充用户名、密码");
`

//gitee导入页面url
const giteeImportPageUrl="https://gitee.com/projects/import/url";
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
async function interept( ) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page,DOM,Runtime, Fetch} = client;

    await Network.enable();
    await Runtime.enable();
    await DOM.enable();
    await Page.enable();
    //打开gitee登录页面
    await Page.navigate( {url:giteeLoginPageUrl});

    // types/chrome-remote-interface 说 没有此方法 loadEventFired，但是 官方例子 中有此方法， https://github.com/cyrus-and/chrome-remote-interface/wiki/Async-await-example
    await Page.loadEventFired()

    await DOM.getDocument();
    //填写用户名、密码
    await Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
      expression:js_fillUserPass
    })

    // 参考 https://www.npmjs.com/package/readline-sync , https://developer.aliyun.com/article/1254945
    const _trash=readlineSync.question("此时在gitee登录页面，填写各字段、点击'登录'按钮、填写可能的验证码 后，在此nodejs控制台按任意键继续")

    await Page.navigate({url:giteeImportPageUrl})
    readlineSync.question("此时在gitee导入URL页面，填写各字段、点击'导入'按钮 后，在此nodejs控制台按任意键继续")

    //请求过滤
    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      const req:Protocol.Network.Request=params.request;
      const url:string = params.request.url;
      if(!url.startsWith("https://gitee.com")){
        return;
      }
      console.log(`【请求地址】${url}`)

      if(urlList.indexOf(url)>=0){
        console.log(`【postData】【${url}】${req.postData}`)
      }

    })

  }catch(err){
    console.error(err);
  }
}

interept()
