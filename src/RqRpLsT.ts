import * as DP from "devtools-protocol";
import {ReqWrapT} from "./RqRpWrapT.js";

export const reqLs: Map<DP.Protocol.Network.RequestId, ReqWrapT[]> = new Map();
