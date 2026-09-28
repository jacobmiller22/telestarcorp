locals {
  app_name   = "template-api"
  is_preview = var.environment == "preview"

  stack_name = local.is_preview && var.pr_number != "" ? "${local.app_name}-pr-${var.pr_number}" : "${local.app_name}-${var.environment}"

  d1_name = local.is_preview && var.pr_number != "" ? "template-preview-pr-${var.pr_number}-db" : "template-${var.environment}-db"
  kv_name = local.is_preview && var.pr_number != "" ? "template-preview-pr-${var.pr_number}-kv" : "template-${var.environment}-kv"
  r2_name = "template-media-${var.environment}"
}
