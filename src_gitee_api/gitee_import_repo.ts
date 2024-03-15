import {MarkupFieldI, ReqTemplateI, TemplPlaceE} from "../src/req_tmpl_t.js";
import {reqTemplDir} from "../src/my_cfg.js";
import {readdirSync, readFileSync} from "fs";
import {MarkupFieldUtilC} from "./MarkupFieldUtil.js";

import readlineSync from 'readline-sync'

import * as DP from "devtools-protocol";
import  RequestNS from "request";
import assert from "assert";
import {Command} from "commander"
import {siteBaseUrl} from "../src/site_gitee_cfg.js";

const program = new Command("【导入github仓库到gitee（基于gitee页面导入url的请求标记例子）】gitee_import_repo.ts")
const exitCode_1:number=21
const errMsg_1:string=`【错误】【退出代码${exitCode_1}】目录【${reqTemplDir}】下没有已markup的请求例子，请你先执行脚本script/gen_gitee_import_repo_req_template.sh以生成请求例子`
const exitCode_2:number=22
const errMsg_2:string=`【错误】【退出代码${exitCode_2}】命令用法为 me.js from_repoUrl goal_OrgName goal_repoName  goal_repoDesc`

const reqTmplFNLs:string[]=readdirSync(`${reqTemplDir}`)
if(reqTmplFNLs.length<=0){
  console.log(errMsg_1)
  process.exit(exitCode_1)
}

program
  .requiredOption("-f --from_repo <from_repo>","【来源，仓库地址,常为github仓库地址】" )  //"https://github.com/request/request.git",  0 from_repo markup_project_import_url
  .requiredOption("-o, --goal_org <goal_org>","【目标，gitee的组织】")  //"mirrr",  1 goal_org markup_project_namespace_path
  .requiredOption("-r, --goal_repoPath <goal_repoPath>","【目标，gitee仓库路径】")  //"repo01Path", 2 goal_repoPath markup_project_path
  .requiredOption("-n, --goal_repoName <goal_repoName>","【目标，gitee仓库名字】")  //"repo01Name", 3 goal_repoName markup_project_name
  .requiredOption("-d, --goal_repoDesc <goal_repoDesc>","【目标，gitee仓库描述】")  //"仓库描述", 4 goal_repoDesc markup_project_description

program.parse()
const options = program.opts()

const markup_project_import_url:string=options.from_repo // 0
const markup_project_namespace_path:string=options.goal_org // 1
const markup_project_path:string=options.goal_repoPath // 2
const markup_project_name:string=options.goal_repoName // 3
const markup_project_description:string=options.goal_repoDesc // 4

console.log(`【命令行参数打印】${options},${markup_project_import_url}, ${markup_project_namespace_path}, ${markup_project_path}, ${markup_project_name}, ${markup_project_description}`)

const newFieldLs: MarkupFieldI[]=[
<MarkupFieldI>{fldNm:"markup_project_import_url",fldVal:encodeURIComponent(markup_project_import_url) },
<MarkupFieldI>{fldNm:"markup_project_namespace_path",fldVal:encodeURIComponent(markup_project_namespace_path)},
<MarkupFieldI>{fldNm:"markup_project_path",fldVal:encodeURIComponent(markup_project_path)},
<MarkupFieldI>{fldNm:"markup_project_name",fldVal:encodeURIComponent(markup_project_name)},
<MarkupFieldI>{fldNm:"markup_project_description",fldVal:encodeURIComponent(markup_project_description)}
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

const Cookie:string=Array.from(rqTpl.thisSiteCookies).map(ck=>`${ck.name}=${ck.value}`).join("; ")
rqTpl.req.headers['Cookie']=Cookie
console.log(`rqTpl.req.postData【${rqTpl.req.postData}】`)

switch (rqTpl.req.method){
  case "POST":{
    RequestNS.post(
      {url:rqTpl.req.url,
        body:rqTpl.req.postData,
        headers:rqTpl.req.headers
      },
      judgeResult)
    break
  }
  case "GET":{
    break
  }
}

//理论上 目标gitee完整仓库地址 应该从请求响应中解析，这里偷懒了，直接用常识 组装目的gitee完整仓库地址
const goal_repo:string = `${siteBaseUrl}/${markup_project_namespace_path}${markup_project_path}.git`
//组装结果消息
const ok_msg:string = `${options.from_repo}  --->   ${goal_repo}`
const failed_msg:string = `${options.from_repo}  --->   xxx`

function judgeResult(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
    console.log(`执行gitee导入仓库成功， http响应码【${response.statusCode}】【${ok_msg}】`)
    process.exit(0)
  }else{
    console.log(body)
    console.log(error)
    console.log(`执行gitee导入仓库失败， http响应码【${response.statusCode}】【${failed_msg}】`)
    process.exit(5)
  }
}
const _end:boolean=true

