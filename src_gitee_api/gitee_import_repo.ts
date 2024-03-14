import {MarkupFieldI, ReqTemplateI, TemplPlaceE} from "../src/req_tmpl_t.js";
import {reqTemplDir} from "../src/my_cfg.js";
import {readdirSync, readFileSync} from "fs";
import {MarkupFieldUtilC} from "./MarkupFieldUtil.js";

import * as DP from "devtools-protocol";
import  RequestNS from "request";
import assert from "assert";

const exitCode_1:number=21
const errMsg_1:string=`【错误】【退出代码${exitCode_1}】目录【${reqTemplDir}】下没有已markup的请求例子，请你先执行脚本gen_gitee_import_repo_req_template.sh以生成请求例子`
const exitCode_2:number=22
const errMsg_2:string=`【错误】【退出代码${exitCode_2}】命令用法为 me.js from_repoUrl goal_OrgName goal_repoName  goal_repoDesc`

const reqTmplFNLs:string[]=readdirSync(`${reqTemplDir}`)
if(reqTmplFNLs.length<=0){
  console.log(errMsg_1)
  process.exit(exitCode_1)
}

const ARG_START_IDX:number=2
const ARG_CNT:number=4
process.argv.push("http://xxx.com/yyy.git")
process.argv.push("org01")
process.argv.push("repo01")
process.argv.push("仓库描述")

if (process.argv.length<ARG_START_IDX+ARG_CNT){
  console.log(errMsg_1)
  process.exit(exitCode_1)
}
const argLs:string[]=process.argv.slice(ARG_START_IDX)
const from_repoUrl:string=argLs[0]
const goal_OrgName:string=argLs[1]
const goal_repoName:string=argLs[2]
const goal_repoPath:string=goal_repoName
const goal_repoDesc:string=argLs[3]


const newFieldLs: MarkupFieldI[]=[
<MarkupFieldI>{fldNm:"project_import_url",fldVal:encodeURIComponent(from_repoUrl) },
<MarkupFieldI>{fldNm:"markupPrjName",fldVal:encodeURIComponent(goal_OrgName)},
<MarkupFieldI>{fldNm:"markupOrgName",fldVal:encodeURIComponent(goal_repoName)},
<MarkupFieldI>{fldNm:"markupPrjPath",fldVal:encodeURIComponent(goal_repoPath)},
<MarkupFieldI>{fldNm:"markupPrjDesc",fldVal:encodeURIComponent(goal_repoDesc)}
]


const reqTmplFN:string=reqTmplFNLs[0]
const reqTmplFP:string=`${reqTemplDir}/${reqTmplFN}`
const reqTmplText:string= readFileSync(reqTmplFP).toString()
const rqTpl:ReqTemplateI=JSON.parse(reqTmplText)

rqTpl.markupFieldLs= rqTpl.markupFieldLs.map(k=><MarkupFieldI>{fldNm:k.fldNm,fldVal:encodeURIComponent(k.fldVal)})

switch (rqTpl.templatePlace){
  case TemplPlaceE.Url:{
    // rqTpl.req.url
    MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,rqTpl.req.url)
    break;
  }
  case TemplPlaceE.ReqHeader:{
    const tupleLs:[string,string][]=Object.entries(rqTpl.req.headers).map(([key,val],idx)=>{
      const newKey:string=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,key)
      const newVal:string=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,val)
      return [newKey,newVal]
    })

    //重新构造headers
    rqTpl.req.headers=<DP.Protocol.Network.Headers>{}
    tupleLs.forEach(([key,val],idx)=>{
      rqTpl.req.headers[key]=val
    })

    break;
  }
  case TemplPlaceE.Body:{
    rqTpl.req.postData=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,rqTpl.req.postData)
    break;
  }
}

const constentType:string=rqTpl.req.headers["Content-Type"].split(";")[0]

switch (rqTpl.req.method){
  case "POST":{
    // RequestNS.post()
    switch (constentType){
      case "application/x-www-form-urlencoded":{
        RequestNS.post(
          {url:rqTpl.req.url,
            body:rqTpl.req.postData,
            headers:rqTpl.req.headers
          },
          judgeResult)
        break
      }
    }
    break
  }
  case "GET":{
    break
  }
}


function judgeResult(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
    console.log("执行gitee导入仓库成功")
    process.exit(0)
  }else{
    console.log(body)
    console.log(error)
    console.log("执行gitee导入仓库失败")
    process.exit(5)
  }
}
const _end:boolean=true

