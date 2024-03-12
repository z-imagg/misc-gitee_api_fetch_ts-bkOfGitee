```shell
npm install

#rm -fr build
npm run clean

#编译 , src/*.ts --> build/src/*.js
npm run build  

```
webstorm打开本项目，可以直接调试js文件 ./build/src/main.js

```shell
#运行
npm run start

```

https://www.npmjs.com/package/@types/chrome-remote-interface/v/0.31.14  ,  Wed, 22 Nov 2023 00:24:48 GMT

https://www.npmjs.com/package/chrome-remote-interface/v/0.32.2 , https://github.com/cyrus-and/chrome-remote-interface/releases/tag/v0.32.2 ,  Apr 13, 2023


```shell
npm init
npm install   chrome-remote-interface@0.32.2
npm install -D  @types/chrome-remote-interface@0.31.14

/app/chrome-linux/chrome --remote-debugging-port=9222
node ./main.js

```


https://github.com/fate0/pychrome
