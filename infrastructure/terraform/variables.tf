variable "aws_region" {
  description = "AWS region for deployment (ap-south-1 for Bangladesh data residency)"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "bongo-ai"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "bongo_ai"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "bongo_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
