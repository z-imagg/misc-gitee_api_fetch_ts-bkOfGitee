#!/usr/bin/env bash

npm run clean ; npm run build

node build/src_gitee_api/gitee_import_repo.js
