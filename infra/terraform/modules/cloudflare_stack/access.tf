# Cloudflare Access Zero Trust Application (Optional)
resource "cloudflare_access_application" "admin_perimeter" {
  count            = var.enable_cloudflare_access && var.manage_shared_resources ? 1 : 0
  zone_id          = local.zone_id
  name             = "${local.app_name}-${var.environment}-access"
  domain           = "${var.subdomain_prefix}.${var.zone_name}/admin"
  session_duration = "24h"
}
