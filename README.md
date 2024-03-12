```shell
npm install

#编译
npm run build  
#这个构建后的代码会在build/src目录下,  such as build/src/main.js
```
webstorm打开本项目，可以直接调试js文件 ./build/src/main.js

```shell
#运行
npm run start

```

```shell
npm init
npm install   chrome-remote-interface
npm install   @types/chrome-remote-interface

/app/chrome-linux/chrome --remote-debugging-port=9222
node ./main.js

```

