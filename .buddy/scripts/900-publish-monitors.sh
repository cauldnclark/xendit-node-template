#!/usr/bin/env bash

set -e

TEMP_SETUP_DIR=$(mktemp -d)

function cleanup() {
  rm -fr $TEMP_SETUP_DIR ~/.ssh/git ~/.ssh/config
}
trap cleanup EXIT

apt-get update && apt-get -y install git curl

pushd $TEMP_SETUP_DIR
# Setup tfenv to install terraform version based on required_version setting in tf script
git clone https://github.com/tfutils/tfenv.git .
export PATH=$TEMP_SETUP_DIR/bin:$PATH
popd

mkdir -p ~/.ssh
echo "$GITHUB_XENDIT_INFRASTRUCTURE_DEPLOY_PRIVATE_KEY" | base64 -d >~/.ssh/git
chmod 0600 ~/.ssh/git
echo "Host github.com" >~/.ssh/config
echo "User git" >>~/.ssh/config
echo "IdentityFile ~/.ssh/git" >>~/.ssh/config
ssh-keyscan github.com >>~/.ssh/known_hosts

pushd .deployment/terraform/datadog
rm -rf .terraform
tfenv install min-required
tfenv use min-required
terraform init
terraform apply -auto-approve
popd
