# Task 6.6.1: DNS Configuration with Terraform
# DNS records management for pfm-community.app

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# Configure Cloudflare provider
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "zone_id" {
  description = "Cloudflare Zone ID for pfm-community.app"
  type        = string
}

variable "server_ip" {
  description = "Production server IP address"
  type        = string
}

# Root domain A record
resource "cloudflare_record" "root" {
  zone_id = var.zone_id
  name    = "pfm-community.app"
  value   = var.server_ip
  type    = "A"
  ttl     = 1 # Auto TTL
  proxied = true
  comment = "Root domain pointing to production server"
}

# WWW subdomain
resource "cloudflare_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  value   = "pfm-community.app"
  type    = "CNAME"
  ttl     = 1
  proxied = true
  comment = "WWW subdomain redirect"
}

# App subdomain for member portal
resource "cloudflare_record" "app" {
  zone_id = var.zone_id
  name    = "app"
  value   = var.server_ip
  type    = "A"
  ttl     = 1
  proxied = true
  comment = "Member portal application"
}

# Admin subdomain for admin dashboard
resource "cloudflare_record" "admin" {
  zone_id = var.zone_id
  name    = "admin"
  value   = var.server_ip
  type    = "A"
  ttl     = 1
  proxied = true
  comment = "Admin dashboard"
}

# API subdomain for backend services
resource "cloudflare_record" "api" {
  zone_id = var.zone_id
  name    = "api"
  value   = var.server_ip
  type    = "A"
  ttl     = 1
  proxied = true
  comment = "API backend services"
}

# Status page subdomain
resource "cloudflare_record" "status" {
  zone_id = var.zone_id
  name    = "status"
  value   = var.server_ip
  type    = "A"
  ttl     = 1
  proxied = true
  comment = "Status and monitoring page"
}

# MX Records for email
resource "cloudflare_record" "mx1" {
  zone_id  = var.zone_id
  name     = "pfm-community.app"
  value    = "mx1.forwardemail.net"
  type     = "MX"
  priority = 10
  ttl      = 1
  comment  = "Primary MX record"
}

resource "cloudflare_record" "mx2" {
  zone_id  = var.zone_id
  name     = "pfm-community.app"
  value    = "mx2.forwardemail.net"
  type     = "MX"
  priority = 20
  ttl      = 1
  comment  = "Secondary MX record"
}

# TXT Records for verification and security
resource "cloudflare_record" "spf" {
  zone_id = var.zone_id
  name    = "pfm-community.app"
  value   = "v=spf1 include:forwardemail.net ~all"
  type    = "TXT"
  ttl     = 1
  comment = "SPF record for email security"
}

resource "cloudflare_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc"
  value   = "v=DMARC1; p=quarantine; rua=mailto:dmarc@pfm-community.app"
  type    = "TXT"
  ttl     = 1
  comment = "DMARC policy record"
}

# CAA Records for SSL certificate authority
resource "cloudflare_record" "caa_letsencrypt" {
  zone_id = var.zone_id
  name    = "pfm-community.app"
  type    = "CAA"
  ttl     = 1
  data = {
    flags = 0
    tag   = "issue"
    value = "letsencrypt.org"
  }
  comment = "Allow Let's Encrypt to issue certificates"
}

# Page Rules for redirects and caching
resource "cloudflare_page_rule" "www_redirect" {
  zone_id  = var.zone_id
  target   = "www.pfm-community.app/*"
  priority = 1
  status   = "active"

  actions {
    forwarding_url {
      url         = "https://pfm-community.app/$1"
      status_code = 301
    }
  }
}

# Security settings
resource "cloudflare_zone_settings_override" "security" {
  zone_id = var.zone_id
  settings {
    ssl                      = "full"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    opportunistic_encryption = "on"
    tls_1_3                  = "zrt"
    automatic_https_rewrites = "on"
    security_level           = "medium"
    challenge_ttl            = 1800
    browser_check            = "on"
    hotlink_protection       = "on"
  }
}

# Outputs
output "dns_records" {
  description = "Created DNS records"
  value = {
    root   = cloudflare_record.root.hostname
    www    = cloudflare_record.www.hostname
    app    = cloudflare_record.app.hostname
    admin  = cloudflare_record.admin.hostname
    api    = cloudflare_record.api.hostname
    status = cloudflare_record.status.hostname
  }
}
