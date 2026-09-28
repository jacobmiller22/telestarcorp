resource "cloudflare_d1_database" "primary" {
  count      = var.enable_d1 ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = local.d1_name
}
