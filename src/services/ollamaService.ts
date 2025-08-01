interface OllamaConfig {
  available: boolean;
  baseUrl: string;
  models: string[];
  version?: string;
  selectedModel?: string;
}

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

class OllamaService {
  private config: OllamaConfig = {
    available: false,
    baseUrl: 'http://localhost:11434',
    models: []
  };

  async detectOllama(): Promise<boolean> {
    const possibleUrls = [
      'http://localhost:11434',
      'http://127.0.0.1:11434',
      'http://0.0.0.0:11434'
    ];

    for (const url of possibleUrls) {
      try {
        const response = await fetch(`${url}/api/version`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3s timeout
        });
        
        if (response.ok) {
          this.config.baseUrl = url;
          this.config.available = true;
          const versionData = await response.json();
          this.config.version = versionData.version;
          await this.loadAvailableModels();
          console.log(`✅ Ollama detected at ${url} (v${this.config.version})`);
          return true;
        }
      } catch (error) {
        // Continue to next URL
        continue;
      }
    }
    
    console.log('ℹ️ Ollama not detected on standard ports');
    return false;
  }

  async loadAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load models: ${response.status}`);
      }
      
      const data = await response.json();
      const availableModels = data.models?.map((m: OllamaModel) => m.name) || [];
      this.config.models = availableModels;
      
      // Select best model for filename suggestions (prefer smaller, faster models)
      const preferredModels = [
        'llama3.2:1b',    // Fastest
        'llama3.2:3b',    // Good balance
        'qwen2.5:1.5b',   // Fast alternative
        'qwen2.5:3b',     // Good alternative
        'phi3:3.8b',      // Microsoft's efficient model
        'mistral:7b',     // Larger but capable
        'llama3.1:8b',    // Fallback
      ];
      
      // Find the best available model
      for (const preferred of preferredModels) {
        const found = availableModels.find(available => 
          available.toLowerCase().includes(preferred.split(':')[0].toLowerCase())
        );
        if (found) {
          this.config.selectedModel = found;
          console.log(`📝 Selected model for filename suggestions: ${found}`);
          break;
        }
      }
      
      // If no preferred model found, use the first available
      if (!this.config.selectedModel && availableModels.length > 0) {
        this.config.selectedModel = availableModels[0];
        console.log(`📝 Using fallback model: ${this.config.selectedModel}`);
      }
      
      console.log(`🤖 Found ${availableModels.length} Ollama models:`, availableModels);
      return availableModels;
    } catch (error) {
      console.warn('Failed to load Ollama models:', error);
      this.config.models = [];
      return [];
    }
  }

  async suggestFileName(textSample: string): Promise<string> {
    if (!this.config.available || !this.config.selectedModel) {
      throw new Error('Ollama not available or no model selected');
    }

    // Limit text sample to avoid token limits
    const limitedText = textSample.substring(0, 2000);
    
    const prompt = `Based on this document excerpt, suggest a concise, professional filename (without extension):

"${limitedText}"

Requirements:
- Maximum 50 characters
- Use only letters, numbers, hyphens, and underscores
- Be descriptive but concise
- No spaces or special characters
- No file extension needed
- Professional and readable

Respond with only the filename, nothing else.

Filename:`;

    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.selectedModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for consistent results
            top_p: 0.9,
            num_predict: 30,  // Limit response length
            stop: ['\n', '.', '?', '!'] // Stop at sentence endings
          }
        }),
        signal: AbortSignal.timeout(20000) // 20s timeout for local processing
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let suggestion = data.response?.trim() || '';
      
      // Clean up the suggestion
      suggestion = suggestion
        .replace(/^(filename|file|name):\s*/i, '') // Remove prefixes
        .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .toLowerCase()
        .substring(0, 50); // Limit length

      // Ensure we have a valid suggestion
      if (!suggestion || suggestion.length < 3) {
        suggestion = 'document-' + Date.now().toString().slice(-6);
      }

      console.log(`💡 Ollama suggested filename: "${suggestion}"`);
      return suggestion;
    } catch (error) {
      console.error('Ollama filename suggestion failed:', error);
      throw new Error(`Ollama suggestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
        signal: AbortSignal.timeout(300000) // 5 minutes for model download
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  async checkModelExists(modelName: string): Promise<boolean> {
    return this.config.models.includes(modelName);
  }

  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  isAvailable(): boolean {
    return this.config.available && this.config.models.length > 0;
  }

  getSelectedModel(): string | undefined {
    return this.config.selectedModel;
  }

  setSelectedModel(modelName: string): boolean {
    if (this.config.models.includes(modelName)) {
      this.config.selectedModel = modelName;
      console.log(`📝 Model changed to: ${modelName}`);
      return true;
    }
    return false;
  }
}

export const ollamaService = new OllamaService();