# Bongo AI Architecture

## System Overview

Bongo AI is a multi-tier, microservices-based application designed to provide educational assistance to students in Bangladesh with a focus on Bengali language support.

## Architecture Layers

### 1. Frontend Layer

#### Mobile (React Native)
- **iOS/Android Apps**: Native mobile experience
- **State Management**: Redux/Zustand for global state
- **Offline Support**: Cache-first strategy with Redux Persist
- **i18n**: Bengali (bn-BD) as primary language

#### Web (React Native Web)
- **Responsive Design**: Works on all screen sizes
- **Progressive Web App**: Installable, offline-capable
- **Same Codebase**: Shares components with mobile

#### Desktop (Electron/Tauri)
- **Cross-platform**: Windows, macOS, Linux
- **Native Features**: File system access, notifications
- **Lightweight**: Tauri for smaller bundle size

### 2. Backend Layer (Microservices)

#### API Gateway
- **Port**: 4000
- **Purpose**: Single entry point, routing, rate limiting
- **Technologies**: Express.js, http-proxy-middleware

#### Auth Service
- **Port**: 4001
- **Purpose**: User authentication, authorization
- **Technologies**: Express.js, JWT, bcrypt, PostgreSQL, Redis
- **Features**:
  - User registration/login
  - Token management
  - Session handling

#### Content Service
- **Port**: 4002
- **Purpose**: Educational content management
- **Technologies**: Express.js, PostgreSQL, MongoDB
- **Features**:
  - Lesson management
  - Quiz creation
  - Video/article storage
  - Bengali content support

#### AI Service
- **Port**: 4003
- **Purpose**: AI-powered assistance with RAG
- **Technologies**: Express.js, OpenAI/Cohere, Pinecone/Weaviate
- **Features**:
  - Bengali language understanding
  - Context-aware responses
  - Vector search
  - Embeddings generation

#### Analytics Service
- **Port**: 4004
- **Purpose**: User analytics and insights
- **Technologies**: Express.js, PostgreSQL, MongoDB
- **Features**:
  - Usage tracking
  - Performance metrics
  - Learning progress
  - Dashboards

### 3. Data Layer

#### PostgreSQL
- **Purpose**: Relational data
- **Data**: Users, structured content, relationships
- **Version**: 15+
- **Features**: ACID compliance, complex queries

#### Redis
- **Purpose**: Caching, session storage
- **Data**: Temporary data, session tokens
- **Version**: 7+
- **Features**: Fast in-memory operations

#### MongoDB/Firestore
- **Purpose**: Unstructured content
- **Data**: Lessons, articles, user-generated content
- **Features**: Flexible schema, scalability

#### S3/GCS
- **Purpose**: Media storage
- **Data**: Images, videos, documents
- **Features**: CDN integration, encryption

#### Vector Store (Pinecone/Weaviate/Chroma)
- **Purpose**: Semantic search, AI embeddings
- **Data**: Content embeddings for RAG
- **Features**: Fast similarity search

### 4. Infrastructure Layer

#### Containerization (Docker)
- All services containerized
- Docker Compose for local development
- Consistent environments

#### Orchestration (Kubernetes - Optional)
- Production deployment
- Auto-scaling
- High availability

#### Infrastructure as Code (Terraform)
- AWS infrastructure
- ap-south-1 region (Mumbai) for Bangladesh data residency
- VPC, subnets, security groups
- RDS, ElastiCache, S3

#### CI/CD (GitHub Actions)
- Automated testing
- Docker image building
- Deployment pipelines
- Security scanning

### 5. Observability

#### Logging
- Winston for structured logging
- JSON format
- Centralized log aggregation

#### Metrics
- Prometheus-compatible
- Custom business metrics
- Performance monitoring

#### Tracing
- OpenTelemetry
- Distributed tracing
- Request flow visualization

## Data Flow

### User Query Flow
1. User submits query (Bengali or English)
2. Frontend sends to API Gateway
3. Gateway routes to AI Service
4. AI Service:
   - Creates embedding of query
   - Searches vector store for relevant content
   - Builds context from search results
   - Sends to OpenAI/Cohere with Bengali prompt
   - Returns AI-generated response
5. Response sent back to frontend
6. Analytics Service logs interaction

### Authentication Flow
1. User submits credentials
2. API Gateway routes to Auth Service
3. Auth Service:
   - Validates credentials
   - Generates JWT tokens
   - Stores session in Redis
   - Returns tokens to user
4. Subsequent requests include JWT
5. Gateway validates token via Auth Service

### Content Retrieval Flow
1. User requests content
2. Gateway checks cache (Redis)
3. If cache miss:
   - Route to Content Service
   - Fetch from PostgreSQL/MongoDB
   - Cache result
4. Return content to user
5. Analytics Service tracks access

## Security

### Data Residency
- All data stored in ap-south-1 (Mumbai)
- Compliant with Bangladesh regulations
- Data sovereignty maintained

### Encryption
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Database encryption enabled

### Authentication
- JWT with secure secrets
- Refresh token rotation
- Session invalidation

### API Security
- Rate limiting
- CORS configuration
- Helmet.js security headers
- Input validation with Zod

## Scalability

### Horizontal Scaling
- Stateless services
- Load balancer distribution
- Auto-scaling based on metrics

### Caching Strategy
- Redis for hot data
- CDN for static assets
- Database query caching

### Database Optimization
- Indexed queries
- Connection pooling
- Read replicas for scaling

## Offline Support

### Mobile/Desktop
- Local SQLite database
- Service Workers (Web)
- Sync when online
- Conflict resolution

### Data Sync
- Queue offline actions
- Batch sync on connection
- Progressive enhancement

## Internationalization

### Bengali Support
- UTF-8 encoding
- Bengali fonts
- RTL/LTR handling
- Number formatting
- Date/time formatting

### Fallback Strategy
- bn-BD (primary)
- en-US (fallback)
- Dynamic language switching
