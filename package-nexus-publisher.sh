#!/usr/bin/env bash

# If environment variable not set, use default
if [[ -z "${REG_BASE_ADDRESS}" ]]; then
  REG_BASE_ADDRESS="https://nexus.myowg.com"
fi

set -eux pipefail

npm config set strict-ssl false
sed -i 's/"private": true/"private": false/' package.json
TOKEN=$(curl -k -H "Accept: application/json" -H "Content-Type:application/json" -X PUT --data '{"name": "'$NEXUS_USER'", "password": "'$NEXUS_PASS'"}'  https://$REG_BASE_ADDRESS/repository/npm-hosted/-/user/org.couchdb.user:nexus_jenkins | jq '.token')
npm set //$REG_BASE_ADDRESS/repository/npm-hosted/:_authToken $TOKEN

npm publish --registry "https://$REG_BASE_ADDRESS/repository/npm-hosted/"
