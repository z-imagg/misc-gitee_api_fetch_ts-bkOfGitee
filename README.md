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

```shell
npm init
npm install   chrome-remote-interface
npm install -D  @types/chrome-remote-interface

/app/chrome-linux/chrome --remote-debugging-port=9222
node ./main.js

```


https://github.com/fate0/pychrome
