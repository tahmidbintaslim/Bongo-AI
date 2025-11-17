# Quick Start Guide - Bongo AI

Get up and running with Bongo AI in under 10 minutes!

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Yarn** 1.22+ installed (`npm install -g yarn`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** installed

## 5-Minute Setup

### 1. Clone the Repository (30 seconds)
```bash
git clone https://github.com/tahmidbintaslim/Bongo-AI.git
cd Bongo-AI
```

### 2. Install Dependencies (2 minutes)
```bash
yarn install
```

### 3. Set Up Environment Variables (1 minute)
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your preferred text editor (optional for local dev)
# nano .env  # or vim, code, etc.
```

**For quick testing**, the default values in `.env.example` will work for local development!

### 4. Start All Services (2 minutes)
```bash
# Start databases and backend services
docker-compose up -d

# Wait for services to be ready (~30 seconds)
# Check status
docker-compose ps
```

### 5. Verify Everything Works (30 seconds)
```bash
# Check API Gateway
curl http://localhost:4000/health
# Expected: {"status":"ok","service":"api-gateway"}

# Check Auth Service
curl http://localhost:4001/health
# Expected: {"status":"ok","service":"auth-service"}

# Check AI Service
curl http://localhost:4003/health
# Expected: {"status":"ok","service":"ai-service"}
```

## 🎉 You're Ready!

Your Bongo AI backend is now running! Here's what you can do next:

### Test the API

#### 1. Register a User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "Test Student"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

#### 3. Ask AI a Question (in Bengali!)
```bash
curl -X POST http://localhost:4000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "গণিত কী?",
    "userId": "test-user-id",
    "language": "bn"
  }'
```

### Start the Mobile App

```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
yarn install

# For iOS (Mac only)
yarn ios

# For Android
yarn android
```

### Access the Services

- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **AI Service**: http://localhost:4003
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

## Common Commands

### Backend Services
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart auth-service

# Rebuild services after code changes
docker-compose up -d --build
```

### Mobile Development
```bash
# Start Metro bundler
cd apps/mobile && yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run tests
yarn test
```

### Development
```bash
# Install all dependencies
yarn install

# Run linting
yarn lint

# Run all tests
yarn test

# Build all packages
yarn build
```

## Troubleshooting

### Services won't start
```bash
# Check if ports are already in use
lsof -i :4000  # API Gateway
lsof -i :4001  # Auth Service
lsof -i :5432  # PostgreSQL

# Kill conflicting processes or change ports in docker-compose.yml
```

### Docker issues
```bash
# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d

# Check Docker logs
docker-compose logs service-name
```

### Database connection errors
```bash
# Make sure databases are running
docker-compose ps

# Check database logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs mongodb
```

### Mobile app issues
```bash
# Clear Metro cache
cd apps/mobile
yarn start --reset-cache

# For iOS, clear build
cd ios && rm -rf build && cd ..

# For Android, clean
cd android && ./gradlew clean && cd ..
```

## Next Steps

Now that you have Bongo AI running:

1. **Explore the API**: Check out [API Documentation](docs/API.md)
2. **Understand the Architecture**: Read [Architecture Guide](docs/ARCHITECTURE.md)
3. **Add AI API Keys**: Get OpenAI/Cohere keys for full AI features
4. **Customize**: Modify code to fit your needs
5. **Contribute**: See [Contributing Guide](CONTRIBUTING.md)

## Configuration (Optional)

### Add AI Provider API Keys

For full AI features, add your API keys to `.env`:

```env
# OpenAI (recommended for Bengali)
OPENAI_API_KEY=sk-your-key-here

# OR Cohere (alternative)
COHERE_API_KEY=your-cohere-key-here

# Vector Store (for better search)
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_ENVIRONMENT=your-environment
```

Get your keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Cohere**: https://dashboard.cohere.ai/api-keys
- **Pinecone**: https://app.pinecone.io/

### Customize Language

Change default language in `packages/i18n/src/index.ts`:
```typescript
// For English as default
lng: 'en-US'

// For Bengali as default (current)
lng: 'bn-BD'
```

## Production Deployment

Ready for production? See:
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Summary](SECURITY.md)

## Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Open a GitHub issue
- **Questions**: Check existing issues or start a discussion

## What's Included

With this quick start, you get:

✅ Backend API services running
✅ PostgreSQL, Redis, MongoDB databases
✅ Authentication with JWT
✅ AI/RAG service (works better with API keys)
✅ Bengali language support
✅ Complete development environment

## System Requirements

**Minimum:**
- 8GB RAM
- 4 CPU cores
- 10GB free disk space
- macOS, Linux, or Windows with WSL2

**Recommended:**
- 16GB RAM
- 8 CPU cores
- 20GB free disk space

## Summary

You've successfully set up Bongo AI! Here's what's running:

1. **3 Microservices**: API Gateway, Auth, AI
2. **3 Databases**: PostgreSQL, Redis, MongoDB
3. **REST API**: Full authentication and AI endpoints
4. **Bengali Support**: i18n ready with bn-BD
5. **Docker Environment**: Isolated, reproducible

Happy coding! 🚀 বঙ্গ এআই-এ স্বাগতম! (Welcome to Bongo AI!)
