
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";

async function interept(urlStr:string) {
  try{
    let client:CDP.Client = await CDP();
    const {Network, Page, Fetch} = client;
    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      console.log(`【请求地址】${params.request.url}`)
    })

    await Fetch.enable(<Protocol.Fetch.EnableRequest>{
      patterns:[
        <Protocol.Fetch.RequestPattern>{
          urlPattern:"*",
          resourceType:"XHR"
        }
      ]
    })

    await Network.enable();
    await Page.enable();
    await Page.navigate(<Protocol.Page.NavigateRequest>{url:urlStr});
    // await Page.loadEventFired()

  }catch(err){
    console.error(err);
  }
}

interept("https://gitee.com/projects/import/url")
