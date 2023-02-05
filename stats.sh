#!/bin/bash

i=-1
gitnames=()
commits=()

for word in $(git shortlog -s)
do
  re='^[0-9]+$'
  if [[ $word =~ $re ]]
  then
    i=$((i+1));
    commits[$i]=$word;
  else
    if [[ ${gitnames[$i]} ]]
    then
      gitnames[$i]="${gitnames[$i]} $word";
    else
      gitnames[$i]="$word";
    fi
  fi
done

printf '%-30s' "name"
printf '%-10s' "commits"
printf '%-10s' "additions"
printf '%-10s' "deletions"
echo

declare -A gitstats=();

for i in ${!gitnames[@]}
do
  numarray=(${commits[$i]} $(git log --author="${gitnames[$i]}" --pretty=tformat: --numstat | grep -v '^-' | awk '{ add+=$1; del+=$2 } END { print add, del }'));
  gitstats+=([${gitnames[$i]}]="${numarray[@]}")
done

function groupnames() {
  finalname=${namearray[0]}
  for i in ${!namearray[@]}
  do
    if [[ $i -gt 0 ]]
    then
      numarray=${gitstats[${namearray[$i]}]}
      for j in ${!numarray[@]}
      do
        printf '%-10s' "${numarray[$j]}"
      done
    fi
  done
}

namearray=("Jonathan RAFFIN" "Jonathan Raffin" "toto" "tutu")
groupnames

for i in ${!gitnames[@]}
do
  printf '%-30s' "${gitnames[$i]}"
  for num in ${commits[$i]}
  do
    printf '%-10s' $num
  done
  echo
done

