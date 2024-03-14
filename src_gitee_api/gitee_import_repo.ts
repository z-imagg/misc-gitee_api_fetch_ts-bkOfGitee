
import {ReqTemplateI} from "../src/req_tmpl_t.js";
import {reqTemplDir} from "../src/my_cfg.js";
import {readdirSync} from "fs";
import {readFileSync} from "fs";

const exitCode_1:number=20
const errMsg_1:string=`【错误】【退出代码${exitCode_1}】目录【${reqTemplDir}】下没有已markup的请求例子，请你先执行脚本gen_gitee_import_repo_req_template.sh以生成请求例子`

const reqTmplFNLs:string[]=readdirSync(`${reqTemplDir}`)
if(reqTmplFNLs.length<=0){
  console.log(errMsg_1)
  process.exit(exitCode_1)
}

const reqTmplFN:string=reqTmplFNLs[0]
const reqTmplFP:string=`${reqTemplDir}/${reqTmplFN}`
const reqTmplText:string= readFileSync(reqTmplFP).toString()
const reqTmpl:ReqTemplateI=JSON.parse(reqTmplText)
const _end:boolean=true

