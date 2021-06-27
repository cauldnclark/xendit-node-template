terraform {
  required_version = ">= 0.12.24"

  backend "s3" {
    encrypt        = true
    bucket         = "xendit-terraform"
    key            = "datadog/trident/ap-southeast-1/nodesampleapp.tfstate"
    region         = "ap-southeast-1"
    profile        = "xendit"
    dynamodb_table = "xendit-terraform-lock"
  }
}
