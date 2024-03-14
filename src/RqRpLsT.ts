import * as DP from "devtools-protocol";
import {ReqWrapT, RespHdWrapT} from "./RqRpWrapT.js";

export const reqLs: Map<DP.Protocol.Network.RequestId, ReqWrapT[]> = new Map();
export const respHdLs: Map<DP.Protocol.Network.RequestId, RespHdWrapT[]> = new Map();

export function pushReq(redirectResp: DP.Protocol.Network.Response, reqId: DP.Protocol.Network.RequestId, req: DP.Protocol.Network.Request) {
  let ls: ReqWrapT[] = reqLs.get(reqId)
  if (ls == null) {
    reqLs.set(reqId, []);
    ls = reqLs.get(reqId)
  }
  ls.push(new ReqWrapT(redirectResp, reqId, req))
}
