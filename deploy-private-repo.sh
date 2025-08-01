#!/bin/bash

# 🔐 Deploy de Repositório Privado na Vercel
# Script para deploy quando o repo está privado

echo "🔐 RePEc - Deploy de Repositório Privado"
echo "========================================"
echo ""

# Verificar se o build funciona
echo "📦 Verificando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Corrigindo problemas..."
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo ""

# Opções de deploy
echo "🚀 Opções de Deploy para Repositório Privado:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 OPÇÃO 1: RECOMENDADA - Tornar Repositório Público"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://github.com/samuelvictorino/repdf/settings"
echo "2. Role até 'Danger Zone' no final da página"
echo "3. Clique em 'Change visibility' → 'Make public'"
echo "4. Confirme digitando: repdf"
echo "5. Depois: https://vercel.com/new (o repo aparecerá na lista)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 OPÇÃO 2: Deploy Manual (Repositório Privado)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://vercel.com/new"
echo "2. Clique em 'Browse All Templates'"  
echo "3. Procure por 'Import Git Repository'"
echo "4. Cole a URL: https://github.com/samuelvictorino/repdf"
echo "5. Autorize acesso ao repositório privado"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ OPÇÃO 3: Deploy via Arrastar e Soltar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://vercel.com/new"
echo "2. Arraste a pasta 'dist' para a área de upload"
echo "3. Configure as settings manualmente"
echo ""

# Tentar CLI se possível
if command -v vercel &> /dev/null; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 OPÇÃO 4: Via Vercel CLI (se autenticado)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Tentando deploy via CLI..."
    
    if vercel whoami &> /dev/null; then
        echo "✅ Vercel CLI autenticado!"
        echo "🚀 Fazendo deploy..."
        vercel --prod --yes
    else
        echo "❌ Vercel CLI não autenticado."
        echo "Execute: vercel login"
        echo "Depois: vercel --prod"
    fi
else
    echo "📥 Para instalar Vercel CLI: npm install -g vercel"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 INFORMAÇÕES DO PROJETO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 Repositório: https://github.com/samuelvictorino/repdf"
echo "🔨 Framework: Vite"
echo "📦 Build Command: npm run build"
echo "📁 Output Directory: dist"
echo "⚙️  Install Command: npm install"
echo "📄 Config File: vercel.json (já configurado)"
echo ""
echo "🎯 FUNCIONALIDADES PRONTAS:"
echo "  ✅ Manipulação avançada de PDFs"
echo "  ✅ Tema escuro por padrão"
echo "  ✅ Tradução completa PT-BR"
echo "  ✅ Confirmação inteligente de exclusão"
echo "  ✅ Ícones redesenhados"
echo "  ✅ Sistema de notificações"
echo "  ✅ Integração IA (Ollama ready)"
echo ""
echo "🌟 RePEc está pronto para produção!"
echo "🔗 Escolha uma das opções acima para fazer o deploy!"