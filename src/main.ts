
import CDP from 'chrome-remote-interface';
import Protocol from "devtools-protocol";
import serialize from "node-serialize"
import {writeFile, writeFileSync} from 'fs'

const urlList:string[]=[
  "https://gitee.com/tmpOrg/projects"
];

async function interept(urlStr:string) {
  try{
    const client:CDP.Client = await CDP();
    const {Network, Page, Fetch} = client;

    // await Fetch.enable(  )

    Network.on("requestWillBeSent", (params: Protocol.Network.RequestWillBeSentEvent) => {
      if(!params.request.url.startsWith("https://gitee.com")){
        return;
      }
      console.log(`【请求地址】${params.request.url}`)

      if(urlList.indexOf(params.request.url)>=0){
        if(params.request.hasPostData){
          const ser_postData:Buffer=serialize.serialize(params.request.postData)
          writeFileSync("postDataF",ser_postData)
          console.log(`【postData】【${params.request.url}】${params.request.postData}`)
        }
      }

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
