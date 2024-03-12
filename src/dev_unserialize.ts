import {readFileSync} from 'fs'

import serialize from "node-serialize"

const buffer: NodeJS.TypedArray=readFileSync("postDataF")
const postData_Buf:Buffer=serialize.unserialize(buffer)
console.log(postData_Buf.toString())
