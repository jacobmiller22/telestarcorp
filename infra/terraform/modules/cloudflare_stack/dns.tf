data "cloudflare_zone" "current" {
  count      = var.cloudflare_zone_id == "" ? 1 : 0
  name       = var.zone_name
  account_id = var.cloudflare_account_id
}

locals {
  zone_id        = var.cloudflare_zone_id != "" ? var.cloudflare_zone_id : (length(data.cloudflare_zone.current) > 0 ? data.cloudflare_zone.current[0].id : "")
  route_hostname = local.is_preview && var.pr_number != "" ? "pr-${var.pr_number}-${var.subdomain_prefix}.${var.zone_name}" : "${var.subdomain_prefix}.${var.zone_name}"
}

# DNS record for edge routing
resource "cloudflare_record" "api" {
  count   = var.environment != "preview" ? 1 : 0
  zone_id = local.zone_id
  name    = var.subdomain_prefix
  content = "100::" # Proxied placeholder for Workers Route
  type    = "AAAA"
  proxied = true
  ttl     = 1
}
