const fs = require('fs')
const ytdl = require('ytdl-core')
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ').pipe(fs.createWriteStream('video.mp4'));

// fs.createWriteStream('video.mp4')

// let num = 10; // 举例，要转换的数字  
// let binaryString = num.toString(2); // toString方法的第二个参数为2，表示转换为二进制形式  
// console.log(binaryString); // 输出结果为 "1010"
