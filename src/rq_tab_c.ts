import * as DP from "devtools-protocol";
import {ReqWrapT} from "./rq_rp_wrap_t.js";

export class RqTab {
  _rqDct: Map<DP.Protocol.Network.RequestId, ReqWrapT[]>

  constructor(_reqDict: Map<DP.Protocol.Network.RequestId, ReqWrapT[]>) {
    this._rqDct = _reqDict
  }

  pushReq(redirectResp: DP.Protocol.Network.Response, reqId: DP.Protocol.Network.RequestId, req: DP.Protocol.Network.Request) {
    let ls: ReqWrapT[] = this._rqDct.get(reqId)
    if (ls == null) {
      this._rqDct.set(reqId, []);
      ls = this._rqDct.get(reqId)
    }
    ls.push(new ReqWrapT(redirectResp, reqId, req))
  }

  reqLs_has(reqId: DP.Protocol.Network.RequestId) {
    const ls: ReqWrapT[] = this._rqDct.get(reqId)
    const empty: boolean = (ls == null || ls.length == 0)
    return !empty;
  }

  __reqLs_get_req_url_any_startWith(reqId: DP.Protocol.Network.RequestId, urlPrefix: string) {
    const ls: ReqWrapT[] = this._rqDct.get(reqId)
    const empty: boolean = (ls == null || ls.length == 0)
    if (!empty) {
      return ls.filter(k => k.req.url.startsWith(urlPrefix)).length > 0
    }
    return false;
  }

  __reqLs_get_req_urlLsJoin(reqId: DP.Protocol.Network.RequestId) {
    const ls: ReqWrapT[] = this._rqDct.get(reqId)
    const empty: boolean = (ls == null || ls.length == 0)
    if (!empty) {
      return ls.map(k => k.req.url).join(",")
    }
    return "";
  }


}
