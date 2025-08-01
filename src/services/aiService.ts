import { ollamaService } from './ollamaService';
import { suggestFileName as geminiSuggestFileName, canSuggestName as canUseGemini } from './geminiService';

export enum AIProvider {
  OLLAMA = 'ollama',
  GEMINI = 'gemini',
  NONE = 'none'
}

export interface AIProviderStatus {
  provider: AIProvider;
  available: boolean;
  details: {
    version?: string;
    models?: string[];
    selectedModel?: string;
    hasApiKey?: boolean;
    error?: string;
  };
}

class AIService {
  private currentProvider: AIProvider = AIProvider.NONE;
  private initialized = false;
  private initializationPromise: Promise<AIProvider> | null = null;

  async initialize(): Promise<AIProvider> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) {
      return this.currentProvider;
    }

    this.initializationPromise = this.performInitialization();
    const result = await this.initializationPromise;
    this.initializationPromise = null;
    return result;
  }

  private async performInitialization(): Promise<AIProvider> {
    console.log('🔍 Initializing AI services...');

    // Try Ollama first (privacy-first approach)
    try {
      const ollamaAvailable = await ollamaService.detectOllama();
      if (ollamaAvailable && ollamaService.isAvailable()) {
        this.currentProvider = AIProvider.OLLAMA;
        console.log('✅ Ollama initialized successfully');
        this.initialized = true;
        return AIProvider.OLLAMA;
      }
    } catch (error) {
      console.warn('Ollama initialization failed:', error);
    }

    // Fallback to Gemini if configured
    try {
      if (canUseGemini()) {
        this.currentProvider = AIProvider.GEMINI;
        console.log('✅ Gemini API configured and ready');
        this.initialized = true;
        return AIProvider.GEMINI;
      }
    } catch (error) {
      console.warn('Gemini initialization failed:', error);
    }

    // No providers available
    this.currentProvider = AIProvider.NONE;
    console.log('ℹ️ No AI providers available');
    this.initialized = true;
    return AIProvider.NONE;
  }

  async suggestFileName(textSample: string): Promise<string> {
    const provider = await this.initialize();

    if (provider === AIProvider.NONE) {
      throw new Error('No AI providers available for filename suggestions');
    }

    switch (provider) {
      case AIProvider.OLLAMA:
        try {
          console.log('🤖 Using Ollama for filename suggestion...');
          return await ollamaService.suggestFileName(textSample);
        } catch (error) {
          console.warn('Ollama failed, attempting Gemini fallback:', error);
          
          // Try Gemini as fallback if available
          if (canUseGemini()) {
            console.log('☁️ Falling back to Gemini...');
            try {
              return await geminiSuggestFileName(textSample);
            } catch (geminiError) {
              console.error('Gemini fallback also failed:', geminiError);
              throw new Error('All AI providers failed');
            }
          }
          
          throw error;
        }
      
      case AIProvider.GEMINI:
        console.log('☁️ Using Gemini for filename suggestion...');
        return await geminiSuggestFileName(textSample);
      
      default:
        throw new Error('No AI providers available');
    }
  }

  canSuggestName(): boolean {
    return this.currentProvider !== AIProvider.NONE;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  async getProviderStatus(): Promise<AIProviderStatus> {
    const provider = await this.initialize();
    
    switch (provider) {
      case AIProvider.OLLAMA:
        const ollamaConfig = ollamaService.getConfig();
        return {
          provider: AIProvider.OLLAMA,
          available: ollamaConfig.available,
          details: {
            version: ollamaConfig.version,
            models: ollamaConfig.models,
            selectedModel: ollamaConfig.selectedModel
          }
        };
      
      case AIProvider.GEMINI:
        return {
          provider: AIProvider.GEMINI,
          available: canUseGemini(),
          details: {
            hasApiKey: canUseGemini()
          }
        };
      
      default:
        return {
          provider: AIProvider.NONE,
          available: false,
          details: {
            error: 'No AI providers detected. Install Ollama or configure Gemini API key.'
          }
        };
    }
  }

  async refreshProviders(): Promise<AIProvider> {
    console.log('🔄 Refreshing AI providers...');
    this.initialized = false;
    this.currentProvider = AIProvider.NONE;
    return await this.initialize();
  }

  // Ollama-specific methods
  async getOllamaModels(): Promise<string[]> {
    if (this.currentProvider === AIProvider.OLLAMA) {
      return ollamaService.getConfig().models;
    }
    return [];
  }

  async setOllamaModel(modelName: string): Promise<boolean> {
    if (this.currentProvider === AIProvider.OLLAMA) {
      return ollamaService.setSelectedModel(modelName);
    }
    return false;
  }

  async pullOllamaModel(modelName: string): Promise<boolean> {
    if (this.currentProvider === AIProvider.OLLAMA) {
      const success = await ollamaService.pullModel(modelName);
      if (success) {
        await ollamaService.loadAvailableModels(); // Refresh model list
      }
      return success;
    }
    return false;
  }

  // Utility methods
  isInitialized(): boolean {
    return this.initialized;
  }

  getProviderDisplayName(provider: AIProvider): string {
    switch (provider) {
      case AIProvider.OLLAMA:
        return 'Ollama (Local)';
      case AIProvider.GEMINI:
        return 'Google Gemini (Cloud)';
      default:
        return 'None';
    }
  }

  getProviderIcon(provider: AIProvider): string {
    switch (provider) {
      case AIProvider.OLLAMA:
        return '🤖';
      case AIProvider.GEMINI:
        return '☁️';
      default:
        return '❌';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Backward compatibility exports for existing code
export const canSuggestName = () => aiService.canSuggestName();
export const suggestFileName = (text: string) => aiService.suggestFileName(text);