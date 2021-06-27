terraform {
  required_version = ">= 0.12.24"
  backend "s3" {
    bucket         = "xendit-terraform-staging"
    key            = "aws/trident/ap-southeast-1/nodesampleapp-staging-dev.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    profile        = "xendit"
    dynamodb_table = "xendit-terraform-staging-lock"
  }
}

provider "aws" {
  region  = "ap-southeast-1"
}

provider "aws" {
  alias = "oregon"
  region  = "us-west-2"
}
