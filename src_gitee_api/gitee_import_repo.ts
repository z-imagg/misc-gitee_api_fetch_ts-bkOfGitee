import {MarkupFieldI, ReqTemplateI, TemplPlaceE} from "../src/req_tmpl_t.js";
import {reqTemplDir} from "../src/my_cfg.js";
import {readdirSync, readFileSync} from "fs";
import {MarkupFieldUtilC} from "./MarkupFieldUtil.js";

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
<MarkupFieldI>{fldNm:"project_import_url",fldVal:from_repoUrl},
<MarkupFieldI>{fldNm:"markupPrjName",fldVal:goal_OrgName},
<MarkupFieldI>{fldNm:"markupOrgName",fldVal:goal_repoName},
<MarkupFieldI>{fldNm:"markupPrjPath",fldVal:goal_repoPath},
<MarkupFieldI>{fldNm:"markupPrjDesc",fldVal:goal_repoDesc}
]


const reqTmplFN:string=reqTmplFNLs[0]
const reqTmplFP:string=`${reqTemplDir}/${reqTmplFN}`
const reqTmplText:string= readFileSync(reqTmplFP).toString()
const rqTpl:ReqTemplateI=JSON.parse(reqTmplText)

MarkupFieldUtilC.assign_(rqTpl.markupFieldLs,newFieldLs)

switch (rqTpl.templatePlace){
  case TemplPlaceE.Url:{
    // rqTpl.req.url
    break;
  }
  case TemplPlaceE.ReqHeader:{
    break;
  }
  case TemplPlaceE.Body:{
    break;
  }
}

const _end:boolean=true

