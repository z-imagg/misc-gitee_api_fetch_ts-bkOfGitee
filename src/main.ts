
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";

async function interept(urlStr:string) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page, Fetch} = client;

    await Fetch.enable(  )

    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      if(!params.request.url.startsWith("https://gitee.com")){
        return;
      }
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
