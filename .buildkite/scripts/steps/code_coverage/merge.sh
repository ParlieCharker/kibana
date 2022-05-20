#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

export CODE_COVERAGE=1

base=target/kibana-coverage
target="$base/functional"
first="$target/first"

filesCount() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    count=$(find "$1" -maxdepth 1 -type f | grep -v .DS* | wc -l | xargs) # xargs trims whitespace
  else
    count=$(find "$1" -maxdepth 1 -type f | wc -l | xargs) # xargs trims whitespace
  fi
}

_head() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    count=$(find "$1" -maxdepth 1 -type f | grep -v .DS* | wc -l | xargs) # xargs trims whitespace
    firstFile=$(find "$1" -maxdepth 1 -type f | grep -v .DS* | head -1)
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
  half=$((count / 2))
  echo "### half: $half"

  # the index variable is irrelevant
  for x in $(seq 1 $half); do
    _head $1
    echo "### Moving firstFile: ${firstFile}"
    echo "### To first: ${first}"
    mv "$firstFile" "$first"
  done
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
