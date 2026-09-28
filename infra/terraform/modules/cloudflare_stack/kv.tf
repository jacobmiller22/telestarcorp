resource "cloudflare_workers_kv_namespace" "cache" {
  count      = var.enable_kv ? 1 : 0
  account_id = var.cloudflare_account_id
  title      = local.kv_name
}
