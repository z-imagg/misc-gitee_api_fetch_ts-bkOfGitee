#!/usr/bin/env bash

cd /fridaAnlzAp/github-gitee-GITEA/gitee_api_fetch_ts/

[ -f build/src_gitee_api/gitee_import_repo.cjs ] || { npm run clean ; npm run build ;}

node build/src_gitee_api/gitee_import_repo.cjs $@
