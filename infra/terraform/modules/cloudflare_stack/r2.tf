resource "cloudflare_r2_bucket" "media" {
  count      = var.enable_r2 && var.manage_shared_resources ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = local.r2_name
  location   = "ENAM"
}
