import {readFileSync} from "fs";
import {MarkupFieldI} from "./req_tmpl_t.cjs";

// const urlList:string[]=[
//   "https://gitee.com/tmpOrg/projects"
// ];

const giteeAccount=JSON.parse(readFileSync("gitee_account.json","utf8"))
const giteeUserName=giteeAccount["user"];
const giteePwd=giteeAccount["pass"];

export const siteBaseUrl="https://gitcode.com";
//gitee登录页面url
export const giteeLoginPageUrl=`${siteBaseUrl}`; // https://gitcode.com
//gitee登录页面中"登录"按钮的css选择器，  firefox开发者工具   人工获得
// const loginBtnCssSelector="div.field:nth-child(4) > input:nth-child(1)";
const loginPageMsg="【gitee登录页面】已填充用户名、密码， "
//gitee登录页面中填写用户名、填写密码的js语句，  firefox开发者工具   人工获得
export const js_fillUserPass=`
document.getElementsByClassName("button-content")[0].click()
var loginUi=document.getElementsByClassName("devui-input__inner");
loginUi[0].value="${giteeUserName}"
loginUi[1].value="${giteePwd}"
document.title="${loginPageMsg}"+document.title;
//document.getElementsByClassName("button-content")[5].click() ; //不用 js点击登录按钮，这里要求人工点击登录按钮
`


//gitee导入页面url
export const giteeImportPageUrl=`${siteBaseUrl}/create/import`; // "https://gitcode.com/create/import";
export const markup_project_import_url = "https://github.com/intel/ARM_NEON_2_x86_SSE.git"
export const nowMs:number = Date.now();
export const markup_project_name = `markup_project_name----intel--ARM_NEON_2_x86_SSE__${nowMs}`
export const markup_project_namespace_path = "markup-organization-9473" ; //mirrr
export const markup_project_path = `markup_project_path----intel--ARM_NEON_2_x86_SSE__${nowMs}`
export const markup_project_description = `markup_project_description----intel--ARM_NEON_2_x86_SSE__${nowMs}`

export const markupFieldLs:MarkupFieldI[]=[]
markupFieldLs.push( {fldNm:"markup_project_import_url",fldVal:markup_project_import_url} as MarkupFieldI)
markupFieldLs.push( {fldNm:"markup_project_name",fldVal:markup_project_name} as MarkupFieldI)
markupFieldLs.push( {fldNm:"markup_project_namespace_path",fldVal:markup_project_namespace_path} as MarkupFieldI)
markupFieldLs.push( {fldNm:"markup_project_path",fldVal:markup_project_path} as MarkupFieldI)
markupFieldLs.push( {fldNm:"markup_project_description",fldVal:markup_project_description} as MarkupFieldI)


const importPageMsg="【已填充标记字段】"
export const js_fillMarkupGoalRepo=`
var btnS=document.getElementsByClassName("devui-input__inner")

btnS[0].value="${markup_project_import_url}"; //项目url
btnS[1].value="${markup_project_name}"; //项目名称
document.getElementsByClassName("devui-editable-select-input__inner")[0].value="${markup_project_namespace_path}";  //项目路径.组织名
btnS[2].value="${markup_project_path}"; //项目路径.仓库名
document.getElementsByClassName("devui-textarea")[0].value="${markup_project_description}"; //项目描述
document.getElementsByClassName("devui-radio__label")[0].click(); // 公开按钮
document.getElementById("devui-checkbox__label-text")[0].click(); // 公开项目需知
// document.getElementById("button-content")[3].click(); // 导入 按钮
document.title="${importPageMsg}"+document.title;
`
//gitee账户页面url .  作为 登录判定依据 的 账户页面   的 url 故意且必须 和  正常进入 账户页面 不同 以 区分
export const accInfoPgUrl=`${siteBaseUrl}/setting/account?different_to_normal=AvoidNoise`;// https://gitcode.com/setting/account?different_to_normal=AvoidNoise
