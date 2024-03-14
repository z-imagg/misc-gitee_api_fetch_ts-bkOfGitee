
export class LsUtilC{
  static elem1<ElemTyp>(chain:ElemTyp[]){
    const empty:boolean=(chain==null||chain.length==0)
    return (!empty)?chain[0]:null;
  }
  static elem2<ElemTyp>(chain:ElemTyp[]){
    const lack:boolean=(chain==null||chain.length<2)
    return (!lack)?chain[1]:null;
  }

  static endElem<ElemTyp>(chain:ElemTyp[]){
    const endIdx:number=chain.length-1;
    return (endIdx>=0)?chain[endIdx]:null;
  }
}
