import * as DP from "devtools-protocol";

export enum TemplPlace {
  ReqHeader = 0,
  Url = 1,
  Body = 2
}

export interface MarkupField {
  fldNm: string,
  fldVal: string
}

export interface ReqTemplate {
  //当前毫秒数
  nowMs: number,
  //请求id
  reqId: DP.Protocol.Network.RequestId
  //请求
  req: DP.Protocol.Network.Request
  //模板位置（标记字段在请求中的部位）
  templatePlace: TemplPlace
  //标记字段们
  markupFieldLs: MarkupField[]
}
