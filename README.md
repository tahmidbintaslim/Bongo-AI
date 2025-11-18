# Bongo AI - Bengali Study Assistant

A comprehensive Bengali study assistant for Bangladesh built with React Native (mobile + web) with desktop support via Electron/Tauri.

## 🎯 Features

- **Multi-Platform Support**: Mobile (iOS/Android), Web, and Desktop (Electron/Tauri)
- **Bengali First**: Full i18n support with Bengali (bn-BD) as the primary language
- **Offline Capability**: Offline caching for seamless learning anywhere
- **AI-Powered**: RAG (Retrieval-Augmented Generation) with Bengali prompts
- **Microservices Architecture**: Scalable backend services
- **Data Residency**: Compliant with Bangladesh data regulations

## 🏗️ Architecture

### Frontend
- **React Native**: Mobile apps (iOS/Android)
- **React Native Web (RNW)**: Web application
- **Electron/Tauri**: Desktop applications
- **State Management**: Redux/Zustand
- **Internationalization**: i18n with bn-BD locale
- **Offline Support**: Cache-first strategy

### Backend Microservices
- **Auth Service**: User authentication and authorization
- **Content Service**: Educational content management
- **AI Service**: RAG-based AI assistance with Bengali support
- **Analytics Service**: User analytics and insights

### Data Layer
- **PostgreSQL**: Relational data (users, structured content)
- **Redis**: Caching and session management
- **MongoDB/Firestore**: Unstructured content and documents
- **S3/GCS**: Media and file storage
- **Vector Store**: Pinecone/Weaviate/Chroma for AI embeddings

### AI/ML
- **OpenAI/Cohere**: Language models with Bengali support
- **RAG**: Retrieval-Augmented Generation for contextual responses
- **Vector Search**: Semantic search in Bengali content

### DevOps
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Infrastructure as Code**: Terraform
- **Observability**: Logging, metrics, and tracing
- **Data Residency**: Bangladesh-compliant infrastructure

## 📁 Project Structure

```
bongo-ai/
├── apps/
│   ├── mobile/              # React Native mobile app
│   ├── web/                 # React Native Web app
│   ├── desktop/             # Electron/Tauri desktop app
│   └── backend/
│       ├── auth-service/    # Authentication microservice
│       ├── content-service/ # Content management microservice
│       ├── ai-service/      # AI/RAG microservice
│       ├── analytics-service/ # Analytics microservice
│       └── api-gateway/     # API Gateway
├── packages/
│   ├── shared/              # Shared utilities and types
│   ├── ui-components/       # Shared UI components
│   └── i18n/                # Internationalization
├── infrastructure/
│   ├── terraform/           # Infrastructure as Code
│   ├── docker/              # Docker configurations
│   └── k8s/                 # Kubernetes manifests
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- MongoDB 6+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tahmidbintaslim/Bongo-AI.git
cd Bongo-AI
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
# Start all services with Docker
docker-compose up -d

# Or start individual services
yarn mobile          # Start mobile app
yarn web             # Start web app
yarn desktop         # Start desktop app
yarn backend:auth    # Start auth service
yarn backend:content # Start content service
yarn backend:ai      # Start AI service
yarn backend:analytics # Start analytics service
```

### Development

```bash
# Run all tests
yarn test

# Lint code
yarn lint

# Build all packages
yarn build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL=postgresql://bongo_user:bongo_pass@localhost:5432/bongo_ai
MONGODB_URL=mongodb://bongo_user:bongo_pass@localhost:27017/bongo_ai
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_api_key
COHERE_API_KEY=your_cohere_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# Auth
JWT_SECRET=your_jwt_secret

# Storage
S3_BUCKET=your_s3_bucket
S3_REGION=ap-south-1
GCS_BUCKET=your_gcs_bucket
```

## 🌐 Internationalization

The app supports Bengali (bn-BD) as the primary language with fallback to English. All UI strings are externalized and translatable.

## 📱 Mobile Development

```bash
# iOS
cd apps/mobile
yarn ios

# Android
cd apps/mobile
yarn android
```

## 🖥️ Desktop Development

```bash
# Electron
cd apps/desktop
yarn start:electron

# Tauri
cd apps/desktop
yarn start:tauri
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Integration tests
yarn test:integration
```

## 🚢 Deployment

### Docker

```bash
# Build all services
docker-compose build

# Deploy
docker-compose up -d
```

### Terraform

```bash
# Initialize Terraform
yarn terraform:init

# Plan infrastructure
yarn terraform:plan

# Apply infrastructure
yarn terraform:apply
```

## 📊 Monitoring & Observability

- Application logs: Structured JSON logging
- Metrics: Prometheus-compatible metrics
- Tracing: OpenTelemetry integration
- Dashboards: Grafana dashboards

## 🔒 Security & Compliance

- Data residency: Bangladesh data centers
- Encryption at rest and in transit
- GDPR-compliant data handling
- Regular security audits

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for students in Bangladesh
- Bengali NLP support powered by OpenAI/Cohere
- Community-driven educational content

## 📞 Support

For support, email support@bongo-ai.com or join our Slack channel.