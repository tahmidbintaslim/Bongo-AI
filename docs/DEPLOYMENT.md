# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Terraform >= 1.0
- AWS Account (for production)
- Node.js >= 18
- Domain name (for production)

## Local Development

### 1. Clone the repository
```bash
git clone https://github.com/tahmidbintaslim/Bongo-AI.git
cd Bongo-AI
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start services with Docker
```bash
docker-compose up -d
```

### 5. Verify services
```bash
# Check all services are running
docker-compose ps

# Test health endpoints
curl http://localhost:4000/health  # API Gateway
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4003/health  # AI Service
```

## Production Deployment

### AWS Deployment (Recommended for Bangladesh)

#### 1. Configure AWS credentials
```bash
aws configure
# Set region to ap-south-1 (Mumbai) for Bangladesh data residency
```

#### 2. Initialize Terraform
```bash
cd infrastructure/terraform
terraform init
```

#### 3. Plan infrastructure
```bash
terraform plan -var-file="production.tfvars"
```

#### 4. Apply infrastructure
```bash
terraform apply -var-file="production.tfvars"
```

#### 5. Configure environment variables
```bash
# Set production environment variables in AWS Systems Manager Parameter Store
aws ssm put-parameter --name "/bongo-ai/DATABASE_URL" --value "your_value" --type SecureString
```

#### 6. Deploy services

##### Using Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

##### Using Kubernetes (EKS)
```bash
kubectl apply -f infrastructure/k8s/
```

### Vercel Deployment (Web App)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd apps/web
vercel --prod
```

### Mobile App Deployment

#### iOS (App Store)
```bash
cd apps/mobile
yarn ios:build
# Follow Apple's app submission process
```

#### Android (Play Store)
```bash
cd apps/mobile
yarn android:build
# Follow Google's app submission process
```

## Environment Variables

### Required for Production

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MONGODB_URL=mongodb://user:pass@host:27017/dbname
REDIS_URL=redis://host:6379

# AI Services
OPENAI_API_KEY=sk-...
COHERE_API_KEY=...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Auth
JWT_SECRET=secure_random_secret
REFRESH_TOKEN_SECRET=another_secure_secret

# Storage
S3_BUCKET=bongo-ai-storage-prod
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Monitoring
SENTRY_DSN=https://...
```

## Database Migration

### PostgreSQL
```bash
# Run migrations
cd apps/backend/auth-service
npx prisma migrate deploy
```

### MongoDB
```bash
# Seed initial data
cd apps/backend/content-service
npm run seed
```

## Monitoring

### Health Checks
```bash
# Check all services
curl https://api.bongo-ai.com/health
```

### Logs
```bash
# View logs
docker-compose logs -f service_name

# AWS CloudWatch (production)
aws logs tail /aws/ecs/bongo-ai --follow
```

### Metrics
- Access Grafana: http://localhost:3000
- Default credentials: admin/admin
- Prometheus: http://localhost:9090

## Scaling

### Horizontal Scaling
```bash
# Scale specific service
docker-compose up -d --scale ai-service=3
```

### Auto-scaling (AWS)
- Configured in Terraform
- Based on CPU/Memory metrics
- Min: 2, Max: 10 instances

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL
pg_dump -h localhost -U bongo_user bongo_ai > backup.sql

# MongoDB
mongodump --uri="mongodb://..." --out=backup/
```

### Restore
```bash
# PostgreSQL
psql -h localhost -U bongo_user bongo_ai < backup.sql

# MongoDB
mongorestore --uri="mongodb://..." backup/
```

## SSL/TLS Setup

### Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d api.bongo-ai.com
```

### AWS Certificate Manager
- Request certificate in ACM
- Add to Load Balancer
- Auto-renewal enabled

## Rollback

### Docker
```bash
# Rollback to previous version
docker-compose down
git checkout previous_tag
docker-compose up -d
```

### Kubernetes
```bash
kubectl rollout undo deployment/service-name
```

## Troubleshooting

### Service not starting
```bash
# Check logs
docker-compose logs service_name

# Check environment variables
docker-compose config
```

### Database connection issues
```bash
# Test connection
psql -h localhost -U bongo_user -d bongo_ai

# Check Redis
redis-cli ping
```

### High memory usage
```bash
# Check container stats
docker stats

# Restart service
docker-compose restart service_name
```

## Security Checklist

- [ ] All secrets in environment variables
- [ ] SSL/TLS enabled
- [ ] Database encryption enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Firewall rules set
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Data residency compliance verified

## Post-Deployment

1. Test all endpoints
2. Verify database connections
3. Check monitoring dashboards
4. Test mobile apps
5. Verify SSL certificates
6. Check backup automation
7. Review security logs
8. Update documentation
9. Notify team
10. Monitor for issues

## Support

For deployment issues:
- Check logs first
- Review this guide
- Open GitHub issue
- Contact: devops@bongo-ai.com
