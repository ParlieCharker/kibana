#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

export CODE_COVERAGE=1

base=target/kibana-coverage
target="$base/functional"
first="$target/first"
rest="$target/rest"

filesCount() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    count=$(find "$1" -maxdepth 1 -type f | grep -vc ".DS*" | xargs) # xargs trims whitespace
  else
    count=$(find "$1" -maxdepth 1 -type f | wc -l | xargs) # xargs trims whitespace
  fi
}

_head() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    count=$(find "$1" -maxdepth 1 -type f | grep -vc ".DS*" | xargs) # xargs trims whitespace
    firstFile=$(find "$1" -maxdepth 1 -type f | grep -v ".DS*" | head -1)
  else
    count=$(find "$1" -maxdepth 1 -type f | wc -l | xargs) # xargs trims whitespace
    firstFile=$(find "$1" -maxdepth 1 -type f | head -1)
  fi
}

splitCoverage() {
  echo "--- Running splitCoverage"
  filesCount "$1"
  echo "### total: $count"

  mkdir -p $first
  mkdir -p $rest
  half=$((count / 2))
  echo "### half: $half"

  # the index variable is irrelevant
  for x in $(seq 1 $half); do
    _head "$1"
    #    echo "### Moving firstFile: ${firstFile}"
    #    echo "### To first: ${first}"
    mv "$firstFile" "$first"
  done

  for x in $(find "$target" -maxdepth 1 -type f -name '*.json'); do
    echo "### x: ${x}"
    mv "$x" "$rest" || printf "\n\t### Trouble moving %s to %s" "$x" "$rest"
  done
}

splitMerge() {
  echo "--- Merge the 1st half of the coverage files"
  yarn nyc merge target/kibana-coverage/functional/first target/kibana-coverage/functional/first.json
  echo "--- Merge the 2nd half of the coverage files"
  yarn nyc merge target/kibana-coverage/functional/rest target/kibana-coverage/functional/rest.json
  echo "--- Report-Merge the 2 halves into one"
  yarn nyc report --nycrc-path src/dev/code_coverage/nyc_config/nyc.functional.config.js
}

listReports() {
  ls -R $base
}

finalReplace() {
  echo "### KIBANA_DIR in finalReplace fn: $KIBANA_DIR"
  local targetPath=$1
#  TODO-TRE: Drop hardcoded replacement anchor
  anchor=LEETRE
#  sed -ie "s|$anchor|${KIBANA_DIR}|g" $targetPath
  sed -ie "s|$anchor|/var/lib/jenkins/workspace/elastic+kibana+code-coverage/kibana|g" "$targetPath"
}
