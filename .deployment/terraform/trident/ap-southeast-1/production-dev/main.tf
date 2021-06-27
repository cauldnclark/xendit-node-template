locals {
  env        = "production"
  mode       = "development"
  mode_short = "dev"
  name       = "nodesampleapp"
  domain     = "tidnex.com"

  k8s_cluster_name    = "trident-production-0"
  k8s_namespace       = "xenoss-dev"
  k8s_service_account = "${local.name}-${local.mode}"

  full_name                    = "${local.name}-${local.env}-${local.mode}"
  private_ingressctrl_hostname = "traefik-internal.ap-southeast-1.${local.domain}"
  public_ingressctrl_hostname  = "traefik-public.ap-southeast-1.${local.domain}"
  svc_hostname                 = "nodesampleapp-prod-dev.ap-southeast-1.${local.domain}"
}

data "aws_eks_cluster" "this" {
  name = local.k8s_cluster_name
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_kms_key" "chamber_key" {
  provider = aws.oregon
  key_id   = "alias/parameter_store_key"
}

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

data "aws_route53_zone" "tidnex" {
  name         = local.domain
  private_zone = false
}

resource "aws_route53_record" "this" {
  zone_id = data.aws_route53_zone.tidnex.zone_id
  name    = local.svc_hostname
  type    = "CNAME"
  records = [local.private_ingressctrl_hostname]
  ttl     = 60
}
