import {MarkupFieldI, MarkupFldNmTyp} from "../src/req_tmpl_t.js";

export class MarkupFieldUtilC{

  static toDct(fldLs: MarkupFieldI[]){
    const tupleLs=fldLs.map(k=>[k.fldNm,k])
    const dct:Map<MarkupFldNmTyp,MarkupFieldI>=new Map(tupleLs)
    return dct
  }
  static assign_(fromFldLs: MarkupFieldI[], toFldLs: MarkupFieldI[]){
    const frmDct=MarkupFieldUtilC.toDct(fromFldLs)
    toFldLs.forEach(k=>{
      k.fldVal = frmDct.get(k.fldNm).fldVal
    })
  }
}
