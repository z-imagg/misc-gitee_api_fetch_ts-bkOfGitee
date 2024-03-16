import * as DP from "devtools-protocol";
import axios,{ AxiosRequestConfig, AxiosResponse, AxiosStatic} from "axios";

export function dpHeaders2map(headers:DP.Protocol.Network.Headers):Map<string,string>{
    const dct:Map<string,string>=new Map<string,string>(
        Object.entries(headers)
            .map(
                ([k,v],i)=>[k,v]
            )
    )
    return dct

}
