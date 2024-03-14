import {MarkupFieldI, MarkupFldNmTyp} from "../src/req_tmpl_t.js";

export class MarkupFieldUtilC{

  static toDct(fldLs: MarkupFieldI[]){
    const tupleLs=fldLs.map(k=>[k.fldNm,k])
    const dct:Map<MarkupFldNmTyp,MarkupFieldI>=new Map(tupleLs)
    return dct
  }
  static assign_L2R(markupFldLs: MarkupFieldI[], toFldLs: MarkupFieldI[], dorkingText:string){
    const markupDct=MarkupFieldUtilC.toDct(markupFldLs)
    toFldLs.forEach(k=>{
      dorkingText=dorkingText.replace(markupDct.get(k.fldNm).fldVal, k.fldVal)
    })
    return dorkingText
  }
}
