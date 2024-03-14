import * as DP from "devtools-protocol";

export enum TemplPlaceE {
  ReqHeader = 0,
  Url = 1,
  Body = 2
}

export interface MarkupFieldI {
  fldNm: string,
  fldVal: string
}

export interface ReqTemplateI {
  //当前毫秒数
  nowMs: number,
  //请求id
  reqId: DP.Protocol.Network.RequestId
  //请求
  req: DP.Protocol.Network.Request
  //登录gitee后，gitee.com在浏览器中的所有cookies
  thisSiteCookies:DP.Protocol.Network.Cookie[]

  //模板位置（标记字段在请求中的部位）
  templatePlace: TemplPlaceE
  //标记字段们
  markupFieldLs: MarkupFieldI[]
}
