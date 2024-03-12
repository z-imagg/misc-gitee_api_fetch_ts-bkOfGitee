
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

async function interept(urlStr:string) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page, Runtime,Fetch,DOM,} = client;

    // await Fetch.enable(  )

    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      if(!params.request.url.startsWith("https://gitee.com")){
        return;
      }
      console.log(`【请求地址】${params.request.url}`)

      if(urlList.indexOf(params.request.url)>=0){
        console.log(`【postData】【${params.request.url}】${params.request.postData}`)
      }

    })
    await Network.enable();
    await Page.enable();
    await Page.navigate( {url:urlStr});
    // chrome-remote-interface 填充 dom , 参考 https://stackoverflow.com/questions/45500146/how-to-get-multiple-dom-elements-with-chrome-remote-interface-node-js/45513753#45513753
    await Page.on("loadEventFired",(params: Protocol.Page.LoadEventFiredEvent)=>{
// chrome打开页面 https://gitee.com/login ，用 开发者工具 找到 用户名输入框id、密码输入框id
      const expr=`
document.getElementById("user_login").value="${giteeUserName}";
document.getElementById("user_password").value="${giteePwd}";
alert("已填充用户名、密码");
`
      Runtime.evaluate(<Protocol.Runtime.EvaluateRequest>{
        expression:expr
      })

    })

  }catch(err){
    console.error(err);
  }
}

// interept("https://gitee.com/projects/import/url")
interept("https://gitee.com/login")
