

## 本仓库功能描述

**chrome-remote-interface控制chrome浏览器获得gitee导入仓库接口请求模板**

实现过程步骤描述：

1. [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface.git)启动chrome浏览器；

2. 由请求、响应回调构造请求链条， 请求链条中尝试发现http302重定向;

3. 打开gitee的账户信息页面，请求链条中若有重定向，则判定为已登录，否则未登录；

4. 若未登录，则打开gitee登录页面，由js填写配置的用户名、密码，由人工点击登录按钮，因为点击登录后可能有验证码识别；

5. 打开gitee导入仓库页面，由js填写各标记字段，生成gitee导入仓库接口的请求例子（请求例子作为请求模板）

## 使用手册

### 一、生成请求模板(gitee导入给定url仓库 请求 模板）

####  1. 填写gitee账户
```cp gitee_account.json.template  gitee_account.json```, 按照格式填写 你的gitee账户 到配置文件 gitee_account.json

####  2. 填写gitee组织

修改 [site_gitee_cfg.ts](http://giteaz:3000/msic/node-typescript-boilerplate/src/branch/main/src/site_gitee_cfg.ts) 中以下变量markupOrgName的值为你的gitee组织
```javascript
const markupOrgName = "markup-organization-9473" ; //mirrr
```

#### 3. 修改本机中chrome可执行程序路径

修改 [my_cfg.ts](http://giteaz:3000/msic/node-typescript-boilerplate/src/branch/main/src/my_cfg.ts) 中```chromePath```为 本机chrome可执行程序路径


#### 4. 执行脚本生成gitee 导入仓库接口 的请求模板

```bash -x script/gen_gitee_import_repo_req_template.sh```

该脚本会启动chrome浏览器，

只有在gitee登录页面  需要人工点击 浏览器页面上的登录按钮，因为 点击登录按钮后可能有验证码识别，

其余是动作是chrome-remote-interface直接驱动chrome或对chrome执行js脚本完成的，不需要人工操作浏览器

假设 本步骤产生的结果文件 名为   ```./reqTemplate/x.json```

#### 5. 使用 请求模板（带有标记值字段的请求 即 请求模板）

[步骤4](giteaz:3000/msic/node-typescript-boilerplate#4-执行脚本生成gitee-导入仓库接口-的请求模板) 产生的结果文件```./reqTemplate/x.json```举例: [doc/example_pretty_json_for_human_read.json](http://giteaz:3000/msic/node-typescript-boilerplate/src/branch/main/doc/example_pretty_json_for_human_read.json)

##### 5.1. 解释 请求模板
该结果文件```./reqTemplate/x.json``` 即  带有标记markup值字段的请求 即 请求模板


##### 5.2. 可忽略字段

忽略 "nowMs", 此项目定义的

忽略 "hasPostData" "mixedContentType" "initialPriority" "referrerPolicy" "isSameSite"  "postDataEntries"

[devtools-protocol/types/protocol.d.ts](https://github.com/ChromeDevTools/devtools-protocol/blob/master/types/protocol.d.ts)

忽略字段postDataEntries 的原因是 字段postDataEntries==base64(postData)

##### 5.3. 解释 "templatePlace"、"markupFieldLs"

字段"templatePlace"定义为 [req_tmpl_t.ts](giteaz:3000/msic/node-typescript-boilerplate/src/branch/main/src/req_tmpl_t.ts)下的枚举TemplPlaceE

字段"templatePlace"描述了 "markupFieldLs"的标记值们 作用到哪
```js
//来自  http://giteaz:3000/msic/node-typescript-boilerplate/src/branch/main/src/req_tmpl_t.ts
export enum TemplPlaceE {
  ReqHeader = 0, // "markupFieldLs"的标记值 在 ./reqTemplate/x.json:/"req"/"headers"
  Url = 1, // "markupFieldLs"的标记值 在 ./reqTemplate/x.json:/"req"/"url"
  Body = 2 // "markupFieldLs"的标记值 在 ./reqTemplate/x.json:/"req"/"postData"
}

```

##### 5.4. 使用方法

1. 将其中"markupFieldLs"描述的各字段值替换 成 目标字段值（比如 来源gitee组织、目标github仓库 等）， 

2. 替换后json转换为请求执行

3. 执行该请求 即可将目标github仓库导入进给定的gitee组织


### 二、调用导入接口( 基于 以上 gitee导入给定url仓库 请求模板）

```shell
#导入github仓库到gitee
export PATH=/fridaAnlzAp/github-gitee-gitea/gitee_api_fetch_ts/script:$PATH

#生成bash命令import_githubRepo_to_gitee.sh的提示
source script/bash-complete--import_githubRepo_to_gitee.sh

import_githubRepo_to_gitee.sh --help

import_githubRepo_to_gitee.sh --两次tab 即有命令提示

```


## 开发时候用的 

1. 环境
```shell
cat /etc/issue #Ubuntu 22.04.4 LTS \n \l
node  --version #v18.19.1
npm --version #10.5.0
yarn --version #1.22.21
pnpm --version #8.15.4
yrm --version #1.0.6
```

2. npm安装依赖 ```npm install```
```shell
npm install

#rm -fr build
npm run clean

#编译 , src/*.ts --> build/src/*.js
npm run build  

```

开发过程中安装依赖所用命令:
```shell
npm install   chrome-remote-interface
npm install -D  @types/chrome-remote-interface
npm install readline-sync
```
注意这些依赖已经写入package.json中，
因此此时不需要这样，此时只需要执行面说的```npm install```即可按照package.json安装依赖，
这里只是记录一下，供给下次开发别的参考


3. 清理、编译、启动


已经在main.js中启动了chrome, 无需外部启动chrome

外部启动chrome: ```/app/chrome-linux/chrome --disable-gpu --no-sandbox --remote-debugging-port=9222```

```shell
#清理 ,即删除build目录
npm run clean
#编译，即调用tsc将src/**.ts转换为build/src/**.js
npm run build  
#启动，用node命令执行package.json中指定的入口文件(这里是main.js)
npm run start
```

解释 : ``` npm run xxx == npx `package.json/scripts/xxx`  ```


4. webstorm

webstorm打开本项目，可以直接调试js文件 ./build/src/main.js



5. 【不推荐】 fate0/pychrome : 有人以python3.5对chrome-remote-interface做的包装,

[fate0/pychrome](https://github.com/fate0/pychrome)

看其例子用法，只是借用了python3.5的async关键字来伪装nodejs的async关键字，

而且后来的python3.x(x是几？）已经废弃了python关键字async, 因此 不建议使用此包装

