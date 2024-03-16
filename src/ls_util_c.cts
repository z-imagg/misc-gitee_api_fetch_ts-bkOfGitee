
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

export class StrIncludeUtil{
  static includeAny(longStr:string,shortLs:string[]):boolean{
    if(longStr==null || longStr.length==0 || shortLs==null||shortLs.length==0){
      return false
    }
    for( const shortStr in shortLs){
        if (longStr.includes(shortStr)){
          return true;
        }
    }
    return false;
  }
}