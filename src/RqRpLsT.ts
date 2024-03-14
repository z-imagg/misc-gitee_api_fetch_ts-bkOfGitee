import * as DP from "devtools-protocol";
import {ReqWrapT, RespHdWrapT} from "./RqRpWrapT.js";

export const reqLs: Map<DP.Protocol.Network.RequestId, ReqWrapT[]> = new Map();
export const respHdLs: Map<DP.Protocol.Network.RequestId, RespHdWrapT[]> = new Map();
