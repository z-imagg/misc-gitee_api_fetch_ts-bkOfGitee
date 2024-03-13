

## 本仓库功能描述

**chrome-remote-interface控制chrome浏览器获得gitee导入仓库接口请求模板**

chrome-remote-interface启动chrome浏览器；
由请求、响应回调构造请求链条， 请求链条中尝试发现http302重定向;
打开gitee的账户信息页面，请求链条中若有重定向，则判定为已登录，否则未登录；
若未登录，则打开gitee登录页面，由js填写配置的用户名、密码，由人工点击登录按钮，因为点击登录后可能有验证码识别；
打开gitee导入仓库页面，由js填写各标记字段，生成gitee导入仓库接口的请求例子（请求例子作为请求模板）

## 使用手册

####  1. 填写gitee账户
```cp gitee_account.json.template  gitee_account.json```, 按照格式填写 你的gitee账户 到配置文件 gitee_account.json

####  2. 填写gitee组织

修改main.ts中以下变量markupOrgName的值为你的gitee组织
```javascript
const markupOrgName = "markup-organization-9473" ; //mirrr
```

#### 3. 修改本机中chrome可执行程序路径

修改```src/main.ts```中```chromePath```为 本机chrome可执行程序路径


#### 4. 执行脚本生成gitee 导入仓库接口 的请求模板

```gen_gitee_import_repo_req_template.sh```

该脚本会启动chrome浏览器，

只有在gitee登录页面  需要人工点击 浏览器页面上的登录按钮，因为 点击登录按钮后可能有验证码识别，

其余是动作是chrome-remote-interface直接驱动chrome或对chrome执行js脚本完成的，不需要人工操作浏览器



## 开发时候用的 

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
