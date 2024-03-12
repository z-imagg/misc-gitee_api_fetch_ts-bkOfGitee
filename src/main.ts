
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";
import {Runtime} from "inspector";

import * as fs from "fs";

const urlList:string[]=[
  "https://gitee.com/tmpOrg/projects"
];

const giteeAccount=JSON.parse(fs.readFileSync("gitee_account.json","utf8"))
const giteeUserName=giteeAccount["user"];
const giteePwd=giteeAccount["pass"];

//gitee登录页面url
const giteeLoginPageUrl="https://gitee.com/login";
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
const js_fillUserPass=`
document.getElementById("user_login").value="${giteeUserName}";
document.getElementById("user_password").value="${giteePwd}";
alert("已填充用户名、密码");
`

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

    //请求过滤
    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      if(!params.request.url.startsWith("https://gitee.com")){
        return;
      }
      console.log(`【请求地址】${params.request.url}`)

      if(urlList.indexOf(params.request.url)>=0){
        console.log(`【postData】【${params.request.url}】${params.request.postData}`)
      }

    })

  }catch(err){
    console.error(err);
  }
}

interept()
