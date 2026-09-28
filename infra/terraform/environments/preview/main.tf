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

variable "pr_number" {
  type = string
}

module "stack" {
  source = "../../modules/cloudflare_stack"

  cloudflare_account_id   = var.cloudflare_account_id
  zone_name               = var.zone_name
  environment             = "preview"
  subdomain_prefix        = "api"
  pr_number               = var.pr_number
  manage_shared_resources = false # Ephemeral preview reuses shared R2
  enable_d1               = true
  enable_kv               = true
  enable_r2               = false
}

output "d1_database_id" { value = module.stack.d1_database_id }
output "d1_database_name" { value = module.stack.d1_database_name }
output "kv_namespace_id" { value = module.stack.kv_namespace_id }
output "endpoint_url" { value = "https://pr-${var.pr_number}-api.${var.zone_name}" }
