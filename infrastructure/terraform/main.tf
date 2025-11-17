terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "bongo-ai-terraform-state"
    key    = "terraform.tfstate"
    region = "ap-south-1"  # Mumbai region for Bangladesh data residency
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Bongo-AI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      DataRegion  = "Bangladesh"
    }
  }
}
