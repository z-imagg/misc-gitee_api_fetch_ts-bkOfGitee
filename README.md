

## 本仓库功能描述

**chrome-remote-interface控制chrome浏览器获得gitee导入仓库接口请求模板**

chrome-remote-interface启动chrome浏览器；
由请求、响应回调构造请求链条， 请求链条中尝试发现http302重定向;
打开gitee的账户信息页面，请求链条中若有重定向，则判定为已登录，否则未登录；
若未登录，则打开gitee登录页面，由js填写配置的用户名、密码，由人工点击登录按钮，因为点击登录后可能有验证码识别；
打开gitee导入仓库页面，由js填写各标记字段，生成gitee导入仓库接口的请求例子（请求例子作为请求模板）

## 一些脚本

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
