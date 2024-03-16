import * as DP from "devtools-protocol";

export class ReqWrapT {

  redirectResp: DP.Protocol.Network.Response;
  reqId: DP.Protocol.Network.RequestId;

  req: DP.Protocol.Network.Request;


  // 构造函数
  constructor(redirectResp: DP.Protocol.Network.Response, reqId: DP.Protocol.Network.RequestId, req: DP.Protocol.Network.Request) {
    this.redirectResp = redirectResp
    this.reqId = reqId
    this.req = req
  }

}

export class RespHdWrapT {

  reqId: DP.Protocol.Network.RequestId;
  statusCode: number
  respHd: DP.Protocol.Network.Headers;


  // 构造函数
  constructor(reqId: DP.Protocol.Network.RequestId, statusCode: number, respHd: DP.Protocol.Network.Headers) {
    this.reqId = reqId
    this.statusCode = statusCode
    this.respHd = respHd
  }


}
