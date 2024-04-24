#!/usr/bin/env bash

#【用法】 bash use_example.sh

function use_example() {

source <(curl --silent http://giteaz:3000/bal/bash-simplify/raw/branch/release/cdCurScriptDir.sh)
cdCurScriptDir



local err01_code=23
local err01_txt="error : /app/bin/ not in \$PATH, exit $err01_code"

#断言'/app/bin/' 必须在$PATH中
echo $PATH | grep "/app/bin" >/dev/null || { echo "$err01_txt" && exit $err01_code ;}

#导入github仓库到gitee
# export PATH=/app/github-gitee-GITEA/gitee_api_fetch_ts/script:$PATH
local SrcF=/app/github-gitee-GITEA/gitee_api_fetch_ts/script/import_githubRepo_to_gitee.sh  && \
local F=/app/bin/import_githubRepo_to_gitee.sh && \
chmod +x $SrcF && \
{ unlink $F 2>/dev/null || ln -s $SrcF $F ;} 

#生成bash命令import_githubRepo_to_gitee.sh的提示
source bash-complete--import_githubRepo_to_gitee.sh

readlink -f `which import_githubRepo_to_gitee.sh`

#若运行失败，则 安装依赖、编译 后 再运行
import_githubRepo_to_gitee.sh --help || { ( cd  .. && npm install && npm run build ) && import_githubRepo_to_gitee.sh --help ;}

echo '用法举例:import_githubRepo_to_gitee.sh --两次tab 即有命令提示'


}


use_example