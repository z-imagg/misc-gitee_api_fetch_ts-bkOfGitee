import fs from "fs";
import {MarkupFieldI} from "./req_tmpl_t.js";

// const urlList:string[]=[
//   "https://gitee.com/tmpOrg/projects"
// ];

const giteeAccount=JSON.parse(fs.readFileSync("gitee_account.json","utf8"))
const giteeUserName=giteeAccount["user"];
const giteePwd=giteeAccount["pass"];

//gitee登录页面url
export const giteeLoginPageUrl="https://gitee.com/login";
//gitee登录页面中"登录"按钮的css选择器，  firefox开发者工具   人工获得
// const loginBtnCssSelector="div.field:nth-child(4) > input:nth-child(1)";
const loginPageMsg="【gitee登录页面】已填充用户名、密码， "
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
export const js_fillUserPass=`
document.getElementById("user_login").value="${giteeUserName}";
document.getElementById("user_password").value="${giteePwd}";
document.title="${loginPageMsg}"+document.title;
`


//gitee导入页面url
export const giteeImportPageUrl="https://gitee.com/projects/import/url";
export const project_import_url = "https://github.com/intel/ARM_NEON_2_x86_SSE.git"
export const nowMs:number = Date.now();
export const markupPrjName = `markupPrjName----intel--ARM_NEON_2_x86_SSE__${nowMs}`
const markupOrgName = "markup-organization-9473" ; //mirrr
const markupPrjPath = `markupPrjPath----intel--ARM_NEON_2_x86_SSE__${nowMs}`
const markupPrjDesc = `markupPrjDesc----intel--ARM_NEON_2_x86_SSE__${nowMs}`

export const markupFieldLs:MarkupFieldI[]=[]
markupFieldLs.push(<MarkupFieldI>{fldNm:"project_import_url",fldVal:project_import_url})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markupPrjName",fldVal:markupPrjName})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markupOrgName",fldVal:markupOrgName})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markupPrjPath",fldVal:markupPrjPath})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markupPrjDesc",fldVal:markupPrjDesc})


const importPageMsg="【已填充标记字段】"
export const js_fillMarkupGoalRepo=`
document.title="${importPageMsg}"+document.title;
document.getElementById("project_import_url").value="${project_import_url}";
document.getElementById("project_name").value="${markupPrjName}";
document.querySelector('.scrolling > div[data-value="${markupOrgName}"]').click() //点击下拉列表中具有给定组织名的元素
document.getElementById("project_path").value="${markupPrjPath}";
document.getElementById("project_description").value="${markupPrjDesc}";
document.getElementById("submit-project-new").click();
`
//gitee账户页面url .  作为 登录判定依据 的 账户页面   的 url 故意且必须 和  正常进入 账户页面 不同 以 区分
export const accInfoPgUrl="https://gitee.com/profile/account_information?different_to_normal=AvoidNoise";
