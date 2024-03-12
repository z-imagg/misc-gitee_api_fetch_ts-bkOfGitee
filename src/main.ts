
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";

async function interept(urlStr:string) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page, Fetch} = client;

    await Fetch.enable( {
      patterns:[
        <Protocol.Fetch.RequestPattern>{
          urlPattern:"^http[s]?://gitee.com/*", //chrome-remote-interface 的 正则表达式太简陋了 不好用， 比如 开头符号^无效
          resourceType:"XHR"
        }
      ]
    })

    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      console.log(`【请求地址】${params.request.url}`)
    })
    await Network.enable();
    await Page.enable();
    await Page.navigate( {url:urlStr});
    await Page.loadEventFired()

  }catch(err){
    console.error(err);
  }
}

interept("https://gitee.com/projects/import/url")
