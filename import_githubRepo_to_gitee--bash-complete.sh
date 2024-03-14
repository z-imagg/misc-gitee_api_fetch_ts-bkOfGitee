#!/usr/bin/env bash

#source me.sh

_import_githubRepo_to_gitee() {
    local pre cur opts

    COMPREPLY=()
    #pre="$3"
    #cur="$2"
    pre=${COMP_WORDS[COMP_CWORD-1]}
    cur=${COMP_WORDS[COMP_CWORD]}
    opts="--from_repo --goal_org --goal_repoPath --goal_repoName --goal_repoDesc -h --help"
    case "$cur" in
    -* )
        COMPREPLY=( $( compgen -W "$opts" -- $cur ) )
    esac
}
complete -F _import_githubRepo_to_gitee   import_githubRepo_to_gitee.sh
