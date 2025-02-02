import {MarkupFieldI, ReqTemplateI, TemplPlaceE} from "../src/req_tmpl_t.cjs";
import {reqTemplDir} from "../src/my_cfg.cjs";
import {readdirSync, readFileSync, writeFileSync} from "fs";
import {MarkupFieldUtilC} from "./MarkupFieldUtil.cjs";


import * as DP from "devtools-protocol";
import axios,{ AxiosRequestConfig, AxiosResponse, AxiosStatic} from "axios";

import {Command} from "commander"
import {siteBaseUrl} from "../src/site_gitee_cfg.cjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import assert from "assert";


async function MyMain(){

  const program = new Command("【导入github仓库到gitee（基于gitee页面导入url的请求标记例子）】gitee_import_repo.cts")

  program
    .requiredOption("-f --from_repo <from_repo>","【来源，仓库地址,常为github仓库地址】" )  //"https://github.com/request/request.git",  0 from_repo markup_project_import_url
    .requiredOption("-o, --goal_org <goal_org>","【目标，gitee的组织】")  //"mirrr",  1 goal_org markup_project_namespace_path
    .requiredOption("-r, --goal_repoPath <goal_repoPath>","【目标，gitee仓库路径】")  //"repo01Path", 2 goal_repoPath markup_project_path
    .requiredOption("-n, --goal_repoName <goal_repoName>","【目标，gitee仓库名字】")  //"repo01Name", 3 goal_repoName markup_project_name
    .requiredOption("-d, --goal_repoDesc <goal_repoDesc>","【目标，gitee仓库描述】")  //"仓库描述", 4 goal_repoDesc markup_project_description
    .option("-w, --write_return <write_return>","【函数返回结果写入该文件】")

  program.parse()
  const options = program.opts()

  const markup_project_import_url:string=options.from_repo // 0
  const markup_project_namespace_path:string=options.goal_org // 1
  const markup_project_path:string=options.goal_repoPath // 2
  const markup_project_name:string=options.goal_repoName // 3
  const markup_project_description:string=options.goal_repoDesc // 4
  let returnFp:string=options.write_return // 5
  if(!returnFp){
    returnFp=`write_return.${Date.now()}.json`
  }

  console.log(`【命令行参数打印】 ${markup_project_import_url}, ${markup_project_namespace_path}, ${markup_project_path}, ${markup_project_name}, ${markup_project_description}`)


  const simpleResp:SimpleRespI = await GiteeImportRepoF(markup_project_import_url,markup_project_namespace_path,markup_project_path,markup_project_name,markup_project_description)

  writeFileSync(returnFp,JSON.stringify(simpleResp))
  return simpleResp;

}

interface SimpleRespI{
  url:string
  reqBody:string
  reqHeaders:string
  respStatus:number
  respBody:string
  respHeaders:string
  goal_repoUrl:string
}

async function GiteeImportRepoF(markup_project_import_url:string,markup_project_namespace_path:string,markup_project_path:string,markup_project_name:string,markup_project_description:string):Promise<SimpleRespI>{
  const exitCode_1:number=21
  const errMsg_1:string=`【错误】【退出代码${exitCode_1}】目录【${reqTemplDir}】下没有已markup的请求例子，请你先执行脚本script/gen_gitee_import_repo_req_template.sh以生成请求例子`

//变量axios的类型是AxiosStatic; axios这个名字普通了，换个名字叫axiosInst
  const axiosInst:AxiosStatic=axios;

  const reqTmplFNLs:string[]=readdirSync(`${reqTemplDir}`)
  assert(reqTmplFNLs.length>0, `ASSERT00 ${errMsg_1}`)



  const newFieldLs: MarkupFieldI[]=[
     {fldNm:"markup_project_import_url",fldVal:encodeURIComponent(markup_project_import_url) } as MarkupFieldI,
     {fldNm:"markup_project_namespace_path",fldVal:encodeURIComponent(markup_project_namespace_path)} as MarkupFieldI,
     {fldNm:"markup_project_path",fldVal:encodeURIComponent(markup_project_path)} as MarkupFieldI,
     {fldNm:"markup_project_name",fldVal:encodeURIComponent(markup_project_name)} as MarkupFieldI,
     {fldNm:"markup_project_description",fldVal:encodeURIComponent(markup_project_description)} as MarkupFieldI
  ]


  const reqTmplFN:string=reqTmplFNLs[0]
  const reqTmplFP:string=`${reqTemplDir}/${reqTmplFN}`
  const reqTmplText:string= readFileSync(reqTmplFP).toString()
  const rqTpl:ReqTemplateI=JSON.parse(reqTmplText)

  rqTpl.markupFieldLs= rqTpl.markupFieldLs.map(k=> ({fldNm:k.fldNm,fldVal:encodeURIComponent(k.fldVal)} as MarkupFieldI))

  rqTpl.templatePlaceS.forEach(templatePlace=>{
  switch (templatePlace){
    case TemplPlaceE.Url:{
      // rqTpl.req.url
      rqTpl.req.url=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,rqTpl.req.url)
      break;
    }
    case TemplPlaceE.ReqHeader:{
      const tupleLs:[string,string][]=Object.entries(rqTpl.req.headers).map(([key,val],idx)=>{
        const newKey:string=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,key)
        const newVal:string=MarkupFieldUtilC.assign_L2R(rqTpl.markupFieldLs,newFieldLs,val)
        return [newKey,newVal]
      })

      //重新构造headers
      rqTpl.req.headers= {} as DP.Protocol.Network.Headers
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
  })


  const Cookie:string=Array.from(rqTpl.thisSiteCookies).map(ck=>`${ck.name}=${ck.value}`).join("; ")
  rqTpl.req.headers['Cookie']=Cookie
  console.log(`rqTpl.req.postData【${rqTpl.req.postData}】`)

  const resp:AxiosResponse = await axiosInst( {
    url:rqTpl.req.url,
    method:rqTpl.req.method,
    data:rqTpl.req.postData,
    headers:rqTpl.req.headers,
  } as AxiosRequestConfig)

//理论上 目标gitee完整仓库地址 应该从请求响应中解析，这里偷懒了，直接用常识 组装目的gitee完整仓库地址
  const goal_repoUrl:string = `${siteBaseUrl}/${markup_project_namespace_path}/${markup_project_path}.git`
//组装结果消息
  const ok_msg:string = `${markup_project_import_url}  --->   ${goal_repoUrl}`
  const failed_msg:string = `${markup_project_import_url}  --->   xxx`

  if (resp.status == 200) {
    console.log(resp.data)
    console.log(`执行gitee导入仓库成功， http响应码【${resp.status}】 【${ok_msg}】`)
  }else{
    console.log(resp.data)
    console.log(`执行gitee导入仓库失败， http响应码【${resp.status}】 【${failed_msg}】`)
  }

  const simpleReqResp:SimpleRespI= {
    url:rqTpl.req.url,
    reqBody:rqTpl.req.postData,
    reqHeaders:JSON.stringify(rqTpl.req.headers),
    respStatus:resp.status,
    respBody:resp.data,
    respHeaders:JSON.stringify(resp.headers),
    goal_repoUrl:goal_repoUrl
  } as SimpleRespI

  return simpleReqResp;

}


if (require.main==module){
  MyMain().then(
    (simpleRespI:SimpleRespI)=>{
    //调用成功打印
    },
    (_)=>{
    // 调用失败打印
    }
  )
}
const _end:boolean=true

