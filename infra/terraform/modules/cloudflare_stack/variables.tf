variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID (optional)"
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
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for API routing (e.g. api, staging-api)"
  type        = string
  default     = "api"
}

variable "pr_number" {
  description = "Pull request number for ephemeral preview stack isolation"
  type        = string
  default     = ""
}

variable "manage_shared_resources" {
  description = "Whether to manage shared tier resources like R2 buckets or Turnstile"
  type        = bool
  default     = true
}

# Composable Feature Toggles
variable "enable_d1" {
  description = "Whether to provision Cloudflare D1 database"
  type        = bool
  default     = true
}

variable "enable_kv" {
  description = "Whether to provision Workers KV cache namespace"
  type        = bool
  default     = true
}

variable "enable_r2" {
  description = "Whether to provision Cloudflare R2 object storage bucket"
  type        = bool
  default     = true
}

variable "enable_cloudflare_access" {
  description = "Whether to provision Cloudflare Access Zero Trust perimeter"
  type        = bool
  default     = false
}

variable "enable_turnstile" {
  description = "Whether to provision Cloudflare Turnstile bot verification widget"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Whether to provision edge rate limiting and custom WAF rules"
  type        = bool
  default     = true
}
