# 🌐 Arquitetura MCP - RePDF como Servidor e Cliente

## 🎯 Visão Geral

O RePDF evolui para se tornar tanto **Servidor MCP** quanto **Cliente MCP**, criando um ecossistema integrado de processamento de documentos PDF que pode ser utilizado por outros aplicativos e agentes de IA.

---

## 🖥️ RePEc como Servidor MCP

### **Funcionalidades Expostas via MCP**

#### **1. 📄 Ferramentas de Manipulação de PDF**

```typescript
// MCP Tools que o RePDF expõe
interface RePDFMCPTools {
  // Análise de documentos
  "pdf-analyze": {
    description: "Analisa estrutura e conteúdo de PDFs";
    parameters: {
      file_path: string;
      analysis_type: "structure" | "content" | "metadata" | "all";
    };
    returns: DocumentAnalysis;
  };

  // Extração de texto e dados
  "pdf-extract": {
    description: "Extrai texto, imagens e dados estruturados";
    parameters: {
      file_path: string;
      extract_type: "text" | "images" | "tables" | "forms";
      page_range?: {start: number, end: number};
    };
    returns: ExtractedContent;
  };

  // Manipulação de páginas
  "pdf-manipulate": {
    description: "Reorganiza, rotaciona, divide ou combina PDFs";
    parameters: {
      operation: "split" | "merge" | "rotate" | "reorder";
      input_files: string[];
      configuration: ManipulationConfig;
    };
    returns: OperationResult;
  };

  // Análise com IA local
  "pdf-ai-analyze": {
    description: "Análise avançada usando modelos Ollama locais";
    parameters: {
      file_path: string;
      analysis_features: AIFeatureType[];
      model_preferences?: OllamaModelPreferences;
    };
    returns: AIAnalysisResult;
  };

  // Busca semântica
  "pdf-search": {
    description: "Busca semântica e por palavras-chave em PDFs";
    parameters: {
      query: string;
      search_type: "keyword" | "semantic" | "hybrid";
      file_paths: string[];
    };
    returns: SearchResults;
  };
}
```

#### **2. 📊 Recursos (Resources) Expostos**

```typescript
interface RePDFMCPResources {
  // Documentos abertos no workspace
  "workspace://documents": {
    description: "Lista documentos atualmente abertos";
    returns: WorkspaceDocument[];
  };

  // Metadados de documentos
  "document://metadata/{document_id}": {
    description: "Metadados detalhados de um documento";
    returns: DocumentMetadata;
  };

  // Resultados de análises IA
  "analysis://results/{analysis_id}": {
    description: "Resultados de análises IA realizadas";
    returns: AIAnalysisResult;
  };

  // Configurações do sistema
  "system://config": {
    description: "Configurações atuais do RePDF";
    returns: SystemConfiguration;
  };
}
```

#### **3. 🔔 Notificações (Notifications)**

```typescript
interface RePDFMCPNotifications {
  // Progresso de operações longas
  "operation/progress": {
    operation_id: string;
    progress: number; // 0-1
    stage: string;
    estimated_remaining: number; // ms
  };

  // Documento modificado
  "document/modified": {
    document_id: string;
    modification_type: "content" | "metadata" | "structure";
    timestamp: Date;
  };

  // Análise IA concluída
  "ai/analysis_complete": {
    analysis_id: string;
    document_id: string;
    features_analyzed: AIFeatureType[];
    results_available: boolean;
  };

  // Novos documentos adicionados
  "workspace/document_added": {
    document_id: string;
    file_path: string;
    auto_analysis_started: boolean;
  };
}
```

### **Implementação do Servidor MCP**

```typescript
// src/mcp/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class RePDFMCPServer {
  private server: Server;
  private transport: StdioServerTransport;

  constructor(private appContext: AppContextType) {
    this.server = new Server(
      {
        name: 'repdf-server',
        version: '1.0.0',
        description: 'RePDF Document Processing Server'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          notifications: {},
        }
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.transport = new StdioServerTransport();
  }

  private setupToolHandlers() {
    // Análise de PDF
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'pdf-analyze':
          return await this.handlePdfAnalyze(args);
        case 'pdf-extract':
          return await this.handlePdfExtract(args);
        case 'pdf-manipulate':
          return await this.handlePdfManipulate(args);
        case 'pdf-ai-analyze':
          return await this.handleAIAnalyze(args);
        case 'pdf-search':
          return await this.handlePdfSearch(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handlePdfAnalyze(args: any): Promise<DocumentAnalysis> {
    const { file_path, analysis_type } = args;
    
    // Integra com o sistema existente do RePDF
    const loadedDoc = await loadPdfFromFiles([new File([], file_path)]);
    
    return {
      structure: this.analyzeStructure(loadedDoc),
      content: analysis_type === 'content' ? this.analyzeContent(loadedDoc) : undefined,
      metadata: analysis_type === 'metadata' ? this.extractMetadata(loadedDoc) : undefined
    };
  }

  async start() {
    await this.server.connect(this.transport);
    console.log('RePDF MCP Server started');
  }
}
```

---

## 📥 RePEc como Cliente MCP

### **Integrações MCP Externas**

#### **1. 🔗 Clientes MCP Integrados**

```typescript
// Integração com serviços externos via MCP
interface ExternalMCPClients {
  // Claude Desktop/API
  claude: {
    tools: ["analyze_document", "summarize_content"];
    use_case: "Análise avançada de documentos com contexto";
  };

  // Obsidian MCP
  obsidian: {
    tools: ["create_note", "link_documents"];
    use_case: "Criar notas estruturadas a partir de PDFs";
  };

  // Filesystem MCP
  filesystem: {
    tools: ["read_file", "write_file", "list_directory"];
    use_case: "Gerenciamento avançado de arquivos";
  };

  // Web MCP (para pesquisas relacionadas)
  web: {
    tools: ["search", "fetch_page"];
    use_case: "Pesquisar informações relacionadas ao documento";
  };

  // Database MCP
  database: {
    tools: ["query", "insert", "update"];
    use_case: "Armazenar metadados e análises em banco de dados";
  };
}
```

#### **2. 🤖 Workflows Inteligentes**

```typescript
// Exemplo de workflow usando múltiplos MCPs
class IntelligentDocumentWorkflow {
  constructor(
    private mcpClients: MCPClientManager
  ) {}

  async processLegalDocument(pdfPath: string): Promise<LegalAnalysisResult> {
    // 1. Análise local com RePDF
    const pdfAnalysis = await this.mcpClients.repdf.call('pdf-ai-analyze', {
      file_path: pdfPath,
      analysis_features: ['entity_extraction', 'contract_analysis']
    });

    // 2. Enriquecimento com Claude via MCP
    const claudeAnalysis = await this.mcpClients.claude.call('analyze_document', {
      content: pdfAnalysis.extracted_text,
      analysis_type: 'legal_risk_assessment'
    });

    // 3. Criação de nota estruturada no Obsidian
    await this.mcpClients.obsidian.call('create_note', {
      title: `Legal Analysis - ${pdfAnalysis.metadata.title}`,
      content: this.formatLegalAnalysis(pdfAnalysis, claudeAnalysis),
      tags: ['legal', 'contract', 'analysis']
    });

    // 4. Armazenamento em banco de dados
    await this.mcpClients.database.call('insert', {
      table: 'legal_analyses',
      data: {
        document_id: pdfAnalysis.document_id,
        risk_score: claudeAnalysis.risk_score,
        key_issues: claudeAnalysis.issues,
        analyzed_at: new Date()
      }
    });

    return {
      local_analysis: pdfAnalysis,
      ai_analysis: claudeAnalysis,
      note_created: true,
      stored_in_db: true
    };
  }
}
```

### **Implementação do Cliente MCP**

```typescript
// src/mcp/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

class RePDFMCPClient {
  private clients: Map<string, Client> = new Map();

  async connectToMCPServer(name: string, transport: any): Promise<void> {
    const client = new Client(
      {
        name: `repdf-client-${name}`,
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    await client.connect(transport);
    this.clients.set(name, client);
  }

  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) throw new Error(`Client for ${serverName} not found`);

    return await client.request(
      {
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      }
    );
  }

  async getResource(serverName: string, uri: string): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) throw new Error(`Client for ${serverName} not found`);

    return await client.request(
      {
        method: 'resources/read',
        params: { uri }
      }
    );
  }
}
```

---

## 🔄 Casos de Uso Integrados

### **1. 📋 Pipeline de Análise Completa**

```typescript
// Workflow completo usando MCP
async function completeDocumentAnalysis(pdfPath: string) {
  // 1. RePDF faz análise inicial
  const initialAnalysis = await mcpClient.callTool('repdf', 'pdf-analyze', {
    file_path: pdfPath,
    analysis_type: 'all'
  });

  // 2. Claude Desktop analisa conteúdo via MCP
  const aiInsights = await mcpClient.callTool('claude', 'analyze_text', {
    text: initialAnalysis.extracted_text,
    context: 'business_document'
  });

  // 3. Obsidian cria nota estruturada
  await mcpClient.callTool('obsidian', 'create_note', {
    title: `Analysis: ${initialAnalysis.title}`,
    content: formatAnalysisNote(initialAnalysis, aiInsights)
  });

  // 4. Web search para contexto adicional
  const relatedInfo = await mcpClient.callTool('web', 'search', {
    query: aiInsights.key_topics.join(' '),
    num_results: 5
  });

  return {
    pdf_analysis: initialAnalysis,
    ai_insights: aiInsights,
    related_info: relatedInfo,
    note_created: true
  };
}
```

### **2. 🤝 Colaboração Multi-Agente**

```typescript
// Múltiplos agentes trabalhando no mesmo documento
class MultiAgentDocumentProcessor {
  async processWithMultipleAgents(pdfPath: string) {
    // Agente 1: Análise técnica
    const technicalAgent = new DocumentAnalysisAgent(mcpClients);
    const techAnalysis = await technicalAgent.analyze(pdfPath);

    // Agente 2: Análise de negócios  
    const businessAgent = new BusinessAnalysisAgent(mcpClients);
    const bizAnalysis = await businessAgent.analyze(pdfPath);

    // Agente 3: Síntese e relatório
    const reportAgent = new ReportGenerationAgent(mcpClients);
    const finalReport = await reportAgent.synthesize([techAnalysis, bizAnalysis]);

    return finalReport;
  }
}
```

---

## 🏗️ Arquitetura de Deployment

### **Configuração MCP Server**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "repdf-server": {
      "command": "node",
      "args": ["/path/to/repdf/dist/mcp-server.js"],
      "env": {
        "REPDF_WORKSPACE": "/path/to/documents",
        "OLLAMA_HOST": "http://localhost:11434"
      }
    }
  }
}
```

### **Docker Compose para MCP Ecosystem**

```yaml
# docker-compose.mcp.yml
version: '3.8'

services:
  repdf-mcp-server:
    build: .
    command: npm run mcp:server
    volumes:
      - ./documents:/app/documents
      - ./models:/app/models
    environment:
      - MCP_SERVER_PORT=3000
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - ollama
      - postgres

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ./ollama-models:/root/.ollama
    ports:
      - "11434:11434"

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: repdf_mcp
      POSTGRES_USER: repdf
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📊 Monitoramento e Analytics

### **MCP Usage Analytics**

```typescript
interface MCPAnalytics {
  // Métricas de uso do servidor
  server_metrics: {
    tools_called: Map<string, number>;
    resources_accessed: Map<string, number>;
    active_clients: number;
    average_response_time: number;
  };

  // Métricas de uso como cliente
  client_metrics: {
    external_services_used: Map<string, number>;
    workflow_success_rate: number;
    integration_errors: ErrorLog[];
  };

  // Performance
  performance: {
    document_processing_time: number;
    ai_analysis_time: number;
    mcp_communication_overhead: number;
  };
}
```

---

## 🚀 Roadmap MCP

### **Fase 1: Servidor MCP Básico (1-2 meses)**
- [ ] Implementar servidor MCP core
- [ ] Ferramentas básicas de manipulação PDF
- [ ] Integração com workspace atual
- [ ] Testes com Claude Desktop

### **Fase 2: Cliente MCP (2-3 meses)**
- [ ] Cliente MCP para serviços externos
- [ ] Workflows básicos multi-agente
- [ ] Integração com Obsidian e filesystem
- [ ] Dashboard de monitoramento

### **Fase 3: Workflows Avançados (3-4 meses)**
- [ ] Pipelines de análise complexos
- [ ] Agentes especializados por domínio
- [ ] APIs para integrações customizadas
- [ ] Marketplace de workflows

### **Fase 4: Ecosystem Completo (4+ meses)**
- [ ] RePDF MCP Registry
- [ ] Workflows visuais (drag-and-drop)
- [ ] Colaboração multi-usuário
- [ ] Enterprise deployment tools

---

## 🏆 Vantagens Competitivas MCP

### **Diferenciadores Únicos**
1. **Primeiro PDF-native MCP Server**: Especializado em documentos PDF
2. **Privacy-First MCP**: Processamento local com Ollama
3. **Workflow Engine**: Sistema visual de criação de pipelines
4. **Domain Expertise**: Templates para diferentes setores

### **Ecossistema Integrado**
- **RePDF Hub**: Central de workflows e integrações
- **Community Templates**: Biblioteca de workflows compartilhados
- **Enterprise Connectors**: Integração com sistemas corporativos
- **AI Agent Marketplace**: Agentes especializados para diferentes tarefas

O MCP transforma o RePDF de um simples editor PDF em uma **plataforma de processamento inteligente de documentos**, integrável com qualquer sistema que suporte o protocolo MCP.