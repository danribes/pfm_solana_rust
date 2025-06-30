# Cloud-Agnostic Infrastructure for PFM Community Management Application
# Task 6.3.1: Staging & Production Environment Setup

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
  
  # Backend configuration for state management
  backend "local" {
    # Can be changed to remote backend (S3, GCS, Azure, etc.)
    path = "terraform.tfstate"
  }
}

# Variables for cloud-agnostic deployment
variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "cloud_provider" {
  description = "Cloud provider (aws, gcp, azure, digitalocean, local)"
  type        = string
  default     = "local"
}

variable "region" {
  description = "Cloud region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "pfm-community"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "ssl_enabled" {
  description = "Enable SSL/TLS certificates"
  type        = bool
  default     = true
}

variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "monitoring_enabled" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = true
}

# Local variables for environment-specific configuration
locals {
  environment_config = {
    staging = {
      instance_count     = 1
      database_size     = "small"
      redis_size        = "small"
      cpu_limit         = "1000m"
      memory_limit      = "2Gi"
      storage_size      = "20Gi"
      backup_retention  = 7
      log_retention     = 30
      ssl_certificate   = "staging"
    }
    production = {
      instance_count     = 3
      database_size     = "large"
      redis_size        = "medium"
      cpu_limit         = "2000m"
      memory_limit      = "4Gi"
      storage_size      = "100Gi"
      backup_retention  = 30
      log_retention     = 90
      ssl_certificate   = "production"
    }
  }
  
  config = local.environment_config[var.environment]
  
  # Resource naming convention
  resource_prefix = "${var.project_name}-${var.environment}"
  
  # Common labels for all resources
  common_labels = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
    created_at  = formatdate("YYYY-MM-DD", timestamp())
  }
  
  # Port configuration
  ports = {
    backend         = 3000
    frontend_admin  = 3001
    frontend_member = 3002
    postgres        = 5432
    redis          = 6379
    nginx          = 80
    nginx_ssl      = 443
  }
}

# Docker provider configuration
provider "docker" {
  # Can be configured for remote Docker hosts
  host = "unix:///var/run/docker.sock"
}

# Docker network for the application
resource "docker_network" "app_network" {
  name = "${local.resource_prefix}-network"
  
  driver = "bridge"
  
  ipam_config {
    subnet  = "172.20.0.0/16"
    gateway = "172.20.0.1"
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
}

# PostgreSQL Database
resource "docker_volume" "postgres_data" {
  name = "${local.resource_prefix}-postgres-data"
  
  labels = {
    for k, v in local.common_labels : k => v
  }
}

resource "docker_container" "postgres" {
  name  = "${local.resource_prefix}-postgres"
  image = "postgres:15-alpine"
  
  restart = "unless-stopped"
  
  env = [
    "POSTGRES_DB=pfm_community_${var.environment}",
    "POSTGRES_USER=pfm_user",
    "POSTGRES_PASSWORD=${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "pfm_password"}",
    "POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256"
  ]
  
  ports {
    internal = local.ports.postgres
    external = local.ports.postgres
  }
  
  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }
  
  volumes {
    host_path      = "${path.cwd}/../backend/database/schema.sql"
    container_path = "/docker-entrypoint-initdb.d/schema.sql"
  }
  
  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U pfm_user -d pfm_community_${var.environment}"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 5
    start_period = "30s"
  }
  
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
  
  # Resource constraints
  memory = var.environment == "production" ? 2048 : 1024
  
  depends_on = [docker_network.app_network]
}

# Redis Cache
resource "docker_volume" "redis_data" {
  name = "${local.resource_prefix}-redis-data"
  
  labels = {
    for k, v in local.common_labels : k => v
  }
}

resource "docker_container" "redis" {
  name  = "${local.resource_prefix}-redis"
  image = "redis:7-alpine"
  
  restart = "unless-stopped"
  
  command = [
    "redis-server",
    "--appendonly", "yes",
    "--requirepass", "${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "redis_password"}"
  ]
  
  ports {
    internal = local.ports.redis
    external = local.ports.redis
  }
  
  volumes {
    volume_name    = docker_volume.redis_data.name
    container_path = "/data"
  }
  
  healthcheck {
    test         = ["CMD", "redis-cli", "--raw", "incr", "ping"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 5
    start_period = "15s"
  }
  
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
  
  # Resource constraints
  memory = var.environment == "production" ? 1024 : 512
  
  depends_on = [docker_network.app_network]
}

# Backend Application
resource "docker_container" "backend" {
  name  = "${local.resource_prefix}-backend"
  image = "ghcr.io/${var.project_name}/backend:latest"
  
  restart = "unless-stopped"
  
  env = [
    "NODE_ENV=${var.environment}",
    "DATABASE_URL=postgresql://pfm_user:${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "pfm_password"}@${docker_container.postgres.name}:${local.ports.postgres}/pfm_community_${var.environment}",
    "REDIS_URL=redis://:${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "redis_password"}@${docker_container.redis.name}:${local.ports.redis}",
    "SESSION_SECRET=${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "session_secret"}",
    "JWT_SECRET=${var.environment == "production" ? "CHANGE_IN_PRODUCTION" : "jwt_secret"}",
    "SOLANA_RPC_URL=${var.environment == "production" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"}",
    "PORT=${local.ports.backend}"
  ]
  
  ports {
    internal = local.ports.backend
    external = local.ports.backend
  }
  
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:${local.ports.backend}/health"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "60s"
  }
  
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
  
  # Resource constraints
  memory = var.environment == "production" ? 2048 : 1024
  
  depends_on = [
    docker_container.postgres,
    docker_container.redis
  ]
}

# Frontend Admin Portal
resource "docker_container" "frontend_admin" {
  name  = "${local.resource_prefix}-frontend-admin"
  image = "ghcr.io/${var.project_name}/frontend-admin:latest"
  
  restart = "unless-stopped"
  
  env = [
    "NODE_ENV=${var.environment}",
    "NEXT_PUBLIC_API_URL=http://${docker_container.backend.name}:${local.ports.backend}",
    "NEXT_PUBLIC_SOLANA_RPC=${var.environment == "production" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"}",
    "PORT=${local.ports.frontend_admin}"
  ]
  
  ports {
    internal = local.ports.frontend_admin
    external = local.ports.frontend_admin
  }
  
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:${local.ports.frontend_admin}"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "60s"
  }
  
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
  
  # Resource constraints
  memory = var.environment == "production" ? 1024 : 512
  
  depends_on = [docker_container.backend]
}

# Frontend Member Portal
resource "docker_container" "frontend_member" {
  name  = "${local.resource_prefix}-frontend-member"
  image = "ghcr.io/${var.project_name}/frontend-member:latest"
  
  restart = "unless-stopped"
  
  env = [
    "NODE_ENV=${var.environment}",
    "NEXT_PUBLIC_API_URL=http://${docker_container.backend.name}:${local.ports.backend}",
    "NEXT_PUBLIC_SOLANA_RPC=${var.environment == "production" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"}",
    "PORT=${local.ports.frontend_member}"
  ]
  
  ports {
    internal = local.ports.frontend_member
    external = local.ports.frontend_member
  }
  
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:${local.ports.frontend_member}"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "60s"
  }
  
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  labels = {
    for k, v in local.common_labels : k => v
  }
  
  # Resource constraints
  memory = var.environment == "production" ? 1024 : 512
  
  depends_on = [docker_container.backend]
}

# Outputs for reference
output "environment_info" {
  description = "Environment information"
  value = {
    environment      = var.environment
    cloud_provider   = var.cloud_provider
    region          = var.region
    resource_prefix = local.resource_prefix
  }
}

output "service_endpoints" {
  description = "Service endpoints"
  value = {
    backend         = "http://localhost:${local.ports.backend}"
    frontend_admin  = "http://localhost:${local.ports.frontend_admin}"
    frontend_member = "http://localhost:${local.ports.frontend_member}"
    postgres        = "localhost:${local.ports.postgres}"
    redis          = "localhost:${local.ports.redis}"
  }
}

output "database_info" {
  description = "Database connection information"
  value = {
    host     = docker_container.postgres.name
    port     = local.ports.postgres
    database = "pfm_community_${var.environment}"
    username = "pfm_user"
  }
  sensitive = false
}

output "container_names" {
  description = "Container names for management"
  value = {
    postgres        = docker_container.postgres.name
    redis          = docker_container.redis.name
    backend        = docker_container.backend.name
    frontend_admin = docker_container.frontend_admin.name
    frontend_member = docker_container.frontend_member.name
  }
} 