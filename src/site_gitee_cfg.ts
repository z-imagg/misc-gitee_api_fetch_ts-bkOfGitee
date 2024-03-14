import fs from "fs";
import {MarkupFieldI} from "./req_tmpl_t.js";

// const urlList:string[]=[
//   "https://gitee.com/tmpOrg/projects"
// ];

const giteeAccount=JSON.parse(fs.readFileSync("gitee_account.json","utf8"))
const giteeUserName=giteeAccount["user"];
const giteePwd=giteeAccount["pass"];

export const siteBaseUrl="https://gitee.com";
//gitee登录页面url
export const giteeLoginPageUrl=`${siteBaseUrl}/login`; // "https://gitee.com/login"
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
export const giteeImportPageUrl=`${siteBaseUrl}/projects/import/url`; // "https://gitee.com/projects/import/url";
export const markup_project_import_url = "https://github.com/intel/ARM_NEON_2_x86_SSE.git"
export const nowMs:number = Date.now();
export const markup_project_name = `markup_project_name----intel--ARM_NEON_2_x86_SSE__${nowMs}`
const markup_project_namespace_path = "markup-organization-9473" ; //mirrr
const markup_project_path = `markup_project_path----intel--ARM_NEON_2_x86_SSE__${nowMs}`
const markup_project_description = `markup_project_description----intel--ARM_NEON_2_x86_SSE__${nowMs}`

export const markupFieldLs:MarkupFieldI[]=[]
markupFieldLs.push(<MarkupFieldI>{fldNm:"markup_project_import_url",fldVal:markup_project_import_url})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markup_project_name",fldVal:markup_project_name})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markup_project_namespace_path",fldVal:markup_project_namespace_path})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markup_project_path",fldVal:markup_project_path})
markupFieldLs.push(<MarkupFieldI>{fldNm:"markup_project_description",fldVal:markup_project_description})


const importPageMsg="【已填充标记字段】"
export const js_fillMarkupGoalRepo=`
document.title="${importPageMsg}"+document.title;
document.getElementById("project_import_url").value="${markup_project_import_url}";
document.getElementById("project_name").value="${markup_project_name}";
//document.getElementById("project_namespace_path").value="${markup_project_namespace_path}"; ///页面中此输入框并不带入请求中，但是请求中字段名字确实是project[namespace_path]
document.querySelector('.scrolling > div[data-value="${markup_project_namespace_path}"]').click() //点击下拉列表中具有给定组织名的元素
document.getElementById("project_path").value="${markup_project_path}";
document.getElementById("project_description").value="${markup_project_description}";
document.getElementById("submit-project-new").click();
`
//gitee账户页面url .  作为 登录判定依据 的 账户页面   的 url 故意且必须 和  正常进入 账户页面 不同 以 区分
export const accInfoPgUrl="https://gitee.com/profile/account_information?different_to_normal=AvoidNoise";
