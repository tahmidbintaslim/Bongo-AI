// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Database types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Cache types
export interface CacheConfig {
  host: string;
  port: number;
  ttl: number;
}

// Vector Store types
export interface VectorStoreConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma';
  apiKey?: string;
  url?: string;
  indexName: string;
}

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

// AI types
export interface AIProviderConfig {
  provider: 'openai' | 'cohere';
  apiKey: string;
  model?: string;
}

export interface RAGContext {
  documents: VectorDocument[];
  query: string;
  maxTokens?: number;
}
