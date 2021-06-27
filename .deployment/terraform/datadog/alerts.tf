module "nodesampleapp_production_dev" {
  source               = "git@github.com:xendit/xendit-infrastructure.git//terraform-modules/datadog?ref=503245"
  create_eks_resources = true
  create_eb_resources  = false
  create_dashboard     = false

  environment = "production-development"

  pagerduty_team_name  = local.pagerduty_team_name
  slack_channel_name   = local.slack_channel_name
  product_name         = local.product_name
  product_owner        = local.product_owner
  service_name_display = "${local.service_name_display} Prod Dev"
  service_name         = local.service_name

  service_type     = "web_api"
  service_language = "nodejs"

  databases = ["postgres"]
  public_urls = []

  rabbitmq_queue_names = []
  worker_name          = ""

  token_header_synth_tests = ""

  kube_namespace = "xenoss-dev"
  kubernetes_deployment_names = [
    "nodesampleapp-development-server"
  ]
}

module "nodesampleapp_production_live" {
  source               = "git@github.com:xendit/xendit-infrastructure.git//terraform-modules/datadog?ref=503245"
  create_eks_resources = true
  create_eb_resources  = false
  create_dashboard     = false

  environment = "production-live"

  pagerduty_team_name  = local.pagerduty_team_name
  slack_channel_name   = local.slack_channel_name
  product_name         = local.product_name
  product_owner        = local.product_owner
  service_name_display = "${local.service_name_display} Prod Live"
  service_name         = local.service_name

  service_type     = "web_api"
  service_language = "nodejs"

  databases = ["postgres"]
  public_urls = []

  rabbitmq_queue_names = []
  worker_name          = ""

  token_header_synth_tests = ""

  kube_namespace = "xenoss-live"
  kubernetes_deployment_names = [
    "nodesampleapp-live-server"
  ]
}
