locals {
  env        = "staging"
  mode       = "live"
  mode_short = "live"
  name       = "nodesampleapp"
  domain = "stg.tidnex.dev"

  k8s_cluster_name    = "trident-staging-0"
  k8s_namespace       = "xenoss-${local.mode}"
  k8s_service_account = "${local.name}-${local.mode}"

  region = "ap-southeast-1"
  ingresscontroller_hostname = "traefik-internal.${local.region}.priv.${local.domain}"
  svc_hostname = "${local.name}-${local.mode}.${local.region}.priv.${local.domain}"
}


data "aws_eks_cluster" "this" {
  name = local.k8s_cluster_name
}

data "aws_caller_identity" "current" {}

data "aws_kms_key" "chamber_key" {
  provider = aws.oregon
  key_id   = "alias/parameter_store_key"
}

#EKS-IAM IAM role creation
module "eks_iam_role_assumable_with_eks_oidc" {
  source = "git@github.com:xendit/xendit-infrastructure.git//terraform-modules/eks-chamber-iam-role?ref=49a3f0b"

  account_id   = data.aws_caller_identity.current.account_id
  service_name = local.name
  environment  = local.env
  mode         = local.mode

  role_path                 = "/"
  force_detach_policies     = false
  oidc_provider_url         = replace(data.aws_eks_cluster.this.identity.0.oidc.0.issuer, "/(https|http)(://)/", "")
  chamber_kms_master_key_id = data.aws_kms_key.chamber_key.id

  eks_service_accounts = [
    {
      name      = local.k8s_service_account
      namespace = local.k8s_namespace
    },
  ]
}
# Route53 endpoint Creations
data "aws_route53_zone" "self" {
  name         = local.domain
  private_zone = false
}

resource "aws_route53_record" "this" {
  zone_id = data.aws_route53_zone.self.zone_id
  name    = local.svc_hostname
  type    = "CNAME"
  records = [local.ingresscontroller_hostname]
  ttl     = 60
}
