#!/bin/bash

echo "🚀 Configuração do Deploy via GitHub"
echo "====================================="
echo ""

# Check if we have pending changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Commitando mudanças pendentes..."
    git add .
    git commit -m "Update: GitHub deployment setup"
else
    echo "✅ Git repository está limpo"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  CRIAR REPOSITÓRIO NO GITHUB:"
echo "   • Vá para: https://github.com/new"
echo "   • Nome: repdf (ou outro nome)"
echo "   • Visibilidade: Private (recomendado)"
echo "   • NÃO marque 'Initialize with README'"
echo "   • Clique: Create repository"
echo ""

echo "2️⃣  CONECTAR AO GITHUB:"
echo "   • Copie este comando (substitua USERNAME):"
echo "   git remote add origin https://github.com/USERNAME/repdf.git"
echo "   git push -u origin main"
echo ""

echo "3️⃣  CONFIGURAR GOOGLE CLOUD SERVICE ACCOUNT:"
echo "   • Vá para: https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "   • Clique: Create Service Account"
echo "   • Nome: github-deploy"
echo "   • Adicione roles:"
echo "     - Cloud Run Admin"
echo "     - Storage Admin  "
echo "     - Container Registry Service Agent"
echo "     - Service Account User"
echo "   • Crie chave JSON e baixe o arquivo"
echo ""

echo "4️⃣  OBTER PROJECT ID:"
echo "   • Vá para: https://console.cloud.google.com/home/dashboard"
echo "   • Copie o 'Project ID' (não o nome)"
echo ""

echo "5️⃣  CONFIGURAR SECRETS NO GITHUB:"
echo "   • No seu repositório: Settings → Secrets and variables → Actions"
echo "   • Adicione:"
echo "     - GCP_PROJECT_ID: (seu project ID)"
echo "     - GCP_SA_KEY: (conteúdo completo do arquivo JSON)"
echo ""

echo "6️⃣  HABILITAR APIs NO GOOGLE CLOUD:"
echo "   • Vá para: https://console.cloud.google.com/apis/library"
echo "   • Habilite:"
echo "     - Cloud Build API"
echo "     - Cloud Run Admin API"
echo "     - Container Registry API"
echo ""

echo "✅ ARQUIVOS CRIADOS:"
echo "   • .github/workflows/deploy.yml (GitHub Actions)"
echo "   • Dockerfile (Container config)"
echo "   • nginx.conf (Server config)"
echo "   • DEPLOY-GITHUB.md (Guia completo)"
echo ""

echo "🎯 APÓS CONFIGURAR:"
echo "   • Faça push: git push origin main"
echo "   • Deploy automático acontecerá!"
echo "   • Veja progresso em: GitHub → Actions tab"
echo ""

echo "📞 Precisa de ajuda com algum passo específico?"
echo "   Posso te guiar através de qualquer etapa!"