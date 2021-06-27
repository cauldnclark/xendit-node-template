output "svc_hostname" {
  value = aws_route53_record.this.name
}

output "svc_sa_iam_role_arn" {
  value = module.eks_iam_role_assumable_with_eks_oidc.iam_role_arn
}
