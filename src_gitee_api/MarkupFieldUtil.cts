import {MarkupFieldI, MarkupFldNmTyp} from "../src/req_tmpl_t.cjs";

export class MarkupFieldUtilC{

  static toDct(fldLs: MarkupFieldI[]){
    const dct:Map<MarkupFldNmTyp,MarkupFieldI>=new Map (fldLs.map((eleK,k)=>[ eleK.fldNm,eleK]))
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
