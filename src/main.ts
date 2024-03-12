
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";

const urlList:string[]=[
  "https://gitee.com/tmpOrg/projects"
];

async function interept( ) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page,DOM, Fetch} = client;

    await Network.enable();
    await DOM.enable();
    await Page.enable();
    await Page.navigate( {url:"https://gitee.com/projects/import/url"});

    // types/chrome-remote-interface 说 没有此方法 loadEventFired，但是 官方例子 中有此方法， https://github.com/cyrus-and/chrome-remote-interface/wiki/Async-await-example
    await Page.loadEventFired()

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
