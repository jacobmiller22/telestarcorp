variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Workers, D1, KV, R2, and DNS permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID (optional, resolved via zone_name if omitted)"
  type        = string
  default     = ""
}

variable "zone_name" {
  description = "Root domain name for the zone (e.g. example.com)"
  type        = string
  default     = "example.com"
}

variable "environment" {
  description = "Deployment tier (production, staging, preview)"
  type        = string
  default     = "staging"
}
