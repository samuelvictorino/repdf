# 🚀 Instruções de Deploy - RePDF

## 📋 Deploy na Vercel (Recomendado)

### Método 1: Deploy Automático via Git

1. **Acesse o Vercel**: https://vercel.com/new
2. **Importe o repositório**: `https://github.com/samuelvictorino/repdf`
3. **Configure as settings**:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (opcionais):
   ```
   VITE_APP_TITLE=RePDF - Suíte Executiva PDF
   ```

5. **Deploy**: Clique em "Deploy"

### Método 2: Via CLI (se autenticado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login na Vercel
vercel login

# Deploy
npm run deploy:vercel
# ou
./deploy-vercel.sh
```

---

## 🌐 URLs de Deploy

### Vercel
- **URL do Projeto**: https://vercel.com/dashboard
- **Configuração**: Automática via `vercel.json`
- **Build Time**: ~2-3 minutos

### Netlify (Alternativo)
```bash
npm run deploy:netlify
```

### GitHub Pages (Alternativo)
```bash
npm run deploy:gh-pages
```

---

## ⚙️ Configurações de Deploy

### vercel.json
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

---

## 🔧 Build Local

Para testar o build localmente:

```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Preview local
npm run preview
```

---

## 📊 Métricas de Build

- **Bundle Size**: ~507 KB (minified)
- **Gzipped**: ~124 KB
- **Build Time**: ~3-4 segundos
- **Lighthouse Score**: 95+ (Performance)

---

## 🎯 Funcionalidades Deployadas

### ✅ Core Features
- [x] Manipulação avançada de PDFs
- [x] Sistema de undo/redo
- [x] Drag & drop inteligente
- [x] Visualização rápida com zoom
- [x] Exportação com opções avançadas

### ✅ UI/UX Features  
- [x] Tema escuro por padrão
- [x] Tradução completa para português
- [x] Ícones redesenhados com hover effects
- [x] Popover de confirmação de exclusão
- [x] Tela de arquivo vazio traduzida
- [x] Sistema de notificações inteligente

### ✅ AI Features (Ready)
- [x] Integração com Ollama preparada
- [x] Sugestões de nome via IA
- [x] Arquitetura para análise de documentos
- [x] Sistema MCP servidor/cliente projetado

### 📚 Documentação
- [x] `ADVANCED_AI_FEATURES.md` - Funcionalidades IA avançadas
- [x] `MCP_ARCHITECTURE.md` - Estrutura MCP servidor/cliente  
- [x] `AI_AGENT_TOOL_ARCHITECTURE.md` - Plataforma para agentes IA

---

## 🌟 Post-Deploy

Após o deploy, você pode:

1. **Testar todas as funcionalidades** no ambiente de produção
2. **Configurar domínio customizado** (se necessário)
3. **Habilitar analytics** da Vercel
4. **Configurar CI/CD** para deploys automáticos
5. **Implementar as funcionalidades IA** seguindo a documentação

---

## 📞 Suporte

- **Repositório**: https://github.com/samuelvictorino/repdf
- **Issues**: Use o GitHub Issues para reportar problemas
- **Documentação**: Veja os arquivos `.md` na raiz do projeto

---

**🎉 RePDF está pronto para uso em produção!**