# Terraform Variables for Cloud-Agnostic Deployment
# Task 6.3.1: Staging & Production Environment Setup

# Core Environment Variables
variable "environment" {
  description = "Environment name (staging, production, development)"
  type        = string
  validation {
    condition     = contains(["staging", "production", "development"], var.environment)
    error_message = "Environment must be staging, production, or development."
  }
}

variable "cloud_provider" {
  description = "Target cloud provider"
  type        = string
  default     = "local"
  validation {
    condition = contains([
      "aws", "gcp", "azure", "digitalocean", "linode", "vultr", "local"
    ], var.cloud_provider)
    error_message = "Cloud provider must be one of: aws, gcp, azure, digitalocean, linode, vultr, local."
  }
}

variable "region" {
  description = "Cloud region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "Availability zones for multi-AZ deployment"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Project Configuration
variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "pfm-community"
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.project_name))
    error_message = "Project name must start with a letter and contain only letters, numbers, and hyphens."
  }
}

variable "organization" {
  description = "Organization name for resource tagging"
  type        = string
  default     = "pfm-organization"
}

variable "cost_center" {
  description = "Cost center for billing allocation"
  type        = string
  default     = "engineering"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# Domain and SSL Configuration
variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = ""
}

variable "subdomain_admin" {
  description = "Subdomain for admin portal"
  type        = string
  default     = "admin"
}

variable "subdomain_member" {
  description = "Subdomain for member portal"
  type        = string
  default     = "app"
}

variable "ssl_enabled" {
  description = "Enable SSL/TLS certificates"
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "ARN of existing SSL certificate (AWS)"
  type        = string
  default     = ""
}

# Container Configuration
variable "container_registry" {
  description = "Container registry URL"
  type        = string
  default     = "ghcr.io"
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}

# Application Scaling Configuration
variable "backend_min_instances" {
  description = "Minimum number of backend instances"
  type        = number
  default     = 1
  validation {
    condition     = var.backend_min_instances >= 1
    error_message = "Backend must have at least 1 instance."
  }
}

variable "backend_max_instances" {
  description = "Maximum number of backend instances"
  type        = number
  default     = 10
}

variable "frontend_min_instances" {
  description = "Minimum number of frontend instances"
  type        = number
  default     = 1
}

variable "frontend_max_instances" {
  description = "Maximum number of frontend instances"
  type        = number
  default     = 5
}

variable "cpu_target_utilization" {
  description = "Target CPU utilization for auto-scaling"
  type        = number
  default     = 70
  validation {
    condition     = var.cpu_target_utilization > 0 && var.cpu_target_utilization <= 100
    error_message = "CPU target utilization must be between 1 and 100."
  }
}

# Database Configuration
variable "database_engine" {
  description = "Database engine (postgres, mysql)"
  type        = string
  default     = "postgres"
  validation {
    condition     = contains(["postgres", "mysql"], var.database_engine)
    error_message = "Database engine must be postgres or mysql."
  }
}

variable "database_version" {
  description = "Database engine version"
  type        = string
  default     = "15"
}

variable "database_instance_class" {
  description = "Database instance class/size"
  type        = string
  default     = "db.t3.micro"
}

variable "database_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "database_max_allocated_storage" {
  description = "Database maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "database_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
  validation {
    condition     = var.database_backup_retention_period >= 0 && var.database_backup_retention_period <= 35
    error_message = "Backup retention period must be between 0 and 35 days."
  }
}

variable "database_multi_az" {
  description = "Enable multi-AZ deployment for database"
  type        = bool
  default     = false
}

variable "database_encryption_enabled" {
  description = "Enable database encryption at rest"
  type        = bool
  default     = true
}

# Cache Configuration
variable "redis_node_type" {
  description = "Redis node type/size"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

# Security Configuration
variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = false
}

variable "enable_ddos_protection" {
  description = "Enable DDoS protection"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "ssh_key_name" {
  description = "SSH key name for instance access"
  type        = string
  default     = ""
}

# Monitoring and Logging
variable "monitoring_enabled" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 30
  validation {
    condition     = var.log_retention_days > 0
    error_message = "Log retention must be greater than 0 days."
  }
}

variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_schedule" {
  description = "Backup schedule (cron format)"
  type        = string
  default     = "0 2 * * *"  # Daily at 2 AM
}

# Notification Configuration
variable "notification_email" {
  description = "Email address for notifications"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
}

# Feature Flags
variable "enable_auto_scaling" {
  description = "Enable auto-scaling for application services"
  type        = bool
  default     = true
}

variable "enable_load_balancing" {
  description = "Enable load balancing"
  type        = bool
  default     = true
}

variable "enable_cdn" {
  description = "Enable Content Delivery Network"
  type        = bool
  default     = false
}

variable "enable_api_gateway" {
  description = "Enable API Gateway"
  type        = bool
  default     = false
}

# Blockchain Configuration
variable "solana_network" {
  description = "Solana network (mainnet-beta, devnet, testnet)"
  type        = string
  default     = "devnet"
  validation {
    condition     = contains(["mainnet-beta", "devnet", "testnet"], var.solana_network)
    error_message = "Solana network must be mainnet-beta, devnet, or testnet."
  }
}

variable "solana_rpc_url" {
  description = "Custom Solana RPC URL (overrides network default)"
  type        = string
  default     = ""
}

# Resource Tagging
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Local Variables for Computed Values
locals {
  # Environment-specific defaults
  environment_defaults = {
    development = {
      instance_size         = "small"
      database_class       = "db.t3.micro"
      redis_node_type      = "cache.t3.micro"
      min_instances        = 1
      max_instances        = 2
      backup_retention     = 1
      log_retention        = 7
      multi_az            = false
      encryption_enabled   = false
      monitoring_level     = "basic"
      auto_scaling        = false
    }
    staging = {
      instance_size         = "medium"
      database_class       = "db.t3.small"
      redis_node_type      = "cache.t3.small"
      min_instances        = 1
      max_instances        = 3
      backup_retention     = 7
      log_retention        = 30
      multi_az            = false
      encryption_enabled   = true
      monitoring_level     = "standard"
      auto_scaling        = true
    }
    production = {
      instance_size         = "large"
      database_class       = "db.t3.medium"
      redis_node_type      = "cache.t3.medium"
      min_instances        = 2
      max_instances        = 10
      backup_retention     = 30
      log_retention        = 90
      multi_az            = true
      encryption_enabled   = true
      monitoring_level     = "comprehensive"
      auto_scaling        = true
    }
  }
  
  # Current environment configuration
  env_config = local.environment_defaults[var.environment]
  
  # Common resource tags
  common_tags = merge({
    Environment   = var.environment
    Project      = var.project_name
    Organization = var.organization
    CostCenter   = var.cost_center
    ManagedBy    = "terraform"
    CreatedAt    = formatdate("YYYY-MM-DD", timestamp())
    CloudProvider = var.cloud_provider
  }, var.additional_tags)
  
  # Resource naming convention
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Service URLs based on environment
  solana_rpc_urls = {
    mainnet-beta = "https://api.mainnet-beta.solana.com"
    devnet       = "https://api.devnet.solana.com"
    testnet      = "https://api.testnet.solana.com"
  }
  
  solana_rpc_url = var.solana_rpc_url != "" ? var.solana_rpc_url : local.solana_rpc_urls[var.solana_network]
  
  # Domain configuration
  admin_domain = var.domain_name != "" ? "${var.subdomain_admin}.${var.domain_name}" : ""
  member_domain = var.domain_name != "" ? "${var.subdomain_member}.${var.domain_name}" : ""
} 