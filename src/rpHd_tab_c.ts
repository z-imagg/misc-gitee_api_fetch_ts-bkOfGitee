import * as DP from "devtools-protocol";
import {RespHdWrapT} from "./rq_rp_wrap_t.js";

export class RpHdTabC {
  _rspHdDct: Map<DP.Protocol.Network.RequestId, RespHdWrapT[]>

  constructor(_respHdDct: Map<DP.Protocol.Network.RequestId, RespHdWrapT[]>) {
    this._rspHdDct = _respHdDct
  }

  pushRespHd(reqId: DP.Protocol.Network.RequestId, statusCode: number, respHd: DP.Protocol.Network.Headers) {
    let ls: RespHdWrapT[] = this._rspHdDct.get(reqId)
    if (ls == null) {
      this._rspHdDct.set(reqId, []);
      ls = this._rspHdDct.get(reqId)
    }
    ls.push(new RespHdWrapT(reqId, statusCode, respHd))
  }
}
