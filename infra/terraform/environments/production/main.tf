terraform {
  required_version = ">= 1.6.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.35"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "zone_name" {
  type    = string
  default = "example.com"
}

module "stack" {
  source = "../../modules/cloudflare_stack"

  cloudflare_account_id   = var.cloudflare_account_id
  zone_name               = var.zone_name
  environment             = "production"
  subdomain_prefix        = "api"
  manage_shared_resources = true
  enable_d1               = true
  enable_kv               = true
  enable_r2               = true
}

output "d1_database_id" { value = module.stack.d1_database_id }
output "kv_namespace_id" { value = module.stack.kv_namespace_id }
output "r2_bucket_name" { value = module.stack.r2_bucket_name }
output "endpoint_url" { value = module.stack.endpoint_url }
