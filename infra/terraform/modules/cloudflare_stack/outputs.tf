output "d1_database_id" {
  description = "UUID of the provisioned D1 database"
  value       = var.enable_d1 ? cloudflare_d1_database.primary[0].id : ""
}

output "d1_database_name" {
  description = "Name of the provisioned D1 database"
  value       = var.enable_d1 ? cloudflare_d1_database.primary[0].name : ""
}

output "kv_namespace_id" {
  description = "ID of the Workers KV cache namespace"
  value       = var.enable_kv ? cloudflare_workers_kv_namespace.cache[0].id : ""
}

output "r2_bucket_name" {
  description = "Name of the R2 media bucket"
  value       = var.enable_r2 && var.manage_shared_resources ? cloudflare_r2_bucket.media[0].name : ""
}

output "endpoint_url" {
  description = "Authoritative worker endpoint URL"
  value       = "https://${var.subdomain_prefix}.${var.zone_name}"
}
