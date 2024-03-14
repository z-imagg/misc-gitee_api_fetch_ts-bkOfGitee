export class Test{
  zz:number
  constructor(arg:number) {
    this.zz=arg
  }
  func01(){
    console.log(`filed1:${this.zz}`)
  }
}

new Test(99).func01()
/*
npm run clean; npm run build; node build/src/test.js
#filed1:99
 */
