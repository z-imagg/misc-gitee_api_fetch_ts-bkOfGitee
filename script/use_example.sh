#!/usr/bin/env bash

#【用法】 bash use_example.sh

function use_example() {

source <(curl --silent http://giteaz:3000/bal/bash-simplify/raw/branch/release/cdCurScriptDir.sh)
cdCurScriptDir
# __dire==/app/github-gitee-GITEA/gitee_api_fetch_ts/script/

PrjHm=$(cd ..; pwd)
# PrjHm==/app/github-gitee-GITEA/gitee_api_fetch_ts/


local err01_code=23
local err01_txt="error : /app/bin/ not in \$PATH, exit $err01_code"

#断言'/app/bin/' 必须在$PATH中
echo $PATH | grep "/app/bin" >/dev/null || { echo "$err01_txt" && exit $err01_code ;}

#导入github仓库到gitee
# export PATH=/app/github-gitee-GITEA/gitee_api_fetch_ts/script:$PATH
local SrcF=/app/github-gitee-GITEA/gitee_api_fetch_ts/script/import_githubRepo_to_gitee.sh  && \
local F=/app/bin/import_githubRepo_to_gitee.sh && \
chmod +x $SrcF && \
{ unlink $F 2>/dev/null ; ln -s $SrcF $F ;} 

#生成bash命令import_githubRepo_to_gitee.sh的提示
source bash-complete--import_githubRepo_to_gitee.sh

echo -n "import_githubRepo_to_gitee.sh:" && readlink -f `which import_githubRepo_to_gitee.sh`

err02_code=24
err02_txt="错误02: 请先准备好环境，再运行use_example.sh， exit $err02_code, 环境准备参考: http://giteaz:3000/github_tool/github-gitee-GITEA/src/branch/main/readme.md"
err02_txt_use_example="缺少文件'$PrjHm/gitee_account.json', $err02_txt"
err02_txt_reqTmpl_no="目录'$PrjHm/reqTemplate/'下缺少请求模板文件, $err02_txt"
err02_txt_reqTmpl_not_1="目录'$PrjHm/reqTemplate/'只能有1个请求模板文件, $err02_txt"

[[ -f $PrjHm/gitee_account.json ]] || { echo "$err02_txt_use_example" && exit $err02_code ;}

reqTmplF_cnt=$(ls $PrjHm/reqTemplate/ | wc -l )
[[ $reqTmplF_cnt -le 0 ]] &&  { echo "$err02_txt_reqTmpl_no" && exit $err02_code ;}
[[ $reqTmplF_cnt -ne 1 ]] &&  { echo "$err02_txt_reqTmpl_not_1" && exit $err02_code ;}

err03_code=24
err03_txt="错误03: '$PrjHm/src/my_cfg.cts'中指定的chromePath，该文件不存在， exit $err02_code "
chromePath=$(grep chromePath  $PrjHm/src/my_cfg.cts   | cut -d'"' -f 2)
[[ ! -f $chromePath ]] && { echo $err03_txt && exit $err03_code ;}

# grep chromePath  /app/github-gitee-GITEA/gitee_api_fetch_ts/src/my_cfg.cts   | cut -d'"' -f 2  # == /app/chrome-linux/chrome

#若运行失败，则 安装依赖、编译 后 再运行
import_githubRepo_to_gitee.sh --help || { ( cd  $PrjHm && npm install && npm run build ) && import_githubRepo_to_gitee.sh --help ;}

echo '用法举例:import_githubRepo_to_gitee.sh --两次tab 即有命令提示'


}


use_example