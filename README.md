
## 术语

- 【文件】 标记字段值 == 字段值 是 足够长的、不容易跟该文件中其他字符串相同的

- 【术语】 请求模板 == 一个正常请求， 其 业务字段值 是 标记字段值 ， 因此 只要 将 标记字段值 替换成 目标值， 该 请求文件 即成为 目标请求 了

## 适用场景

- 适用场景   ： 请求模板 方案 适用于 无 签名 的 请求

- 不适用场景 ： 请求模板 方案 在 有签名时 失效 ， 具体：

  
       当 请求 中 有 签名字段 时， 
       两个合法请求A、B  中 业务字段值 若 不同，   
       则 A、B签名不同，  导致 即使 将A的业务字段替换为B的 也无法获得B的合法签名，
       因此 此 请求模板 方案 在 有签名时 失效。

## 本仓库功能描述

**chrome-remote-interface控制chrome浏览器获得gitee导入仓库接口请求模板**

实现过程步骤描述：

1. [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface.git)启动chrome浏览器；

2. 由请求、响应回调构造请求链条， 请求链条中尝试发现http302重定向;

3. 打开gitee的账户信息页面，请求链条中若有重定向，则判定为已登录，否则未登录；

4. 若未登录，则打开gitee登录页面，由js填写配置的用户名、密码，由人工点击登录按钮，因为点击登录后可能有验证码识别；

5. 打开gitee导入仓库页面，由js填写各标记字段，生成gitee导入仓库接口的请求例子（请求例子作为请求模板）

## 使用手册

### gen-gitee_importRepo-ReqTemplate

**一、生成请求模板(gitee导入给定url仓库 请求 模板）**

####  1. 填写gitee账户
```cp gitee_account.json.template  gitee_account.json```, 按照格式填写 你的gitee账户 到配置文件 gitee_account.json

####  2. 填写gitee组织

修改 [src/site_gitee_cfg.cts](http://giteaz:3000/msic/gitee_api_fetch_ts/src/branch/main/src/site_gitee_cfg.cts) 中以下变量markupOrgName的值为你的gitee组织
```javascript
const markupOrgName = "markup-organization-9473" ; //mirrr
//不要修改其他变量
```

#### 3. 修改本机中chrome可执行程序路径

##### 3.1 下载chromium
[chromium/1280425,2024-03-30](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/1280425/)

[chromium/1280425,2024-03-30/chrome-linux.zip](https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F1280425%2Fchrome-linux.zip?generation=1711757130384856&alt=media)

```shell
unzip chrome-linux.zip -d /app/
/app/chrome-linux/chrome --version
# Chromium 125.0.6388.0 
```

##### 3.2 配置chromium路径
修改 [src/my_cfg.cts](http://giteaz:3000/msic/gitee_api_fetch_ts/src/branch/main/src/my_cfg.cts) 中```chromePath```为 本机chrome可执行程序路径```/app/chrome-linux/chrome```


#### 4. 执行脚本生成gitee 导入仓库接口 的请求模板

```bash -x script/gen_gitee_import_repo_req_template.sh``` 启动chrome浏览器， ```chrome-remote-interface```和人工操作混合 完成 获取请求模板


当需要人工操作时，按照该脚本在控制台打印的提示操作。具体过程如下：

###### 1. 脚本 以```chrome-remote-interface``` 打开chrome浏览器, 控制台提示等待按回车
###### 2. 人工 在控制台按回车
###### 3. 脚本 以```chrome-remote-interface``` 驱动chrome进入gitee.com登陆页面, 并填写好gitee用户名、密码, 控制台提示等待按回车
###### 4. 人工 在chrome页面 点击 登陆按钮, 并人工完成可能出现的验证码识别
###### 5. 脚本 以```chrome-remote-interface``` 进入gitee导入外部仓库页面, 对各字段填写标记值，执行导入，监控 url、请求、响应 ， 若监控到 标记值 则将该请求当成请求模板。 
      
       此时脚本已执行完成并已退出
      
###### 6. 人工 观察 控制台 打印的 监控到的请求模板们 ,   找到 并 保留 gitee导入仓库的请求模板 ， 删除其余无用请求模板

现在是西历2024年4月24日， gitee导入仓库的请求模板 特征如下 

```
【在url,发现标记请求地址】【https://gitee.com/markup-organization-9473/markup_project_path----intel--ARM_NEON_2_x86_SSE__1713933501288】
已写入请求例子（作为请求模板）文件 【./reqTemplate/9A65D9ABD4F7C28D9BE7FE027C3FDE39.json】
```   
    
```shell
#脚本 监控到的请求模板如下
ls reqTemplate/
# 21241.424.json	21241.429.json	21241.441.json	21241.442.json	21241.448.json	21241.459.json	21241.544.json	21241.561.json	21241.562.json	21241.563.json	9A65D9ABD4F7C28D9BE7FE027C3FDE39.json

#通过人工观察， 确认 并 保留 gitee导入仓库的请求模板 9A65D9ABD4F7C28D9BE7FE027C3FDE39.json
rm reqTemplate/!(9A65D9ABD4F7C28D9BE7FE027C3FDE39.json)

#确保目录reqTemplate下只有一个文件，因为接下时 只会从目录reqTemplate中读取第一个文件作为请求模板
ls -l reqTemplate/
#-rwxrwxrwx 1  5.5K    9A65D9ABD4F7C28D9BE7FE027C3FDE39.json

```


完整日志例子， http://giteaz:3000/misc/gitee_api_fetch_ts/src/branch/main/log.txt.d/gen_gitee_import_repo_req_template.sh-gitee-example.log

gitee导入仓库的请求模板 例子  , http://giteaz:3000/misc/gitee_api_fetch_ts/src/branch/main/log.txt.d/gitee_reqTemplate_importRepo_9A65D9ABD4F7C28D9BE7FE027C3FDE39.json

#### 5. 使用 请求模板（带有标记值字段的请求 即 请求模板）

[步骤4](giteaz:3000/msic/gitee_api_fetch_ts#4-执行脚本生成gitee-导入仓库接口-的请求模板) 产生的结果文件```./reqTemplate/x.json```举例: [doc/example_pretty_json_for_human_read.json](http://giteaz:3000/msic/gitee_api_fetch_ts/src/branch/main/doc/example_pretty_json_for_human_read.json)

##### 5.1. 解释 请求模板
该结果文件```./reqTemplate/x.json``` 即  带有标记markup值字段的请求 即 请求模板


##### 5.2. 可忽略字段

忽略 "nowMs", 此项目定义的

忽略 "hasPostData" "mixedContentType" "initialPriority" "referrerPolicy" "isSameSite"  "postDataEntries"

[devtools-protocol/types/protocol.d.ts](https://github.com/ChromeDevTools/devtools-protocol/blob/master/types/protocol.d.ts)

忽略字段postDataEntries 的原因是 字段postDataEntries==base64(postData)

##### 5.3. 解释 "templatePlace"、"markupFieldLs"

字段"templatePlace"定义为 [req_tmpl_t.cts](giteaz:3000/msic/gitee_api_fetch_ts/src/branch/main/src/req_tmpl_t.ts)下的枚举TemplPlaceE

字段"templatePlace"描述了 "markupFieldLs"的标记值们 作用到哪
```js
//来自  http://giteaz:3000/msic/gitee_api_fetch_ts/src/branch/main/src/req_tmpl_t.cts
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


### gitee_importRepo

**二、调用导入接口( 基于 以上 gitee导入给定url仓库 请求模板）**

以命令方式使用gitee导入仓库接口， http://giteaz:3000/misc/gitee_api_fetch_ts/src/branch/main/script/use_example.sh

```shell
bash  /app/github-gitee-GITEA/gitee_api_fetch_ts/script/use_example.sh
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

