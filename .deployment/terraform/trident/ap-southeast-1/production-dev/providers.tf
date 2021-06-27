terraform {
  required_version = ">= 0.12.24"
  backend "s3" {
    bucket         = "xendit-terraform"
    key            = "aws/trident/nodesampleapp-production-dev"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "xendit-terraform-lock"
  }
}

provider "aws" {
  region  = "ap-southeast-1"
  version = "~> 2.58"
}

provider "aws" {
  alias = "oregon"
  region  = "us-west-2"
}