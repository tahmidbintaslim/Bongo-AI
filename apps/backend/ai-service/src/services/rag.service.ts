import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import { createLogger } from '../utils/logger';

const logger = createLogger('rag-service');

interface RAGRequest {
  query: string;
  documents: any[];
  language: string;
  maxTokens?: number;
}

export class RAGService {
  private openai: OpenAI | null = null;
  private cohere: CohereClient | null = null;
  private provider: 'openai' | 'cohere';

  constructor() {
    this.provider = process.env.AI_PROVIDER as 'openai' | 'cohere' || 'openai';

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.COHERE_API_KEY) {
      this.cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
      });
    }
  }

  async generateResponse(request: RAGRequest): Promise<string> {
    const { query, documents, language, maxTokens = 1000 } = request;

    // Build context from documents
    const context = documents
      .map((doc, idx) => `[${idx + 1}] ${doc.content}`)
      .join('\n\n');

    // System prompt for Bengali
    const systemPrompt = language === 'bn'
      ? `আপনি একজন বাংলাদেশের শিক্ষার্থীদের জন্য সহায়ক AI শিক্ষক। আপনি বাংলায় সঠিক এবং সহায়ক উত্তর প্রদান করুন।`
      : `You are a helpful AI tutor for students in Bangladesh. Provide accurate and helpful answers.`;

    const userPrompt = language === 'bn'
      ? `প্রসঙ্গ:\n${context}\n\nপ্রশ্ন: ${query}\n\nউপরের প্রসঙ্গের উপর ভিত্তি করে বাংলায় একটি সহায়ক উত্তর প্রদান করুন।`
      : `Context:\n${context}\n\nQuestion: ${query}\n\nProvide a helpful answer based on the context above.`;

    try {
      if (this.provider === 'openai' && this.openai) {
        return await this.generateWithOpenAI(systemPrompt, userPrompt, maxTokens);
      } else if (this.provider === 'cohere' && this.cohere) {
        return await this.generateWithCohere(systemPrompt, userPrompt, maxTokens);
      } else {
        throw new Error('No AI provider configured');
      }
    } catch (error) {
      logger.error('RAG generation error:', error);
      throw error;
    }
  }

  private async generateWithOpenAI(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number
  ): Promise<string> {
    const response = await this.openai!.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'No response generated';
  }

  private async generateWithCohere(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number
  ): Promise<string> {
    const response = await this.cohere!.generate({
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      maxTokens,
      temperature: 0.7,
    });

    return response.generations[0]?.text || 'No response generated';
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      if (this.openai) {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        });
        return response.data[0].embedding;
      } else if (this.cohere) {
        const response = await this.cohere.embed({
          texts: [text],
          model: 'embed-multilingual-v3.0',
        });
        // @ts-ignore - Cohere API type compatibility
        return response.embeddings[0];
      } else {
        throw new Error('No AI provider configured');
      }
    } catch (error) {
      logger.error('Embedding creation error:', error);
      throw error;
    }
  }
}
