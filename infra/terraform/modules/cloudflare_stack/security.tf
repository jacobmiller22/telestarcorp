# Cloudflare Turnstile Bot Mitigation Widget
resource "cloudflare_turnstile_widget" "bot_gate" {
  count      = var.enable_turnstile && var.manage_shared_resources ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = "${local.app_name}-${var.environment}-turnstile"
  domains    = [var.zone_name]
  mode       = "managed"
}
