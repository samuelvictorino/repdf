# 🚀 Deploy via GitHub para Google Cloud Run

## Passo 1: Criar Repositório no GitHub

1. **Vá para**: https://github.com/new
2. **Nome do repositório**: `repdf` (ou outro nome)
3. **Visibilidade**: Private (recomendado) ou Public
4. **NÃO** marque "Add a README file" (já temos arquivos)
5. **Clique**: "Create repository"

## Passo 2: Push do Código Local

No terminal, execute:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit - RePDF production ready"

# Conectar ao repositório remoto (substitua USERNAME pelo seu)
git remote add origin https://github.com/USERNAME/repdf.git

# Push para GitHub
git branch -M main
git push -u origin main
```

## Passo 3: Configurar Google Cloud Service Account

### 3.1 - Criar Service Account
1. **Vá para**: https://console.cloud.google.com/iam-admin/serviceaccounts
2. **Clique**: "Create Service Account"
3. **Nome**: `github-deploy`
4. **Description**: `Service account for GitHub Actions deployment`
5. **Clique**: "Create and Continue"

### 3.2 - Adicionar Permissões
Adicione estas roles:
- `Cloud Run Admin`
- `Storage Admin`
- `Container Registry Service Agent`
- `Service Account User`

### 3.3 - Criar Chave JSON
1. **Clique** no service account criado
2. **Vá para**: Keys tab
3. **Clique**: "Add Key" → "Create new key"
4. **Selecione**: JSON
5. **Baixe** o arquivo JSON

## Passo 4: Configurar Secrets no GitHub

1. **Vá para**: Seu repositório no GitHub
2. **Clique**: Settings → Secrets and variables → Actions
3. **Adicione estes secrets**:

### 4.1 - GCP_PROJECT_ID
- **Name**: `GCP_PROJECT_ID`
- **Value**: Seu Project ID do Google Cloud (encontre em: https://console.cloud.google.com/home/dashboard)

### 4.2 - GCP_SA_KEY
- **Name**: `GCP_SA_KEY`
- **Value**: Conteúdo completo do arquivo JSON baixado (copie tudo)

## Passo 5: Habilitar APIs Necessárias

Execute no Google Cloud Shell ou localmente:

```bash
# Habilitar APIs necessárias
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

Ou via Console:
1. **Vá para**: https://console.cloud.google.com/apis/library
2. **Habilite** estas APIs:
   - Cloud Build API
   - Cloud Run Admin API
   - Container Registry API

## Passo 6: Deploy Automático

Agora, toda vez que você fizer push para `main`:

```bash
# Fazer alterações
git add .
git commit -m "Update: description of changes"
git push origin main
```

O deploy acontecerá automaticamente! 🎉

## Passo 7: Verificar Deploy

1. **GitHub**: Vá para Actions tab para ver o progresso
2. **Cloud Run**: Verifique o novo serviço em https://console.cloud.google.com/run

## 🔧 Estrutura Criada

```
repdf/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ Workflow de deploy
├── dist/                       # ✅ Build de produção
├── src/                        # ✅ Código fonte
├── Dockerfile                  # ✅ Container config
├── nginx.conf                  # ✅ Server config
├── package.json               # ✅ Dependencies
├── deploy-check.js            # ✅ Verificação de build
└── README.md                  # ✅ Documentação

```

## 🎯 Resultado

Após o primeiro deploy:
- ✅ **URL automática**: Google Cloud Run gerará uma URL
- ✅ **SSL/HTTPS**: Configurado automaticamente
- ✅ **Deploy contínuo**: Push → Build → Deploy automático
- ✅ **Sem CDN**: Tailwind integrado via PostCSS
- ✅ **Otimizado**: Assets comprimidos e chunked

## 📞 Precisa de Ajuda?

Se tiver dúvidas em algum passo, me avise e posso te ajudar com:
- Configuração do GitHub
- Secrets do Google Cloud
- Troubleshooting do deploy
- Customização do workflow

**Pronto para começar! 🚀**