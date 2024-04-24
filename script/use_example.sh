#!/usr/bin/env bash

#【用法】 source use_example.sh


#导入github仓库到gitee
export PATH=/fridaAnlzAp/github-gitee-GITEA/gitee_api_fetch_ts/script:$PATH

#生成bash命令import_githubRepo_to_gitee.sh的提示
source script/bash-complete--import_githubRepo_to_gitee.sh

import_githubRepo_to_gitee.sh --help

echo '用法举例:import_githubRepo_to_gitee.sh --两次tab 即有命令提示'

