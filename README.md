```shell
node  --version #v18.19.1
npm --version #10.5.0
yarn --version #1.22.21
pnpm --version #8.15.4
yrm --version #1.0.6
```

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
npm install readline-sync

#已经在main.js中启动了chrome, 无需外部启动chrome
#/app/chrome-linux/chrome --disable-gpu --no-sandbox --remote-debugging-port=9222

npm run clean; npm run build; npm run start

```


https://github.com/fate0/pychrome
