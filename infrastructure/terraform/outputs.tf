output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.storage.bucket
}
